import { Routes, Route } from 'react-router-dom';
import LoadingPage from './components/LoadingPage';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SetPassword from './pages/SetPassword';
import LearningHub from './pages/LearningHub';

// Admin Imports
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import StudentsPage from './pages/admin/StudentsPage';
import MarksPage from './pages/admin/MarksPage';
import PapersPage from './pages/admin/PapersPage';
import QuizzesPage from './pages/admin/QuizzesPage';
import ResultsPage from './pages/admin/ResultsPage';
import SettingsPage from './pages/admin/SettingsPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import RecordingsPage from './pages/admin/RecordingsPage';
import SliderPage from './pages/admin/SliderPage';
import LearningHubAdmin from './pages/admin/LearningHubAdmin';
import HomePageAdmin from './pages/admin/HomePageAdmin';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learning-hub" element={<LearningHub />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="marks" element={<MarksPage />} />
          <Route path="learning-hub" element={<LearningHubAdmin />} />
          <Route path="papers" element={<PapersPage />} />
          <Route path="quizzes" element={<QuizzesPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="recordings" element={<RecordingsPage />} />
          <Route path="sliders" element={<SliderPage />} />
          <Route path="homepage" element={<HomePageAdmin />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </AuthProvider>
  );
}
