// src/components/MapView.js - Improved with better placeholders
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapView({ routePoints, startLocation, currentLocation }) {
  // Check if we have valid location data
  const hasValidLocation = currentLocation && 
    currentLocation.coords && 
    currentLocation.coords.latitude !== 0 && 
    currentLocation.coords.longitude !== 0;

  // Get coordinates for display
  const getLat = (loc) => loc?.coords?.latitude?.toFixed(4) || '...';
  const getLon = (loc) => loc?.coords?.longitude?.toFixed(4) || '...';

  // For web, show an improved placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={60} color="#3498db" />
        <Text style={styles.placeholderText}>
          {routePoints.length > 0 ? '📍 Tracking Route' : '🗺️ Map View'}
        </Text>
        <Text style={styles.placeholderSubtext}>
          {routePoints.length > 0 
            ? `${routePoints.length} points tracked` 
            : 'Waiting for GPS...'}
        </Text>
        
        {/* Show location info if available */}
        {hasValidLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              📍 Current: {getLat(currentLocation)}, {getLon(currentLocation)}
            </Text>
            {startLocation && (
              <Text style={styles.locationText}>
                🟢 Start: {getLat(startLocation)}, {getLon(startLocation)}
              </Text>
            )}
            {routePoints.length > 1 && (
              <Text style={styles.locationText}>
                🔴 Points: {routePoints.length}
              </Text>
            )}
          </View>
        )}

        {!hasValidLocation && routePoints.length === 0 && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              ⏳ Please start a trip to see tracking
            </Text>
          </View>
        )}
      </View>
    );
  }

  // For mobile, use real react-native-maps
  try {
    const Map = require('react-native-maps').default;
    const Polyline = require('react-native-maps').Polyline;
    const Marker = require('react-native-maps').Marker;

    // Default region (Kuala Lumpur)
    const defaultRegion = {
      latitude: 3.1390,
      longitude: 101.6869,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    // Use current location if available
    const region = hasValidLocation ? {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    } : defaultRegion;

    return (
      <Map
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {/* Route line */}
        {routePoints.length > 1 && (
          <Polyline
            coordinates={routePoints}
            strokeColor="#3498db"
            strokeWidth={4}
          />
        )}
        
        {/* Start marker */}
        {startLocation && startLocation.coords && (
          <Marker
            coordinate={{
              latitude: startLocation.coords.latitude,
              longitude: startLocation.coords.longitude,
            }}
            title="Start"
            pinColor="green"
          />
        )}
        
        {/* Current/End marker */}
        {hasValidLocation && routePoints.length > 0 && (
          <Marker
            coordinate={{
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            }}
            title={routePoints.length > 1 ? "End" : "Current Location"}
            pinColor={routePoints.length > 1 ? "red" : "blue"}
          />
        )}
      </Map>
    );
  } catch (error) {
    // Fallback if react-native-maps fails
    return (
      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={60} color="#e74c3c" />
        <Text style={styles.placeholderText}>Map Error</Text>
        <Text style={styles.placeholderSubtext}>Please use web version or install maps</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 12,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  locationInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    width: '100%',
    maxWidth: 350,
  },
  locationText: {
    fontSize: 13,
    color: '#2c3e50',
    marginVertical: 2,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'normal',
  },
});
