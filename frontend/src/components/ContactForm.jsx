import { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { getInputStyles } from '../theme/formStyles';

export default function ContactForm({ mode }) {
  const isDark = mode === 'dark';
  const inputStyles = getInputStyles(isDark);

  // 1. THIS IS THE STATE WE NEED (Make sure this exists!)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();

      if (!response.ok) {
        console.log('Validation error:', result); // Uses 'result' to clear ESLint warning
        alert('Please check your form data.');
        return;
      }

      alert('Message sent successfully.');
      setFormData({ name: '', phone: '', whatsapp: '', message: '' }); // Clears inputs
    } catch (error) {
      console.error('Submission error:', error); // Uses 'error' to clear ESLint warning
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#1a1523', mb: 1 }}>
        Write Us a Message
      </Typography>
      <Box sx={{ width: '60px', height: '4px', bgcolor: 'primary.main', mb: 4, borderRadius: '2px' }} />

      {['name', 'phone', 'whatsapp'].map((field) => (
        <TextField
          key={field}
          fullWidth
          label={field === 'name' ? 'Your Full Name' : field.charAt(0).toUpperCase() + field.slice(1) + ' Number'}
          name={field}
          variant="outlined"
          value={formData[field]}
          onChange={handleChange}
          sx={inputStyles}
        />
      ))}

      <TextField
        fullWidth
        label="Write message here..."
        name="message"
        variant="outlined"
        multiline
        rows={4}
        value={formData.message}
        onChange={handleChange}
        sx={inputStyles}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{
          py: 1.8,
          borderRadius: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          boxShadow: '0 4px 20px rgba(124, 77, 255, 0.3)',
        }}
      >
        Send Message
      </Button>
    </Box>
  );
}