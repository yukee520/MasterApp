import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PROJECTS: '@MasterApp_projects',
  SETTINGS: '@MasterApp_settings',
};

const DEFAULT_PROJECTS = [
  {
    id: '1',
    name: 'MyTodoApp',
    description: 'A simple todo list application',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    githubRepo: 'yukee520/MyTodoApp',
    status: 'active',
  },
  {
    id: '2',
    name: 'CalculatorPro',
    description: 'Advanced calculator with scientific functions',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    githubRepo: 'yukee520/CalculatorPro',
    status: 'active',
  },
];

export const projectManager = {
  getProjects: async () => {
    try {
      const projectsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (projectsJson === null) {
        await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
        return DEFAULT_PROJECTS;
      }
      return JSON.parse(projectsJson);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  saveProject: async (project) => {
    try {
      const existingProjects = await projectManager.getProjects();
      const projectIndex = existingProjects.findIndex(p => p.id === project.id);
      
      const updatedProject = {
        ...project,
        updatedAt: new Date().toISOString(),
      };

      let updatedProjects;
      if (projectIndex >= 0) {
        updatedProjects = existingProjects.map((p, index) => 
          index === projectIndex ? updatedProject : p
        );
      } else {
        updatedProjects = [...existingProjects, updatedProject];
      }

      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
      return updatedProject;
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  },

  removeProject: async (projectId) => {
    try {
      const projects = await projectManager.getProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filteredProjects));
      return filteredProjects;
    } catch (error) {
      console.error('Error removing project:', error);
      throw error;
    }
  },

  getProjectById: async (projectId) => {
    try {
      const projects = await projectManager.getProjects();
      return projects.find(p => p.id === projectId) || null;
    } catch (error) {
      console.error('Error getting project:', error);
      return null;
    }
  },

  getSettings: async () => {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsJson === null) {
        const defaultSettings = {
          githubUsername: 'yukee520',
          patToken: '',
          defaultRepo: 'react-native-template',
          autoPush: true,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        return defaultSettings;
      }
      return JSON.parse(settingsJson);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    }
  },

  saveSettings: async (settings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return settings;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
};
