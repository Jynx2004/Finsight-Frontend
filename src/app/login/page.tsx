'use client'
import { AuroraBackground } from '../components/ui/AuroraBackground'
import React, { useState } from 'react'
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material'
import { Logo } from '../components/logo'
import LoginIcon from '@mui/icons-material/Login'
import { UserLogin } from '../apiprovider/auth/authenticate'

const page = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [loginsuccess, setLoginSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault()
    let count = 0
    if (username && usernameError) {
      setUsernameError(false)
    }
    if (password && passwordError) {
      setPasswordError(false)
    }
    if (!username) {
      count++
      setUsernameError(true)
    }
    if (!password) {
      count++
      setPasswordError(true)
    }
    if (count > 0) {
      return
    }
    console.log('Login submitted:', { username, password })
    try {
      setLoading(true)
      const userData = await UserLogin({ username, password })
      console.log('Login successful:', userData)
      setLoginSuccess(true)
      setLoading(false)
      setTimeout(() => {
        window.location.href = '/dashboard' // Redirect to dashboard after 3 seconds
      }, 5000)
    } catch (error) {
      setLoading(false)
      setLoginSuccess(false)
      console.error('Login failed:', error)
      // Handle login failure (e.g., show error message)
      alert('Login failed. Please check your credentials and try again.')
    }
  }

  return (
    <AuroraBackground>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%',
          maxWidth: '400px',
          mx: 'auto',
          p: 3
        }}
      >
        <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
          <Logo />
        </Typography>
        <Box
          component='form'
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            p: 3,
            borderRadius: '8px'
          }}
        >
          <Typography variant='body1' sx={{ color: '#ffffff', mb: 2 }}>
            Please enter your credentials to log in.
          </Typography>
          {loginsuccess && (
            <Typography variant='body1' sx={{ color: '#00ff00', mb: 2 }}>
              Login successful! Redirecting...
            </Typography>
          )}
          <TextField
            label='Username'
            variant='outlined'
            value={username}
            error={usernameError}
            disabled={loginsuccess}
            helperText={usernameError ? 'Username is required' : ''}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiInputBase-input': { color: '#ffffff' },
              '& .MuiInputLabel-root': { color: '#ffffff' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#ffffff' },
                '&:hover fieldset': { borderColor: '#36A2EB' },
                '&.Mui-focused fieldset': { borderColor: '#36A2EB' }
              }
            }}
          />
          <TextField
            label='Password'
            type='password'
            variant='outlined'
            disabled={loginsuccess}
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            error={passwordError}
            helperText={passwordError ? 'Password is required' : ''}
            sx={{
              '& .MuiInputBase-input': { color: '#ffffff' },
              '& .MuiInputLabel-root': { color: '#ffffff' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#ffffff' },
                '&:hover fieldset': { borderColor: '#36A2EB' },
                '&.Mui-focused fieldset': { borderColor: '#36A2EB' }
              }
            }}
          />
          <Button
            disabled={loginsuccess}
            type='submit'
            variant='contained'
            startIcon={<LoginIcon />}
            sx={{
              backgroundColor: '#36A2EB',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#333333',
                borderColor: '#36A2EB'
              },
              mt: 2
            }}
          >
            {loading ? (
              <Box>
                <CircularProgress />
              </Box>
            ) : (
              <Typography>Sign In</Typography>
            )}
          </Button>
        </Box>
      </Box>
    </AuroraBackground>
  )
}

export default page
