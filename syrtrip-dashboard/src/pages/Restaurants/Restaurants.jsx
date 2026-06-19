import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Rating,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import DataTable from '../../components/Table/DataTable';
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '../../api';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    location: '',
    rating: 0,
    cuisineType: '',
    phoneNumber: '',
    images: [],
  });

  const locations = [
    'دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس',
    'دير الزور', 'السويداء', 'إدلب', 'الرقة', 'الحسكة'
  ];

  const cuisineTypes = [
    'شرقي', 'بحري', 'ريفي', 'إيطالي', 'هندي',
    'صيني', 'حلويات', 'شامي', 'فرنسي', 'أندلسي'
  ];

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await getRestaurants();
      setRestaurants(response.data || []);
    } catch (error) {
      showSnackbar('خطأ في جلب البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenModal = (restaurant = null) => {
    if (restaurant) {
      setEditingRestaurant(restaurant);
      setFormData({
        id: restaurant.id || '',
        name: restaurant.name || '',
        description: restaurant.description || '',
        location: restaurant.location || '',
        rating: restaurant.rating || 0,
        cuisineType: restaurant.cuisineType || '',
        phoneNumber: restaurant.phoneNumber || '',
        images: restaurant.images || [],
      });
    } else {
      setEditingRestaurant(null);
      setFormData({
        id: `r${Date.now()}`,
        name: '',
        description: '',
        location: '',
        rating: 0,
        cuisineType: '',
        phoneNumber: '',
        images: [],
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingRestaurant(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRatingChange = (event, newValue) => {
    setFormData({ ...formData, rating: newValue });
  };

  const handleImagesChange = (e) => {
    const images = e.target.value.split(',').map(img => img.trim()).filter(img => img);
    setFormData({ ...formData, images });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.location) {
        showSnackbar('الاسم والموقع مطلوبان', 'error');
        return;
      }

      const dataToSend = {
        ...formData,
        rating: Number(formData.rating) || 0,
      };

      if (editingRestaurant) {
        await updateRestaurant(editingRestaurant._id, dataToSend);
        showSnackbar('تم تحديث المطعم بنجاح');
      } else {
        await createRestaurant(dataToSend);
        showSnackbar('تم إضافة المطعم بنجاح');
      }

      handleCloseModal();
      fetchRestaurants();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'حدث خطأ', 'error');
    }
  };

  const handleDelete = async (restaurant) => {
    if (window.confirm(`هل أنت متأكد من حذف "${restaurant.name}"؟`)) {
      try {
        await deleteRestaurant(restaurant._id);
        showSnackbar('تم حذف المطعم بنجاح');
        fetchRestaurants();
      } catch (error) {
        showSnackbar('خطأ في الحذف', 'error');
      }
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.location?.includes(searchTerm) ||
    restaurant.cuisineType?.includes(searchTerm)
  );

  const columns = [
    { field: 'name', headerName: 'الاسم' },
    { field: 'location', headerName: 'الموقع' },
    {
      field: 'cuisineType',
      headerName: 'نوع المطبخ',
      renderCell: (row) => (
        <Chip label={row.cuisineType} color="primary" size="small" variant="outlined" />
      )
    },
    {
      field: 'rating',
      headerName: 'التقييم',
      renderCell: (row) => (
        <Rating value={row.rating} readOnly size="small" />
      )
    },
    { field: 'phoneNumber', headerName: 'الهاتف' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        إدارة المطاعم
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="بحث بالاسم أو الموقع أو نوع المطبخ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'left' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              إضافة مطعم
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          data={filteredRestaurants}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRestaurant ? 'تعديل مطعم' : 'إضافة مطعم جديد'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="الاسم *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>الموقع *</InputLabel>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  label="الموقع *"
                >
                  {locations.map(loc => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>نوع المطبخ</InputLabel>
                <Select
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleInputChange}
                  label="نوع المطبخ"
                >
                  {cuisineTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                <Typography>التقييم:</Typography>
                <Rating
                  name="rating"
                  value={formData.rating}
                  onChange={handleRatingChange}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="الوصف"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="رقم الهاتف"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="روابط الصور (مفصولة بفاصلة)"
                name="images"
                value={formData.images.join(', ')}
                onChange={handleImagesChange}
                placeholder="assets/images/restaurants/restaurant1.jpg, assets/images/restaurants/restaurant2.jpg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            إلغاء
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRestaurant ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default Restaurants;