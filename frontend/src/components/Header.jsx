import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Stack,
} from '@mui/material';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ComputerIcon from '@mui/icons-material/Computer';

export default function Header({ mode, toggleMode }) {
  const navigate = useNavigate();
  const [isRotating, setIsRotating] = useState(false);

  const handleThemeToggleClick = (event) => {
    if (isRotating) return;

    setIsRotating(true);
    toggleMode(event);

    setTimeout(() => {
      setIsRotating(false);
    }, 500);
  };

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        background:
          mode === 'dark'
            ? 'rgba(20, 14, 40, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <Toolbar>
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <ComputerIcon sx={{ mr: 2, color: 'primary.main' }} />

          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              letterSpacing: 1.5,
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            NEXUS LABS
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ fontWeight: 'bold' }}
          >
            Home
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate('/about')}
            sx={{ fontWeight: 'bold' }}
          >
            About Us
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate('/contact')}
            sx={{ fontWeight: 'bold' }}
          >
            Contact Us
          </Button>
        <Button
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ fontWeight: 'bold' }}
          >
            Login
          </Button>
             <Button
            color="inherit"
            onClick={() => navigate('/register')}
            sx={{ fontWeight: 'bold' }}
          >
            Register
          </Button>
               <Button
            color="inherit"
            onClick={() => navigate('/Ai')}
            sx={{ fontWeight: 'bold' }}
          >
            AI Search
          </Button>
              <Button
            color="inherit"
            onClick={() => navigate('/AiText')}
            sx={{ fontWeight: 'bold' }}
          >
            AI Search Text
          </Button>
          <IconButton
            onClick={handleThemeToggleClick}
            color="primary"
            sx={{
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isRotating ? 'rotate(360deg)' : 'rotate(0deg)',
            }}
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}