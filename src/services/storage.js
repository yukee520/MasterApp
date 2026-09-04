// src/services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  saveUser: async (user) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Save user error:', error);
      return false;
    }
  },

  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  saveTrip: async (trip) => {
    try {
      const trips = await storage.getTrips();
      trips.push(trip);
      await AsyncStorage.setItem('trips', JSON.stringify(trips));
      return true;
    } catch (error) {
      console.error('Save trip error:', error);
      return false;
    }
  },

  getTrips: async () => {
    try {
      const trips = await AsyncStorage.getItem('trips');
      return trips ? JSON.parse(trips) : [];
    } catch (error) {
      console.error('Get trips error:', error);
      return [];
    }
  },

  saveActiveTrip: async (trip) => {
    try {
      await AsyncStorage.setItem('active_trip', JSON.stringify(trip));
      return true;
    } catch (error) {
      console.error('Save active trip error:', error);
      return false;
    }
  },

  getActiveTrip: async () => {
    try {
      const trip = await AsyncStorage.getItem('active_trip');
      return trip ? JSON.parse(trip) : null;
    } catch (error) {
      console.error('Get active trip error:', error);
      return null;
    }
  },

  clearActiveTrip: async () => {
    try {
      await AsyncStorage.removeItem('active_trip');
      return true;
    } catch (error) {
      console.error('Clear active trip error:', error);
      return false;
    }
  },

  clearAllTrips: async () => {
    try {
      await AsyncStorage.removeItem('trips');
      return true;
    } catch (error) {
      console.error('Clear trips error:', error);
      return false;
    }
  }
};
