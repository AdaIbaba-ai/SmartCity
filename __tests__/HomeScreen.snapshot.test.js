import React from 'react';
import renderer from 'react-test-renderer';
import HomeScreen from '../src/screens/HomeScreen';

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    return {
        Feather: () => React.createElement('Feather'),
        MaterialCommunityIcons: () => React.createElement('MaterialCommunityIcons'),
        Ionicons: () => React.createElement('Ionicons'),
    };
});

jest.mock('expo-linear-gradient', () => {
    const React = require('react');
    return {
        LinearGradient: ({ children }) => React.createElement('View', null, children),
    };
});

jest.mock('../src/context/AppContext', () => ({
    useAppContext: () => ({
        isLandscape: false,
        selectedCity: { name: 'Zürich', emoji: '🇨🇭' },
        setSelectedCity: jest.fn(),
        swissCities: [{ name: 'Zürich', emoji: '🇨🇭' }],
    }),
}));

jest.mock('@tanstack/react-query', () => ({
    useQuery: () => ({
        data: {
            temperature: 20,
            weathercode: 1,
            windspeed: 5,
            apparent: 19,
        },
        isLoading: false,
        error: null,
    }),
}));

jest.mock('../src/api/overpass', () => ({
    fetchRestaurantsInCity: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../src/api/weather', () => ({
    fetchWeather: jest.fn(() => Promise.resolve({
        temperature: 20,
        weathercode: 1,
        windspeed: 5,
        apparent: 19,
    })),
}));

// Snapshot-Test
test('renders HomeScreen correctly (snapshot)', () => {
    const tree = renderer.create(<HomeScreen navigation={{ navigate: jest.fn() }} />).toJSON();
    expect(tree).toMatchSnapshot();
});
