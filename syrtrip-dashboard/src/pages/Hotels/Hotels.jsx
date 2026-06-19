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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import DataTable from '../../components/Table/DataTable';
import { getHotels, createHotel, updateHotel, deleteHotel } from '../../api';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    location: '',
    rating: 0,
    pricePerNight: '',
    phoneNumber: '',
    images: [],
    category: 'hotel',
  });

  const locations = [
    'دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس',
    'دير الزور', 'السويداء', 'إدلب', 'الرقة', 'الحسكة'
  ];

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await getHotels();
      setHotels(response.data || []);
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

  const handleOpenModal = (hotel = null) => {
    if (hotel) {
      setEditingHotel(hotel);
      setFormData({
        id: hotel.id || '',
        name: hotel.name || '',
        description: hotel.description || '',
        location: hotel.location || '',
        rating: hotel.rating || 0,
        pricePerNight: hotel.pricePerNight || '',
        phoneNumber: hotel.phoneNumber || '',
        images: hotel.images || [],
        category: hotel.category || 'hotel',
      });
    } else {
      setEditingHotel(null);
      setFormData({
        id: `h${Date.now()}`,
        name: '',
        description: '',
        location: '',
        rating: 0,
        pricePerNight: '',
        phoneNumber: '',
        images: [],
        category: 'hotel',
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingHotel(null);
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
        pricePerNight: Number(formData.pricePerNight) || 0,
        rating: Number(formData.rating) || 0,
      };

      if (editingHotel) {
        await updateHotel(editingHotel._id, dataToSend);
        showSnackbar('تم تحديث الفندق بنجاح');
      } else {
        await createHotel(dataToSend);
        showSnackbar('تم إضافة الفندق بنجاح');
      }

      handleCloseModal();
      fetchHotels();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'حدث خطأ', 'error');
    }
  };

  const handleDelete = async (hotel) => {
    if (window.confirm(`هل أنت متأكد من حذف "${hotel.name}"؟`)) {
      try {
        await deleteHotel(hotel._id);
        showSnackbar('تم حذف الفندق بنجاح');
        fetchHotels();
      } catch (error) {
        showSnackbar('خطأ في الحذف', 'error');
      }
    }
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location?.includes(searchTerm)
  );

  const columns = [
    { field: 'name', headerName: 'الاسم' },
    { field: 'location', headerName: 'الموقع' },
    {
      field: 'rating',
      headerName: 'التقييم',
      renderCell: (row) => (
        <Rating value={row.rating} readOnly size="small" />
      )
    },
    {
      field: 'pricePerNight',
      headerName: 'السعر/ليلة',
      renderCell: (row) => `${row.pricePerNight} $`
    },
    { field: 'phoneNumber', headerName: 'الهاتف' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        إدارة الفنادق
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="بحث بالاسم أو الموقع..."
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
              إضافة فندق
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
          data={filteredHotels}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingHotel ? 'تعديل فندق' : 'إضافة فندق جديد'}
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
                label="السعر لليلة"
                name="pricePerNight"
                type="number"
                value={formData.pricePerNight}
                onChange={handleInputChange}
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
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                label="روابط الصور (مفصولة بفاصلة)"
                name="images"
                value={formData.images.join(', ')}
                onChange={handleImagesChange}
                placeholder="assets/images/hotels/hotel1.jpg, assets/images/hotels/hotel2.jpg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            إلغاء
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingHotel ? 'تحديث' : 'إضافة'}
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

export default Hotels;