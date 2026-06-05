import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { getDesignTokens } from './theme/theme';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLayout from './layouts/AdminLayout';
import HeroCmsManager from './components/admin/HeroCmsManager';
import ProtectedRoute from './components/ProtectedRoute';
import HomeSectionCmsManager from './components/admin/HomeSectionCmsManager';
import FeatureCardCmsManager from './components/admin/FeatureCardCmsManager';

export default function App() {
  const [mode, setMode] = useState('dark');

 const toggleColorMode = (event) => {
  if (!document.startViewTransition) {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    return;
  }

  const x = event.clientX;
  const y = event.clientY;

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  document.documentElement.style.setProperty('--x', `${x}px`);
  document.documentElement.style.setProperty('--y', `${y}px`);
  document.documentElement.style.setProperty('--r', `${endRadius}px`);

  const transition = document.startViewTransition(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  });

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          'circle(0px at var(--x) var(--y))',
          'circle(var(--r) at var(--x) var(--y))',
        ],
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  });
};

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
       <Routes>
        {/* PUBLIC WEBSITE ROUTE GROUP (Uses MainLayout) */}
        <Route path="/" element={<MainLayout mode={mode} toggleMode={toggleColorMode} />}>
          <Route index element={<HomePage mode={mode} />} />
          <Route path="about" element={<AboutPage mode={mode} />} />
          <Route path="contact" element={<ContactPage mode={mode} />} />
          <Route path="login" element={<LoginPage mode={mode} />} /> 
          <Route path="register" element={<RegisterPage mode={mode} />} /> 
        </Route> {/* <- Public group ends here cleanly */}

        {/* INDEPENDENT ADMIN ROUTE GROUP (Does NOT use MainLayout) */}
       {/* Dedicated Admin Router Shell Scope */}
  {/* 🔒 Protected Admin Group */}
    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<AdminLayout mode={mode} />}>
        <Route path="dashboard" element={<AdminDashboard mode={mode} />} />
        <Route path="hero-sections" element={<HeroCmsManager mode={mode} />} />
        <Route path="home-sections" element={<HomeSectionCmsManager mode={mode} />} />
        <Route path="feature-cards" element={<FeatureCardCmsManager mode={mode} />} />
    </Route>
    </Route>
    
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}