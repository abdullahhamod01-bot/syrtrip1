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
import { getTransports, createTransport, updateTransport, deleteTransport } from '../../api';

const Transport = () => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    location: '',
    rating: 0,
    type: '',
    fare: '',
    phoneNumber: '',
    images: [],
  });

  const locations = [
    'دمشق', 'حلب', 'حمص', 'اللاذقية', 'طرطوس',
    'دير الزور', 'السويداء', 'إدلب', 'الرقة', 'الحسكة'
  ];

  const transportTypes = [
    { value: 'فاخر', label: 'VIP' },
    { value: 'ميني فان', label: 'ميني فان' },
    { value: 'دراجة', label: 'دراجة هوائية' },
    { value: 'توصيل', label: 'توصيل سريع' },
    { value: 'تاكسي كهربائي', label: 'تاكسي كهربائي' },
    { value: 'باص سياحي', label: 'باص سياحي' },
    { value: 'سكوتر', label: 'سكوتر كهربائي' },
  ];

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const response = await getTransports();
      setTransports(response.data || []);
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

  const handleOpenModal = (transport = null) => {
    if (transport) {
      setEditingTransport(transport);
      setFormData({
        id: transport.id || '',
        name: transport.name || '',
        description: transport.description || '',
        location: transport.location || '',
        rating: transport.rating || 0,
        type: transport.type || '',
        fare: transport.fare || '',
        phoneNumber: transport.phoneNumber || '',
        images: transport.images || [],
      });
    } else {
      setEditingTransport(null);
      setFormData({
        id: `t${Date.now()}`,
        name: '',
        description: '',
        location: '',
        rating: 0,
        type: '',
        fare: '',
        phoneNumber: '',
        images: [],
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingTransport(null);
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
        fare: Number(formData.fare) || 0,
      };

      if (editingTransport) {
        await updateTransport(editingTransport._id, dataToSend);
        showSnackbar('تم تحديث وسيلة النقل بنجاح');
      } else {
        await createTransport(dataToSend);
        showSnackbar('تم إضافة وسيلة النقل بنجاح');
      }

      handleCloseModal();
      fetchTransports();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'حدث خطأ', 'error');
    }
  };

  const handleDelete = async (transport) => {
    if (window.confirm(`هل أنت متأكد من حذف "${transport.name}"؟`)) {
      try {
        await deleteTransport(transport._id);
        showSnackbar('تم حذف وسيلة النقل بنجاح');
        fetchTransports();
      } catch (error) {
        showSnackbar('خطأ في الحذف', 'error');
      }
    }
  };

  const filteredTransports = transports.filter(transport =>
    transport.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transport.location?.includes(searchTerm) ||
    transport.type?.includes(searchTerm)
  );

  const getTypeColor = (type) => {
    const colors = {
      'فاخر': 'warning',
      'ميني فان': 'primary',
      'دراجة': 'success',
      'توصيل': 'error',
      'تاكسي كهربائي': 'info',
      'باص سياحي': 'secondary',
      'سكوتر': 'default',
    };
    return colors[type] || 'default';
  };

  const columns = [
    { field: 'name', headerName: 'الاسم' },
    { field: 'location', headerName: 'الموقع' },
    {
      field: 'type',
      headerName: 'النوع',
      renderCell: (row) => (
        <Chip
          label={row.type}
          color={getTypeColor(row.type)}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      field: 'fare',
      headerName: 'الأجرة',
      renderCell: (row) => `${row.fare} $`
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
        إدارة وسائل النقل
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="بحث بالاسم أو الموقع أو النوع..."
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
              إضافة نقل
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
          data={filteredTransports}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTransport ? 'تعديل وسيلة نقل' : 'إضافة وسيلة نقل جديدة'}
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
                <InputLabel>نوع النقل</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="نوع النقل"
                >
                  {transportTypes.map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="الأجرة ($)"
                name="fare"
                type="number"
                value={formData.fare}
                onChange={handleInputChange}
              />
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
                placeholder="assets/images/transport/transport1.jpg, assets/images/transport/transport2.jpg"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            إلغاء
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTransport ? 'تحديث' : 'إضافة'}
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

export default Transport;