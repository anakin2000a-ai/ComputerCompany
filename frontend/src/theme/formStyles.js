export const getInputStyles = (isDark) => ({
  mb: 2.5,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: isDark ? '#030207' : '#ffffff',
    color: isDark ? '#ffffff' : '#1a1523',
    '& fieldset': {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)',
    },
    '&:hover fieldset': {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(124, 77, 255, 0.6)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
    },
  },
  '& .MuiInputLabel-root': {
    color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(26, 21, 35, 0.6)',
    '&.Mui-focused': {
      color: 'primary.main',
    },
  },
  '& .MuiInputBase-input': {
    color: isDark ? '#ffffff' : '#1a1523',
  },
});