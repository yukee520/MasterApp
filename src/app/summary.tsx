// src/app/summary.tsx - Shows Area Names & Hide Points
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import MapView from '../components/MapView';

export default function SummaryScreen() {
  const params = useLocalSearchParams();
  const [startAddress, setStartAddress] = useState(null);
  const [endAddress, setEndAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Extract params
  const { 
    distance, 
    duration, 
    start_time, 
    end_time,
    points,
    start_lat,
    start_lon,
    end_lat,
    end_lon
  } = params;

  // Parse route points
  let routePoints = [];
  try {
    if (points && typeof points === 'string') {
      routePoints = JSON.parse(points);
    }
  } catch (e) {
    routePoints = [];
  }

  const startLat = parseFloat(start_lat || 0);
  const startLon = parseFloat(start_lon || 0);
  const endLat = parseFloat(end_lat || 0);
  const endLon = parseFloat(end_lon || 0);

  // Get address from coordinates
  useEffect(() => {
    getAddresses();
  }, []);

  const getAddresses = async () => {
    setLoading(true);
    try {
      // Get start address
      if (startLat > 0 && startLon > 0) {
        const startAddr = await Location.reverseGeocodeAsync({
          latitude: startLat,
          longitude: startLon,
        });
        if (startAddr.length > 0) {
          setStartAddress(startAddr[0]);
        }
      }

      // Get end address
      if (endLat > 0 && endLon > 0) {
        const endAddr = await Location.reverseGeocodeAsync({
          latitude: endLat,
          longitude: endLon,
        });
        if (endAddr.length > 0) {
          setEndAddress(endAddr[0]);
        }
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format address nicely
  const formatAddress = (address) => {
    if (!address) return 'Unknown location';
    
    // Build readable address
    const parts = [];
    if (address.name) parts.push(address.name);
    if (address.street) parts.push(address.street);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ') || 'Unknown location';
  };

  // Get short location name (city/area)
  const getShortLocation = (address) => {
    if (!address) return 'Unknown';
    return address.city || address.district || address.region || address.street || 'Unknown';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Format duration
  const formatDuration = (minutes) => {
    const mins = parseInt(minutes || 0);
    if (mins < 1) return 'Less than a minute';
    if (mins < 60) return `${mins} minutes`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Create location objects for map
  const startLocation = startLat > 0 ? { coords: { latitude: startLat, longitude: startLon } } : null;
  const endLocation = endLat > 0 ? { coords: { latitude: endLat, longitude: endLon } } : null;

  // Navigation
  const handleHome = () => {
    router.push('/');
  };

  const handleNewTrip = () => {
    router.push('/trip');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Getting location names...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={60} color="#2ecc71" />
        <Text style={styles.headerTitle}>Trip Completed! ✅</Text>
      </View>

      {/* Map */}
      {routePoints.length > 1 && (
        <View style={styles.mapCard}>
          <Text style={styles.cardTitle}>🗺️ Route Map</Text>
          <View style={styles.mapContainer}>
            <MapView
              routePoints={routePoints}
              startLocation={startLocation}
              currentLocation={endLocation}
            />
          </View>
        </View>
      )}

      {/* Trip Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>📊 Trip Summary</Text>
        
        {/* Distance */}
        <View style={styles.detailRow}>
          <Ionicons name="speedometer-outline" size={22} color="#3498db" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{distance || 0} km</Text>
          </View>
        </View>

        {/* Duration */}
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={22} color="#f39c12" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{formatDuration(duration)}</Text>
          </View>
        </View>

        {/* Start Time */}
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={22} color="#2ecc71" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Started</Text>
            <Text style={styles.detailValue}>{formatDate(start_time)}</Text>
          </View>
        </View>

        {/* End Time */}
        <View style={styles.detailRow}>
          <Ionicons name="flag-outline" size={22} color="#e74c3c" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Ended</Text>
            <Text style={styles.detailValue}>{formatDate(end_time)}</Text>
          </View>
        </View>

        {/* START LOCATION - With Area Name */}
        {startLat > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="navigate-circle" size={22} color="#2ecc71" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>📍 Start Location</Text>
              <Text style={styles.detailValue}>{getShortLocation(startAddress)}</Text>
              <Text style={styles.detailSubtext}>{formatAddress(startAddress)}</Text>
            </View>
          </View>
        )}

        {/* END LOCATION - With Area Name */}
        {endLat > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="location" size={22} color="#e74c3c" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>🏁 End Location</Text>
              <Text style={styles.detailValue}>{getShortLocation(endAddress)}</Text>
              <Text style={styles.detailSubtext}>{formatAddress(endAddress)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleHome}
        >
          <Ionicons name="home" size={20} color="white" />
          <Text style={styles.actionButtonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.successButton]}
          onPress={handleNewTrip}
        >
          <Ionicons name="car" size={20} color="white" />
          <Text style={styles.actionButtonText}>New Trip</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 10,
  },
  mapCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  detailsCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailContent: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#95a5a6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    marginTop: 2,
  },
  detailSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  successButton: {
    backgroundColor: '#2ecc71',
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
});
