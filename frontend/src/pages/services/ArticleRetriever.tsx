import React, { useState, useEffect } from 'react';
// import Sidebar from '../../components/Sidebar';
import { toast } from 'react-hot-toast';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

interface Article {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  url: string;
  status: 'success' | 'error';
}

const ArticleRetriever = () => {
  const { projectName } = useParams<{ projectName: string }>();
  const [searchTerms, setSearchTerms] = useState(1);
  const [searchSource, setSearchSource] = useState('Google Scholar');
  const [country, setCountry] = useState('');
  const [patientCohort, setPatientCohort] = useState('');
  const [term1, setTerm1] = useState('');
  const [term2, setTerm2] = useState('');
  const [term3, setTerm3] = useState('');
  const [operator1, setOperator1] = useState('AND');
  const [operator2, setOperator2] = useState('AND');
  const [pdfCount, setPdfCount] = useState(10);
  const [pdfCountError, setPdfCountError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchResults, setSearchResults] = useState<{ successCount: number; errorCount: number } | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectName) {
      toast.error('Project name is required');
      return;
    }
  }, [projectName]);

  // Handle PDF count change with validation
  const handlePdfCountChange = (value: number) => {
    if (value > 20) {
      setPdfCountError('Maximum 20 PDFs allowed');
      setPdfCount(20);
    } else {
      setPdfCountError('');
      setPdfCount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSearchResults(null);

    try {
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Please login first');
        return;
      }

      // Validate required fields
      if (!term1.trim()) {
        toast.error('Please enter at least one search term');
        return;
      }

      // Ensure PDF count is within limits
      if (pdfCount > 20) {
        toast.error('Maximum 20 PDFs allowed');
        setPdfCount(20);
        return;
      }

      // Prepare search terms array
      const searchTermsArray = [term1];
      if (searchTerms >= 2 && term2.trim()) searchTermsArray.push(term2);
      if (searchTerms >= 3 && term3.trim()) searchTermsArray.push(term3);

      // Prepare operators array
      const operatorsArray = [];
      if (searchTerms >= 2) operatorsArray.push(operator1);
      if (searchTerms >= 3) operatorsArray.push(operator2);

      // Prepare request body
      const requestBody = {
        project_name: projectName,
        country: country || "",
        patient_cohort: patientCohort || "",
        search_terms: searchTermsArray,
        operators: operatorsArray,
        max_pdfs: pdfCount
      };

      const baseUrl = `${import.meta.env.VITE_API_URL}`;

      // Determine the API endpoint based on the selected source
      const endpoint = searchSource === 'Google Scholar' 
        ? `${baseUrl}/v1/services/retrive_google_scholer_article`
        : searchSource === 'PubMed'
        ? `${baseUrl}/v1/services/retrive_pubmed_article`
        : `${baseUrl}/v1/services/retrive_scholar_and_pubmed_articles`;

      // Make the API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
      });

      // Handle different response statuses
      if (response.status === 502) {
        throw new Error('The server is currently unavailable. Please try again later.');
      } else if (response.status === 401) {
        throw new Error('Your session has expired. Please login again.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      } else if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Handle the response
      if (searchSource === 'Google Scholar and PubMed') {
        if (data.details === "files downloaded successfully!") {
          setSearchResults({ successCount: pdfCount, errorCount: 0 });
          toast.success(
            <div>
              <p className="font-bold">Search completed successfully!</p>
              <p>Successfully retrieved articles from both Google Scholar and PubMed</p>
            </div>,
            { duration: 5000 }
          );
          setShowResults(true);
          setDownloadSuccess(true);

          // Fetch the list of downloaded articles
          const baseUrl = `${import.meta.env.VITE_API_URL}`;
 
          const articlesResponse = await fetch(`${baseUrl}/v1/services/get_all_file_and_folders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              project_name: projectName
            })
          });

          if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json();
            const folders = (articlesData?.folders || []).filter((folder: any) => folder.name !== projectName);
            const files = (articlesData?.files || []).map((file: any) => ({
              title: file.name.replace(/_/g, ' ').replace('.pdf', ''),
              authors: [],
              journal: '',
              year: new Date().getFullYear(),
              url: file.path,
              status: 'success' as const
            }));
            setArticles(files);
          }
        } else {
          throw new Error('Unexpected response format from the server');
        }
      } else if (Array.isArray(data) && data.length === 2) {
        const [successCount, errorCount] = data;
        setSearchResults({ successCount, errorCount });
        
        // Show success message with details
        if (successCount > 0) {
          toast.success(
            <div>
              <p className="font-bold">Search completed successfully!</p>
              <p>Successfully retrieved {successCount} articles</p>
              {errorCount > 0 && <p>{errorCount} articles failed to retrieve</p>}
            </div>,
            { duration: 5000 }
          );
          setShowResults(true);
          setDownloadSuccess(true);

          // Fetch the list of downloaded articles
          const baseUrl = `${import.meta.env.VITE_API_URL}`;
 
          const articlesResponse = await fetch(`${baseUrl}/v1/services/get_all_file_and_folders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              project_name: projectName
            })
          });

          if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json();
            const folders = (articlesData?.folders || []).filter((folder: any) => folder.name !== projectName);
            const files = (articlesData?.files || []).map((file: any) => ({
              title: file.name.replace(/_/g, ' ').replace('.pdf', ''),
              authors: [],
              journal: '',
              year: new Date().getFullYear(),
              url: file.path,
              status: 'success' as const
            }));
            setArticles(files);
          }
        } else {
          toast.error('No articles were found matching your search criteria.');
        }
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

  return (
    <div className="flex">
      {/* <Sidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} /> */}
      <main className="flex-1 ml-45">
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Article Retriever
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Search and download research articles from various sources
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => navigate(`/projects/view/${projectName}/dashboard/article-retriever/recent_projects`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Recent Searches
                </button>
              </div>
            </div>

            {/* Search Results Summary */}
            {searchResults && (
              <div className="mb-8 bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Search Results</h2>
                  <button
                    onClick={() => navigate(`/projects/view/${projectName}/dashboard/downloaded-articles`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Downloaded Materials
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Successful Retrievals</p>
                    <p className="text-2xl font-bold text-green-600">{searchResults.successCount}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Failed Retrievals</p>
                    <p className="text-2xl font-bold text-red-600">{searchResults.errorCount}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many search terms do you want to enter?
                  </label>
                  <select
                    value={searchTerms}
                    onChange={(e) => setSearchTerms(Number(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select search source
                  </label>
                  <select
                    value={searchSource}
                    onChange={(e) => setSearchSource(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>Google Scholar</option>
                    <option>PubMed</option>
                    <option>Google Scholar and PubMed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter country (optional)
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., United States"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter patient cohort (optional)
                  </label>
                  <input
                    type="text"
                    value={patientCohort}
                    onChange={(e) => setPatientCohort(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Adults, Children, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter search term 1
                  </label>
                  <input
                    type="text"
                    value={term1}
                    onChange={(e) => setTerm1(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your first search term"
                    required
                  />
                </div>

                {searchTerms >= 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select operator for terms 1 and 2
                      </label>
                      <select
                        value={operator1}
                        onChange={(e) => setOperator1(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option>AND</option>
                        <option>OR</option>
                        <option>NOT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter search term 2
                      </label>
                      <input
                        type="text"
                        value={term2}
                        onChange={(e) => setTerm2(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your second search term"
                        required
                      />
                    </div>
                  </>
                )}

                {searchTerms >= 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select operator for terms 2 and 3
                      </label>
                      <select
                        value={operator2}
                        onChange={(e) => setOperator2(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option>AND</option>
                        <option>OR</option>
                        <option>NOT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter search term 3
                      </label>
                      <input
                        type="text"
                        value={term3}
                        onChange={(e) => setTerm3(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your third search term"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many PDFs do you want to download? (Maximum 20)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pdfCount}
                      onChange={(e) => handlePdfCountChange(Number(e.target.value))}
                      min="1"
                      max="20"
                      className={`mt-1 block w-full border ${pdfCountError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {pdfCountError && (
                      <div className="absolute right-0 mt-1 flex items-center text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {pdfCountError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || pdfCount > 20}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Searching...' : 'Search and Download'}
                  </button>
                </div>
              </form>
            </div>

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
      </main>
    </div>
  );
};

export default ArticleRetriever;