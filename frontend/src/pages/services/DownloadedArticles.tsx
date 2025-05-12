import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Download, X, Trash2, RotateCcw, Eye } from 'lucide-react';

interface Article {
  path: string;
  name: string;
  source: 'PubMed' | 'Google Scholar' | 'CSV' | 'Images' | 'included' | 'excluded';
}

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title: string;
  content?: string;
  isMetadata?: boolean;
  onDownload?: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, title, content, isMetadata, onDownload }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  if (isMetadata) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mb-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
              {content}
            </pre>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onDownload}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
            placeholder="Enter your reason..."
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(reason);
              setReason('');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded-md shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

// const baseUrl = `${import.meta.env.VITE_API_URL}`;

const DownloadedArticles: React.FC = () => {
  const navigate = useNavigate();
  const { projectName } = useParams<{ projectName: string }>();
  const location = useLocation();
  const { token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<'PubMed' | 'Google Scholar' | 'CSV' | 'Images' | 'included' | 'excluded' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'include' | 'exclude'>('include');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [metadataContent, setMetadataContent] = useState<string>('');
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState(false);
  const [selectedArticleForMetadata, setSelectedArticleForMetadata] = useState<Article | null>(null);

  // Function to get source from URL
  const getSourceFromUrl = (path: string) => {
    const sourceMatch = path.match(/\/downloaded-articles\/([^/]+)$/);
    if (!sourceMatch) return null;
    
    const source = sourceMatch[1].toLowerCase();
    switch (source) {
      case 'google-scholar':
        return 'Google Scholar';
      case 'pubmed':
        return 'PubMed';
      case 'included-articles':
        return 'included';
      case 'excluded-articles':
        return 'excluded';
      case 'csv-files':
        return 'CSV';
      case 'images':
        return 'Images';
      default:
        return null;
    }
  };

  // Function to get URL from source
  const getUrlFromSource = (source: 'PubMed' | 'Google Scholar' | 'CSV' | 'Images' | 'included' | 'excluded') => {
    switch (source) {
      case 'Google Scholar':
        return 'google-scholar';
      case 'PubMed':
        return 'pubmed';
      case 'included':
        return 'included-articles';
      case 'excluded':
        return 'excluded-articles';
      case 'CSV':
        return 'csv-files';
      case 'Images':
        return 'images';
      default:
        return '';
    }
  };

  // Handle initial load and URL changes
  useEffect(() => {
    const source = getSourceFromUrl(location.pathname);
    if (source) {
      setSelectedSource(source);
    }
    setIsInitialLoad(false);
  }, []);

  // Update URL when source changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad && selectedSource) {
      const urlPath = getUrlFromSource(selectedSource);
      navigate(`/projects/view/${projectName}/dashboard/downloaded-articles/${urlPath}`, { replace: true });
    }
  }, [selectedSource, projectName, navigate, isInitialLoad]);

  // Handle URL changes after initial load
  useEffect(() => {
    if (!isInitialLoad) {
      const source = getSourceFromUrl(location.pathname);
      if (source) {
        setSelectedSource(source);
      } else {
        setSelectedSource(null);
      }
    }
  }, [location.pathname, isInitialLoad]);

  // Fetch articles when component mounts or source changes
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const baseUrl = `${import.meta.env.VITE_API_URL}`;

        const response = await axios.post(
          `${baseUrl}/v1/services/get_all_file_and_folders`,
          {
            project_name: projectName
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log("API Response:", response.data);

        // Filter and transform the response data
        const articleList = response.data
          .filter((path: string) => {
            const extension = path.split('.').pop()?.toLowerCase();
            // Include PDF files, images, and CSV files
            return extension === 'pdf' || ['jpg', 'jpeg', 'png', 'gif', 'csv'].includes(extension || '');
          })
          .map((path: string) => {
            let source: 'PubMed' | 'Google Scholar' | 'CSV' | 'Images' | 'included' | 'excluded';
            const lowerPath = path.toLowerCase();
            
            if (lowerPath.includes('/includes/')) {
              source = 'included';
            } else if (lowerPath.includes('/excludes/')) {
              source = 'excluded';
            } else if (lowerPath.includes('/pubmed/')) {
              source = 'PubMed';
            } else if (lowerPath.includes('/google_scholar/')) {
              source = 'Google Scholar';
            } else if (path.split('.').pop()?.toLowerCase() === 'csv') {
              source = 'CSV';
            } else if (['jpg', 'jpeg', 'png', 'gif'].includes(path.split('.').pop()?.toLowerCase() || '')) {
              source = 'Images';
            } else {
              source = 'PubMed';
            }
            
            return {
              path,
              name: path.split('/').pop()?.replace(/_/g, ' ') || '',
              source
            };
          });

        setArticles(articleList);
      } catch (error) {
        console.error('Error fetching articles:', error);
        toast.error('Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    };

    if (projectName && token) {
      fetchArticles();
    }
  }, [projectName, token]);

  const pubmedArticles = articles.filter(article => article.source === 'PubMed' && article.name.toLowerCase().endsWith('.pdf'));
  const googleScholarArticles = articles.filter(article => article.source === 'Google Scholar' && article.name.toLowerCase().endsWith('.pdf'));
  const csvFiles = articles.filter(article => article.source === 'CSV');
  const imageFiles = articles.filter(article => article.source === 'Images');
  const includedArticles = articles.filter(article => article.source === 'included' && article.name.toLowerCase().endsWith('.pdf'));
  const excludedArticles = articles.filter(article => article.source === 'excluded' && article.name.toLowerCase().endsWith('.pdf'));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (!selectedSource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 sm:text-5xl">
              Downloaded Files
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Welcome to your downloaded files management center
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PubMed Section */}
            <div 
              onClick={() => setSelectedSource('PubMed')}
              className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-shadow"
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-indigo-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">PubMed Articles</h2>
                <p className="text-gray-600 mb-4">
                  {pubmedArticles.length} articles available
                </p>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  View Articles
                </button>
              </div>
            </div>

            {/* Google Scholar Section */}
            <div 
              onClick={() => setSelectedSource('Google Scholar')}
              className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-shadow"
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-indigo-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Google Scholar Articles</h2>
                <p className="text-gray-600 mb-4">
                  {googleScholarArticles.length} articles available
                </p>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  View Articles
                </button>
              </div>
            </div>

            {/* CSV Section */}
            <div 
              onClick={() => setSelectedSource('CSV')}
              className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-shadow"
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-indigo-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">CSV Files</h2>
                <p className="text-gray-600 mb-4">
                  {csvFiles.length} files available
                </p>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  View Files
                </button>
              </div>
            </div>

            {/* Images Section */}
            <div 
              onClick={() => setSelectedSource('Images')}
              className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-shadow"
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-indigo-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Images</h2>
                <p className="text-gray-600 mb-4">
                  {imageFiles.length} images available
                </p>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  View Images
                </button>
              </div>
            </div>

            {/* Included Articles Section */}
            <div 
              onClick={() => setSelectedSource('included')}
              className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-shadow"
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-green-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Included Articles</h2>
                <p className="text-gray-600 mb-4">
                  {includedArticles.length} articles included
                </p>
                <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                  View Included
                </button>
              </div>
            </div>

            {/* Excluded Articles Section */}
            <div 
              onClick={() => setSelectedSource('excluded')}
              className="bg-white rounded-3xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-shadow"
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-yellow-500 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Excluded Articles</h2>
                <p className="text-gray-600 mb-4">
                  {excludedArticles.length} articles excluded
                </p>
                <button className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600">
                  View Excluded
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentArticles = articles.filter(article => {
    if (article.source === selectedSource) {
      // Don't show text files in included or excluded views
      if ((selectedSource === 'included' || selectedSource === 'excluded') && 
          article.name.toLowerCase().endsWith('.txt')) {
        return false;
      }
      // For CSV files, show only the filename
      if (selectedSource === 'CSV') {
        article.name = article.path.split('/').pop() || article.path;
      }
      return true;
    }
    return false;
  });

  const handleInclude = async (reason: string) => {
    if (!selectedArticle) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login first');
        return;
      }

      const baseUrl = `${import.meta.env.VITE_API_URL}`;
      const topic = selectedArticle.path.split('/').slice(-2)[0]; // Get topic from path

      const response = await fetch(`${baseUrl}/v1/services/include_file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_path: selectedArticle.path,
          reason: reason,
          topic: topic,
          project_name: projectName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to include article');
      }

      const data = await response.json();
      toast.success(data.message || 'Article included successfully');
      setIsModalOpen(false);

      // Refresh the articles list
      const updatedArticles = articles.map(article => {
        if (article.path === selectedArticle.path) {
          return { ...article, source: 'included' as const };
        }
        return article;
      });
      setArticles(updatedArticles);

      // If we're in the included view, update the current articles
      if (selectedSource === 'included') {
        setSelectedSource('included');
      }
    } catch (error) {
      console.error('Include error:', error);
      toast.error('Failed to include article. Please try again.');
    }
  };

  const handleExclude = async (reason: string) => {
    if (!selectedArticle) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login first');
        return;
      }

      const baseUrl = `${import.meta.env.VITE_API_URL}`;
      const topic = selectedArticle.path.split('/').slice(-2)[0]; // Get topic from path

      const response = await fetch(`${baseUrl}/v1/services/exclude_file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_path: selectedArticle.path,
          reason: reason,
          topic: topic,
          project_name: projectName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exclude article');
      }

      const data = await response.json();
      toast.success(data.message || 'Article excluded successfully');
      setIsModalOpen(false);

      // Refresh the articles list
      const updatedArticles = articles.map(article => {
        if (article.path === selectedArticle.path) {
          return { ...article, source: 'excluded' as const };
        }
        return article;
      });
      setArticles(updatedArticles);

      // If we're in the excluded view, update the current articles
      if (selectedSource === 'excluded') {
        setSelectedSource('excluded');
      }
    } catch (error) {
      console.error('Exclude error:', error);
      toast.error('Failed to exclude article. Please try again.');
    }
  };

  // Update the view button click handler
  const handleViewMetadata = async (article: Article) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login first');
        return;
      }

      const baseUrl = `${import.meta.env.VITE_API_URL}`;
      
      // Convert path based on source type
      let txtPath;
      if (selectedSource === 'included' || selectedSource === 'excluded') {
        // For included/excluded files, extract the number from the PDF filename
        const pdfNumber = article.path.match(/_(\d+)\.pdf$/)?.[1] || '1';
        // Replace the PDF filename with REASON_N.txt where N is the extracted number
        txtPath = article.path.replace(/\d+\.pdf$/, `REASON_${pdfNumber}.txt`);
      } else {
        // For Google Scholar and PubMed files, use .txt
        txtPath = article.path.replace('.pdf', '.txt');
      }

      // Get the metadata content
      const metadataResponse = await fetch(`${baseUrl}/v1/services/view_content`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_path: txtPath
        })
      });

      if (!metadataResponse.ok) {
        throw new Error('Failed to view file');
      }

      const metadataData = await metadataResponse.json();
      
      // Only use the content part and format it for better readability
      const content = metadataData.content || '';
      let formattedContent = content
        .replace(/([A-Za-z]+):/g, '\n$1:')
        .replace(/Authors:/g, '\nAuthors:')
        .replace(/Abstract:/g, '\nAbstract:')
        .replace(/Edited By:/g, '\nEdited By:')
        .replace(/Published Date:/g, '\nPublished Date:')
        .replace(/Citation:/g, '\nCitation:')
        .replace(/Contact:/g, '\nContact:')
        .trim();
      
      setMetadataContent(formattedContent);
      setSelectedArticleForMetadata(article);
      setIsMetadataModalOpen(true);
    } catch (error) {
      console.error('View error:', error);
      toast.error('Failed to view file. Please try again.');
    }
  };

  const handleDownloadMetadata = async () => {
    if (!selectedArticleForMetadata) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login first');
        return;
      }

      const baseUrl = `${import.meta.env.VITE_API_URL}`;
      const txtPath = selectedArticleForMetadata.path.replace('.pdf', '.txt');

      const response = await fetch(`${baseUrl}/v1/services/download_articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: txtPath
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const data = await response.json();
      
      // Open in new tab
      window.open(data, '_blank');

      toast.success('Opening file in new tab...');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => {
              setSelectedSource(null);
              navigate(`/projects/view/${projectName}/dashboard/downloaded-articles`, { replace: true });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Sources
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 sm:text-5xl">
              {selectedSource} Files
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              View and manage your downloaded {selectedSource?.toLowerCase()} files
            </p>
          </div>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          {currentArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No files found in this project.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {currentArticles.map((article, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <svg
                        className="h-8 w-8 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-gray-900">{article.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {article.name.toLowerCase().endsWith('.txt') ? (
                        <Tooltip text="Download Text File">
                          <button
                            onClick={async () => {
                              try {
                                const accessToken = localStorage.getItem('accessToken');
                                if (!accessToken) {
                                  toast.error('Please login first');
                                  return;
                                }

                                const baseUrl = `${import.meta.env.VITE_API_URL}`;

                                const response = await fetch(`${baseUrl}/v1/services/download_articles`, {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({
                                    path: article.path
                                  })
                                });

                                if (!response.ok) {
                                  throw new Error('Failed to download file');
                                }

                                const data = await response.json();
                                
                                // Create a temporary link element
                                const link = document.createElement('a');
                                link.href = data;
                                link.setAttribute('download', article.name);
                                link.setAttribute('target', '_blank');
                                
                                // Trigger the download
                                document.body.appendChild(link);
                                link.click();
                                
                                // Clean up
                                document.body.removeChild(link);

                                toast.success('Download started successfully');
                              } catch (error) {
                                console.error('Download error:', error);
                                toast.error('Failed to download file. Please try again.');
                              }
                            }}
                            className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </Tooltip>
                      ) : (
                        <>
                          {(selectedSource === 'CSV' || selectedSource === 'Images') ? (
                            <>
                              <Tooltip text="Download File">
                                <button
                                  onClick={async () => {
                                    try {
                                      const accessToken = localStorage.getItem('accessToken');
                                      if (!accessToken) {
                                        toast.error('Please login first');
                                        return;
                                      }

                                      const baseUrl = `${import.meta.env.VITE_API_URL}`;

                                      const response = await fetch(`${baseUrl}/v1/services/download_articles`, {
                                        method: 'POST',
                                        headers: {
                                          'Authorization': `Bearer ${accessToken}`,
                                          'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                          path: article.path
                                        })
                                      });

                                      if (!response.ok) {
                                        throw new Error('Failed to download file');
                                      }

                                      const data = await response.json();
                                      
                                      // Open in new tab
                                      window.open(data, '_blank');

                                      toast.success('Opening file in new tab...');
                                    } catch (error) {
                                      console.error('Download error:', error);
                                      toast.error('Failed to download file. Please try again.');
                                    }
                                  }}
                                  className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              {selectedSource !== 'included' && selectedSource !== 'excluded' && (
                                <>
                                  <Tooltip text="View Metadata">
                                    <button
                                      onClick={() => handleViewMetadata(article)}
                                      className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      <Eye className="w-5 h-5" />
                                    </button>
                                  </Tooltip>

                                  <Tooltip text="Include Article">
                                    <button
                                      onClick={() => {
                                        setSelectedArticle(article);
                                        setModalType('include');
                                        setIsModalOpen(true);
                                      }}
                                      className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                      <CheckCircle className="w-5 h-5" />
                                    </button>
                                  </Tooltip>

                                  <Tooltip text="Exclude Article">
                                    <button
                                      onClick={() => {
                                        setSelectedArticle(article);
                                        setModalType('exclude');
                                        setIsModalOpen(true);
                                      }}
                                      className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                    >
                                      <XCircle className="w-5 h-5" />
                                    </button>
                                  </Tooltip>

                                  <Tooltip text="Download Article">
                                    <button
                                      onClick={async () => {
                                        try {
                                          const accessToken = localStorage.getItem('accessToken');
                                          if (!accessToken) {
                                            toast.error('Please login first');
                                            return;
                                          }

                                          const baseUrl = `${import.meta.env.VITE_API_URL}`;

                                          const response = await fetch(`${baseUrl}/v1/services/download_articles`, {
                                            method: 'POST',
                                            headers: {
                                              'Authorization': `Bearer ${accessToken}`,
                                              'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                              path: article.path
                                            })
                                          });

                                          if (!response.ok) {
                                            throw new Error('Failed to download file');
                                          }

                                          const data = await response.json();
                                          
                                          // Open in new tab
                                          window.open(data, '_blank');

                                          toast.success('Opening file in new tab...');
                                        } catch (error) {
                                          console.error('Download error:', error);
                                          toast.error('Failed to download file. Please try again.');
                                        }
                                      }}
                                      className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      <Download className="w-5 h-5" />
                                    </button>
                                  </Tooltip>
                                </>
                              )}

                              {(selectedSource === 'included' || selectedSource === 'excluded') && (
                                <>
                                  <Tooltip text="View Reason">
                                    <button
                                      onClick={() => handleViewMetadata(article)}
                                      className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      <Eye className="w-5 h-5" />
                                    </button>
                                  </Tooltip>

                                  <Tooltip text="Undo Action">
                                    <button
                                      onClick={async () => {
                                        try {
                                          const accessToken = localStorage.getItem('accessToken');
                                          if (!accessToken) {
                                            toast.error('Please login first');
                                            return;
                                          }

                                          const baseUrl = `${import.meta.env.VITE_API_URL}`;

                                          const response = await fetch(`${baseUrl}/v1/services/undo_file`, {
                                            method: 'POST',
                                            headers: {
                                              'Authorization': `Bearer ${accessToken}`,
                                              'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                              file_path: article.path
                                            })
                                          });

                                          if (!response.ok) {
                                            throw new Error('Failed to undo action');
                                          }

                                          const data = await response.json();
                                          toast.success(data.message || 'Action undone successfully');
                                          
                                          // Refresh the articles list
                                          const updatedArticles = articles.filter(a => a.path !== article.path);
                                          setArticles(updatedArticles);
                                        } catch (error) {
                                          console.error('Undo error:', error);
                                          toast.error('Failed to undo action. Please try again.');
                                        }
                                      }}
                                      className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      <RotateCcw className="w-5 h-5" />
                                    </button>
                                  </Tooltip>

                                  <Tooltip text="Delete Article">
                                    <button
                                      onClick={async () => {
                                        try {
                                          const accessToken = localStorage.getItem('accessToken');
                                          if (!accessToken) {
                                            toast.error('Please login first');
                                            return;
                                          }

                                          const baseUrl = `${import.meta.env.VITE_API_URL}`;

                                          const response = await fetch(`${baseUrl}/v1/services/delete_file`, {
                                            method: 'POST',
                                            headers: {
                                              'Authorization': `Bearer ${accessToken}`,
                                              'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                              file_path: article.path
                                            })
                                          });

                                          if (!response.ok) {
                                            throw new Error('Failed to delete file');
                                          }

                                          const data = await response.json();
                                          toast.success(data.message);
                                          
                                          // Refresh the articles list
                                          const updatedArticles = articles.filter(a => a.path !== article.path);
                                          setArticles(updatedArticles);
                                        } catch (error) {
                                          console.error('Delete error:', error);
                                          toast.error('Failed to delete file. Please try again.');
                                        }
                                      }}
                                      className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </Tooltip>

                                  <Tooltip text="Download Article">
                                    <button
                                      onClick={async () => {
                                        try {
                                          const accessToken = localStorage.getItem('accessToken');
                                          if (!accessToken) {
                                            toast.error('Please login first');
                                            return;
                                          }

                                          const baseUrl = `${import.meta.env.VITE_API_URL}`;

                                          const response = await fetch(`${baseUrl}/v1/services/download_articles`, {
                                            method: 'POST',
                                            headers: {
                                              'Authorization': `Bearer ${accessToken}`,
                                              'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                              path: article.path
                                            })
                                          });

                                          if (!response.ok) {
                                            throw new Error('Failed to download file');
                                          }

                                          const data = await response.json();
                                          
                                          // Open in new tab
                                          window.open(data, '_blank');

                                          toast.success('Opening file in new tab...');
                                        } catch (error) {
                                          console.error('Download error:', error);
                                          toast.error('Failed to download file. Please try again.');
                                        }
                                      }}
                                      className="inline-flex items-center justify-center p-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      <Download className="w-5 h-5" />
                                    </button>
                                  </Tooltip>
                                </>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={modalType === 'include' ? handleInclude : handleExclude}
        title={modalType === 'include' ? 'Include Article' : 'Exclude Article'}
      />

      {/* Add Metadata Modal */}
      <Modal
        isOpen={isMetadataModalOpen}
        onClose={() => {
          setIsMetadataModalOpen(false);
          setSelectedArticleForMetadata(null);
        }}
        onSubmit={() => {}}
        title="Article Metadata"
        content={metadataContent}
        isMetadata={true}
        onDownload={handleDownloadMetadata}
      />
    </div>
  );
};

export default DownloadedArticles;