import { Box, Button, Typography } from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Navbar({ mode }) {
  const isDark = mode === 'dark';
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Check if the current route is inside the administration sector
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    // Remove session tokens completely
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    console.log('Admin session terminated. Redirecting to login...');
    navigate('/login');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      px: 4, 
      py: 2, 
      bgcolor: isDark ? '#090514' : '#ffffff',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
    }}>
      <Typography variant="h6" sx={{ fontWeight: 900, color: isDark ? '#fff' : '#1a1523', textDecoration: 'none' }} component={Link} to="/">
        NEXUS LABS
      </Typography>

      <Box display="flex" alignItems="center" gap={3}>
        {/* 2. DYNAMIC VISIBILITY CONDITION LOGIC */}
        {!isAdminRoute ? (
          // Public Website links show ONLY on frontend pages
          <>
            <Button component={Link} to="/" sx={{ color: isDark ? '#fff' : '#000' }}>Home</Button>
            <Button component={Link} to="/about" sx={{ color: isDark ? '#fff' : '#000' }}>About Us</Button>
            <Button component={Link} to="/contact" sx={{ color: isDark ? '#fff' : '#000' }}>Contact Us</Button>
          </>
        ) : (
          // Admin CMS Specific quick indicators show ONLY inside /admin pathing
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<LogoutIcon />} 
            onClick={handleLogout}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
          >
            Sign Out
          </Button>
        )}
      </Box>
    </Box>
  );
}