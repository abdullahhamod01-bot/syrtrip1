import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import DataTable from '../../components/Table/DataTable';
import { getBookings, getBookingStats } from '../../api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      setBookings(response.data?.bookings || []);
    } catch (error) {
      showSnackbar('خطأ في جلب الحجوزات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getBookingStats();
      setStats(response.data?.stats);
    } catch (error) {
      console.log('Stats not available');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SY');
  };

  const getStatusLabel = (status) => {
    const labels = { pending: 'معلق', confirmed: 'مؤكد', cancelled: 'ملغي' };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'warning', confirmed: 'success', cancelled: 'error' };
    return colors[status] || 'default';
  };

  const getItemTypeLabel = (type) => {
    const labels = { hotel: 'فندق', restaurant: 'مطعم', transport: 'نقل' };
    return labels[type] || type;
  };

  const getItemTypeColor = (type) => {
    const colors = { hotel: 'success', restaurant: 'warning', transport: 'error' };
    return colors[type] || 'default';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesType = typeFilter === 'all' || booking.itemType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const columns = [
    { field: 'itemName', headerName: 'العنصر' },
    {
      field: 'itemType',
      headerName: 'النوع',
      renderCell: (row) => (
        <Chip
          label={getItemTypeLabel(row.itemType)}
          color={getItemTypeColor(row.itemType)}
          size="small"
        />
      )
    },
    { field: 'location', headerName: 'الموقع' },
    {
      field: 'checkInDate',
      headerName: 'من',
      renderCell: (row) => formatDate(row.checkInDate)
    },
    {
      field: 'checkOutDate',
      headerName: 'إلى',
      renderCell: (row) => formatDate(row.checkOutDate)
    },
    {
      field: 'totalPrice',
      headerName: 'السعر',
      renderCell: (row) => `${row.totalPrice} $`
    },
    {
      field: 'numberOfGuests',
      headerName: 'الضيوف',
      renderCell: (row) => row.numberOfGuests
    },
    {
      field: 'status',
      headerName: 'الحالة',
      renderCell: (row) => (
        <Chip
          label={getStatusLabel(row.status)}
          color={getStatusColor(row.status)}
          size="small"
        />
      )
    },
    {
      field: 'contactPerson',
      headerName: 'التواصل',
      renderCell: (row) => (
        <Box>
          <Typography variant="body2">{row.contactPerson}</Typography>
          <Typography variant="caption" color="text.secondary">{row.phoneNumber}</Typography>
        </Box>
      )
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        إدارة الحجوزات
      </Typography>

      {/* إحصائيات سريعة */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {stats.total || 0}
                </Typography>
                <Typography variant="body2">إجمالي الحجوزات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {stats.pending || 0}
                </Typography>
                <Typography variant="body2">معلقة</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {stats.confirmed || 0}
                </Typography>
                <Typography variant="body2">مؤكدة</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {stats.cancelled || 0}
                </Typography>
                <Typography variant="body2">ملغية</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* فلاتر البحث */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="بحث بالاسم أو الشخص أو الموقع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>الحالة</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="الحالة"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="pending">معلقة</MenuItem>
                <MenuItem value="confirmed">مؤكدة</MenuItem>
                <MenuItem value="cancelled">ملغية</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>النوع</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="النوع"
              >
                <MenuItem value="all">الكل</MenuItem>
                <MenuItem value="hotel">فنادق</MenuItem>
                <MenuItem value="restaurant">مطاعم</MenuItem>
                <MenuItem value="transport">نقل</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2} sx={{ textAlign: 'left' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredBookings.length} حجز
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* جدول الحجوزات */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          data={filteredBookings}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Bookings;