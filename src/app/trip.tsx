// src/app/trip.tsx - Improved Location Handling
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import MapView from '../components/MapView';

export default function TripScreen() {
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [location, setLocation] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('waiting'); // 'waiting', 'ready', 'tracking'
  
  const watchSubscription = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    console.log('🔄 TripScreen mounted');
    if (Platform.OS !== 'web') {
      requestPermissions();
    } else {
      // Web: Use default location
      setLocation({
        coords: {
          latitude: 3.1390,
          longitude: 101.6869
        }
      });
      setGpsStatus('ready');
    }
    return () => {
      console.log('🧹 TripScreen cleanup');
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      console.log('📱 Requesting permissions...');
      setGpsStatus('waiting');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(loc);
        setGpsStatus('ready');
        console.log('✅ Location granted:', loc.coords);
        Alert.alert('GPS Ready', 'Location permissions granted!');
      } else {
        setGpsStatus('denied');
        Alert.alert(
          'Permission Required', 
          'Please enable location in settings to track trips',
          [
            { text: 'OK' },
            { text: 'Open Settings', onPress: () => Location.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Permission error:', error);
      setGpsStatus('error');
    }
  };

  const startTrip = async () => {
    console.log('🚗 Start Trip button pressed');
    
    if (!location) {
      Alert.alert('GPS Not Ready', 'Please wait for GPS to initialize');
      return;
    }

    setLoading(true);
    try {
      let loc;
      if (Platform.OS !== 'web') {
        // Get fresh location on mobile
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      } else {
        // Web: use current location
        loc = location;
      }
      
      console.log('📍 Location obtained:', loc.coords);
      setStartLocation(loc);
      setLocation(loc);
      setStartTime(new Date());
      setRoutePoints([{
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      }]);
      setDistance(0);
      setDuration(0);
      setGpsStatus('tracking');
      
      setIsTracking(true);
      console.log('✅ Tracking started');
      
      // Start watching location (mobile only)
      if (Platform.OS !== 'web') {
        watchSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (newLocation) => {
            console.log('📍 Location update:', newLocation.coords);
            setLocation(newLocation);
            setRoutePoints(prev => {
              const newPoints = [...prev, {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude
              }];
              if (prev.length > 0) {
                const lastPoint = prev[prev.length - 1];
                const newDistance = calculateDistance(
                  lastPoint.latitude, lastPoint.longitude,
                  newLocation.coords.latitude, newLocation.coords.longitude
                );
                setDistance(prevDist => prevDist + newDistance);
              }
              return newPoints;
            });
          }
        );
      }
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      Alert.alert('🚗 Trip Started!', 'GPS tracking is now active.');
    } catch (error) {
      console.error('❌ Start trip error:', error);
      Alert.alert('Error', 'Failed to start trip: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Web-only: Update location manually
  const updateLocation = () => {
    if (Platform.OS === 'web' && isTracking) {
      console.log('🔄 Updating location (web)');
      const newLat = location.coords.latitude + 0.001;
      const newLon = location.coords.longitude + 0.001;
      const newLocation = {
        coords: {
          latitude: newLat,
          longitude: newLon
        }
      };
      setLocation(newLocation);
      setRoutePoints(prev => {
        const newPoints = [...prev, {
          latitude: newLat,
          longitude: newLon
        }];
        if (prev.length > 0) {
          const lastPoint = prev[prev.length - 1];
          const newDistance = calculateDistance(
            lastPoint.latitude, lastPoint.longitude,
            newLat, newLon
          );
          setDistance(prevDist => prevDist + newDistance);
        }
        return newPoints;
      });
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const endTrip = () => {
    console.log('🔴 End Trip button pressed');
    
    // Clean up
    if (intervalRef.current) {
      console.log('🧹 Clearing timer');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (watchSubscription.current) {
      console.log('🧹 Clearing location watch');
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    
    // Prepare trip data
    const endTime = new Date();
    const tripData = {
      distance: distance.toFixed(2),
      duration: Math.round(duration / 60),
      start_time: startTime ? startTime.toISOString() : new Date().toISOString(),
      end_time: endTime.toISOString(),
      points: JSON.stringify(routePoints),
      start_lat: String(startLocation?.coords?.latitude || 0),
      start_lon: String(startLocation?.coords?.longitude || 0),
      end_lat: String(location?.coords?.latitude || 0),
      end_lon: String(location?.coords?.longitude || 0),
    };
    
    console.log('📊 Trip data:', tripData);
    
    setIsTracking(false);
    setGpsStatus('ready');
    console.log('🚀 Navigating to summary with data...');
    
    router.push({
      pathname: '/summary',
      params: tripData
    });
    console.log('✅ Navigation called');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get GPS status message
  const getGpsMessage = () => {
    switch (gpsStatus) {
      case 'waiting': return '⏳ Getting GPS...';
      case 'ready': return '✅ GPS Ready';
      case 'tracking': return '📍 Tracking...';
      case 'denied': return '❌ GPS Denied';
      case 'error': return '⚠️ GPS Error';
      default: return '⏳ Initializing...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          routePoints={routePoints}
          startLocation={startLocation}
          currentLocation={location}
        />
      </View>

      <View style={styles.controlsContainer}>
        {!isTracking ? (
          <View style={styles.tripInfo}>
            <Text style={styles.infoText}>{getGpsMessage()}</Text>
            {location && (
              <Text style={styles.coordsText}>
                📍 {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.startButton, (gpsStatus !== 'ready' && gpsStatus !== 'tracking') && styles.disabledButton]}
              onPress={startTrip}
              disabled={loading || (gpsStatus !== 'ready' && gpsStatus !== 'tracking')}
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
          <View style={styles.activeTrip}>
            <View style={styles.tripStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{formatTime(duration)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Points</Text>
                <Text style={styles.statValue}>{routePoints.length}</Text>
              </View>
            </View>

            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={styles.updateButton}
                onPress={updateLocation}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.updateButtonText}>Update Location (Web)</Text>
              </TouchableOpacity>
            )}

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapContainer: {
    flex: 1,
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
    marginBottom: 4,
  },
  coordsText: {
    fontSize: 12,
    color: '#95a5a6',
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
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginTop: 10,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f39c12',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
