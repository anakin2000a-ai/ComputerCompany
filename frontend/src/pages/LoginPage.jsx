import { Box, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT THE NAVIGATE HOOK
import DynamicForm from '../components/DynamicForm';

export default function LoginPage({ mode }) {
  const isDark = mode === 'dark';
  const navigate = useNavigate(); // 2. INITIALIZE THE NAVIGATE FUNCTION

  const loginFields = [
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
  ];

  const handleLoginSuccess = (responsePayload) => {
    console.log('Full backend response payload:', responsePayload);
    
    // Extract token based on your Laravel API response structure
    const token = responsePayload.token || responsePayload.access_token || responsePayload.data?.token;
    const user = responsePayload.user || responsePayload.data?.user;

    if (token) {
      // Store token and user in browser storage
      localStorage.setItem('authToken', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Token successfully stored in localStorage. Redirecting...');
      
      // 3. REDIRECT THE USER TO YOUR SECURE DASHBOARD ROUTE
      navigate('/admin/dashboard'); 
    } else {
      console.error('Login reported success, but no token was found in the response payload.');
    }
  };

  return (
    <Box sx={{ bgcolor: isDark ? '#090514' : '#f8f7ff', minHeight: '80vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', flexGrow: 1 }}>
      <Box sx={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(124,77,255,0.06) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '2px' }}>
          NEXUS LABS ACCESS
        </Typography>
        
        <DynamicForm
          mode={mode}
          title="Welcome Back"
          submitUrl="http://127.0.0.1:8000/api/login"
          successMessage="Login successful!"
          fields={loginFields}
          initialValues={{ email: '', password: '' }}
          onSuccess={handleLoginSuccess}
        />
      </Container>
    </Box>
  );
}