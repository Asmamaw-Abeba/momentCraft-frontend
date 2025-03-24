import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, ThemeProvider, createTheme } from '@mui/material'; // Import ThemeProvider and createTheme
import Header from './components/Header';
import Home from './components/Home';
import MemoryForm from './components/MemoryForm';
import MemoryList from './components/MemoryList';
import Login from './components/Login';
import Register from './components/Register';
import Timeline from './components/Timeline';
import TimeLineMemories from './components/TimeLineMemories';
import CreateTimeline from './components/CreateTimeline';
import PublicTimelineViewer from './components/PublicTimelineViewer';
import AddMemory from './components/AddMemory';
import FriendsManager from './components/FriendsManager';
import SharedTimelines from './components/SharedTimelines';
import BestMemories from './components/BestMemories';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
          <ToastContainer />
          {/* <Header /> */}
          <Container>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route
                path="/"
                element={
                  <>
                    <MemoryForm onMemoryCreated={handleMemoryCreated} />
                    <MemoryList refresh={refresh} />
                  </>
                }
              /> */}
              {/* Memories Page */}
              <Route path="/memories" element={<MemoryList refresh={refresh} />} />
              <Route path="/add-memory" element={<MemoryForm refresh={refresh} />} />
              {/* Login Page */}
              <Route path="/login" element={<Login />} />
              {/* Register Page */}
              <Route path="/register" element={<Register />} />
              {/* Timeline Page */}
              <Route path="/timelines" element={<Timeline />} />
              <Route path="/timelines/:timelineId" element={<TimeLineMemories />} />
              <Route path="/create-timeline" element={<CreateTimeline />} />
              <Route path="/add-memory/:timelineId?" element={<AddMemory />} />
              <Route path="/timeline/public/:id" element={<PublicTimelineViewer />} />
              <Route path="/friends" element={<FriendsManager />} />
              <Route path="/shared-timelines" element={<SharedTimelines />} />
              <Route path="/best-memories" element={<BestMemories />} />
            </Routes>
          </Container>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;