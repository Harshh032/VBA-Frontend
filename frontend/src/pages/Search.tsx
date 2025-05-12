import React from 'react';
import Sidebar from '../components/Sidebar';

function Search() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Search</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              Search across all your documents and extracted content.
            </p>
            {/* Add your search functionality here */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Search; 