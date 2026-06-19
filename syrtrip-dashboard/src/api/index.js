import axios from 'axios';

const API_URL = 'https://syrtrip1.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getHotels = () => api.get('/hotels');
export const createHotel = (data) => api.post('/hotels', data);
export const updateHotel = (id, data) => api.put(`/hotels/${id}`, data);
export const deleteHotel = (id) => api.delete(`/hotels/${id}`);

export const getRestaurants = () => api.get('/restaurants');
export const createRestaurant = (data) => api.post('/restaurants', data);
export const updateRestaurant = (id, data) => api.put(`/restaurants/${id}`, data);
export const deleteRestaurant = (id) => api.delete(`/restaurants/${id}`);

export const getPlaces = () => api.get('/places');
export const createPlace = (data) => api.post('/places', data);
export const updatePlace = (id, data) => api.put(`/places/${id}`, data);
export const deletePlace = (id) => api.delete(`/places/${id}`);

export const getTransports = () => api.get('/transport');
export const createTransport = (data) => api.post('/transport', data);
export const updateTransport = (id, data) => api.put(`/transport/${id}`, data);
export const deleteTransport = (id) => api.delete(`/transport/${id}`);

export const getBookings = () => api.get('/bookings');
export const getBookingStats = () => api.get('/bookings/stats/all');

export default api;