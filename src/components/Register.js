import React, { useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
} from '@mui/material';

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
});

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post('https://momentcraft-backend.onrender.com/api/auth/register', {
        username: values.username,
        email: values.email,
        password: values.password,
      });
      login(response.data.token);
      navigate('/best-memories');
    } catch (err) {
      setErrors({ submit: 'Registration failed. Please try again.' });
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register
          </Typography>
          
          <Formik
            initialValues={{ username: '', email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ 
              values, 
              errors, 
              touched, 
              handleChange, 
              handleBlur, 
              isSubmitting 
            }) => (
              <Form>
                <TextField
                  fullWidth
                  margin="normal"
                  name="username"
                  label="Username"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.username && Boolean(errors.username)}
                  helperText={touched.username && errors.username}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  margin="normal"
                  name="email"
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  margin="normal"
                  name="password"
                  label="Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  variant="outlined"
                />

                {errors.submit && (
                  <Typography color="error" align="center" sx={{ mt: 2 }}>
                    {errors.submit}
                  </Typography>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>

          <Typography align="center" variant="body2" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#1976d2',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
              onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
              onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
            >
              Log in
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;