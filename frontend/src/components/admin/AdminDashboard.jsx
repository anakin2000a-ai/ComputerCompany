import { Box, Typography, Grid, Paper } from '@mui/material';

export default function AdminDashboard({ mode }) {
  const isDark = mode === 'dark';

  return (
    <Box sx={{ p: 3, color: isDark ? '#fff' : '#1a1523' }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
        Infrastructure Dashboard
      </Typography>
      <Typography variant="body1" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', mb: 4 }}>
        System monitoring metrics overview control station.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, bgcolor: isDark ? '#120d24' : '#fff', borderRadius: '12px' }}>
            <Typography variant="subtitle2" color="primary">System Status</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>Active Operational</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, bgcolor: isDark ? '#120d24' : '#fff', borderRadius: '12px' }}>
            <Typography variant="subtitle2" color="primary">Gateway Endpoint</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>API v1 Engine</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}