import React from 'react';
import { useLocation } from 'react-router-dom';

const toolContents = {
  'term-extractor': {
    title: 'Term Extractor',
    description: 'Extract key terms and concepts from your research documents with our advanced term extraction tool.',
    sampleText: 'The rapid advancement of artificial intelligence has revolutionized various industries. Machine learning algorithms are now capable of processing vast amounts of data and identifying patterns that were previously undetectable. Natural language processing techniques enable computers to understand and generate human language with remarkable accuracy.',
    features: [
      'Automated term extraction',
      'Customizable extraction rules',
      'Export to multiple formats',
      'Batch processing capability'
    ]
  },
  'article-retriever': {
    title: 'Article Retriever',
    description: 'Search and download research articles from various academic databases and sources.',
    sampleText: 'Recent studies in quantum computing have shown promising results in error correction and qubit stability. Researchers have developed new methods for maintaining quantum coherence and reducing decoherence effects. These advancements could potentially lead to practical quantum computers in the near future.',
    features: [
      'Multi-database search',
      'Citation management',
      'PDF download',
      'Reference tracking'
    ]
  },
  'word-analysis': {
    title: 'Common Word Analysis',
    description: 'Analyze word frequency and patterns in your documents to gain insights into your research content.',
    sampleText: 'Climate change has become one of the most pressing issues of our time. Rising global temperatures, melting ice caps, and extreme weather events are clear indicators of the changing climate. Scientists worldwide are working to develop sustainable solutions and mitigation strategies.',
    features: [
      'Word frequency analysis',
      'Pattern recognition',
      'Trend visualization',
      'Comparative analysis'
    ]
  },
  'download-articles': {
    title: 'Get Download Articles',
    description: 'Access and download research articles from various academic sources with ease.',
    sampleText: 'The field of biotechnology has seen significant growth in recent years. Advances in gene editing technologies like CRISPR have opened new possibilities in medicine and agriculture. Researchers are exploring applications in disease treatment, crop improvement, and environmental conservation.',
    features: [
      'Bulk downloading',
      'Format conversion',
      'Metadata extraction',
      'Organized storage'
    ]
  },
  'pdf-image-extractor': {
    title: 'PDF Image Extractor',
    description: 'Extract and save images from PDF documents while maintaining quality and resolution.',
    sampleText: 'Modern architectural designs incorporate sustainable materials and energy-efficient systems. Green buildings utilize solar panels, rainwater harvesting, and natural ventilation to reduce environmental impact. These innovations are transforming the construction industry.',
    features: [
      'High-quality extraction',
      'Batch processing',
      'Format conversion',
      'Metadata preservation'
    ]
  },
  'csv-manager': {
    title: 'CSV Manager',
    description: 'Manage and analyze your research data with our powerful CSV management tools.',
    sampleText: 'Data analysis in social sciences has evolved significantly with the advent of big data. Researchers can now analyze large datasets to identify social patterns and trends. This has led to new insights in fields like sociology, psychology, and economics.',
    features: [
      'Data visualization',
      'Filter and sort',
      'Data cleaning',
      'Export options'
    ]
  },
  'pdf-filter': {
    title: 'PDF Filter',
    description: 'Filter and organize your PDF documents based on content, keywords, and metadata.',
    sampleText: 'Renewable energy technologies are becoming increasingly efficient and cost-effective. Solar and wind power installations are growing rapidly worldwide. These developments are crucial for reducing carbon emissions and combating climate change.',
    features: [
      'Content filtering',
      'Keyword search',
      'Metadata analysis',
      'Document organization'
    ]
  },
  'table-extractor': {
    title: 'Table Extractor',
    description: 'Extract and analyze tables from your documents with precision and accuracy.',
    sampleText: 'The pharmaceutical industry has made significant progress in drug development. New technologies enable faster and more accurate testing of potential treatments. This has led to breakthroughs in treating various diseases and conditions.',
    features: [
      'Table detection',
      'Data extraction',
      'Format conversion',
      'Data validation'
    ]
  },
  'combined-extractor': {
    title: 'Combined Extractor',
    description: 'Extract multiple types of content from your documents in a single operation.',
    sampleText: 'Urban planning has evolved to incorporate smart city technologies. These include intelligent transportation systems, energy-efficient buildings, and digital infrastructure. Such innovations aim to improve quality of life while reducing environmental impact.',
    features: [
      'Multi-format extraction',
      'Batch processing',
      'Content organization',
      'Custom extraction rules'
    ]
  }
};

const ToolPage = () => {
  const location = useLocation();
  const toolName = location.pathname.split('/').pop();
  
  // If no specific tool is selected, show the default welcome message
  if (!toolName || !toolContents[toolName as keyof typeof toolContents]) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Welcome to Research Tools Platform
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Select a tool from the sidebar to get started with your research tasks.
            </p>
            <div className="mt-12">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.values(toolContents).map((tool, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900">{tool.title}</h3>
                      <p className="mt-2 text-sm text-gray-500">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toolContent = toolContents[toolName as keyof typeof toolContents];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            {toolContent.title}
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            {toolContent.description}
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sample Content</h2>
            <p className="text-gray-700 mb-6">
              {toolContent.sampleText}
            </p>
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {toolContent.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="h-2 w-2 bg-indigo-600 rounded-full mr-3"></span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolPage; 