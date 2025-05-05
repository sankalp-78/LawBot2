import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import '../styles/AdminPage.css';

const AdminNavbar = ({ isDarkMode, toggleTheme, onAddUser }) => {
  return (
    <nav className="admin-navbar">
      <div className="admin-nav-left">
        <h1 className="admin-nav-title">Admin Dashboard</h1>
      </div>
      <div className="admin-nav-right">
        <IconButton onClick={toggleTheme} color="inherit">
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddUser}
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          Add User
        </Button>
      </div>
    </nav>
  );
};

const AdminPage = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    userName: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        // Verify token with backend
        await axios.get('http://localhost:4500/api/admin/verify', {
          headers: { 'x-auth-token': token }
        });
        await fetchUsers();
      } catch (error) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:4500/api/admin/users', {
        headers: { 'x-auth-token': token }
      });
      setUsers(response.data);
    } catch (error) {
      showSnackbar('Error fetching users', 'error');
    }
  };

  const handleAdd = () => {
    setAddForm({ name: '', email: '', password: '' });
    setOpenAddDialog(true);
  };

  const handleAddSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('http://localhost:4500/api/admin/users', addForm, {
        headers: { 'x-auth-token': token }
      });
      fetchUsers();
      setOpenAddDialog(false);
      showSnackbar('User added successfully', 'success');
    } catch (error) {
      showSnackbar('Error adding user', 'error');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, password: '' });
    setOpenEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:4500/api/admin/users/${selectedUser._id}`, editForm, {
        headers: { 'x-auth-token': token }
      });
        fetchUsers();
      setOpenEditDialog(false);
      showSnackbar('User updated successfully', 'success');
    } catch (error) {
      showSnackbar('Error updating user', 'error');
    }
  };

  const handleDelete = (userId, userName) => {
    setDeleteDialog({
      open: true,
      userId,
      userName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:4500/api/admin/users/${deleteDialog.userId}`, {
        headers: { 'x-auth-token': token }
      });
        fetchUsers();
      showSnackbar('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar(error.response?.data?.message || 'Error deleting user', 'error');
    } finally {
      setDeleteDialog({ open: false, userId: null, userName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, userId: null, userName: '' });
  };

  const handleViewHistory = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      console.log('Fetching search history for user:', userId);
      
      const response = await axios.get(`http://localhost:4500/api/admin/users/${userId}/search-history`, {
        headers: { 'x-auth-token': token }
      });
      
      console.log('Search history response:', response.data);
      
      if (response.data && response.data.length > 0) {
        setSearchHistory(response.data);
        setOpenHistoryDialog(true);
      } else {
        showSnackbar('No search history found for this user', 'info');
      }
    } catch (error) {
      console.error('Error fetching search history:', error);
      showSnackbar(error.response?.data?.message || 'Error fetching search history', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="admin-page-container">
      <AdminNavbar 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        onAddUser={handleAdd}
      />
      <div className="admin-content">
        <TableContainer 
          component={Paper} 
          className="admin-table-container"
          sx={{ 
            backgroundColor: 'background.paper',
            boxShadow: 'var(--card-shadow)',
            border: '1px solid var(--link-color)',
            borderRadius: 'var(--border-radius)',
            maxHeight: 'calc(100vh - 200px)',
            overflow: 'auto'
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  color: 'text.primary', 
                  fontWeight: 'bold',
                  backgroundColor: 'background.paper',
                  borderBottom: '2px solid var(--link-color)'
                }}>Name</TableCell>
                <TableCell sx={{ 
                  color: 'text.primary', 
                  fontWeight: 'bold',
                  backgroundColor: 'background.paper',
                  borderBottom: '2px solid var(--link-color)'
                }}>Email</TableCell>
                <TableCell sx={{ 
                  color: 'text.primary', 
                  fontWeight: 'bold',
                  backgroundColor: 'background.paper',
                  borderBottom: '2px solid var(--link-color)'
                }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} sx={{ 
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}>
                  <TableCell sx={{ 
                    color: 'text.primary',
                    borderBottom: '1px solid var(--link-color)'
                  }}>{user.name}</TableCell>
                  <TableCell sx={{ 
                    color: 'text.primary',
                    borderBottom: '1px solid var(--link-color)'
                  }}>{user.email}</TableCell>
                  <TableCell sx={{ 
                    borderBottom: '1px solid var(--link-color)'
                  }}>
                    <IconButton 
                      onClick={() => handleEdit(user)}
                      sx={{
                        color: 'text.primary',
                        '&:hover': {
                          color: 'text.secondary'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(user._id, user.name)}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          color: 'error.dark'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleViewHistory(user._id)}
                      sx={{
                        color: 'info.main',
                        '&:hover': {
                          color: 'info.dark'
                        }
                      }}
                    >
                      <HistoryIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
              color: 'text.primary',
              borderRadius: 'var(--border-radius)',
              minWidth: '400px',
              maxWidth: '500px'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: 'text.primary',
            borderBottom: '1px solid var(--link-color)',
            backgroundColor: 'background.paper'
          }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ 
            backgroundColor: 'background.paper',
            padding: '20px'
          }}>
            <Typography sx={{ color: 'text.primary' }}>
              Are you sure you want to delete user: {deleteDialog.userName}?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ 
            backgroundColor: 'background.paper',
            borderTop: '1px solid var(--link-color)',
            padding: '16px'
          }}>
            <Button 
              onClick={handleDeleteCancel}
              sx={{ color: 'text.primary' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error"
              sx={{ color: 'error.main' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog 
          open={openAddDialog} 
          onClose={() => setOpenAddDialog(false)}
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
              color: 'text.primary',
              borderRadius: 'var(--border-radius)'
            }
          }}
        >
          <DialogTitle sx={{ color: 'text.primary' }}>Add New User</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'text.primary' }
              }}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'text.primary' }
              }}
            />
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'text.primary' }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenAddDialog(false)}
              sx={{ color: 'text.primary' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSubmit} 
              variant="contained"
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={() => setOpenEditDialog(false)}
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
              color: 'text.primary',
              borderRadius: 'var(--border-radius)'
            }
          }}
        >
          <DialogTitle sx={{ color: 'text.primary' }}>Edit User</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'text.primary' }
              }}
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'text.primary' }
              }}
            />
            <TextField
              margin="dense"
              label="New Password (leave blank to keep current)"
              type="password"
              fullWidth
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-root': { color: 'text.primary' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'text.primary' }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenEditDialog(false)}
              sx={{ color: 'text.primary' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              variant="contained"
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Search History Dialog */}
        <Dialog 
          open={openHistoryDialog} 
          onClose={() => setOpenHistoryDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: isDarkMode ? '#000000' : 'background.paper',
              color: isDarkMode ? '#ffffff' : 'text.primary',
              borderRadius: 'var(--border-radius)',
              maxHeight: '80vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: isDarkMode ? '#ffffff' : 'text.primary',
            borderBottom: '1px solid var(--link-color)',
            backgroundColor: isDarkMode ? '#000000' : 'background.paper'
          }}>
            Search History
          </DialogTitle>
          <DialogContent sx={{ 
            backgroundColor: isDarkMode ? '#000000' : 'background.paper',
            padding: '20px'
          }}>
            {searchHistory.length === 0 ? (
              <Typography align="center" sx={{ py: 4, color: isDarkMode ? '#ffffff' : 'text.primary' }}>
                No search history available
              </Typography>
            ) : (
              <TableContainer sx={{ 
                backgroundColor: isDarkMode ? '#000000' : 'background.paper',
                maxHeight: '60vh'
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        color: isDarkMode ? '#ffffff' : 'text.primary', 
                        fontWeight: 'bold',
                        backgroundColor: isDarkMode ? '#000000' : 'background.paper',
                        borderBottom: '2px solid var(--link-color)'
                      }}>Search Query</TableCell>
                      <TableCell sx={{ 
                        color: isDarkMode ? '#ffffff' : 'text.primary', 
                        fontWeight: 'bold',
                        backgroundColor: isDarkMode ? '#000000' : 'background.paper',
                        borderBottom: '2px solid var(--link-color)'
                      }}>Timestamp</TableCell>
                      <TableCell sx={{ 
                        color: isDarkMode ? '#ffffff' : 'text.primary', 
                        fontWeight: 'bold',
                        backgroundColor: isDarkMode ? '#000000' : 'background.paper',
                        borderBottom: '2px solid var(--link-color)'
                      }}>Results</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchHistory.map((history) => (
                      <TableRow key={history._id} sx={{ 
                        '&:hover': {
                          backgroundColor: isDarkMode ? '#1a1a1a' : 'action.hover'
                        }
                      }}>
                        <TableCell sx={{ 
                          color: isDarkMode ? '#ffffff' : '#000000',
                          borderBottom: '1px solid var(--link-color)'
                        }}>{history.searchQuery}</TableCell>
                        <TableCell sx={{ 
                          color: isDarkMode ? '#ffffff' : '#000000',
                          borderBottom: '1px solid var(--link-color)'
                        }}>{new Date(history.timestamp).toLocaleString()}</TableCell>
                        <TableCell sx={{ 
                          color: isDarkMode ? '#ffffff' : '#000000',
                          borderBottom: '1px solid var(--link-color)'
                        }}>
                          {history.results && history.results.length > 0 ? (
                            history.results.map((result, index) => (
                              <div key={index} style={{ 
                                marginBottom: '8px', 
                                whiteSpace: 'pre-wrap',
                                color: isDarkMode ? '#ffffff' : '#000000'
                              }}>
                                {result}
            </div>
                            ))
                          ) : (
                            <Typography sx={{ color: isDarkMode ? '#ffffff' : '#000000' }}>No results</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            backgroundColor: isDarkMode ? '#000000' : 'background.paper',
            borderTop: '1px solid var(--link-color)',
            padding: '16px'
          }}>
            <Button 
              onClick={() => setOpenHistoryDialog(false)}
              sx={{ color: isDarkMode ? '#ffffff' : 'text.primary' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        </div>
    </div>
  );
};

export default AdminPage; 