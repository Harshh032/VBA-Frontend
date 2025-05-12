import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface ExtractedImage {
  url: string;
  filename: string;
}

const PDFImageExtractor = () => {
  const { projectName } = useParams<{ projectName: string }>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setSelectedFile(file);
      setExtractionSuccess(false); // Reset success state when a new file is selected
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
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setSelectedFile(file);
      setExtractionSuccess(false); // Reset success state when a new file is dropped
    }
  };

  // Submit: Upload PDF and extract images
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
    setExtractedImages([]);
    setExtractionSuccess(false);

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

      const baseUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${baseUrl}/v1/services/image_extractor`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const images = data.map((url: string) => ({
          url,
          filename: url.split('/').pop()?.split('?')[0] || 'image'
        }));
        setExtractedImages(images);
        setExtractionSuccess(true);
        toast.success(`Images Extracted Successfully! Check your Download folder.`);
      } else {
        throw new Error('Unexpected response format from the server');
      }

    } catch (error) {
      console.error('Error:', error);
      let message = 'An unknown error occurred.';
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        message = 'Network error. Please check your connection.';
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 ml-45">
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              PDF Image Extractor
            </h1>
            <p className="mt-4 text-lg text-gray-600">Upload a PDF file to extract images</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
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
                <div className="space-y-2 mt-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-indigo-600 hover:text-indigo-500">Upload a file</span> or drag and drop
                  </p>
                </div>
                <p className="text-xs text-gray-500">PDF up to 10MB</p>
              </div>

              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Selected file: <strong>{selectedFile.name}</strong>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  selectedFile && !isLoading
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isLoading ? 'Extracting...' : 'Extract Images'}
              </button>
            </form>

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
                    <h3 className="text-sm font-medium text-green-800">Images Extracted Successfully!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Your images have been extracted. You can find them in your Download folder.</p>
                      <p className="mt-1">Total images extracted: {extractedImages.length}</p>
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
      </main>
    </div>
  );
};

export default PDFImageExtractor;