import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { githubService } from '../services/githubService';

export default function SettingsScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [templateRepo, setTemplateRepo] = useState('react-native-template');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await githubService.getSettings();
      setToken(settings.token || '');
      setUsername(settings.username || '');
      setTemplateRepo(settings.templateRepo || 'react-native-template');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    if (!token || !username) {
      Alert.alert('⚠️ Warning', 'Please fill in both GitHub Username and Token');
      return;
    }

    setSaving(true);
    try {
      await githubService.saveSettings({ token, username, templateRepo });
      Alert.alert('✅ Success', 'GitHub settings saved successfully!');
      navigation?.goBack();
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!token || !username) {
      Alert.alert('⚠️ Warning', 'Please enter username and token first');
      return;
    }

    try {
      Alert.alert('⏳ Testing', 'Checking GitHub connection...');
      // Simple test: fetch user info
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('✅ Success', `Connected as: ${data.login}`);
      } else {
        Alert.alert('❌ Failed', 'Invalid token or username');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Connection failed: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚙️ GitHub Settings</Text>
          <View style={{ width: 50 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>GitHub Username</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. johndoe"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Personal Access Token (PAT)</Text>
          <TextInput
            style={styles.input}
            placeholder="ghp_xxxxxxxxxxxxx"
            placeholderTextColor="#666"
            value={token}
            onChangeText={setToken}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.label}>Template Repository</Text>
          <TextInput
            style={styles.input}
            placeholder="react-native-template"
            placeholderTextColor="#666"
            value={templateRepo}
            onChangeText={setTemplateRepo}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.testButton} onPress={testConnection}>
            <Text style={styles.testButtonText}>🔌 Test Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? '⏳ Saving...' : '💾 Save Settings'}
            </Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ How to get a GitHub Token</Text>
            <Text style={styles.infoText}>
              1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
              {'\n'}2. Click "Generate new token (classic)"
              {'\n'}3. Select scopes: repo, workflow
              {'\n'}4. Generate and copy your token
            </Text>
          </View>
        </View>
      </ScrollView>
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
    padding: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  testButton: {
    backgroundColor: '#4e95ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#03dac6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 10,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#888',
    fontSize: 12,
    lineHeight: 20,
  },
});
