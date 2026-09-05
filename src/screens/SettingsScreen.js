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
  Switch,
} from 'react-native';
import { projectManager } from '../services/projectManager';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    githubUsername: '',
    patToken: '',
    defaultRepo: '',
    autoPush: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await projectManager.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await projectManager.saveSettings(settings);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const defaultSettings = {
              githubUsername: 'yukee520',
              patToken: '',
              defaultRepo: 'react-native-template',
              autoPush: true,
            };
            setSettings(defaultSettings);
            await projectManager.saveSettings(defaultSettings);
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GitHub Configuration</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GitHub Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter GitHub username"
              value={settings.githubUsername}
              onChangeText={(text) => setSettings({...settings, githubUsername: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Personal Access Token (PAT)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter GitHub PAT"
              value={settings.patToken}
              onChangeText={(text) => setSettings({...settings, patToken: text})}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Default Repository Template</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter template repo name"
              value={settings.defaultRepo}
              onChangeText={(text) => setSettings({...settings, defaultRepo: text})}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.toggleGroup}>
            <Text style={styles.toggleLabel}>Auto-push to GitHub</Text>
            <Switch
              value={settings.autoPush}
              onValueChange={(value) => setSettings({...settings, autoPush: value})}
              trackColor={{ false: '#767577', true: '#6200ee' }}
              thumbColor={settings.autoPush ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={saveSettings}
            disabled={saving}
          >
            <Text style={styles.actionButtonText}>
              {saving ? 'Saving...' : '💾 Save Settings'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={resetSettings}
          >
            <Text style={styles.actionButtonText}>↺ Reset to Default</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.testButton]}
            onPress={() => {
              Alert.alert('Test GitHub Connection', 'Checking connection to GitHub API...');
            }}
          >
            <Text style={styles.actionButtonText}>🔗 Test GitHub Connection</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Master App v1.0.0</Text>
          <Text style={styles.versionSubtext}>Built with ❤️ in Termux</Text>
        </View>
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
  headerPlaceholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  toggleGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#6200ee',
  },
  resetButton: {
    backgroundColor: '#ff3b30',
  },
  testButton: {
    backgroundColor: '#34c759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default SettingsScreen;
