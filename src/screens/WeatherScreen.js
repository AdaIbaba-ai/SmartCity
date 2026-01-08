import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import { fetch7DayForecast } from '../api/weather';

const WeatherScreen = () => {
    const { selectedCity } = useAppContext();
    const { isLandscape } = useAppContext();
    const { data, isLoading, error } = useQuery({
        queryKey: ['forecast', selectedCity.name],
        queryFn: () => fetch7DayForecast(selectedCity),
    });

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.day}>{item.date}</Text>
            <Text style={styles.icon}>{getEmoji(item.condition)}</Text>
            <Text style={styles.temp}>{item.temp}°C</Text>
        </View>
    );

    const getEmoji = (condition) => {
        switch (condition) {
            case 'sunny': return '☀️';
            case 'partly_cloudy': return '⛅';
            case 'cloudy': return '☁️';
            case 'rainy': return '🌧️';
            default: return '❓';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>7-Day Forecast for {selectedCity.name}</Text>
            {isLoading ? (
                <Text>Loading...</Text>
            ) : error ? (
                <Text style={{ color: 'red' }}>Error loading forecast.</Text>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f8fafc',
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1f2937',
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    day: {
        fontSize: 16,
        color: '#374151',
    },
    icon: {
        fontSize: 24,
    },
    temp: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
});

export default WeatherScreen;
