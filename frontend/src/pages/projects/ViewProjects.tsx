import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
// import Sidebar from '../../components/Sidebar';

interface Project {
  id: string;
  name: string;
  path: string;
}

const ViewProjects = () => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const fetchProjects = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
        return;
      }
      
      const baseUrl = `${import.meta.env.VITE_API_URL}`;
      console.log(import.meta.env.VITE_API_URL);
      const response = await fetch(`${baseUrl}/v1/services/get_existing_projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      const data = await response.json();
      // Create a Map to store unique projects by name
      const uniqueProjects = new Map();
      
      // Additional validation to handle potential path format issues
      data.forEach((path: string) => {
        if (!path) return;
        
        const parts = path.split('/');
        if (parts.length < 3) return;
        
        const projectName = parts[2]; // This will get "test" or "kidney" from the path
        
        // Skip empty project names
        if (!projectName) return;
        
        // Only add if we haven't seen this project name before
        if (!uniqueProjects.has(projectName)) {
          uniqueProjects.set(projectName, {
            id: path,
            name: projectName,
            path: path,
          });
        }
      });
      
      // Convert Map values to array
      const transformedProjects = Array.from(uniqueProjects.values());
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadProjects = async () => {
      if (isMounted) {
        await fetchProjects();
      }
    };
    
    loadProjects();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]); // Only re-fetch when authentication status changes

  const handleCreateProject = () => {
    navigate('/projects/create', {
      state: { isSidebarOpen },
    });
  };

  const handleViewProject = (project: Project) => {
    navigate(`/projects/view/${encodeURIComponent(project.name)}/dashboard`);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* <Sidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} /> */}
      <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarOpen ? 'ml-45' : 'ml-16'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Your Projects</h1>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Project
              </button>
            </div>
            <p className="mt-2 text-lg text-gray-600">
              Manage all your research projects in one place.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-32 space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-sm text-gray-500">Loading projects...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">No projects yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Start by creating a new project.</p>
                  <div className="mt-6">
                    <button
                      onClick={handleCreateProject}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Project
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      </div>
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={() => handleViewProject(project)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-300"
                        >
                          View Project →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewProjects;