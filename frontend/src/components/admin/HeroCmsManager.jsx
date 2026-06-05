import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DynamicForm from '../../components/DynamicForm';
import DynamicTable from '../../components/DynamicTable';
import ToastNotification from '../../components/ToastNotification';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

export default function HeroCmsManager({ mode }) {
  const isDark = mode === 'dark';
  const token = localStorage.getItem('authToken');

  const [heroSections, setHeroSections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false); 
  const [selectedHero, setSelectedHero] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, recordId: null });

  const columns = [
    { field: 'page', headerName: 'Page' },
    { field: 'title', headerName: 'Title' },
    { 
      field: 'background_image', 
      headerName: 'Background Image',
      renderCell: (row) => row.background_image ? (
        <Box 
          component="img" 
          src={`http://127.0.0.1:8000/storage/${row.background_image}`} 
          alt={row.title || 'Hero'}
          sx={{ width: 75, height: 40, borderRadius: '6px', objectFit: 'cover' }}
        />
      ) : '—'
    }
  ];

  const heroFields = [
    { name: 'page', label: 'Target Page Identity' },
    { name: 'small_title', label: 'Small Top Title' },
    { name: 'title', label: 'Main Core Title' },
    { name: 'highlighted_title', label: 'Highlighted Accent Title' },
    { name: 'subtitle', label: 'Subtitle / Description Paragraph', multiline: true, rows: 3 },
    { name: 'primary_button_text', label: 'Primary Button Text' },
    { name: 'primary_button_url', label: 'Primary Button Target URL (href)' },
    { name: 'secondary_button_text', label: 'Secondary Button Text' },
    { name: 'secondary_button_url', label: 'Secondary Button Target URL (href)' },
    { name: 'background_image', label: 'Upload Background Image', type: 'file' },
    { name: 'is_active', label: 'Publish Immediately (Active Status)', type: 'checkbox' }
  ];

  const defaultValues = { page: 'home', small_title: '', title: '', highlighted_title: '', subtitle: '', primary_button_text: '', primary_button_url: '', secondary_button_text: '', secondary_button_url: '', is_active: 1 };

  const fetchHeroSections = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/admin/hero-sections', {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok) {
        setHeroSections(resData.data || (Array.isArray(resData) ? resData : []));
      }
    } catch (err) {
      console.error('Failed fetching data records:', err);
    }
  }, [token]);

  useEffect(() => { fetchHeroSections(); }, [fetchHeroSections]);

  // HITS GET BY ID ENDPOINT FOR HERO SECTION DETAILS
  const handleViewDetailsClick = async (row) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/hero-sections/${row.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (response.ok) {
        setSelectedHero(resData.data || resData);
        setIsViewingDetails(true);
      } else {
        setToast({ open: true, message: resData.message || 'Error pulling hero configuration metadata.', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'Server communication crash.', severity: 'error' });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEditClick = (row) => {
    setSelectedHero({
      ...row,
      background_image: typeof row.background_image === 'string' ? null : row.background_image
    });
    setIsEditing(true);
    setIsViewingDetails(false);
  };

  const openDeletePrompt = (id) => {
    setDeleteDialog({ open: true, recordId: id });
  };

  const handleExecuteDelete = async () => {
    const id = deleteDialog.recordId;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/hero-sections/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setToast({ open: true, message: 'Configuration record successfully removed.', severity: 'success' });
        fetchHeroSections();
      } else {
        setToast({ open: true, message: 'Could not remove configuration.', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'Failed to complete deletion process.', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, recordId: null });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ marginBottom: "15px" }} display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? '#fff' : '#1a1523' }}>
          {isViewingDetails ? "Hero Segment Inspection" : "Hero Configurations"}
        </Typography>
        {!isEditing && !isViewingDetails && (
          <Button sx={{ marginTop: "15px" }} variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedHero(null); setIsEditing(true); }}>
            Add New Hero
          </Button>
        )}
      </Box>

      {isViewingDetails && selectedHero ? (
        <Paper sx={{ p: 4, bgcolor: isDark ? '#120d24' : '#ffffff', borderRadius: '16px', border: `1px solid ${isDark ? '#1d1637' : '#eaeaea'}` }}>
          <Typography variant="h6" sx={{ color: '#7c4dff', fontWeight: 800, mb: 1 }}>
            Details for Hero Configuration Reference ID: #{selectedHero.id}
          </Typography>
          <Divider sx={{ mb: 3, borderColor: isDark ? '#2a204e' : '#eaeaea' }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 4 }}>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Target Page Identity</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>{selectedHero.page}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Small Top Title</Typography><Typography sx={{ color: isDark ? '#fff' : '#000' }}>{selectedHero.small_title || '—'}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Main Core Title</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>{selectedHero.title || '—'}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Highlighted Accent Title</Typography><Typography sx={{ color: isDark ? '#fff' : '#000' }}>{selectedHero.highlighted_title || '—'}</Typography></Box>
            <Box sx={{ gridColumn: 'span 2' }}><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Subtitle Paragraph Text</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', whiteSpace: 'pre-line' }}>{selectedHero.subtitle || '—'}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Primary Action Button</Typography><Typography sx={{ color: isDark ? '#fff' : '#000' }}>{selectedHero.primary_button_text ? `${selectedHero.primary_button_text} (${selectedHero.primary_button_url})` : '—'}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Secondary Action Button</Typography><Typography sx={{ color: isDark ? '#fff' : '#000' }}>{selectedHero.secondary_button_text ? `${selectedHero.secondary_button_text} (${selectedHero.secondary_button_url})` : '—'}</Typography></Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Background Image Asset</Typography>
              {selectedHero.background_image ? (
                <Box component="img" src={`http://127.0.0.1:8000/storage/${selectedHero.background_image}`} sx={{ mt: 1, width: 150, height: 80, borderRadius: '8px', objectFit: 'cover' }} />
              ) : '—'}
            </Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Status</Typography><Typography sx={{ color: selectedHero.is_active ? '#00e676' : '#ff1744', fontWeight: 700 }}>{selectedHero.is_active ? 'LIVE / ACTIVE' : 'DRAFT'}</Typography></Box>
          </Box>

          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setIsViewingDetails(false)} sx={{ flexGrow: 1, color: isDark ? '#fff' : '#000' }}>
              Back to Table
            </Button>
            <Button variant="contained" onClick={() => handleEditClick(selectedHero)} sx={{ flexGrow: 1, bgcolor: '#7c4dff' }}>
              Modify Configuration Layout
            </Button>
          </Box>
        </Paper>
      ) : isEditing ? (
        <Box sx={{ p: 4, bgcolor: isDark ? '#120d24' : '#ffffff', borderRadius: '16px' }}>
          <DynamicForm
            mode={mode}
            title={selectedHero ? "Edit Hero Configuration" : "Create New Hero Configuration"}
            fields={heroFields}
            initialValues={selectedHero || defaultValues}
            submitUrl="http://127.0.0.1:8000/api/v1/admin/hero-sections"
            successMessage={selectedHero ? "Configuration updated!" : "Configuration created!"}
            isMultipart={true}
            onSuccess={() => { setIsEditing(false); fetchHeroSections(); }}
          />
          <Button fullWidth variant="text" onClick={() => setIsEditing(false)} sx={{ mt: 2, color: isDark ? '#fff' : '#000' }}>
            Cancel Operation
          </Button>
        </Box>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {isLoadingDetails && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '16px' }}>
              <CircularProgress />
            </Box>
          )}
          <DynamicTable 
            mode={mode}
            columns={columns}
            data={heroSections}
            onView={handleViewDetailsClick} // MOUNTED AUTH VIEW OPERATION HERE
            onEdit={handleEditClick}
            onDelete={openDeletePrompt}
            fallbackText="No infrastructure records found."
          />
        </Box>
      )}

      <DeleteConfirmDialog 
        open={deleteDialog.open}
        mode={mode}
        title="Remove Hero Record"
        message="Are you sure you want to delete this specific hero section configuration setup?"
        onClose={() => setDeleteDialog({ open: false, recordId: null })}
        onConfirm={handleExecuteDelete}
      />

      <ToastNotification open={toast.open} message={toast.message} severity={toast.severity} mode={mode} onClose={() => setToast(p => ({ ...p, open: false }))} />
    </Box>
  );
}