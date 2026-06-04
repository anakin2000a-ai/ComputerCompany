export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#7c4dff',
    },
    secondary: {
      main: '#00e5ff',
    },
    background: {
      default: mode === 'dark' ? '#090514' : '#f8f7ff',
      paper: mode === 'dark' ? '#140e28' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f0edff' : '#1a1523',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});