import RNFS from 'react-native-fs';

const SETTINGS_PATH = `${RNFS.DocumentDirectoryPath}/RNBuilderProjects/settings.json`;

export const githubService = {
  async getSettings() {
    try {
      const exists = await RNFS.exists(SETTINGS_PATH);
      if (exists) {
        const content = await RNFS.readFile(SETTINGS_PATH, 'utf8');
        return JSON.parse(content);
      }
      return { token: '', username: '', templateRepo: 'react-native-template' };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { token: '', username: '', templateRepo: 'react-native-template' };
    }
  },

  async saveSettings(settings) {
    try {
      const dirPath = `${RNFS.DocumentDirectoryPath}/RNBuilderProjects`;
      const dirExists = await RNFS.exists(dirPath);
      if (!dirExists) {
        await RNFS.mkdir(dirPath);
      }
      await RNFS.writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  async createRepoFromTemplate(projectName, token, username, templateRepo) {
    const response = await fetch(`https://api.github.com/repos/${username}/${templateRepo}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner: username,
        name: projectName,
        private: false,
        include_all_branches: false
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to create repository');
    }

    return await response.json();
  },

  async uploadFileToRepo(username, repoName, filePath, content, token) {
    // Check if file exists to get SHA if updating
    let sha = null;
    try {
      const checkRes = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
        headers: { 
          'Authorization': `token ${token}`, 
          'Accept': 'application/vnd.github.v3+json' 
        }
      });
      if (checkRes.ok) {
        const data = await checkRes.json();
        sha = data.sha;
      }
    } catch (e) {
      // File doesn't exist, proceed without SHA
    }

    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update ${filePath} from MasterApp`,
        content: encodedContent,
        sha: sha
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || `Failed to upload ${filePath}`);
    }

    return await response.json();
  },

  async pushProject(project, token, username, templateRepo) {
    try {
      // 1. Create Repo from Template
      const repo = await this.createRepoFromTemplate(project.name, token, username, templateRepo);
      
      // 2. Upload App.js
      const appJsPath = `${project.path}/App.js`;
      const exists = await RNFS.exists(appJsPath);
      if (exists) {
        const appJsContent = await RNFS.readFile(appJsPath, 'utf8');
        await this.uploadFileToRepo(username, project.name, 'App.js', appJsContent, token);
      }

      // 3. Upload package.json if exists
      const packagePath = `${project.path}/package.json`;
      const packageExists = await RNFS.exists(packagePath);
      if (packageExists) {
        const packageContent = await RNFS.readFile(packagePath, 'utf8');
        await this.uploadFileToRepo(username, project.name, 'package.json', packageContent, token);
      }

      return repo.html_url;
    } catch (error) {
      console.error('Push project error:', error);
      throw error;
    }
  }
};
