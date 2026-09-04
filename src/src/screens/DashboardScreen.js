import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, RefreshControl, Alert, SafeAreaView,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { getProjects, saveProject, removeProject } from '../services/projectManager';
import RNFS from 'react-native-fs';

export default function DashboardScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const PROJECTS_DIR = `${RNFS.ExternalDirectoryPath}/ReactProjects`;

  const loadProjects = async () => {
    try {
      const list = await getProjects();
      setProjects(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load projects', error);
      setProjects([]);
    }
  };

  useEffect(() => {
    loadProjects();
    // Refresh when screen comes into focus
    const unsubscribe = navigation?.addListener('focus', loadProjects);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  }, []);

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    const projectPath = `${PROJECTS_DIR}/${projectName.trim()}`;

    try {
      // Check if project exists
      const exists = await RNFS.exists(projectPath);
      if (exists) {
        Alert.alert('Error', 'Project already exists');
        return;
      }

      // Create project folder
      await RNFS.mkdir(projectPath);

      // Create default App.js
      await RNFS.writeFile(
        `${projectPath}/App.js`,
        `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ${projectName.trim()}!</Text>
      <Text style={styles.subtitle}>Edit this file to build your app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});`,
        'utf8'
      );

      // Create package.json
      await RNFS.writeFile(
        `${projectPath}/package.json`,
        `{
  "name": "${projectName.trim()}",
  "version": "0.0.1",
  "private": true
}`,
        'utf8'
      );

      const newProject = {
        name: projectName.trim(),
        path: projectPath,
        repoUrl: `https://github.com/yukee520/${projectName.trim()}`,
        createdAt: new Date().toISOString(),
        files: ['App.js', 'package.json'],
      };

      const updated = await saveProject(newProject);
      setProjects(Array.isArray(updated) ? updated : []);
      setProjectName('');

      Alert.alert('✅ Success', 'Project created! Opening editor...', [
        { text: 'OK', onPress: () => navigation?.navigate('Editor', { project: newProject }) }
      ]);

    } catch (error) {
      Alert.alert('❌ Error', 'Failed to create project: ' + error.message);
    }
  };

  const openEditor = (project) => {
    if (!project) {
      Alert.alert('Error', 'Project not found');
      return;
    }
    navigation?.navigate('Editor', { project });
  };

  const handleDelete = (project) => {
    if (!project?.name) return;
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete folder
              await RNFS.unlink(project.path);
              // Remove from storage
              const updated = await removeProject(project.name);
              setProjects(Array.isArray(updated) ? updated : []);
              Alert.alert('✅ Success', 'Project deleted');
            } catch (error) {
              Alert.alert('❌ Error', 'Failed to delete project: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    if (!item) return null;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardInfo}
          activeOpacity={0.7}
          onPress={() => openEditor(item)}
        >
          <Text style={styles.projectName}>{item.name || 'Unnamed Project'}</Text>
          <Text style={styles.projectPath} numberOfLines={1}>
            📁 {item.path || 'No path'}
          </Text>
        </TouchableOpacity>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => openEditor(item)}
          >
            <Text style={styles.openButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>📱 My Projects</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation?.navigate('Settings')}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="New Project Name"
            placeholderTextColor="#888"
            value={projectName}
            onChangeText={setProjectName}
            onSubmitEditing={handleCreateProject}
          />
          <TouchableOpacity style={styles.createButton} onPress={handleCreateProject}>
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={projects}
          keyExtractor={(item, index) => item?.name || index.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyText}>No projects yet</Text>
              <Text style={styles.emptySubtext}>Create your first project above!</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingsButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  createButton: {
    backgroundColor: '#4e95ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardInfo: {
    flex: 1,
    paddingRight: 12,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  projectPath: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  openButton: {
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
  },
  openButtonText: {
    color: '#4e95ff',
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#ff5555',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});
