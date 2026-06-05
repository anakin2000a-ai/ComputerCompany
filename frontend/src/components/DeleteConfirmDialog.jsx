import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function DeleteConfirmDialog({ open, onClose, onConfirm, mode, title, message }) {
  const isDark = mode === 'dark';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? '#120d24' : '#ffffff',
          borderRadius: '16px',
          backgroundImage: 'none',
          p: 1,
          boxShadow: isDark ? '0px 12px 32px rgba(0, 0, 0, 0.6)' : '0px 12px 32px rgba(124, 77, 255, 0.15)'
        }
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" pt={2}>
        <WarningAmberRoundedIcon sx={{ color: '#ff5252', fontSize: '4rem' }} />
      </Box>
      
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 900, color: isDark ? '#fff' : '#1a1523', pt: 1 }}>
        {title || 'Confirm Deletion'}
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)', fontSize: '15px' }}>
          {message || 'Are you absolutely sure you want to remove this record? This action cannot be undone.'}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', px: 3, pb: 2, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            borderRadius: '10px', 
            px: 3,
            color: isDark ? '#fff' : '#000', 
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            '&:hover': { borderColor: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          disableElevation
          sx={{ 
            borderRadius: '10px', 
            px: 3,
            bgcolor: '#ff5252', 
            '&:hover': { bgcolor: '#e04242' } 
          }}
        >
          Delete Record
        </Button>
      </DialogActions>
    </Dialog>
  );
}