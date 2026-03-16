import axios from 'axios';
import config from '../config/env.js';

export const findNearbyHospitals = async (latitude, longitude, radius = 5000) => {
    if (!config.googleMapsApiKey) {
        // Return mock data when API key is not configured, now with latitude/longitude
        return [
            {
                name: 'City General Hospital',
                address: '123 Main Street',
                distance: '1.2 km',
                phone: '+1-555-0100',
                type: 'Hospital',
                rating: 4.5,
                location: { lat: latitude + 0.01, lng: longitude + 0.01 }
            },
            {
                name: 'Emergency Medical Center',
                address: '456 Oak Avenue',
                distance: '2.5 km',
                phone: '+1-555-0200',
                type: 'Emergency Room',
                rating: 4.3,
                location: { lat: latitude - 0.015, lng: longitude + 0.005 }
            },
            {
                name: 'St. Mary\'s Hospital',
                address: '789 Elm Street',
                distance: '3.8 km',
                phone: '+1-555-0300',
                type: 'Hospital',
                rating: 4.7,
                location: { lat: latitude + 0.005, lng: longitude - 0.02 }
            },
            {
                name: 'City Ambulance Dispatch',
                address: '101 Transport Way',
                distance: '1.0 km',
                phone: '+1-555-0911',
                type: 'Ambulance',
                rating: 4.9,
                location: { lat: latitude - 0.008, lng: longitude - 0.012 }
            },
        ];
    }

    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            {
                params: {
                    location: `${latitude},${longitude}`,
                    radius,
                    type: 'hospital',
                    key: config.googleMapsApiKey,
                },
            }
        );

        return response.data.results.map(place => ({
            name: place.name,
            address: place.vicinity,
            location: place.geometry.location,
            rating: place.rating,
            placeId: place.place_id,
        }));
    } catch (error) {
        console.error('Error calling Google Maps API:', error);
        throw new Error('Failed to find nearby hospitals');
    }
};
