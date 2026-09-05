import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { projectManager } from '../services/projectManager';

const EditorScreen = ({ route, navigation }) => {
  const { projectId, projectName } = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeContent, setCodeContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const projectData = await projectManager.getProjectById(projectId);
      if (projectData) {
        setProject(projectData);
        setCodeContent(`// Project: ${projectData.name}\n// Description: ${projectData.description}\n// Repository: ${projectData.githubRepo}\n\n// Write your code here...\nimport React from 'react';\n\nconst App = () => {\n  return <div>Hello, ${projectData.name}!</div>;\n};\n\nexport default App;`);
      } else {
        Alert.alert('Error', 'Project not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert('Error', 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      const updatedProject = {
        ...project,
        updatedAt: new Date().toISOString(),
        codeContent: codeContent,
      };
      
      await projectManager.saveProject(updatedProject);
      setProject(updatedProject);
      
      Alert.alert('Success', 'Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Error', 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const buildProject = async () => {
    if (!project) return;

    Alert.alert(
      'Build Project',
      `Trigger build for ${project.name}? This will push changes to GitHub and trigger the workflow.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Build',
          onPress: async () => {
            Alert.alert('Build Triggered', 'The build process has been initiated.');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading project...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{projectName}</Text>
        <TouchableOpacity onPress={buildProject} style={styles.buildButton}>
          <Text style={styles.buildButtonText}>🚀 Build</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.projectInfo}>
          <Text style={styles.infoLabel}>Repository:</Text>
          <Text style={styles.infoValue}>{project?.githubRepo}</Text>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.infoValue, styles.statusValue]}>{project?.status}</Text>
          <Text style={styles.infoLabel}>Last Updated:</Text>
          <Text style={styles.infoValue}>
            {new Date(project?.updatedAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.codeEditor}>
          <Text style={styles.editorLabel}>Code Editor</Text>
          <TextInput
            style={styles.codeInput}
            multiline
            numberOfLines={20}
            value={codeContent}
            onChangeText={setCodeContent}
            placeholder="// Write your code here..."
            placeholderTextColor="#666"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={saveChanges}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : '💾 Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#6200ee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buildButton: {
    padding: 8,
  },
  buildButtonText: {
    fontSize: 16,
    color: '#6200ee',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  projectInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  statusValue: {
    color: '#4caf50',
    textTransform: 'capitalize',
  },
  codeEditor: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  editorLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  codeInput: {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 400,
  },
  saveButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default EditorScreen;
