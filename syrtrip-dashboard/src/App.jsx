import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Hotels from './pages/Hotels/Hotels';
import Restaurants from './pages/Restaurants/Restaurants';
import Places from './pages/Places/Places';
import Transport from './pages/Transport/Transport';
import Bookings from './pages/Bookings/Bookings';
import Users from './pages/Users/Users';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/places" element={<Places />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/users" element={<Users />} />
      </Routes>
    </Layout>
  );
}

export default App;