// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);

  // Placeholder data for now
  useEffect(() => {
    // We'll add real data loading later
    setTrips([]);
  }, []);

  const startNewTrip = () => {
    navigation.navigate('Trip');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Hello, Driver!</Text>
        <Text style={styles.subtitle}>Track your trips easily</Text>
      </View>

      {/* Today's Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="car-outline" size={24} color="#3498db" />
          <Text style={styles.summaryNumber}>0</Text>
          <Text style={styles.summaryLabel}>Today's Trips</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="speedometer-outline" size={24} color="#2ecc71" />
          <Text style={styles.summaryNumber}>0 km</Text>
          <Text style={styles.summaryLabel}>Today's Distance</Text>
        </View>
        <View style={styles.summaryCard}>
          <Ionicons name="stats-chart-outline" size={24} color="#f39c12" />
          <Text style={styles.summaryNumber}>0</Text>
          <Text style={styles.summaryLabel}>Total Trips</Text>
        </View>
      </View>

      {/* Start Trip Button */}
      <TouchableOpacity 
        style={styles.startButton} 
        onPress={startNewTrip}
      >
        <Ionicons name="car" size={30} color="white" />
        <Text style={styles.startButtonText}>Start New Trip</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('History')}
        >
          <Ionicons name="list-outline" size={24} color="#3498db" />
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Coming Soon!', 'More features on the way!')}
        >
          <Ionicons name="settings-outline" size={24} color="#3498db" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    marginTop: 10,
  },
  summaryCard: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    padding: 18,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
});

export default HomeScreen;
