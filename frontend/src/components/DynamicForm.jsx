// import { useState, useEffect } from 'react';
// import { Box, Typography, TextField, Button, FormControlLabel, Checkbox } from '@mui/material';

// export default function DynamicForm({ 
//   mode, 
//   title, 
//   fields, 
//   initialValues, 
//   submitUrl, 
//   successMessage, 
//   isMultipart = false, 
//   onSuccess 
// }) {
//   const isDark = mode === 'dark';
//   const token = localStorage.getItem('authToken');
//   const [formState, setFormState] = useState({});

//   useEffect(() => {
//     if (initialValues) {
//       setFormState(JSON.parse(JSON.stringify(initialValues)));
//     }
//   }, [initialValues?.id, initialValues]);

//   const handleTextChange = (e) => {
//     const { name, value } = e.target;
//     setFormState((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCheckboxChange = (e) => {
//     const { name, checked } = e.target;
//     setFormState((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
//   };

//   const handleFileChange = (e) => {
//     const { name, files } = e.target;
//     if (files && files[0]) {
//       setFormState((prev) => ({ ...prev, [name]: files[0] }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const isEditing = !!formState.id; 
//     let baseTargetUrl = submitUrl.endsWith('/') ? submitUrl.slice(0, -1) : submitUrl;
//     let finalUrl = isEditing ? `${baseTargetUrl}/${formState.id}` : baseTargetUrl;

//     let bodyData;
//     let customHeaders = {
//       'Accept': 'application/json',
//       'Authorization': `Bearer ${token}`
//     };

//     if (isMultipart) {
//       const formDataObj = new FormData();
      
//       Object.keys(formState).forEach((key) => {
//         if (key === 'created_at' || key === 'updated_at' || key === 'id') return;
//         if (key === 'background_image' && typeof formState[key] === 'string') return;

//         if (formState[key] !== null && formState[key] !== undefined) {
//           formDataObj.append(key, formState[key]);
//         }
//       });

//       if (isEditing) {
//         formDataObj.append('_method', 'PUT');
//       }

//       bodyData = formDataObj;
//     } else {
//       bodyData = JSON.stringify(formState);
//       customHeaders['Content-Type'] = 'application/json';
//     }

//     try {
//       const response = await fetch(finalUrl, {
//         method: isMultipart && isEditing ? 'POST' : (isEditing ? 'PUT' : 'POST'), 
//         headers: customHeaders,
//         body: bodyData
//       });

//       // Parse JSON payload data safely regardless of a success state or error status code
//       const resData = await response.json();

//       if (response.ok) {
//         alert(successMessage || 'Operation saved successfully!');
        
//         // FIXED: Send the backend payload data directly back to the calling component page!
//         if (onSuccess) onSuccess(resData); 
//       } else {
//         alert(`Error: ${resData.message || 'Something went wrong.'}`);
//       }
//     } catch (err) {
//       console.error('Network interface transaction failed:', err);
//     }
//   };

//   return (
//     <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
//       <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: isDark ? '#fff' : '#000' }}>
//         {title}
//       </Typography>

//       {fields.map((field) => {
//         if (field.type === 'checkbox') {
//           return (
//             <Box key={field.name} sx={{ mb: 2 }}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={!!(formState[field.name] === true || formState[field.name] === 1 || formState[field.name] === '1')}
//                     onChange={handleCheckboxChange}
//                     name={field.name}
//                     color="primary"
//                   />
//                 }
//                 label={field.label}
//                 sx={{ color: isDark ? '#fff' : '#000' }}
//               />
//             </Box>
//           );
//         }

//         if (field.type === 'file') {
//           return (
//             <Box key={field.name} sx={{ mb: 3 }}>
//               <Typography variant="body2" sx={{ mb: 1, color: isDark ? '#fff' : '#000' }}>
//                 {field.label}
//               </Typography>
//               <Button
//                 variant="outlined"
//                 component="label"
//                 fullWidth
//                 sx={{ py: 1.5, color: isDark ? '#fff' : '#000' }}
//               >
//                 {formState[field.name] instanceof File ? formState[field.name].name : 'Choose New File'}
//                 <input type="file" name={field.name} hidden onChange={handleFileChange} />
//               </Button>
//             </Box>
//           );
//         }

