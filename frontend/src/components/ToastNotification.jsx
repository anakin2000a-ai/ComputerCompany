import { Snackbar, Alert } from '@mui/material';

export default function ToastNotification({ open, message, severity = 'success', onClose, mode }) {
  const isDark = mode === 'dark';

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          borderRadius: '12px',
          fontWeight: 600,
          boxShadow: isDark ? '0px 8px 24px rgba(0, 0, 0, 0.5)' : '0px 8px 24px rgba(124, 77, 255, 0.15)',
          bgcolor: severity === 'success' ? (isDark ? '#7c4dff' : '#6200ea') : '#ff5252'
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}