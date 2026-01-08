import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppContext} from "../context/AppContext";

const FavoritesScreen = ({ navigation }) => {
  const { isLandscape } = useAppContext();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this item from your favorites?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedFavorites = favorites.filter(item => item.id !== id);
              setFavorites(updatedFavorites);
              await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            } catch (error) {
              console.error('Error removing favorite:', error);
            }
          },
        },
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteCard}>
      <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      <View style={styles.favoriteContent}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoriteSubtitle}>
          {item.type === 'restaurant' ? item.cuisine : item.category}
        </Text>
        <Text style={styles.favoriteLocation}>{item.city}</Text>
        <View style={styles.favoriteFooter}>
          <Text style={styles.favoriteRating}>⭐ {item.rating}</Text>
          <Text style={styles.favoriteDistance}>{item.distance} km</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.id)}
      >
        <Text style={styles.removeButtonText}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start exploring restaurants and activities to add them to your favorites!
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.exploreButtonText}>Start Exploring</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 20,
  },
  favoriteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  favoriteImage: {
    width: 80,
    height: 80,
  },
  favoriteContent: {
    flex: 1,
    padding: 15,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  favoriteSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  favoriteLocation: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  favoriteRating: {
    fontSize: 12,
    color: '#374151',
  },
  favoriteDistance: {
    fontSize: 12,
    color: '#6b7280',
  },
  removeButton: {
    padding: 15,
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 18,
  },
});

export default FavoritesScreen;