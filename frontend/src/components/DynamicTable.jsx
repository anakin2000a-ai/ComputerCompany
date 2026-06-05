import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// NEW ICON IMPORT: Elegant visibility icon for record details view
import VisibilityIcon from '@mui/icons-material/Visibility'; 

export default function DynamicTable({ mode, columns, data, onEdit, onDelete, onView, fallbackText }) {
  const isDark = mode === 'dark';

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        bgcolor: isDark ? '#120d24' : '#ffffff', 
        borderRadius: '16px',
        border: `1px solid ${isDark ? '#1d1637' : '#eaeaea'}`,
        boxShadow: 'none',
        overflow: 'hidden'
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: '#7c4dff' }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.field} sx={{ color: '#fff', fontWeight: 700, fontSize: '14px', borderBottom: 'none' }}>
                {col.headerName}
              </TableCell>
            ))}
            <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: '14px', borderBottom: 'none', pr: 4 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                  {fallbackText || 'No data blocks recorded.'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow 
                key={row.id || index} 
                sx={{ 
                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
                  borderBottom: `1px solid ${isDark ? '#1d1637' : '#eaeaea'}`
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.field} sx={{ color: isDark ? '#fff' : '#1a1523', borderBottom: 'none', py: 2 }}>
                    {col.renderCell ? col.renderCell(row) : row[col.field]}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ borderBottom: 'none', pr: 2 }}>
                  
                  {/* NEW VIEW DETAILS ACTION ICON BUTTON */}
                  {onView && (
                    <IconButton onClick={() => onView(row)} sx={{ color: '#00e5ff', mr: 0.5 }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  )}

                  {onEdit && (
                    <IconButton onClick={() => onEdit(row)} sx={{ color: '#7c4dff', mr: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  
                  {onDelete && (
                    <IconButton onClick={() => onDelete(row.id)} sx={{ color: '#ff5252' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}

                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}