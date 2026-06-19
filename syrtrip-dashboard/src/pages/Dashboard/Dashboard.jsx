import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  Place as PlaceIcon,
  DirectionsBus as TransportIcon,
  EventNote as BookingIcon,
  People as UsersIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getHotels, getRestaurants, getPlaces, getTransports, getBookings, getBookingStats } from '../../api';

const COLORS = ['#2e7d32', '#ff9800', '#2196f3', '#f44336', '#9c27b0'];

const StatCard = ({ title, count, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            {count}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1.5,
            display: 'flex',
          }}
        >
          {React.cloneElement(icon, { sx: { color, fontSize: 32 } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    hotels: 0,
    restaurants: 0,
    places: 0,
    transports: 0,
    bookings: 0,
    users: 0,
  });
  const [bookingStats, setBookingStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotelsRes, restaurantsRes, placesRes, transportsRes, bookingsRes] = await Promise.all([
        getHotels(),
        getRestaurants(),
        getPlaces(),
        getTransports(),
        getBookings().catch(() => ({ data: { bookings: [] } })),
      ]);

      setStats({
        hotels: hotelsRes.data.length || 0,
        restaurants: restaurantsRes.data.length || 0,
        places: placesRes.data.length || 0,
        transports: transportsRes.data.length || 0,
        bookings: bookingsRes.data?.bookings?.length || 0,
        users: 0,
      });

      try {
        const statsRes = await getBookingStats();
        setBookingStats(statsRes.data?.stats);
      } catch (err) {
        console.log('Booking stats not available');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookingChartData = bookingStats?.byType?.map(item => ({
    name: item._id === 'hotel' ? 'فنادق' : item._id === 'restaurant' ? 'مطاعم' : 'نقل',
    value: item.count,
  })) || [];

  const statusData = [
    { name: 'مؤكد', value: bookingStats?.confirmed || 0 },
    { name: 'معلق', value: bookingStats?.pending || 0 },
    { name: 'ملغي', value: bookingStats?.cancelled || 0 },
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        لوحة التحكم
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="الفنادق" count={stats.hotels} icon={<HotelIcon />} color="#2e7d32" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="المطاعم" count={stats.restaurants} icon={<RestaurantIcon />} color="#ff9800" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="المعالم" count={stats.places} icon={<PlaceIcon />} color="#2196f3" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="النقل" count={stats.transports} icon={<TransportIcon />} color="#f44336" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="الحجوزات" count={stats.bookings} icon={<BookingIcon />} color="#9c27b0" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard title="المستخدمين" count={stats.users} icon={<UsersIcon />} color="#607d8b" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              الحجوزات حسب النوع
            </Typography>
            {bookingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={bookingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2e7d32" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                <Typography color="textSecondary">لا توجد بيانات كافية</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              حالة الحجوزات
            </Typography>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                <Typography color="textSecondary">لا توجد بيانات كافية</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;