//         return (
//           <TextField
//             key={field.name}
//             name={field.name}
//             label={field.label}
//             type={field.type || 'text'} // Ensures password characters hide properly
//             multiline={field.multiline || false}
//             rows={field.rows || 1}
//             value={formState[field.name] || ''}
//             onChange={handleTextChange}
//             fullWidth
//             margin="normal"
//             InputLabelProps={{ shrink: true }}
//             sx={{
//               '& .MuiInputBase-input': { color: isDark ? '#fff' : '#000' },
//               '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }
//             }}
//           />
//         );
//       })}

//       <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 1.5 }}>
//         Commit Configuration Data
//       </Button>
//     </Box>
//   );
// }
import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, FormControlLabel, Checkbox } from '@mui/material';
import ToastNotification from './ToastNotification';

export default function DynamicForm({ mode, title, fields, initialValues, submitUrl, successMessage, isMultipart = false, onSuccess }) {
  const isDark = mode === 'dark';
  const token = localStorage.getItem('authToken');
  const [formState, setFormState] = useState({});

  // Toast States
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (initialValues) {
      setFormState(JSON.parse(JSON.stringify(initialValues)));
    }
  }, [initialValues?.id, initialValues]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormState((prev) => ({ ...prev, [name]: checked ? 1 : 0 }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormState((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!formState.id; 
    let baseTargetUrl = submitUrl.endsWith('/') ? submitUrl.slice(0, -1) : submitUrl;
    let finalUrl = isEditing ? `${baseTargetUrl}/${formState.id}` : baseTargetUrl;

    let bodyData;
    let customHeaders = { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` };

    if (isMultipart) {
      const formDataObj = new FormData();
      Object.keys(formState).forEach((key) => {
        if (key === 'created_at' || key === 'updated_at' || key === 'id' || key === 'url') return;
        if ((key === 'background_image' || key === 'image') && typeof formState[key] === 'string') return;
        if (formState[key] !== null && formState[key] !== undefined) {
          formDataObj.append(key, formState[key]);
        }
      });
      if (isEditing) formDataObj.append('_method', 'PUT');
      bodyData = formDataObj;
    } else {
      bodyData = JSON.stringify(formState);
      customHeaders['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(finalUrl, {
        method: isMultipart && isEditing ? 'POST' : (isEditing ? 'PUT' : 'POST'), 
        headers: customHeaders,
        body: bodyData
      });
      const resData = await response.json();

      if (response.ok) {
        setToast({ open: true, message: successMessage || 'Saved successfully!', severity: 'success' });
        setTimeout(() => {
          if (onSuccess) onSuccess(resData);
        }, 1000);
      } else {
        setToast({ open: true, message: resData.message || 'Validation error occurred.', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'Critical communication crash.', severity: 'error' });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: isDark ? '#fff' : '#000' }}>
        {title}
      </Typography>

      {fields.map((field) => {
        if (field.type === 'checkbox') {
          return (
            <Box key={field.name} sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!(formState[field.name] === true || formState[field.name] === 1 || formState[field.name] === '1')}
                    onChange={handleCheckboxChange}
                    name={field.name}
                    color="primary"
                  />
                }
                label={field.label}
                sx={{ color: isDark ? '#fff' : '#000' }}
              />
            </Box>
          );
        }

        if (field.type === 'file') {
          return (
            <Box key={field.name} sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, color: isDark ? '#fff' : '#000' }}>
                {field.label}
              </Typography>
              <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5, color: isDark ? '#fff' : '#000' }}>
                {formState[field.name] instanceof File ? formState[field.name].name : 'Choose New File'}
                <input type="file" name={field.name} hidden onChange={handleFileChange} />
              </Button>
            </Box>
          );
        }

        return (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type || 'text'}
            multiline={field.multiline || false}
            rows={field.rows || 1}
            value={formState[field.name] || ''}
            onChange={handleTextChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-input': { color: isDark ? '#fff' : '#000' },
              '& .MuiInputLabel-root': { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }
            }}
          />
        );
      })}

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 1.5 }}>
        Commit Configuration Data
      </Button>

      <ToastNotification 
        open={toast.open} 
        message={toast.message} 
        severity={toast.severity} 
        mode={mode}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))} 
      />
    </Box>
  );
}