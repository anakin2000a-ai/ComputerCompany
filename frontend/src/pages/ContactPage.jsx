import { Box, Container, Grid, Typography, IconButton } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

import DynamicForm from '../components/DynamicForm';

export default function ContactPage({ mode }) {
  const isDark = mode === 'dark';

  const contactFields = [
    { name: 'name', label: 'Your Full Name' },
    { name: 'phone', label: 'Contact Number' },
    { name: 'whatsapp', label: 'WhatsApp Number' },
    { name: 'message', label: 'Write message here...', multiline: true, rows: 4 },
  ];

  return (
    <Box sx={{ bgcolor: isDark ? '#090514' : '#f8f7ff', py: 12, position: 'relative', overflow: 'hidden', flexGrow: 1 }}>
      <Box sx={{ position: 'absolute', top: '30%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,77,255,0.08) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <DynamicForm
              mode={mode}
              title="Write Us a Message"
              submitUrl="http://127.0.0.1:8000/api/contact-messages"
              successMessage="Message sent successfully."
              fields={contactFields}
              initialValues={{ name: '', phone: '', whatsapp: '', message: '' }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ pl: { md: 4 } }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '2px' }}>
                NEXUS LABS PLATFORMS
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, color: isDark ? '#ffffff' : '#1a1523', mt: 1, mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Get In Touch
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(26, 21, 35, 0.7)', mb: 5, fontSize: '1.1rem', lineHeight: 1.8 }}>
                Connect directly with our infrastructure engineers across standard distribution arrays.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><LocationOnIcon sx={{ color: 'primary.main' }} /><Typography sx={{ color: isDark ? '#ffffff' : '#1a1523' }}>Cluster-7, San Francisco, CA</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><PhoneAndroidIcon sx={{ color: 'primary.main' }} /><Typography sx={{ color: isDark ? '#ffffff' : '#1a1523' }}>+1 (415) 555-0190</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><EmailIcon sx={{ color: 'primary.main' }} /><Typography sx={{ color: isDark ? '#ffffff' : '#1a1523' }}>ops@nexuslabs.dev</Typography></Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {/* Icons match previous styles cleanly */}
                {[<FacebookIcon key="fb" />, <InstagramIcon key="ig" />].map((icon, idx) => (
                  <IconButton key={idx} sx={{ color: isDark ? '#ffffff' : '#1a1523', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.12)', '&:hover': { bgcolor: 'primary.main', color: '#ffffff' } }}>
                    {icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}