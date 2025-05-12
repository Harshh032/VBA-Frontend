import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface FileItem {
  path: string;
  category: string;
  filename: string;
}

interface ExtractCommonWordsResponse {
  common_words: string[];
}

const WordAnalysis: React.FC = () => {
  const [searchSource, setSearchSource] = useState('Google Scholar');
  const [output, setOutput] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPDF, setSelectedPDF] = useState<string>('');
  const [pdfCategories, setPdfCategories] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const navigate = useNavigate();
  const { projectName } = useParams<{ projectName: string }>();

  // Base API URL - use this consistently throughout the component
  // const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const API_BASE_URL = `/v1/services`;

  useEffect(() => {
    if (output.length > 0 && output[0].category !== 'error' && output[0].category !== 'analysis_result') {
      const uniqueCategories = [...new Set(output
        .filter(file => 
          file.category !== 'error' && 
          file.category !== 'analysis_result' &&
          file.filename.toLowerCase().endsWith('.pdf')
        )
        .map(file => file.category)
      )];
      setPdfCategories(uniqueCategories);
      if (uniqueCategories.length > 0 && !selectedCategory) {
        setSelectedCategory(uniqueCategories[0]);
      }
    }
  }, [output, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOutput([]);
    setSelectedPDF('');
    setSelectedCategory('');
    setAnalysisResults([]);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setOutput([{ path: 'Please login to access this feature', category: 'error', filename: '' }]);
        navigate('/login');
        return;
      }

      if (!projectName) {
        setOutput([{ path: 'Project name is required', category: 'error', filename: '' }]);
        return;
      }

      const baseUrl = `${import.meta.env.VITE_API_URL}`;

      const response = await fetch(`${baseUrl}/v1/services/get_all_file_and_folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          project_name: projectName
        })
      });

      if (response.status === 401) {
        setOutput([{ path: 'Your session has expired. Please login again.', category: 'error', filename: '' }]);
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      
      const processedFiles = data.map((path: string) => {
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        const category = parts[parts.length - 2];
        return {
          path,
          category,
          filename
        };
      });

      setOutput(processedFiles);
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setOutput([{ path: 'Network error: Please check your internet connection and try again.', category: 'error', filename: '' }]);
      } else {
        setOutput([{ path: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`, category: 'error', filename: '' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedPDF) {
      toast.error('Please select a PDF file to analyze.');
      return;
    }

    setIsLoading(true);
    setAnalysisResults([]);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setOutput([{ path: 'Please login to access this feature', category: 'error', filename: '' }]);
        navigate('/login');
        return;
      }

      if (!projectName) {
        setOutput([{ path: 'Project name is required', category: 'error', filename: '' }]);
        return;
      }

      const baseUrl = `${import.meta.env.VITE_API_URL}`;

      const response = await fetch(`${baseUrl}/v1/services/extract_common_words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          s3_pdf_path: selectedPDF,
          project_name: projectName
        })
      });

      if (response.status === 401) {
        setOutput([{ path: 'Your session has expired. Please login again.', category: 'error', filename: '' }]);
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }

      setAnalysisResults(data);
      setOutput([{
        path: JSON.stringify(data),
        category: 'analysis_result',
        filename: selectedPDF.split('/').pop() || 'Analysis Result'
      }]);
    } catch (error) {
      console.error('Analysis Error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setOutput([{ path: 'Network error: Please check your internet connection and try again.', category: 'error', filename: '' }]);
      } else {
        setOutput([{ path: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`, category: 'error', filename: '' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setOutput([]);
    setSelectedPDF('');
    setSelectedCategory('');
    setAnalysisResults([]);
  };

  const handleItemSelect = (item: string) => {
    setSelectedItem(item);
  };

  const handleClearSelection = () => {
    setSelectedItem('');
  };

  const handleDownload = async () => {
    if (!selectedItem || !searchSource) {
      toast.error('Please select both a result and a search source');
      return;
    }

    if (!projectName) {
      toast.error('Project name is required');
      return;
    }

    setIsDownloading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login to access this feature');
        navigate('/login');
        return;
      }

      const baseUrl = `${import.meta.env.VITE_API_URL}`;

      const response = await fetch(`${baseUrl}/v1/services/download_cwa_pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          download_term: selectedItem,
          download_source: searchSource.toUpperCase(),
          project_name: projectName
        })
      });

      if (response.status === 401) {
        toast.error('Your session has expired. Please login again.');
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length === 2) {
        toast.success('PDF has been successfully processed and saved');
        setDownloadSuccess(true);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredFiles = output.filter(
    file => file.category === selectedCategory && 
    file.category !== 'error' && 
    file.category !== 'analysis_result' &&
    file.filename.toLowerCase().endsWith('.pdf')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 sm:text-5xl">
            Common Word Analysis
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Analyze word patterns and frequencies in research articles
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Search Source
              </label>
              <select
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
              >
                <option>Google Scholar</option>
                <option>PubMed</option>
              </select>
            </div>

            {/* Fetch Files Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 ease-in-out"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0012 20c4.411 0 8-3.589 8-8 0-1.492-.438-2.88-1.214-4.077l-1.585 1.585c.337.702.539 1.49.539 2.353 0 3.314-2.686 6-6 6s-6-2.686-6-6c0-.863.202-1.651.539-2.353l-1.585-1.585A7.958 7.958 0 004 17.291z"
                  ></path>
                </svg>
              ) : null}
              {isLoading ? 'Fetching Files...' : 'Fetch Files'}
            </button>
          </form>

          {/* Results */}
          {output.length > 0 && (
            <div className="mt-8 space-y-6">
              {output[0].category === 'error' ? (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{output[0].path}</span>
                </div>
              ) : output[0].category === 'analysis_result' ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-6 bg-gray-50">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Analysis Result
                      </label>
                      <select
                        value={selectedItem}
                        onChange={(e) => handleItemSelect(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                      >
                        <option value="">Select a result</option>
                        {analysisResults.map((result, index) => (
                          <option key={index} value={result}>
                            {result}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedItem && (
                      <div className="p-4 bg-white rounded-lg shadow-sm border border-indigo-500 bg-indigo-50">
                        <p className="text-gray-700 font-medium">{selectedItem}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={handleClearSelection}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 ease-in-out"
                    >
                      Clear Selection
                    </button>
                    <button
                      onClick={handleClearResults}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 ease-in-out"
                    >
                      Clear Results
                    </button>
                  </div>
                  {selectedItem && (
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg shadow-sm border border-indigo-500 bg-indigo-50">
                        <p className="text-gray-700 font-medium">{selectedItem}</p>
                      </div>
                      
                      {/* Second Search Source Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Search Source for Further Analysis
                        </label>
                        <select
                          value={searchSource}
                          onChange={(e) => setSearchSource(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                        >
                          <option value="Google Scholar">Google Scholar</option>
                          <option value="PubMed">PubMed</option>
                        </select>
                      </div>

                      {/* Download Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isDownloading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0012 20c4.411 0 8-3.589 8-8 0-1.492-.438-2.88-1.214-4.077l-1.585 1.585c.337.702.539 1.49.539 2.353 0 3.314-2.686 6-6 6s-6-2.686-6-6c0-.863.202-1.651.539-2.353l-1.585-1.585A7.958 7.958 0 004 17.291z"></path>
                              </svg>
                              Downloading...
                            </>
                          ) : (
                            'Download PDF'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Category Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setSelectedPDF('');
                      }}
                      className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                    >
                      {pdfCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PDF Selector */}
                  <div className="border rounded-lg p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {selectedCategory.replace(/_/g, ' ')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select PDF
                        </label>
                        <select
                          value={selectedPDF}
                          onChange={(e) => setSelectedPDF(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg"
                        >
                          <option value="">Select a PDF</option>
                          {filteredFiles.map((file) => (
                            <option key={file.path} value={file.path}>
                              {file.filename}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedPDF && (
                        <div className="flex justify-end">
                          <button
                            onClick={handleRunAnalysis}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0012 20c4.411 0 8-3.589 8-8 0-1.492-.438-2.88-1.214-4.077l-1.585 1.585c.337.702.539 1.49.539 2.353 0 3.314-2.686 6-6 6s-6-2.686-6-6c0-.863.202-1.651.539-2.353l-1.585-1.585A7.958 7.958 0 004 17.291z"
                                ></path>
                              </svg>
                            ) : null}
                            {isLoading ? 'Analyzing...' : 'Run Analysis'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {downloadSuccess && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Articles Downloaded Successfully!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your articles have been downloaded. You can find them in your Download folder.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/projects/view/${projectName}/dashboard/downloaded-articles`)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Downloaded Materials
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordAnalysis;