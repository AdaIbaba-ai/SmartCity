import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppContext} from "../context/AppContext";
const RestaurantDetailScreen = ({ route, navigation }) => {
  const { isLandscape } = useAppContext();
  const { restaurant } = route.params;
  const [isFavorited, setIsFavorited] = useState(false);

  const addToFavorites = async () => {
    try {
      const existingFavorites = await AsyncStorage.getItem('favorites');
      let favorites = existingFavorites ? JSON.parse(existingFavorites) : [];


      const isAlreadyFavorited = favorites.some(fav => fav.id === restaurant.id);
      if (isAlreadyFavorited) {
        Alert.alert('Already Saved', 'This restaurant is already in your favorites.');
        return;
      }

      favorites.push({
        ...restaurant,
        dateAdded: new Date().toISOString(),
      });

      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorited(true);

      Alert.alert('Success', 'Restaurant added to favorites!');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      Alert.alert('Error', 'Failed to add to favorites.');
    }
  };

  const openMaps = () => {
    const url = `https://maps.google.com/maps?q=${restaurant.lat},${restaurant.lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps application.');
    });
  };

  const renderPriceLevel = (level) => {
    return '₣'.repeat(level);
  };

  return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: restaurant.image }} style={styles.heroImage} />
          <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
              style={styles.favoriteButton}
              onPress={addToFavorites}
          >
            <Text style={styles.favoriteButtonText}>{isFavorited ? '❤️' : '♡'}</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.name}>{restaurant.name}</Text>
            <View style={styles.badges}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{restaurant.cuisine}</Text>
              </View>
              <Text style={styles.rating}>⭐ {restaurant.rating}</Text>
              <Text style={styles.priceLevel}>{renderPriceLevel(restaurant.priceLevel)}</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{restaurant.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>{restaurant.distance} km away</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Opening Hours</Text>
              <Text style={styles.infoValue}>11:00 AM - 10:00 PM (Today)</Text>
            </View>
          </View>


          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>About</Text>
            <Text style={styles.descriptionText}>
              Experience authentic {restaurant.cuisine} cuisine in the heart of {restaurant.city}.
              This highly-rated restaurant offers a perfect blend of traditional flavors and modern presentation,
              making it a must-visit destination for food enthusiasts.
            </Text>
          </View>


          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton} onPress={openMaps}>
              <Text style={styles.primaryButtonText}>Navigate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={addToFavorites}>
              <Text style={styles.secondaryButtonText}>{isFavorited ? 'Saved' : 'Save'}</Text>
            </TouchableOpacity>
          </View>


          <TouchableOpacity
              style={styles.backToListButton}
              onPress={() => navigation.navigate('RestaurantList')}
          >
            <Text style={styles.backToListText}>← See All Restaurants</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  rating: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  priceLevel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  descriptionCard: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },

  backToListButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  backToListText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

export default RestaurantDetailScreen;
