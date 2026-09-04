// src/screens/TripScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const TripScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  const startTrip = async () => {
    setLoading(true);
    try {
      // For now, just simulate starting
      setIsTracking(true);
      Alert.alert('Trip Started!', 'GPS tracking is now active.');
      // Start timer
      const interval = setInterval(() => {
        setDuration(prev => prev + 1);
        // Simulate distance increasing
        setDistance(prev => prev + 0.01);
      }, 1000);
      
      // Store interval to clear later
      window.timerInterval = interval;
      
    } catch (error) {
      Alert.alert('Error', 'Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  const endTrip = () => {
    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: () => {
            // Clear timer
            if (window.timerInterval) {
              clearInterval(window.timerInterval);
              window.timerInterval = null;
            }
            setIsTracking(false);
            
            // Navigate to summary with mock data
            const tripSummary = {
              trip_id: 'trip_' + Date.now(),
              distance_km: distance,
              duration_minutes: Math.round(duration / 60),
              start_time: new Date().toISOString(),
              end_time: new Date().toISOString(),
              start_town: 'Kuala Lumpur',
              end_town: 'Petaling Jaya',
              start_lat: 3.1390,
              start_lon: 101.6869,
              end_lat: 3.1073,
              end_lon: 101.6068,
              user_name: 'Driver'
            };
            
            navigation.navigate('Summary', { trip: tripSummary });
          }
        }
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {/* Placeholder map - will be replaced with actual map */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={60} color="#bdc3c7" />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            GPS will show your route here
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {!isTracking ? (
          // Start Trip
          <View style={styles.tripInfo}>
            <Text style={styles.infoText}>Ready to track your trip</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startTrip}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="car" size={24} color="white" />
                  <Text style={styles.buttonText}>Start Trip</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Active Trip
          <View style={styles.activeTrip}>
            <View style={styles.tripStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{formatTime(duration)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.endButton}
              onPress={endTrip}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="stop-circle" size={24} color="white" />
                  <Text style={styles.buttonText}>End Trip</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 10,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 4,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tripInfo: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  activeTrip: {
    width: '100%',
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 2,
  },
});

export default TripScreen;
