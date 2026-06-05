import { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DynamicForm from '../../components/DynamicForm';
import DynamicTable from '../../components/DynamicTable';
import ToastNotification from '../../components/ToastNotification';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

export default function HomeSectionCmsManager({ mode }) {
  const isDark = mode === 'dark';
  const token = localStorage.getItem('authToken');

  const [homeSections, setHomeSections] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false); // Controls Detail View visibility
  const [selectedSection, setSelectedSection] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, recordId: null });

  const columns = [
    { field: 'section_key', headerName: 'Key Target' },
    { field: 'title', headerName: 'Section Title' },
    { field: 'sort_order', headerName: 'Priority Weight' }
  ];

  const sectionFields = [
    { name: 'page', label: 'Target Page Context' },
    { name: 'section_key', label: 'Section Key Identifier' },
    { name: 'title', label: 'Section Component Header Title' },
    { name: 'subtitle', label: 'Section Subtitle Description Text', multiline: true, rows: 2 },
    { name: 'sort_order', label: 'Sort Priority Index Number', type: 'number' },
    { name: 'is_active', label: 'Publish Structurally (Active Flag)', type: 'checkbox' }
  ];

  const defaultValues = { page: 'home', section_key: '', title: '', subtitle: '', sort_order: 0, is_active: 1 };

  const fetchHomeSections = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/admin/home-sections', {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok) {
        setHomeSections(resData.data || (Array.isArray(resData) ? resData : []));
      }
    } catch (err) {
      console.error('Failed processing index matrix compilation:', err);
    }
  }, [token]);

  useEffect(() => { fetchHomeSections(); }, [fetchHomeSections]);

  // SPECIFIC DETAIL METHOD: HITS GET API ENDPOINT BY RECORD ID WITH AUTHORIZATION HEADERS
  const handleViewDetailsClick = async (row) => {
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/home-sections/${row.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Clears up unauthenticated 401/500 errors
        }
      });
      
      const resData = await response.json();
      
      if (response.ok) {
        setSelectedSection(resData.data || resData);
        setIsViewingDetails(true); // Transitions matrix view over to standalone detailed inspector panel
      } else {
        setToast({ open: true, message: resData.message || 'Error pulling item data configurations.', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'Server communication crash.', severity: 'error' });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEditClick = (row) => {
    setSelectedSection(row);
    setIsEditing(true);
    setIsViewingDetails(false);
  };

  const openDeletePrompt = (id) => {
    setDeleteDialog({ open: true, recordId: id });
  };

  const handleExecuteDelete = async () => {
    const id = deleteDialog.recordId;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/admin/home-sections/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setToast({ open: true, message: 'Layout component successfully removed.', severity: 'success' });
        fetchHomeSections();
      } else {
        setToast({ open: true, message: 'Could not complete removal process.', severity: 'error' });
      }
    } catch (err) {
      setToast({ open: true, message: 'System communication failure during drop action.', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, recordId: null });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Dynamic Header Panel Control Text Block */}
      <Box sx={{ marginBottom: "15px" }} display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? '#fff' : '#1a1523' }}>
          {isViewingDetails ? "Component Inspection Card" : "Home Section Structures"}
        </Typography>
        {!isEditing && !isViewingDetails && (
          <Button sx={{ marginTop: "15px" }} variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedSection(null); setIsEditing(true); }}>
            Add New Layout Section
          </Button>
        )}
      </Box>

      {/* VIEW STEP 1: DETAILED READ-ONLY PROFILE DRAWER VIEW */}
      {isViewingDetails && selectedSection ? (
        <Paper sx={{ p: 4, bgcolor: isDark ? '#120d24' : '#ffffff', borderRadius: '16px', border: `1px solid ${isDark ? '#1d1637' : '#eaeaea'}` }}>
          <Typography variant="h6" sx={{ color: '#7c4dff', fontWeight: 800, mb: 1 }}>
            Details for Object Identifer Reference ID: #{selectedSection.id}
          </Typography>
          <Divider sx={{ mb: 3, borderColor: isDark ? '#2a204e' : '#eaeaea' }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 4 }}>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Target Page Context</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>{selectedSection.page}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Section Key Identifier</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>{selectedSection.section_key}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Component Header Title</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>{selectedSection.title || '—'}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Sort Ordering Priority Weight</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', fontWeight: 600 }}>{selectedSection.sort_order}</Typography></Box>
            <Box sx={{ gridColumn: 'span 2' }}><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Sub-description Text</Typography><Typography sx={{ color: isDark ? '#fff' : '#000', whiteSpace: 'pre-line' }}>{selectedSection.subtitle || '—'}</Typography></Box>
            <Box><Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>Publication State</Typography><Typography sx={{ color: selectedSection.is_active ? '#00e676' : '#ff1744', fontWeight: 700 }}>{selectedSection.is_active ? 'ACTIVE / LIVE' : 'DRAFT / HIDDEN'}</Typography></Box>
          </Box>

          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setIsViewingDetails(false)} sx={{ flexGrow: 1, color: isDark ? '#fff' : '#000', borderColor: isDark ? '#2a204e' : '#ccc' }}>
              Return to Layout Matrix
            </Button>
            <Button variant="contained" onClick={() => handleEditClick(selectedSection)} sx={{ flexGrow: 1, bgcolor: '#7c4dff', '&:hover': { bgcolor: '#6200ea' } }}>
              Modify This Configuration Data
            </Button>
          </Box>
        </Paper>
      ) : isEditing ? (
        /* VIEW STEP 2: DYNAMIC FORM SUBMITTER INTERACTION ZONE */
        <Box sx={{ p: 4, bgcolor: isDark ? '#120d24' : '#ffffff', borderRadius: '16px' }}>
          <DynamicForm
            mode={mode}
            title={selectedSection ? "Modify Page Layout Section" : "Construct Page Layout Section"}
            fields={sectionFields}
            initialValues={selectedSection || defaultValues}
            submitUrl="http://127.0.0.1:8000/api/v1/admin/home-sections"
            successMessage={selectedSection ? "Section profile modified!" : "Section segment registered!"}
            isMultipart={false}
            onSuccess={() => { setIsEditing(false); fetchHomeSections(); }}
          />
          <Button fullWidth variant="text" onClick={() => setIsEditing(false)} sx={{ mt: 2, color: isDark ? '#fff' : '#000' }}>
            Cancel Operations Matrix
          </Button>
        </Box>
      ) : (
        /* VIEW STEP 3: DEFAULT DATA INDEX SELECTION MAPPING LAYOUT */
        <Box sx={{ position: 'relative' }}>
          {isLoadingDetails && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, bgcolor: isDark ? 'rgba(10,5,27,0.6)' : 'rgba(255,255,255,0.6)', borderRadius: '16px' }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          <DynamicTable 
            mode={mode}
            columns={columns}
            data={homeSections}
            onView={handleViewDetailsClick} // NEW EYE BUTTON ONVIEW ACTION REGISTERED HERE!
            onEdit={handleEditClick}
            onDelete={openDeletePrompt}
            fallbackText="No core system modular layouts found."
          />
        </Box>
      )}

      <DeleteConfirmDialog 
        open={deleteDialog.open}
        mode={mode}
        title="Remove Section Layout Configuration"
        message="Are you absolutely sure you want to remove this home layout configuration row item from database views?"
        onClose={() => setDeleteDialog({ open: false, recordId: null })}
        onConfirm={handleExecuteDelete}
      />

      <ToastNotification open={toast.open} message={toast.message} severity={toast.severity} mode={mode} onClose={() => setToast(p => ({ ...p, open: false }))} />
    </Box>
  );
}