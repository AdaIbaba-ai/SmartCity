import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { fetchOverpassData } from '../api/overpass';

const ActivityListScreen = () => {
    const { isLandscape } = useAppContext();
    const route = useRoute();
    const navigation = useNavigation();
    const { selectedCity } = useAppContext();

    const passedActivities = route.params?.activities ?? [];

    const {
        data: activities = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['activities', selectedCity.name],
        queryFn: () => fetchOverpassData(selectedCity.name, ['activity']),
    });

    const fallbackActivities = activities
        ?.filter((item) => item.name && item.lat && item.lng)
        .map((item) => ({
            id: item.id.toString(),
            name: item.name,
            category: item.tags?.tourism || item.tags?.leisure || 'Activity',
            type: item.tags?.indoor ? 'indoor' : 'outdoor',
            address: item.tags?.['addr:street'] || 'Unknown',
            rating: parseFloat(item.tags?.rating) || 4.0,
            distance: 1.2,
            priceLevel: 1,
            image: 'https://source.unsplash.com/400x300/?activity',
            lat: item.lat,
            lng: item.lng,
            city: selectedCity.name,
        }));

    const dataToRender = passedActivities.length > 0 ? passedActivities : fallbackActivities;

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ActivityDetail', { activity: item })}
        >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.content}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.category}</Text>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text>Loading activities...</Text>
            </View>
        );
    }

    if (error || dataToRender.length === 0) {
        return (
            <View style={styles.center}>
                <Text>No activities found.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={dataToRender}
            keyExtractor={(item) => item.id}
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

export default ActivityListScreen;
