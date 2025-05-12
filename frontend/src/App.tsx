import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Bookmarks from './pages/Bookmarks';
import Calendar from './pages/Calendar';
import Documents from './pages/Documents';
import Messages from './pages/Messages';
import Help from './pages/Help';
import PrivateRoute from './components/PrivateRoute';
import ToolPage from './pages/ToolPage';
import TermExtractor from './pages/services/TermExtractor';
import ArticleRetriever from './pages/services/ArticleRetriever';
import RecentSearches from './pages/services/RecentSearches';
import WordAnalysis from './pages/services/WordAnalysis';
import PdfImageExtractor from './pages/services/PdfImageExtractor';
import CombinedExtractor from './pages/services/CombinedExtractor';
import TableExtractor from './pages/services/TableExtractor';
// import CsvManager from './pages/services/CsvManager';
import DownloadedArticles from './pages/services/DownloadedArticles';
import { Toaster } from 'react-hot-toast';
import CreateProject from './pages/projects/CreateProject';
import ViewProjects from './pages/projects/ViewProjects';
import Dashboard from './pages/Dashboard';
import ProjectRedirector from './components/ProjectRedirector';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ProjectRedirector />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
            <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
            <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/help" element={<PrivateRoute><Help /></PrivateRoute>} />
            <Route path="/term-extractor" element={<TermExtractor />} />
            <Route path="/article-retriever" element={<ArticleRetriever />} />
            <Route path="/word-analysis" element={<WordAnalysis />} />
            <Route path="/pdf-image-extractor" element={<PdfImageExtractor />} />
            <Route path="/combined-extractor" element={<CombinedExtractor />} />
            <Route path="/table-extractor" element={<TableExtractor />} />
            {/* <Route path="/csv-manager" element={<CsvManager />} /> */}
            <Route path="/downloaded-articles" element={<DownloadedArticles />} />
            <Route path="/tools/:toolName" element={<ToolPage />} />
            <Route path="/text-summarizer" element={<ToolPage />} />
            <Route path="/citation-generator" element={<ToolPage />} />
            <Route path="/plagiarism-checker" element={<ToolPage />} />
            <Route path="/reference-manager" element={<ToolPage />} />
            <Route path="/download-articles" element={<ToolPage />} />
            <Route path="/pdf-filter" element={<ToolPage />} />
            <Route path="/projects/create" element={<CreateProject />} />
            <Route path="/projects/view" element={<ViewProjects />} />
            
            {/* Project dashboard and tool routes */}
            <Route path="/projects/view/:projectName/dashboard" element={<Dashboard />} />
            <Route path="/projects/view/:projectName/dashboard/term-extractor" element={<TermExtractor />} />
            <Route path="/projects/view/:projectName/dashboard/article-retriever" element={<ArticleRetriever />} />
            <Route path="/projects/view/:projectName/dashboard/article-retriever/recent_projects" element={<RecentSearches />} />
            <Route path="/projects/view/:projectName/dashboard/word-analysis" element={<WordAnalysis />} />
            <Route path="/projects/view/:projectName/dashboard/pdf-image-extractor" element={<PdfImageExtractor />} />
            <Route path="/projects/view/:projectName/dashboard/combined-extractor" element={<CombinedExtractor />} />
            <Route path="/projects/view/:projectName/dashboard/table-extractor" element={<TableExtractor />} />
            {/* Downloaded Articles Routes */}
            <Route path="/projects/view/:projectName/dashboard/downloaded-articles" element={<DownloadedArticles />} />
            <Route path="/projects/view/:projectName/dashboard/downloaded-articles/:source" element={<DownloadedArticles />} />
            <Route path="/projects/view/:projectName/dashboard/pdf-filter" element={<ToolPage />} />
            <Route path="/projects/view/:projectName/dashboard/text-summarizer" element={<ToolPage />} />
            <Route path="/projects/view/:projectName/dashboard/citation-generator" element={<ToolPage />} />
            <Route path="/projects/view/:projectName/dashboard/plagiarism-checker" element={<ToolPage />} />
            <Route path="/projects/view/:projectName/dashboard/reference-manager" element={<ToolPage />} />
            <Route path="/projects/view/:projectName/dashboard/download-articles" element={<ToolPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;