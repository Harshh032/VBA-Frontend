import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import Sidebar from '../components/Sidebar';
import {
  FileText,
  Search,
  Download,
  Image,
  Table,
  FileSpreadsheet,
  BarChart2,
  Layers,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  path: string;
}

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const { projectName } = useParams<{ projectName: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });

  // Define tools with dynamic paths that include project name
  const tools = [
    {
      title: 'Term Extractor',
      description: 'Extract key terms from your documents',
      icon: FileText,
      path: `/projects/view/${projectName}/dashboard/term-extractor`,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      title: 'Article Retriever',
      description: 'Search and download research articles',
      icon: Search,
      path: `/projects/view/${projectName}/dashboard/article-retriever`,
      color: 'bg-green-50 text-green-700 hover:bg-green-100',
    },
    {
      title: 'Word Analysis',
      description: 'Analyze word frequency and patterns',
      icon: BarChart2,
      path: `/projects/view/${projectName}/dashboard/word-analysis`,
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    },
    {
      title: 'Downloaded Articles',
      description: 'Manage your downloaded research papers',
      icon: Download,
      path: `/projects/view/${projectName}/dashboard/downloaded-articles`,
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    },
    {
      title: 'PDF Image Extractor',
      description: 'Extract images from PDF documents',
      icon: Image,
      path: `/projects/view/${projectName}/dashboard/pdf-image-extractor`,
      color: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
    },
    {
      title: 'Table Extractor',
      description: 'Extract tables from documents',
      icon: Table,
      path: `/projects/view/${projectName}/dashboard/table-extractor`,
      color: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
    },
    {
      title: 'Combined Extractor',
      description: 'Extract text, images, and tables from documents',
      icon: Layers,
      path: `/projects/view/${projectName}/dashboard/combined-extractor`,
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    },
  ];

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex">
      {/* <Sidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} /> */}
      <main className="flex-1 ml-55 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Project Dashboard: {projectName}</h1>
            <p className="mt-3 text-lg text-gray-600">
              Access all your research tools and manage your project
            </p>
          </div>
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Research Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {tools.map((tool) => (
                <Link
                  key={tool.title}
                  to={tool.path}
                  className={`flex items-center p-6 rounded-lg shadow-md ${tool.color} transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg`}
                >
                  <tool.icon className="h-8 w-8 mr-6" />
                  <div>
                    <h3 className="text-xl font-medium">{tool.title}</h3>
                    <p className="text-base mt-2">{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;