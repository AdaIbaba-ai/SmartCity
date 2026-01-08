import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';


import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SettingsScreen from './src/screens/SettingsScreen';


import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import ActivityDetailScreen from './src/screens/ActivityDetailScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import RestaurantListScreen from './src/screens/RestaurantListScreen';
import ActivityListScreen from './src/screens/ActivityListScreen';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { AuthProvider, useAuth } from './src/auth/AuthContext';


import { AppProvider } from './src/context/AppContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const queryClient = new QueryClient();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },


        tabBarIcon: ({ color, size, focused }) => {
          let name;

          if (route.name === 'Home') {
            name = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            name = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Favorites') {
            name = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Settings') {
            name = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={name} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}


function RootNavigator() {

  const { user, ready } = useAuth() || {};

  if (ready === false) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
          <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
          <Stack.Screen
            name="Weather"
            component={WeatherScreen}
            options={{ headerShown: true, title: '7-Day Weather' }}
          />
          <Stack.Screen
            name="RestaurantList"
            component={RestaurantListScreen}
            options={{ headerShown: true, title: 'Restaurants Nearby' }}
          />
          <Stack.Screen
            name="ActivityList"
            component={ActivityListScreen}
            options={{ headerShown: true, title: 'Activities Nearby' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </AppProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
