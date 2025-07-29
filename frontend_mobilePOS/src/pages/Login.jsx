import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Button, TextField, Typography, Container, Paper, Link, Alert, Collapse, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  // Clear error when component unmounts or when username/password changes
  useEffect(() => {
    return () => setLoginError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!username.trim() || !password) {
      setLoginError('Please enter both username and password');
      return;
    }

    try {
      const result = await login(username, password);
      if (result?.success) {
        navigate('/dashboard');
      } else {
        setLoginError(result?.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setLoginError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ 
        mt: 8, 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign In
        </Typography>

        {/* Error Alert */}
        <Collapse in={!!loginError} sx={{ width: '100%', mb: 2 }}>
          <Alert 
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setLoginError('')}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {loginError}
          </Alert>
        </Collapse>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mt: 1, 
              mb: 2,
              py: 1.5,
              position: 'relative',
              '&.Mui-disabled': {
                backgroundColor: 'primary.main',
                color: 'white',
                opacity: 0.7
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {loading && (
              <Box sx={{ 
                position: 'absolute', 
                right: 16,
                display: 'flex',
                alignItems: 'center'
              }}>
                <CircularProgress size={20} color="inherit" />
              </Box>
            )}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link href="/signup" underline="hover">
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
