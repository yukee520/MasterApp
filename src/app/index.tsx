// src/app/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [trips, setTrips] = useState([]);

  const startNewTrip = () => {
    router.push('/trip');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hello, Driver! 👋</Text>
          <Text style={styles.subtitle}>Track your trips easily</Text>
        </View>

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

        <TouchableOpacity 
          style={styles.startButton} 
          onPress={startNewTrip}
        >
          <Ionicons name="car" size={30} color="white" />
          <Text style={styles.startButtonText}>Start New Trip</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('History', 'Your trips will appear here')}
          >
            <Ionicons name="list-outline" size={24} color="#3498db" />
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Settings', 'More features coming soon!')}
          >
            <Ionicons name="settings-outline" size={24} color="#3498db" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            💡 Tap "Start New Trip" to begin tracking your journey.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCard: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 22,
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
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  infoSection: {
    margin: 20,
    padding: 15,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
});
