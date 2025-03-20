import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, ThemeProvider, createTheme } from '@mui/material'; // Import ThemeProvider and createTheme
import Header from './components/Header';
import MemoryForm from './components/MemoryForm';
import MemoryList from './components/MemoryList';
import Login from './components/Login';
import Register from './components/Register';
import Timeline from './components/Timeline';
import TimeLineMemories from './components/TimeLineMemories';
import CreateTimeline from './components/CreateTimeline';
import AddMemory from './components/AddMemory';
import AuthContext, { AuthProvider } from './context/AuthContext';

// Create a default theme (you can customize it if needed)
const theme = createTheme({
  palette: {
    primary: { main: '#ff5722' }, // Custom primary color
    secondary: { main: '#4caf50' },
  },
  typography: {
    h3: { fontFamily: 'Roboto, sans-serif' },
  },
});

const App = () => {
  const [refresh, setRefresh] = useState(false);

  const handleMemoryCreated = () => {
    setRefresh(!refresh); // Toggle refresh state to trigger MemoryList update
  };

  return (
    <ThemeProvider theme={theme}> {/* Wrap the app with ThemeProvider */}
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
              <Route path="/memories" element={<MemoryList refresh={refresh} />} />
              <Route path="/add-memory/:timelineId" element={<MemoryForm refresh={refresh} />} />
              {/* Login Page */}
              <Route path="/login" element={<Login />} />
              {/* Register Page */}
              <Route path="/register" element={<Register />} />
              {/* Timeline Page */}
              <Route path="/timelines" element={<Timeline />} />
              <Route path="/timelines/:timelineId" element={<TimeLineMemories />} />
              <Route path="/create-timeline" element={<CreateTimeline />} />
              <Route path="/add-memory/:timelineId?" element={<AddMemory />} />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;