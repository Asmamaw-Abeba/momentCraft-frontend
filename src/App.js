import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from './components/Header';
import MemoryForm from './components/MemoryForm';
import MemoryList from './components/MemoryList';
import Login from './components/Login';
import Register from './components/Register';
import Timeline from './components/Timeline'; // Import the Timeline component
import AuthContext, { AuthProvider } from './context/AuthContext';

const App = () => {
  const [refresh, setRefresh] = useState(false);

  const handleMemoryCreated = () => {
    setRefresh(!refresh); // Toggle refresh state to trigger MemoryList update
  };

  return (
    <AuthProvider>
      <Router>
        <Header />
        <Container>
          <Routes>
            {/* Home Page */}
            <Route
              path="/"
              element={
                <>
                  <MemoryForm onMemoryCreated={handleMemoryCreated} />
                  <MemoryList refresh={refresh} />
                </>
              }
            />
            {/* Memories Page */}
            <Route
              path="/memories"
              element={<MemoryList refresh={refresh} />}
            />
            {/* Login Page */}
            <Route path="/login" element={<Login />} />
            {/* Register Page */}
            <Route path="/register" element={<Register />} />
            {/* Timeline Page */}
            <Route
              path="/timelines/:timelineId"
              element={<Timeline />}
            />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

export default App;