import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import Sidebar from '../../components/Sidebar';

interface ProjectFormData {
  name: string;
  description: string;
}

const CreateProject = () => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Initialize from localStorage or default to true
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    // Get sidebar state from navigation state
    if (location.state?.isSidebarOpen !== undefined) {
      setIsSidebarOpen(location.state.isSidebarOpen);
    }
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkAuthStatus = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('Please login first');
      navigate('/login');
      return false;
    }
    return accessToken;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const accessToken = checkAuthStatus();
    if (!accessToken) return;
    
    console.log("Submitting with project data:", formData);

    try {
      // Use the hardcoded API URL from your original code since VITE_API_URL might not be resolving properly
      const baseUrl = `${import.meta.env.VITE_API_URL}`;
      console.log("Using API URL:", baseUrl);
      
      // Skip token validation check and go straight to the project creation
      // to reduce potential points of failure

      // Proceed with creating the project
      const response = await fetch(`${baseUrl}/v1/services/create_new_project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          // Don't include Accept header if not required by API
        },
        // Remove credentials: 'include' as it might be causing CORS issues
        body: JSON.stringify({
          project_name: formData.name,
          project_description: formData.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Project created successfully!');
        navigate('/projects');
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          alert('Session expired. Please login again.');
          navigate('/login');
          return;
        }
        if (response.status === 403) {
          alert('You do not have permission to create projects.');
          return;
        }
        throw new Error(errorData.detail || `Failed to create project: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      
      // Display detailed error information to help debugging
      if (error instanceof Error) {
        setError(`Error: ${error.message}. Please check browser console for details.`);
      } else {
        setError('Unknown error occurred. Please check browser console.');
      }
      
      // Try alternative approach if the first one failed
      try {
        console.log("Trying alternative approach using XMLHttpRequest");
        const baseUrl = `${import.meta.env.VITE_API_URL}`;
        // Create a promise to wrap XMLHttpRequest
        const xhr = new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${baseUrl}/v1/services/create_new_project`, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
          
          xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`XHR failed with status: ${this.status}, response: ${xhr.responseText}`));
            }
          };
          
          xhr.onerror = function() {
            reject(new Error('XHR Network Error'));
          };
          
          xhr.send(JSON.stringify({
            project_name: formData.name,
            project_description: formData.description
          }));
        });
        
        const data = await xhr;
        alert('Project created successfully with alternative method!');
        navigate('/projects');
        
      } catch (xhrError) {
        console.error('Alternative request also failed:', xhrError);
        setError(prev => `${prev} Alternative method also failed.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex">
      {/* <Sidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} /> */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Project</h1>

          <div className="bg-white rounded-lg shadow p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                <p>{error}</p>
                <p className="text-sm mt-2">API URL: http://34.133.142.70:8000/v1/services/create_new_project</p>
                <button 
                  onClick={() => setError(null)} 
                  className="text-sm text-red-700 underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter project name..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg px-3 py-2 placeholder-gray-400"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter project description..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 placeholder-gray-400 resize-y"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;