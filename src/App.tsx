import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './contexts/UserContext';
import theme from './theme';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeTheme } from './utils/theme';
import Navbar from './components/Navbar';
import Home from './components/Home';
import StudentDashboard from './components/StudentDashboard';
import ProfileNew from './components/ProfileNew';
import ResumeGenerator from './components/ResumeGenerator';
import AIMentor from './components/AIMentor';
import UniversitiesAndGrants from './components/Jobs';
import ShadowOnboarding from './pages/shadowing/ShadowOnboarding';
import ShadowSimulate from './pages/shadowing/ShadowSimulate';
import ShadowResult from './pages/shadowing/ShadowResult';

initializeTheme();

const queryClient = new QueryClient();

const RootRoute: React.FC = () => <Home />;

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ChakraProvider theme={theme}>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <Router>
                <div className="min-h-screen bg-white text-gray-900 dark:bg-dark dark:text-white">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/signup" element={<Navigate to="/" replace />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />

                    <Route path="/shadow" element={<ShadowOnboarding />} />
                    <Route path="/simulate" element={<ShadowSimulate />} />
                    <Route path="/result" element={<ShadowResult />} />

                    <Route path="/jobs" element={<UniversitiesAndGrants />} />
                    <Route path="/resume-generator" element={<ResumeGenerator />} />
                    <Route path="/ai-mentor" element={<AIMentor />} />
                    <Route path="/profile" element={<ProfileNew />} />
                    <Route path="/dashboard" element={<StudentDashboard />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </Router>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </ChakraProvider>
  </QueryClientProvider>
);

export default App;