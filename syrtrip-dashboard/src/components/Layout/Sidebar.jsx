import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  Place as PlaceIcon,
  DirectionsBus as TransportIcon,
  EventNote as BookingIcon,
  People as UsersIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const menuItems = [
  { text: 'الرئيسية', icon: <DashboardIcon />, path: '/' },
  { text: 'الفنادق', icon: <HotelIcon />, path: '/hotels' },
  { text: 'المطاعم', icon: <RestaurantIcon />, path: '/restaurants' },
  { text: 'المعالم السياحية', icon: <PlaceIcon />, path: '/places' },
  { text: 'النقل', icon: <TransportIcon />, path: '/transport' },
  { text: 'الحجوزات', icon: <BookingIcon />, path: '/bookings' },
  { text: 'المستخدمين', icon: <UsersIcon />, path: '/users' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
          🌍 SyrTrip
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  borderRight: '4px solid #4caf50',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;