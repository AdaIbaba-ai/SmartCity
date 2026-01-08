import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantsInCity } from '../api/overpass';
import { fetchWeather } from '../api/weather';

const cityCoordinates = {
  Zürich: { lat: 47.3769, lon: 8.5417 },
  Bern: { lat: 46.9481, lon: 7.4474 },
  Basel: { lat: 47.5596, lon: 7.5886 },
  Geneva: { lat: 46.2044, lon: 6.1432 },
  Lausanne: { lat: 46.5197, lon: 6.6323 },
  Luzern: { lat: 47.0502, lon: 8.3093 },
};

const HomeScreen = ({ navigation }) => {
  const { isLandscape } = useAppContext();
  const { selectedCity, setSelectedCity, swissCities } = useAppContext();
  const coords = cityCoordinates[selectedCity.name];


  const {
    data: restaurantData = [],
    isLoading: isLoadingRestaurants,
    error: restaurantError,
  } = useQuery({
    queryKey: ['restaurants', selectedCity.name],
    queryFn: () => fetchRestaurantsInCity(selectedCity.name),
  });


  const {
    data: weather,
    isLoading: isLoadingWeather,
    error: weatherError,
  } = useQuery({
    queryKey: ['weather', selectedCity.name],
    queryFn: () => fetchWeather(coords?.lat, coords?.lon),
    enabled: !!coords,
  });


  const cityRestaurants = restaurantData
    .filter((item) => item.tags?.name && item.lat && item.lon)
    .map((item) => ({
      id: item.id.toString(),
      name: item.tags.name,
      cuisine: item.tags.cuisine || 'Restaurant',
      rating: 4.2,
      distance: 0.5,
      image: 'https://source.unsplash.com/400x300/?restaurant',
      lat: item.lat,
      lng: item.lon,
      type: 'restaurant',
      address: item.tags['addr:street'] || '',
    }));

  const getWeatherEmoji = (code) => {
    if (!code && code !== 0) return '❓';
    if (code >= 0 && code <= 3) return '☀️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌦️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 95) return '⛈️';
    return '☁️';
  };
  const getWeatherLabel = (code) => {
    if (!code && code !== 0) return 'Weather';
    if (code >= 0 && code <= 1) return 'Sunny';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Cloudy';
    if (code >= 51 && code <= 67) return 'Drizzle/Rain';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Weather';
  };


  const showCityPicker = () => {
    Alert.alert(
      'Select City',
      'Choose your preferred Swiss city:',
      (swissCities || []).map((city) => ({
        text: `${city.name}`,
        onPress: () => setSelectedCity(city),
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };


  const Header = () => (
    <LinearGradient
      colors={['#4f80ff', '#6485ff', '#8aa1ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroTopRow}>
        <Feather name="map-pin" size={22} color="#fff" />
        <Text style={styles.brand}>SmartCity</Text>
        <View style={{ flex: 1 }} />
        {/*<Ionicons name="notifications-outline" size={22} color="#ffffff" />*/}
      </View>

      {/* Mountain art + darken overlay */}
      <Image
        source={require('../assets/hero/mountain.png')}
        style={styles.heroArt}
        resizeMode="cover"
        pointerEvents="none"
      />
      <View style={styles.heroOverlay} />


      <TouchableOpacity style={styles.cityPill} activeOpacity={0.8} onPress={showCityPicker}>
        <MaterialCommunityIcons name="office-building-outline" size={18} color="#ffffff" />
        <Text style={styles.cityPillText}>
          {selectedCity.name} {selectedCity.emoji}
        </Text>
        <Feather name="chevron-down" size={18} color="#ffffff" />
      </TouchableOpacity>


      <TouchableOpacity onPress={() => navigation.navigate('Weather')} activeOpacity={0.9}>
        <View style={styles.weatherCard}>
          {isLoadingWeather ? (
            <Text>Loading weather...</Text>
          ) : weatherError ? (
            <Text style={{ color: 'red' }}>Error loading weather</Text>
          ) : (
            <View style={styles.weatherContent}>
              <Text style={styles.weatherEmoji}>{getWeatherEmoji(weather?.weathercode)}</Text>
              <View style={styles.weatherLeft}>
                <Text style={styles.tempText}>{Math.round(weather?.temperature ?? 0)}°</Text>
                <Text style={styles.weatherDesc}>{getWeatherLabel(weather?.weathercode)}</Text>
              </View>
              <View style={styles.weatherRight}>
                <Text style={styles.hlText}>
                  Wind: {Math.round(weather?.windspeed ?? 0)} km/h
                </Text>
                <Text style={styles.feelsText}>Feels like {Math.round(weather?.apparent ?? weather?.temperature ?? 0)}°</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );


  const ExploreGrid = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Explore {selectedCity.name}</Text>
      <View style={styles.gridWrap}>
        <TouchableOpacity
            style={[styles.gridCard, styles.tintOrange]}
            onPress={() => navigation.navigate('RestaurantList', { restaurants: cityRestaurants })}

            activeOpacity={0.9}
        >

          <View style={styles.gridIconWrap}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#F97316" />
          </View>
          <Text style={styles.gridTitle}>Restaurants</Text>
          <Text style={styles.gridSub}>& Cafés nearby</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.gridCard, styles.tintGreen]}
            onPress={() => navigation.navigate('ActivityList')}
            activeOpacity={0.9}
        >
          <View style={styles.gridIconWrap}>
            <MaterialCommunityIcons name="terrain" size={24} color="#10B981" />
          </View>
          <Text style={styles.gridTitle}>Activities</Text>
          <Text style={styles.gridSub}>Indoor & Outdoor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, styles.tintIndigo]} onPress={() => navigation.navigate('Map')} activeOpacity={0.9}>
          <View style={styles.gridIconWrap}>
            <Feather name="map" size={24} color="#6366F1" />
          </View>
          <Text style={styles.gridTitle}>City Map</Text>
          <Text style={styles.gridSub}>with zones</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.gridCard, styles.tintPink]} onPress={() => navigation.navigate('Favorites')} activeOpacity={0.9}>
          <View style={styles.gridIconWrap}>
            <Feather name="heart" size={24} color="#F43F5E" />
          </View>
          <Text style={styles.gridTitle}>Favorites</Text>
          <Text style={styles.gridSub}>Your saved places</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ===== QUICK ACTIONS =====
  const QuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <TouchableOpacity style={styles.qaCard} onPress={() => navigation.navigate('Map')} activeOpacity={0.9}>
        <View style={[styles.qaIconBadge, styles.tintPurple]}>
          <MaterialCommunityIcons name="bus-clock" size={22} />
        </View>
        <View style={styles.qaTextWrap}>
          <Text style={styles.qaTitle}>Public Transport</Text>
          <Text style={styles.qaSub}>Live schedules & routes</Text>
        </View>
        <Feather name="chevron-right" size={22} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.qaCard} onPress={() => navigation.navigate('Favorites')} activeOpacity={0.9}>
        <View style={[styles.qaIconBadge, styles.tintMint]}>
          <Feather name="calendar" size={22} />
        </View>
        <View style={styles.qaTextWrap}>
          <Text style={styles.qaTitle}>Events Today</Text>
          <Text style={styles.qaSub}>What’s happening nearby</Text>
        </View>
        <Feather name="chevron-right" size={22} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );

   const Featured = () => (
  <View style={[styles.section, { paddingHorizontal: 20 }]}>
    {cityRestaurants[0] && (
        <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigation.navigate('RestaurantList', { restaurants: cityRestaurants })
            }


        >
          <Image source={{ uri: cityRestaurants[0].image }} style={styles.featuredImg} />
          <View style={styles.featuredBody}>
            <Text style={styles.featuredTitle}>Explore Restaurants</Text>
            <Text style={styles.featuredSub}>Top picks in {selectedCity.name}</Text>
            <View style={styles.featuredRow}>
              <Text style={styles.featuredMeta}>⭐ {cityRestaurants[0].rating}</Text>
              <Text style={styles.featuredMetaMuted}>{cityRestaurants[0].distance} km</Text>
            </View>
          </View>
        </TouchableOpacity>
    )}
  </View>
   );

  return isLandscape ? (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Sidebar (links) */}
        <View style={{ width: '32%', backgroundColor: '#4f80ff' }}>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 20 }}>
              SmartCity
            </Text>

            {/* City Selector */}
            <TouchableOpacity style={styles.cityPill} activeOpacity={0.8} onPress={showCityPicker}>
              <MaterialCommunityIcons name="office-building-outline" size={18} color="#ffffff" />
              <Text style={styles.cityPillText}>
                {selectedCity.name} {selectedCity.emoji}
              </Text>
              <Feather name="chevron-down" size={18} color="#ffffff" />
            </TouchableOpacity>

            {/* Weather */}
            <TouchableOpacity onPress={() => navigation.navigate('Weather')} activeOpacity={0.9} style={{ marginTop: 20 }}>
              <View style={styles.weatherCard}>
                {isLoadingWeather ? (
                    <Text>Loading...</Text>
                ) : weatherError ? (
                    <Text style={{ color: 'red' }}>Error</Text>
                ) : (
                    <View style={styles.weatherContent}>
                      <Text style={styles.weatherEmoji}>{getWeatherEmoji(weather?.weathercode)}</Text>
                      <View style={styles.weatherLeft}>
                        <Text style={styles.tempText}>{Math.round(weather?.temperature ?? 0)}°</Text>
                        <Text style={styles.weatherDesc}>{getWeatherLabel(weather?.weathercode)}</Text>
                      </View>
                    </View>
                )}
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>


        <ScrollView
            style={{ flex: 1, backgroundColor: '#F7F8FC' }}
            contentContainerStyle={{ paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
        >
          <ExploreGrid />
          <QuickActions />
          <Featured />
        </ScrollView>
      </View>
  ) : (

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Header />
        <ExploreGrid />
        <QuickActions />
        <Featured />
      </ScrollView>
  );
};

const CARD_RADIUS = 18;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FC' },

  hero: {
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 78,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  heroArt: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -6,
    width: '100%',
    height: 220,
    opacity: 0.55,
    zIndex: 0,
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  brand: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 8 },
  cityPill: {
    marginTop: 16,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    zIndex: 2,
  },
  cityPillText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  weatherCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 2,
  },
  weatherContent: { flexDirection: 'row', alignItems: 'center' },
  weatherEmoji: { fontSize: 44, marginRight: 16 },
  weatherLeft: { flex: 1 },
  tempText: { fontSize: 44, fontWeight: '800', color: '#0f172a', lineHeight: 48 },
  weatherDesc: { marginTop: 2, fontSize: 16, color: '#6b7280' },
  weatherRight: { alignItems: 'flex-end' },
  hlText: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  feelsText: { fontSize: 14, color: '#6b7280' },

  section: { marginTop: 22 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1f2937', paddingHorizontal: 20, marginBottom: 14 },


  gridWrap: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gridCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  gridIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
  },
  gridTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  gridSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  tintOrange: { backgroundColor: '#FFF4EA' },
  tintGreen:  { backgroundColor: '#ECF8F1' },
  tintIndigo: { backgroundColor: '#EEF2FF' },
  tintPink:   { backgroundColor: '#FFEFF3' },


  qaCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: CARD_RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  qaIconBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  qaTextWrap: { flex: 1 },
  qaTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  qaSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  tintPurple: { backgroundColor: '#F0E9FF' },
  tintMint: { backgroundColor: '#EAFBF3' },


  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  featuredImg: { width: '100%', height: 140 },
  featuredBody: { padding: 14 },
  featuredTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  featuredSub: { fontSize: 13, color: '#6b7280', marginTop: 2, marginBottom: 6 },
  featuredRow: { flexDirection: 'row', justifyContent: 'space-between' },
  featuredMeta: { fontSize: 12, color: '#374151' },
  featuredMetaMuted: { fontSize: 12, color: '#9ca3af' },
});

export default HomeScreen;
