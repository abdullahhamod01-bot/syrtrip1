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
import { getPlaces, createPlace, updatePlace, deletePlace } from '../../api';

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    location: '',
    rating: 0,
    category: 'attraction',
    images: [],
  });

  const locations = [
    'دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس',
    'دير الزور', 'السويداء', 'إدلب', 'الرقة', 'الحسكة'
  ];

  const categories = [
    { value: 'attraction', label: 'معلم سياحي' },
    { value: 'historical', label: 'تاريخي' },
    { value: 'natural', label: 'طبيعي' },
    { value: 'religious', label: 'ديني' },
    { value: 'museum', label: 'متحف' },
  ];

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await getPlaces();
      setPlaces(response.data || []);
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

  const handleOpenModal = (place = null) => {
    if (place) {
      setEditingPlace(place);
      setFormData({
        id: place.id || '',
        name: place.name || '',
        description: place.description || '',
        location: place.location || '',
        rating: place.rating || 0,
        category: place.category || 'attraction',
        images: place.images || [],
      });
    } else {
      setEditingPlace(null);
      setFormData({
        id: `p${Date.now()}`,
        name: '',
        description: '',
        location: '',
        rating: 0,
        category: 'attraction',
        images: [],
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingPlace(null);
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

      if (editingPlace) {
        await updatePlace(editingPlace._id, dataToSend);
        showSnackbar('تم تحديث المعلم بنجاح');
      } else {
        await createPlace(dataToSend);
        showSnackbar('تم إضافة المعلم بنجاح');
      }

      handleCloseModal();
      fetchPlaces();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'حدث خطأ', 'error');
    }
  };

  const handleDelete = async (place) => {
    if (window.confirm(`هل أنت متأكد من حذف "${place.name}"؟`)) {
      try {
        await deletePlace(place._id);
        showSnackbar('تم حذف المعلم بنجاح');
        fetchPlaces();
      } catch (error) {
        showSnackbar('خطأ في الحذف', 'error');
      }
    }
  };

  const filteredPlaces = places.filter(place =>
    place.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.location?.includes(searchTerm) ||
    place.category?.includes(searchTerm)
  );

  const getCategoryLabel = (value) => {
    const cat = categories.find(c => c.value === value);
    return cat ? cat.label : value;
  };

  const getCategoryColor = (category) => {
    const colors = {
      attraction: 'primary',
      historical: 'warning',
      natural: 'success',
      religious: 'info',
      museum: 'secondary',
    };
    return colors[category] || 'default';
  };

  const columns = [
    { field: 'name', headerName: 'الاسم' },
    { field: 'location', headerName: 'الموقع' },
    {
      field: 'category',
      headerName: 'الفئة',
      renderCell: (row) => (
        <Chip
          label={getCategoryLabel(row.category)}
          color={getCategoryColor(row.category)}
          size="small"
        />
      )
    },
    {
      field: 'rating',
      headerName: 'التقييم',
      renderCell: (row) => (
        <Rating value={row.rating} readOnly size="small" />
      )
    },
    {
      field: 'images',
      headerName: 'الصور',
      renderCell: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.images?.length || 0} صورة
        </Typography>
      )
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        إدارة المعالم السياحية
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="بحث بالاسم أو الموقع أو الفئة..."
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
              إضافة معلم
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
          data={filteredPlaces}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlace ? 'تعديل معلم سياحي' : 'إضافة معلم سياحي جديد'}
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
                <InputLabel>الفئة</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="الفئة"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="روابط الصور (مفصولة بفاصلة)"
                name="images"
                value={formData.images.join(', ')}
                onChange={handleImagesChange}
                placeholder="assets/images/attractions/attraction1.jpg, assets/images/attractions/attraction2.jpg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            إلغاء
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPlace ? 'تحديث' : 'إضافة'}
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

export default Places;