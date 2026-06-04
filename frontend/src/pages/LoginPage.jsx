import { Box, Container, Typography } from '@mui/material';
import DynamicForm from '../components/DynamicForm';

export default function LoginPage({ mode }) {
  const isDark = mode === 'dark';

  const loginFields = [
    { name: 'email', label: 'Email Address', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
  ];

  // HERE IS YOUR TOKEN MANAGER HANDLER 👇
  const handleLoginSuccess = (responsePayload) => {
    console.log('Full backend response payload:', responsePayload);
    
    // 1. Extract token (Adjust based on your exact backend key name)
    const token = responsePayload.token || responsePayload.access_token;
    const user = responsePayload.user;

    if (token) {
      // 2. Store token in browser storage
      localStorage.setItem('authToken', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Token successfully stored in localStorage.');
      
      // 3. Optional: Redirect your user here to a secure application page
      // window.location.href = '/dashboard'; 
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
          // ATTACH THE HANDLER FUNCTION HERE 👇
          onSuccess={handleLoginSuccess}
        />
      </Container>
    </Box>
  );
}