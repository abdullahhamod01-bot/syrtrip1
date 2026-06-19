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
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import DataTable from '../../components/Table/DataTable';
import api from '../../api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // ملاحظة: Backend الحالي ما عنده endpoint للمستخدمين
      // راح نستخدم placeholder data أو نجرب نجلب من auth
      const response = await api.get('/auth/users').catch(() => ({ data: [] }));
      setUsers(response.data || []);
    } catch (error) {
      showSnackbar('خطأ في جلب المستخدمين', 'error');
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

  const handleDelete = async (user) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
      try {
        await api.delete(`/auth/users/${user._id}`);
        showSnackbar('تم حذف المستخدم بنجاح');
        fetchUsers();
      } catch (error) {
        showSnackbar('خطأ في الحذف - تحتاج إضافة endpoint في Backend', 'error');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: 'name',
      headerName: 'المستخدم',
      renderCell: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: '#2e7d32', width: 32, height: 32 }}>
            {row.name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
            <Typography variant="caption" color="text.secondary">{row.email}</Typography>
          </Box>
        </Box>
      )
    },
    { field: 'email', headerName: 'البريد الإلكتروني' },
    {
      field: 'createdAt',
      headerName: 'تاريخ التسجيل',
      renderCell: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('ar-SY') : '-'
    },
    {
      field: 'bookingsCount',
      headerName: 'الحجوزات',
      renderCell: (row) => (
        <Chip 
          label={row.bookingsCount || 0} 
          size="small" 
          color={row.bookingsCount > 0 ? 'primary' : 'default'}
        />
      )
    },
  ];

  // بيانات تجريبية لو ما كان في endpoint
  const demoUsers = [
    { _id: '1', name: 'أحمد محمد', email: 'ahmed@email.com', createdAt: '2024-01-15', bookingsCount: 3 },
    { _id: '2', name: 'سارة علي', email: 'sara@email.com', createdAt: '2024-02-20', bookingsCount: 1 },
    { _id: '3', name: 'خالد عمر', email: 'khaled@email.com', createdAt: '2024-03-10', bookingsCount: 0 },
  ];

  const displayUsers = users.length > 0 ? filteredUsers : filteredUsers.length > 0 ? filteredUsers : demoUsers.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        إدارة المستخدمين
      </Typography>

      {/* إحصائيات سريعة */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {displayUsers.length}
                </Typography>
                <Typography variant="body2">إجمالي المستخدمين</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AdminIcon sx={{ fontSize: 40, color: 'info.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {displayUsers.filter(u => u.bookingsCount > 0).length}
                </Typography>
                <Typography variant="body2">مستخدمين نشطين</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {displayUsers.reduce((sum, u) => sum + (u.bookingsCount || 0), 0)}
                </Typography>
                <Typography variant="body2">إجمالي الحجوزات</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* شريط البحث */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="بحث بالاسم أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'left' }}>
            <Typography variant="body2" color="text.secondary">
              {displayUsers.length} مستخدم
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* جدول المستخدمين */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          data={displayUsers}
          onDelete={handleDelete}
        />
      )}

      {/* ملاحظة */}
      {users.length === 0 && (
        <Paper sx={{ p: 3, mt: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
          <Typography variant="body2" color="text.secondary">
            ⚠️ ملاحظة: هذه بيانات تجريبية. لعرض البيانات الحقيقية، أضف endpoint <code>GET /api/auth/users</code> في Backend
          </Typography>
        </Paper>
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

export default Users;