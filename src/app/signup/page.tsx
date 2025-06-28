'use client'
import { AuroraBackground } from '../components/ui/AuroraBackground'
import React, { useState } from 'react'
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { UserSignUp } from '../apiprovider/auth/authenticate'
import { Logo } from '../components/logo'

const page = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [signinSuccess, setSignInSuccess] = useState(false)
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
    if (password == confirmPassword && error) {
      setError('')
    }
    if (count > 0) {
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    try {
      setLoading(true)
      const response = await UserSignUp({ username, password })
      console.log('Signup successful:', response)
      setSignInSuccess(true)
      setLoading(false)
      setTimeout(() => {
        window.location.href = '/login' // Redirect to login after signup
      }, 3000)
    } catch (err) {
      setLoading(false)
      console.error('Signup failed:', err)
      setError('Signup failed. Please try again.')
    }
    // Replace with your signup authentication logic (e.g., API call)
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
        {signinSuccess && (
          <Typography variant='body1' sx={{ color: '#00ff00', mb: 2 }}>
            Signup successful! Redirecting...
          </Typography>
        )}
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
          <TextField
            label='Username'
            variant='outlined'
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            required
            disabled={signinSuccess}
            error={usernameError}
            helperText={usernameError ? 'Username is required' : ''}
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
            value={password}
            disabled={signinSuccess}
            error={passwordError}
            helperText={passwordError ? 'Password is required' : ''}
            onChange={e => setPassword(e.target.value)}
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
            label='Confirm Password'
            type='password'
            variant='outlined'
            value={confirmPassword}
            disabled={signinSuccess}
            onChange={e => setConfirmPassword(e.target.value)}
            fullWidth
            required
            error={!!error}
            helperText={error}
            sx={{
              '& .MuiInputBase-input': { color: '#ffffff' },
              '& .MuiInputLabel-root': { color: '#ffffff' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#ffffff' },
                '&:hover fieldset': { borderColor: '#36A2EB' },
                '&.Mui-focused fieldset': { borderColor: '#36A2EB' }
              },
              '& .MuiFormHelperText-root': { color: '#FF6384' } // Error text in red
            }}
          />
          <Button
            type='submit'
            disabled={signinSuccess}
            variant='contained'
            startIcon={<PersonAddIcon />}
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
              <Typography>Create Account</Typography>
            )}
          </Button>
        </Box>
      </Box>
    </AuroraBackground>
  )
}

export default page
