import { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { getInputStyles } from '../theme/formStyles';

// 1. ADD 'onSuccess' TO PROPS HERE 👇
export default function DynamicForm({ mode, title, fields, submitUrl, successMessage, initialValues, onSuccess }) {
  const isDark = mode === 'dark';
  const inputStyles = getInputStyles(isDark);
  
  const [formData, setFormData] = useState(initialValues);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();

      if (!response.ok) {
        console.log('Form submission error details:', result);
        alert(result.message || 'Please check your input data.');
        return;
      }

      alert(successMessage);
      
      // 2. TRIGGER ON_SUCCESS HIER AND PASS THE BACKEND PAYLOAD (TOKEN/USER) 👇
      if (onSuccess) {
        onSuccess(result);
      }

      setFormData(initialValues); 
    } catch (error) {
      console.error('Network execution failure:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#1a1523', mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ width: '60px', height: '4px', bgcolor: 'primary.main', mb: 4, borderRadius: '2px' }} />

      {fields.map((field) => (
        <TextField
          key={field.name}
          fullWidth
          label={field.label}
          name={field.name}
          type={field.type || 'text'}
          variant="outlined"
          multiline={field.multiline || false}
          rows={field.rows || 1}
          value={formData[field.name]}
          onChange={handleChange}
          sx={inputStyles}
        />
      ))}

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
        {title.includes('Login') || title.includes('Welcome') ? 'Sign In' : 'Send Message'}
      </Button>
    </Box>
  );
}