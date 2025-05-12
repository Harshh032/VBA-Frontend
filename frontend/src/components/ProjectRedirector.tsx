import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  path: string;
}

const ProjectRedirector = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkProjects = async () => {
      if (!isAuthenticated) {
        if (isMounted) {
          navigate('/login');
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }

      try {
        const accessToken = localStorage.getItem('token');
        if (!accessToken) {
          if (isMounted) {
            navigate('/login');
          }
          return;
        }

        const baseUrl = `${import.meta.env.VITE_API_URL}`;

        const response = await fetch(`${baseUrl}/v1/services/get_existing_projects`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          if (isMounted) {
            toast.error('Failed to fetch projects');
            navigate('/projects/create');
          }
          return;
        }

        const data = await response.json();
        if (isMounted) {
          if (data && data.length > 0) {
            // Extract unique project names
            const projectNames = [...new Set(data.map((path: string) => path.split('/')[2]))];
            if (projectNames.length > 0) {
              navigate('/projects/view');
            } else {
              navigate('/projects/create');
            }
          } else {
            navigate('/projects/create');
          }
        }
      } catch (error) {
        console.error('Error checking projects:', error);
        if (isMounted) {
          toast.error('An error occurred while checking projects');
          navigate('/projects/create');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkProjects();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return null;
};

export default ProjectRedirector; 