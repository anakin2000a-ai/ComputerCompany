import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DynamicForm from '../../components/DynamicForm';
import DynamicTable from '../../components/DynamicTable';
import ToastNotification from '../../components/ToastNotification';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

export default function FeatureCardCmsManager({ mode }) {
  const isDark = mode === 'dark';
  const token = localStorage.getItem('authToken');

  const [featureCards, setFeatureCards] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, recordId: null });

  const columns = [
    { field: 'page', headerName: 'Page Context' },
    { field: 'title', headerName: 'Card Title', isKey: true },
    { 
      field: 'icon', 
      headerName: 'Icon Asset',
      renderCell: (row) => row.icon ? (
        <Box 
          component="img" 
          src={`http://127.0.0.1:8000/storage/${row.icon}`} 
          alt={row.title}
          sx={{ width: 40, height: 40, borderRadius: '8px', objectFit: 'cover' }}
        />
      ) : '—'
    },
    { field: 'sort_order', headerName: 'Priority Weight' }
  ];

  const cardFields = [
    { name: 'page', label: 'Target Page Identity (Context)' },
    { name: 'section_key', label: 'Section Key Identifier (Unique Label)' },
    { name: 'icon', label: 'Upload Icon Image Graphic Asset (PNG, SVG, JPG)', type: 'file' }, 
    { name: 'title', label: 'Card Title Header' },
    { name: 'description', label: 'Main Body Content / Description', multiline: true, rows: 4 },
    { name: 'button_text', label: 'Action Button Text' },
    { name: 'button_url', label: 'Action Button Target URL (href)' },
    { name: 'sort_order', label: 'Sort Ordering Weight Number', type: 'number' },
    { name: 'is_active', label: 'Publish Structurally (Active Flag)', type: 'checkbox' }
  ];

  const defaultValues = { page: 'home', section_key: '', icon: null, title: '', description: '', button_text: '', button_url: '', sort_order: 0, is_active: 1 };

  const fetchFeatureCards = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/admin/feature-cards', {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok) {
        setFeatureCards(resData.data || (Array.isArray(resData) ? resData : []));
      }
    } catch (err) {
      console.error('Failed processing index request collection:', err);
    }
  }, [token]);

  useEffect(() => { fetchFeatureCards(); }, [fetchFeatureCards]);

  // HITS GET BY ID ENDPOINT FOR FEATURE CARD DETAILS
  const handleViewDetailsClick = async (row) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/feature-cards/${row.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();
      if (response.ok) {
        setSelectedCard(resData.data || resData);
        setIsViewingDetails(true);
      } else {
        setToast({ open: true, message: resData.message || 'Error pulling feature card metadata profile.', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'Server communication crash.', severity: 'error' });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEditClick = (row) => {
    setSelectedCard({
      ...row,
      icon: typeof row.icon === 'string' ? null : row.icon
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
      const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/feature-cards/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setToast({ open: true, message: 'Feature card removed successfully.', severity: 'success' });
        fetchFeatureCards();
      } else {
        setToast({ open: true, message: 'Unable to drop matrix card segment.', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'Failed to safely drop card record.', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, recordId: null });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ marginBottom: "15px" }} display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? '#fff' : '#1a1523' }}>
          {isViewingDetails ? "Feature Card Component Details" : "Feature Card Structures"}
        </Typography>
        {!isEditing && !isViewingDetails && (
          <Button sx={{ marginTop: "15px" }} variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedCard(null); setIsEditing(true); }}>
            Add New Feature Card
          </Button>
        )}
      </Box>

      {isViewingDetails && selectedCard ? (
        <Paper sx={{ p: 4, bgcolor: isDark ? '#120d24' : '#ffffff', borderRadius: '16px', border: `1px solid ${isDark ? '#1d1637' : '#eaeaea'}` }}>
          <Typography variant="h6" sx={{ color: '#7c4dff', fontWeight: 800, mb: 1 }}>
            Details for Feature Card Reference ID: #{selectedCard.id}
          </Typography>
          <Divider sx={{ mb: 3, borderColor: isDark ? '#2a204e' : '#eaeaea' }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 4 }}>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Target Page Identity (Context)</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>{selectedCard.page}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Section Key Identifier</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>{selectedCard.section_key || '—'}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Card Title Header</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>{selectedCard.title || '—'}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Ordering Index Weight</Typography><Typography sx={{ color: isDark ? '#fff' : '#000' }}>{selectedCard.sort_order}</Typography></Box>
            <Box sx={{ gridColumn: 'span 2' }}><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Main Description Content</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', whiteSpace: 'pre-line' }}>{selectedCard.description || '—'}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Action Button Configuration</Typography><Typography sx={{ color: isDark ? '#fff' : '#000' }}>{selectedCard.button_text ? `${selectedCard.button_text} ➔ ${selectedCard.button_url}` : '—'}</Typography></Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Graphic Icon Asset Preview</Typography>
              {selectedCard.icon ? (
                <Box component="img" src={`http://127.0.0.1:8000/storage/${selectedCard.icon}`} sx={{ mt: 1, width: 50, height: 50, borderRadius: '8px', objectFit: 'cover' }} />
              ) : '—'}
            </Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Active Layout View Status</Typography><Typography sx={{ color: selectedCard.is_active ? '#00e676' : '#ff1744', fontWeight: 700 }}>{selectedCard.is_active ? 'ACTIVE' : 'INACTIVE'}</Typography></Box>
          </Box>

          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setIsViewingDetails(false)} sx={{ flexGrow: 1, color: isDark ? '#fff' : '#000' }}>
              Return to Layout Grid
            </Button>
            <Button variant="contained" onClick={() => handleEditClick(selectedCard)} sx={{ flexGrow: 1, bgcolor: '#7c4dff' }}>
              Edit Configuration Data
            </Button>
          </Box>
        </Paper>
      ) : isEditing ? (
        <Box sx={{ p: 4, bgcolor: isDark ? '#120d24' : '#ffffff', borderRadius: '16px' }}>
          <DynamicForm
            mode={mode}
            title={selectedCard ? "Modify Feature Card Layout" : "Construct Feature Card Layout Component"}
            fields={cardFields}
            initialValues={selectedCard || defaultValues}
            submitUrl="http://127.0.0.1:8000/api/v1/admin/feature-cards"
            successMessage={selectedCard ? "Feature card updated!" : "Feature card generated!"}
            isMultipart={true} 
            onSuccess={() => { setIsEditing(false); fetchFeatureCards(); }}
          />
          <Button fullWidth variant="text" onClick={() => setIsEditing(false)} sx={{ mt: 2, color: isDark ? '#fff' : '#000' }}>
            Cancel Operations Matrix
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
            data={featureCards}
            onView={handleViewDetailsClick} // MOUNTED AUTH VIEW OPERATION HERE
            onEdit={handleEditClick}
            onDelete={openDeletePrompt}
            fallbackText="No feature card configurations found in active matrix database."
          />
        </Box>
      )}

      <DeleteConfirmDialog 
        open={deleteDialog.open}
        mode={mode}
        title="Remove Feature Card Layout"
        message="Are you absolutely sure you want to detach this feature card component block from the layout matrix?"
        onClose={() => setDeleteDialog({ open: false, recordId: null })}
        onConfirm={handleExecuteDelete}
      />

      <ToastNotification open={toast.open} message={toast.message} severity={toast.severity} mode={mode} onClose={() => setToast(p => ({ ...p, open: false }))} />
    </Box>
  );
}