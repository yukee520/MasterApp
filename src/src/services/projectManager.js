import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_KEY = '@master_app_projects';

export const getProjects = async () => {
  try {
    const data = await AsyncStorage.getItem(PROJECTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
    return [];
  } catch (error) {
    console.error('Failed to load projects', error);
    return [];
  }
};

export const saveProject = async (project) => {
  try {
    const projects = await getProjects();
    const existingIndex = projects.findIndex(p => p.name === project.name);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.unshift(project);
    }
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    return projects;
  } catch (error) {
    console.error('Failed to save project', error);
    throw error;
  }
};

export const removeProject = async (projectName) => {
  try {
    const projects = await getProjects();
    const filtered = projects.filter(p => p.name !== projectName);
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Failed to delete project', error);
    throw error;
  }
};

export const getProject = async (projectName) => {
  try {
    const projects = await getProjects();
    return projects.find(p => p.name === projectName) || null;
  } catch (error) {
    console.error('Failed to get project', error);
    return null;
  }
};
