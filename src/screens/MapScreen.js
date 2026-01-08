import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAppContext } from '../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { fetchOverpassData } from '../api/overpass';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const FILTERS = [
  'All', 'restaurant', 'cafe',
  'activity-indoor', 'activity-outdoor',
  'event', 'toilet', 'parking'
];

const getColorByType = (type) => {
  switch (type) {
    case 'restaurant': return '#ef4444';
    case 'cafe': return '#f97316';
    case 'activity': return '#3b82f6';
    case 'event': return '#8b5cf6';
    case 'toilet': return '#10b981';
    case 'parking': return '#4f4f6c';
    default: return '#6b7280';
  }
};

const MapScreen = () => {
  const { selectedCity } = useAppContext();
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const { isLandscape } = useAppContext();

  const cityCoords = {
    Zürich: { latitude: 47.3769, longitude: 8.5417 },
    Bern: { latitude: 46.9481, longitude: 7.4474 },
    Basel: { latitude: 47.5596, longitude: 7.5886 },
    Geneva: { latitude: 46.2044, longitude: 6.1432 },
    Lausanne: { latitude: 46.5197, longitude: 6.6323 },
    Luzern: { latitude: 47.0502, longitude: 8.3093 },
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } catch (err) {
        console.error('Location error:', err);
      }
    })();
  }, []);

  const { data: markers = [] } = useQuery({
    queryKey: ['map-data', selectedCity.name, selectedFilter],
    queryFn: () => {
      let filter = [];
      switch (selectedFilter) {
        case 'restaurant':
        case 'cafe':
          filter = ['food']; break;
        case 'toilet':
        case 'parking':
          filter = [selectedFilter]; break;
        case 'activity-indoor':
        case 'activity-outdoor':
          filter = ['activity']; break;
        case 'event':
          filter = ['event']; break;
        case 'All':
        default:
          filter = ['all']; break;
      }
      return fetchOverpassData(selectedCity.name, filter);
    }
  });

  const filteredMarkers = markers.filter((m) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'activity-indoor')
      return m.type === 'activity' && m.tags.indoor === 'yes';
    if (selectedFilter === 'activity-outdoor')
      return m.type === 'activity' && m.tags.indoor !== 'yes';
    return m.type === selectedFilter;
  });

  const showNavigationOptions = (lat, lng) => {
    Alert.alert('Navigate to location', 'Choose travel mode:', [
      {
        text: '🚶 Walk',
        onPress: () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
          Linking.openURL(url);
        },
      },
      {
        text: '🚗 Drive',
        onPress: () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
          Linking.openURL(url);
        },
      },
      {
        text: '🚌 Transit',
        onPress: () => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
          Linking.openURL(url);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
      <View style={styles.container}>
        <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              ...cityCoords[selectedCity.name],
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onRegionChangeComplete={(r) => setRegion(r)}
        >
          {filteredMarkers.map((m) => (
              <Marker
                  key={m.id}
                  coordinate={{ latitude: m.lat, longitude: m.lng }}
                  pinColor={getColorByType(m.type)}
              >
                <Callout
                    onPress={() => {
                      navigation.navigate('ActivityDetail', {
                        activity: {
                          id: m.id,
                          name: m.name,
                          address: m.tags['addr:street'] || 'Unknown',
                          city: selectedCity.name,
                          image: 'https://source.unsplash.com/400x300/?activity',
                          rating: parseFloat(m.tags.rating) || 'unknown',
                          distance: 1.0,
                          priceLevel: 2,
                          type: m.tags.indoor === 'yes' ? 'indoor' : 'outdoor',
                          category: m.tags.tourism || m.tags.leisure || m.type || 'General',
                          openingHours: m.tags.opening_hours || 'Not available',
                          description: m.tags.description || '',
                          lat: m.lat,
                          lng: m.lng,
                        },
                      });
                    }}
                >
                  <View style={{ width: 200 }}>
                    <Text style={{ fontWeight: 'bold' }}>{m.name}</Text>
                    <Text>
                      ⭐ {parseFloat(m.tags.rating) || 'unknown'} | ⏰{' '}
                      {m.tags.opening_hours || 'unknown'}
                    </Text>
                    <TouchableOpacity
                        style={{ marginTop: 6 }}
                        onPress={() => showNavigationOptions(m.lat, m.lng)}
                    >
                      <Text style={{ color: '#3b82f6' }}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              </Marker>
          ))}
        </MapView>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FILTERS.map((filter) => (
                <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedFilter === filter && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                >
                  <Text
                      style={[
                        styles.filterText,
                        selectedFilter === filter && styles.filterTextActive,
                      ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  filterContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 3,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterTextActive: {
    color: '#ffffff',
  },
});

export default MapScreen;
