import React, { useState, useRef } from 'react';
// import Sidebar from '../../components/Sidebar';
import { toast } from 'react-hot-toast';
import { Download, FileText, AlertCircle, Table as TableIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface ExtractedTable {
  url: string;
  filename: string;
}

const TableExtractor = () => {
  const { projectName } = useParams<{ projectName: string }>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [extractedTables, setExtractedTables] = useState<ExtractedTable[]>([]);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (!projectName) {
      toast.error('Project name is required');
      return;
    }

    setIsLoading(true);
    setExtractedTables([]);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('project_name', projectName);

      const baseUrl = `${import.meta.env.VITE_API_URL}`;

      const response = await fetch(`${baseUrl}/v1/services/table_extractor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Handle the response
      if (data.message === "Csv file extracted successfully!") {
        toast.success(
          <div>
            <p className="font-bold">Success!</p>
            <p>Tables extracted successfully</p>
          </div>
        );
        setExtractionSuccess(true);
      } else {
        throw new Error('Unexpected response format from the server');
      }

    } catch (error) {
      console.error('Error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error(
          <div>
            <p className="font-bold">Network Error</p>
            <p>Please check your internet connection and try again.</p>
          </div>
        );
      } else if (error instanceof Error) {
        toast.error(
          <div>
            <p className="font-bold">Error</p>
            <p>{error.message}</p>
          </div>
        );
      } else {
        toast.error(
          <div>
            <p className="font-bold">Unexpected Error</p>
            <p>Please try again later.</p>
          </div>
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (table: ExtractedTable) => {
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = table.url;
      link.setAttribute('download', table.filename);
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);

      toast.success(
        <div>
          <p className="font-bold">Download Started</p>
          <p>Your table is being downloaded...</p>
        </div>
      );
    } catch (error) {
      console.error('Download error:', error);
      toast.error(
        <div>
          <p className="font-bold">Download Error</p>
          <p>Failed to download the table. Please try again.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex">
      {/* <Sidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} /> */}
      <main className="flex-1 ml-45">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Table Extractor
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Upload a PDF file to extract tables
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Selected file: {selectedFile.name}
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!selectedFile || isLoading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      selectedFile && !isLoading
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {isLoading ? 'Extracting...' : 'Extract Tables'}
                  </button>
                </div>
              </form>

              {/* Extracted Tables Section */}
              {extractedTables.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Extracted Tables</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {extractedTables.map((table, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <TableIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {table.filename}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownload(table)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {extractionSuccess && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Tables Extracted Successfully!</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Your tables have been extracted. You can find them in your Download folder.</p>
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
      </main>
    </div>
  );
};

export default TableExtractor; 
