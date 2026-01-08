import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { fetchOverpassData } from '../api/overpass';
import { useNavigation, useRoute } from '@react-navigation/native';

const RestaurantListScreen = () => {
    const { isLandscape } = useAppContext();
    const { selectedCity } = useAppContext();
    const navigation = useNavigation();
    const route = useRoute();

    const passedRestaurants = route.params?.restaurants ?? [];

    const {
        data: restaurantsFromQuery = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['restaurant-list', selectedCity.name],
        queryFn: () => fetchOverpassData(selectedCity.name, ['restaurant', 'cafe']),
    });

    const restaurants =
        passedRestaurants.length > 0
            ? passedRestaurants
            : restaurantsFromQuery
                .filter((item) => item.tags?.name && item.lat && item.lng)
                .map((item) => ({
                    id: item.id.toString(),
                    name: item.tags.name,
                    cuisine: item.tags.cuisine || 'Unknown',
                    rating: parseFloat(item.tags?.rating) || 4.2,
                    address: item.tags?.['addr:street'] || 'Unknown',
                    city: selectedCity.name,
                    distance: 1.0,
                    priceLevel: 2,
                    image: 'https://source.unsplash.com/400x300/?restaurant',
                    lat: item.lat,
                    lng: item.lng,
                    type: item.type || 'restaurant',
                }));

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate('RestaurantDetail', {
                    restaurant: item,
                })
            }
        >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.content}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.cuisine}</Text>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text>Loading restaurants...</Text>
            </View>
        );
    }

    if (error || restaurants.length === 0) {
        return (
            <View style={styles.center}>
                <Text>No restaurants found.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={restaurants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 3,
    },
    image: {
        height: 180,
        width: '100%',
    },
    content: {
        padding: 15,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    sub: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 6,
    },
    rating: {
        fontSize: 14,
        color: '#f59e0b',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RestaurantListScreen;
