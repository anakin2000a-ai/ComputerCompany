import { Box, Container, Typography } from '@mui/material';
import DynamicForm from '../components/DynamicForm';

export default function RegisterPage({ mode }) {
  const isDark = mode === 'dark';

  // 1. Fields mapping directly to your Laravel 'users' table migration layout
  const registerFields = [
    { name: 'name', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'password_confirmation', label: 'Confirm Password', type: 'password' },
  ];

  // 2. Token Manager Handler for successful user sign-up
  const handleRegisterSuccess = (responsePayload) => {
    console.log('Backend Registration payload:', responsePayload);
    
    // Extract token and user details if your API logs them in automatically after registration
    const token = responsePayload.token || responsePayload.access_token;
    const user = responsePayload.user;

    if (token) {
      localStorage.setItem('authToken', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      console.log('Registration complete. Token saved.');
      
      // Optional: redirect user to homepage or dashboard
      // window.location.href = '/dashboard';
    }
  };

  return (
    <Box
      sx={{
        bgcolor: isDark ? '#090514' : '#f8f7ff',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        flexGrow: 1,
      }}
    >
      {/* Background theme styling consistency matching Nexus Labs layout */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(124,77,255,0.06) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '2px' }}>
          NEXUS LABS PROTOCOLS
        </Typography>
        
        {/* 3. Re-use your Dynamic Form Engine */}
        <DynamicForm
          mode={mode}
          title="Create Account"
          submitUrl="http://127.0.0.1:8000/api/register"
          successMessage="Account created successfully!"
          fields={registerFields}
          initialValues={{ name: '', email: '', password: '', password_confirmation: '' }}
          onSuccess={handleRegisterSuccess}
        />
      </Container>
    </Box>
  );
}