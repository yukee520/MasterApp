import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, Alert, ActivityIndicator,
  SafeAreaView, ScrollView
} from 'react-native';
import RNFS from 'react-native-fs';
import { githubService } from '../services/githubService';

export default function EditorScreen({ route, navigation }) {
  const project = route?.params?.project;
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      loadFiles();
    } else {
      Alert.alert('Error', 'No project found', [
        { text: 'Go Back', onPress: () => navigation?.goBack() }
      ]);
    }
  }, [project]);

  const loadFiles = async () => {
    try {
      const exists = await RNFS.exists(project.path);
      if (!exists) {
        Alert.alert('Error', 'Project folder not found');
        return;
      }

      const items = await RNFS.readDir(project.path);
      const fileNames = items
        .filter(item => item.isFile())
        .map(item => item.name);

      setFiles(fileNames);

      if (fileNames.length > 0) {
        const firstFile = fileNames[0];
        setSelectedFile(firstFile);
        await loadFileContent(firstFile);
      } else {
        setSelectedFile('');
        setFileContent('// No files found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load files: ' + error.message);
    }
  };

  const loadFileContent = async (fileName) => {
    try {
      const fullPath = `${project.path}/${fileName}`;
      const exists = await RNFS.exists(fullPath);
      if (exists) {
        const content = await RNFS.readFile(fullPath, 'utf8');
        setFileContent(content);
      } else {
        setFileContent('// File not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to read file: ' + error.message);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'No file selected');
      return;
    }

    setSaving(true);
    try {
      const fullPath = `${project.path}/${selectedFile}`;
      await RNFS.writeFile(fullPath, fileContent, 'utf8');
      Alert.alert('✅ Success', 'File saved successfully!');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save file: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBuildAndPush = async () => {
    setLoading(true);
    try {
      // Save current file first
      if (selectedFile) {
        const fullPath = `${project.path}/${selectedFile}`;
        await RNFS.writeFile(fullPath, fileContent, 'utf8');
      }

      const settings = await githubService.getSettings();
      if (!settings.token || !settings.username) {
        Alert.alert(
          '⚠️ GitHub Not Configured',
          'Please set up GitHub in Settings first.',
          [
            { text: 'Go to Settings', onPress: () => navigation?.navigate('Settings') },
            { text: 'Cancel' }
          ]
        );
        setLoading(false);
        return;
      }

      const repoUrl = await githubService.pushProject(
        project,
        settings.token,
        settings.username,
        settings.templateRepo
      );

      Alert.alert(
        '🎉 Success!',
        `Project pushed to GitHub!\n\n${repoUrl}`,
        [
          { text: 'Open GitHub', onPress: () => {
            // You could add Linking.openURL here
            Alert.alert('Open', repoUrl);
          }},
          { text: 'OK' }
        ]
      );
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'Failed to push to GitHub');
    } finally {
      setLoading(false);
    }
  };

  const switchFile = (fileName) => {
    setSelectedFile(fileName);
    loadFileContent(fileName);
  };

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ No project selected</Text>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Text style={styles.backText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            📝 {project.name}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.actionButtonText}>
                {saving ? '⏳' : '💾 Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.buildButton]}
              onPress={handleBuildAndPush}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>🚀 Build</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          {/* File Sidebar */}
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>📁 Files</Text>
            <FlatList
              data={files}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.fileItem,
                    selectedFile === item && styles.selectedFile
                  ]}
                  onPress={() => switchFile(item)}
                >
                  <Text
                    style={[
                      styles.fileText,
                      selectedFile === item && styles.selectedFileText
                    ]}
                    numberOfLines={1}
                  >
                    📄 {item}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyFileText}>No files found</Text>
              }
            />
          </View>

          {/* Editor Area */}
          <View style={styles.editorArea}>
            <Text style={styles.filePathHeader}>
              {selectedFile || 'No file selected'}
            </Text>
            <ScrollView style={styles.editorScroll}>
              <TextInput
                style={styles.codeEditor}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                value={fileContent}
                onChangeText={setFileContent}
                placeholder="// Write your code here..."
                placeholderTextColor="#444"
                textAlignVertical="top"
              />
            </ScrollView>
          </View>
        </View>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backText: {
    color: '#4e95ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 6,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#4e95ff',
  },
  buildButton: {
    backgroundColor: '#03dac6',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '30%',
    backgroundColor: '#181818',
    borderRightWidth: 1,
    borderRightColor: '#333',
    padding: 10,
  },
  sidebarTitle: {
    color: '#aaa',
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 14,
  },
  fileItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  selectedFile: {
    backgroundColor: '#2d2d2d',
  },
  fileText: {
    color: '#bbb',
    fontSize: 13,
  },
  selectedFileText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyFileText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
  editorArea: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  filePathHeader: {
    color: '#888',
    fontSize: 12,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  editorScroll: {
    flex: 1,
  },
  codeEditor: {
    flex: 1,
    color: '#f8f8f2',
    fontFamily: 'monospace',
    fontSize: 13,
    backgroundColor: '#161616',
    padding: 10,
    borderRadius: 6,
    minHeight: 500,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
