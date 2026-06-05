import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import LayersIcon from '@mui/icons-material/Layers';
// NEW ICON IMPORT: Stylized icon for feature items/cards grid array layout
import StyleIcon from '@mui/icons-material/Style'; 
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

export default function AdminLayout({ mode, setMode }) {
  const isDark = mode === 'dark';
  const navigate = useNavigate();
  const location = useLocation();

  // Unified navigation configuration array setup
  const menuItems = [
    { text: 'Dashboard Home', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Hero Configurations', icon: <LayersIcon />, path: '/admin/hero-sections' },
    { text: 'Home Section Structures', icon: <ViewQuiltIcon />, path: '/admin/home-sections' },
    
    // NEW STRUCTURAL ITEM: Links your new features management engine up directly
    { text: 'Feature Card Layouts', icon: <StyleIcon />, path: '/admin/feature-cards' },
    
    { text: 'System Settings', icon: <SettingsIcon />, path: '/admin/system-settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: isDark ? '#0a051b' : '#f8f9fa' }}>
      
      {/* LEFT SIDEBAR AREA */}
      <Box 
        sx={{ 
          width: '260px', 
          bgcolor: isDark ? '#120d24' : '#ffffff', 
          borderRight: `1px solid ${isDark ? '#1d1637' : '#eaeaea'}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'between',
          p: 2
        }}
      >
        <Box>
          {/* Logo Headers Panel Section Markup */}
          <Box sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#7c4dff', letterSpacing: '1px' }}>
              NEXUS CORE
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontWeight: 700 }}>
              ADMINISTRATION PANEL
            </Typography>
          </Box>

          {/* Navigation Links Mapping Loop */}
          <List sx={{ px: 0 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: '12px',
                      py: 1.2,
                      bgcolor: isActive ? (isDark ? 'rgba(124, 77, 255, 0.15)' : 'rgba(98, 0, 234, 0.08)') : 'transparent',
                      color: isActive ? (isDark ? '#be10ff' : '#6200ea') : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ fontSize: '14px', fontWeight: isActive ? 700 : 500 }} 
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Bottom Utility Controls Drawer Section */}
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '12px',
              py: 1.2,
              color: '#ff5252',
              '&:hover': { bgcolor: 'rgba(255, 82, 82, 0.08)' }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Log Out" primaryTypographyProps={{ fontSize: '14px', fontWeight: 700 }} />
          </ListItemButton>
        </Box>
      </Box>

      {/* RIGHT CONTENT PANEL VIEW SPACE CONTAINER AREA */}
      <Box sx={{ flexGrow: 1, p: 1, overflowY: 'auto' }}>
        <Outlet />
      </Box>

    </Box>
  );
}