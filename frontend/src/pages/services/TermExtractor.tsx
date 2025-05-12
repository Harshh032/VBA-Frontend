import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
// import Sidebar from '../../components/Sidebar';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface TermExtractorResponse {
  [key: string]: string | number | null;
}

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


const TermExtractor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [articleType, setArticleType] = useState<'Surgical Device' | 'Diagnostic' | ''>('');
  const [surgicalDeviceName, setSurgicalDeviceName] = useState('');
  const [enterTechnique, setEnterTechnique] = useState('');
  const [diagnosticTestType, setDiagnosticTestType] = useState('');
  const [diagnosticTestName, setDiagnosticTestName] = useState('');
  const [diagnosticSampleType, setDiagnosticSampleType] = useState('');
  const [diagnosticTechnique, setDiagnosticTechnique] = useState('');
  const [extractedTerms, setExtractedTerms] = useState<TermExtractorResponse | null>(null);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setFile(selectedFile);
      toast.success('File selected successfully');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const parseJsonResponse = (response: string): TermExtractorResponse => {
    try {
      console.log('Raw Response:', response);
      
      // Remove any potential BOM or whitespace
      const cleanedResponse = response.trim();
      
      // Handle triple-escaped JSON
      let jsonString = cleanedResponse;
      
      // Remove outer quotes if present
      if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
        jsonString = jsonString.slice(1, -1);
      }
      
      // Remove <json> tags and unescape the content
      if (jsonString.startsWith('<json>') && jsonString.endsWith('</json>')) {
        jsonString = jsonString
          .replace(/^<json>\n?/, '')
          .replace(/\n?<\/json>$/, '')
          .trim();
      }
      
      // Unescape the JSON string
      jsonString = jsonString
        .replace(/\\"/g, '"')  // Replace \" with "
        .replace(/\\n/g, '')   // Remove \n
        .replace(/\\/g, '')    // Remove any remaining backslashes
        .trim();
      
      console.log('Cleaned JSON String:', jsonString);
      
      // Parse the JSON
      const parsed = JSON.parse(jsonString);
      
      // Validate the parsed data
      if (typeof parsed !== 'object' || parsed === null) {
        console.error('Invalid parsed data:', parsed);
        throw new Error('Invalid response format: Expected an object');
      }
      
      // Ensure all values are either strings, numbers, or null
      const validatedData: TermExtractorResponse = {};
      Object.entries(parsed).forEach(([key, value]) => {
        if (value === null || typeof value === 'string' || typeof value === 'number') {
          validatedData[key] = value;
        } else {
          validatedData[key] = String(value);
        }
      });
      
      console.log('Parsed and Validated Data:', validatedData);
      return validatedData;
    } catch (err) {
      const error = err as Error;
      console.error('JSON Parsing Error:', error);
      console.error('Error Details:', {
        message: error.message,
        stack: error.stack,
        response: response
      });
      throw new Error(`Failed to parse response: ${error.message}`);
    }
  };

  const formatResponse = (data: TermExtractorResponse): JSX.Element => {
    // Filter out the 'n' key and map the remaining entries to JSX elements
    const terms = Object.entries(data).filter(([key]) => key !== 'n');
    if (terms.length === 0) {
      return <p className="text-gray-500 italic">No terms extracted.</p>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Term
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {terms.map(([term, value], index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {term}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {value !== null ? value : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !articleType) {
      toast.error('Please select a file and article type');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setExtractedTerms(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      console.log('Term extractor Access Token:', accessToken);
      if (!accessToken) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }
      

      const formData = new FormData();
      formData.append('file', file);
      formData.append('article_type', articleType);

      if (articleType === 'Surgical Device') {
        if (!surgicalDeviceName || !enterTechnique) {
          toast.error('Please fill in all required fields for Surgical Device');
          return;
        }
        formData.append('surgical_device_name', surgicalDeviceName);
        formData.append('enter_technique', enterTechnique);
      } else if (articleType === 'Diagnostic') {
        if (!diagnosticTestType || !diagnosticTestName || !diagnosticSampleType || !diagnosticTechnique) {
          toast.error('Please fill in all required fields for Diagnostic');
          return;
        }
        formData.append('diagnostic_test_type', diagnosticTestType);
        formData.append('diagnostic_test_name', diagnosticTestName);
        formData.append('diagnostic_sample_type', diagnosticSampleType);
        formData.append('diagnostic_technique', diagnosticTechnique);
      }

      // Show upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const baseUrl = `${import.meta.env.VITE_API_URL}`;

      const response = await fetch(`${baseUrl}/v1/services/term_extractor`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      

      clearInterval(interval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw API Response:', responseText);
      
      try {
        const data = parseJsonResponse(responseText);
        console.log('Parsed Data:', data);
        setExtractedTerms(data);
        toast.success('Terms extracted successfully!');
      } catch (parseError) {
        console.error('Parse Error:', parseError);
        toast.error('Failed to parse response. Please try again.');
        setExtractedTerms(null);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Network error: Please check your internet connection');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to upload file. Please try again.');
      }
    } finally {
      setIsUploading(false);
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
                Term Extractor
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Upload your document to extract key terms and concepts
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="articleType" className="block text-sm font-medium text-gray-700">
                      Article Type
                    </label>
                    <select
                      id="articleType"
                      value={articleType}
                      onChange={(e) => setArticleType(e.target.value as 'Surgical Device' | 'Diagnostic' | '')}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select Article Type</option>
                      <option value="Surgical Device">Surgical Device</option>
                      <option value="Diagnostic">Diagnostic</option>
                    </select>
                  </div>

                  {articleType === 'Surgical Device' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="surgicalDeviceName" className="block text-sm font-medium text-gray-700">
                          Surgical Device Name
                        </label>
                        <input
                          type="text"
                          id="surgicalDeviceName"
                          value={surgicalDeviceName}
                          onChange={(e) => setSurgicalDeviceName(e.target.value)}
                          className="mt-1 block w-full px-4 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                          placeholder="Enter surgical device name"
                        />
                      </div>
                      <div>
                        <label htmlFor="enterTechnique" className="block text-sm font-medium text-gray-700">
                          Enter Technique
                        </label>
                        <input
                          type="text"
                          id="enterTechnique"
                          value={enterTechnique}
                          onChange={(e) => setEnterTechnique(e.target.value)}
                          className="mt-1 block w-full px-4 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                          placeholder="Enter technique"
                        />
                      </div>
                    </div>
                  )}

                  {articleType === 'Diagnostic' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="diagnosticTestType" className="block text-sm font-medium text-gray-700">
                          Diagnostic Test Type
                        </label>
                        <input
                          type="text"
                          id="diagnosticTestType"
                          value={diagnosticTestType}
                          onChange={(e) => setDiagnosticTestType(e.target.value)}
                          className="mt-1 block w-full px-4 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                          placeholder="Enter diagnostic test type"
                        />
                      </div>
                      <div>
                        <label htmlFor="diagnosticTestName" className="block text-sm font-medium text-gray-700">
                          Diagnostic Test Name
                        </label>
                        <input
                          type="text"
                          id="diagnosticTestName"
                          value={diagnosticTestName}
                          onChange={(e) => setDiagnosticTestName(e.target.value)}
                          className="mt-1 block w-full px-4 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                          placeholder="Enter diagnostic test name"
                        />
                      </div>
                      <div>
                        <label htmlFor="diagnosticSampleType" className="block text-sm font-medium text-gray-700">
                          Diagnostic Sample Type
                        </label>
                        <input
                          type="text"
                          id="diagnosticSampleType"
                          value={diagnosticSampleType}
                          onChange={(e) => setDiagnosticSampleType(e.target.value)}
                          className="mt-1 block w-full px-4 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                          placeholder="Enter diagnostic sample type"
                        />
                      </div>
                      <div>
                        <label htmlFor="diagnosticTechnique" className="block text-sm font-medium text-gray-700">
                          Diagnostic Technique
                        </label>
                        <input
                          type="text"
                          id="diagnosticTechnique"
                          value={diagnosticTechnique}
                          onChange={(e) => setDiagnosticTechnique(e.target.value)}
                          className="mt-1 block w-full px-4 py-3 text-base border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg"
                          placeholder="Enter diagnostic technique"
                        />
                      </div>
                    </div>
                  )}

                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-4">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <div className="text-sm text-gray-600">
                        {isDragActive ? (
                          <p>Drop the file here ...</p>
                        ) : (
                          <p>
                            Drag and drop your PDF here, or{' '}
                            <span className="text-indigo-600 hover:text-indigo-500 font-medium">
                              click to select
                            </span>
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Supported format: PDF (max 10MB)</p>
                    </div>
                  </div>

                  {file && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{file.name}</span>
                        <span className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      {isUploading && (
                        <p className="mt-2 text-sm text-gray-500 text-center">
                          Uploading... {uploadProgress}%
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!file || !articleType || isUploading}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      file && articleType && !isUploading
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {isUploading ? 'Extracting...' : 'Extract Terms'}
                  </button>
                </div>
              </form>

              {isUploading && !extractedTerms && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Extracted Terms</h2>
                  <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                    <p className="text-gray-500 italic">Processing terms...</p>
                  </div>
                </div>
              )}

              {extractedTerms && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Extracted Terms</h2>
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    {formatResponse(extractedTerms)}
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

export default TermExtractor;