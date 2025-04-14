import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, ThemeProvider, createTheme, Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
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
import FriendProfile from './components/FriendProfile';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create a default theme
const theme = createTheme({
  palette: {
    primary: { main: '#ff5722' },
    secondary: { main: '#4caf50' },
  },
  typography: {
    h3: { fontFamily: 'Roboto, sans-serif' },
  },
});

const App = () => {
  const [refresh, setRefresh] = useState(false);

  const handleMemoryCreated = () => {
    setRefresh(!refresh);
  };

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <ToastContainer />
            <Header />
            <Container
              component="main"
              sx={{
                flexGrow: 1, // Allows content to take up available space
                mt: { xs: 2, sm: 3 }, // Space for Header (adjust based on Header height)
                mb: { xs: 2, sm: 3 }, // Space for Footer (adjust based on Footer height)
                py: 2, // Internal padding for content
              }}
            >
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
                <Route path="/memories" element={<MemoryList refresh={refresh} />} />
                <Route path="/add-memory" element={<MemoryForm refresh={refresh} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/timelines" element={<Timeline />} />
                <Route path="/timelines/:timelineId" element={<TimeLineMemories />} />
                <Route path="/create-timeline" element={<CreateTimeline />} />
                <Route path="/add-memory/:timelineId?" element={<AddMemory />} />
                <Route path="/timeline/public/:id" element={<PublicTimelineViewer />} />
                <Route path="/friends" element={<FriendsManager />} />
                <Route path="/shared-timelines" element={<SharedTimelines />} />
                <Route path="/best-memories" element={<BestMemories />} />
                <Route path="/profile/:friendId" element={<FriendProfile />} />
              </Routes>
            </Container>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;