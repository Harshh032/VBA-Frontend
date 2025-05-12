import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { TableData } from '../types/table';
import { extractTables, downloadTable } from '../services/tableService';

export const useTableExtractor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedTables, setExtractedTables] = useState<TableData[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      if (!file.type.includes('pdf')) {
        toast.error('Please upload a PDF file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsLoading(true);
    try {
      const data = await extractTables(selectedFile);
      setExtractedTables(data.tables || []);
      setShowResults(true);
      toast.success('Tables extracted successfully!');
    } catch (error) {
      console.error('Error extracting tables:', error);
      toast.error('Failed to extract tables. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (url: string, tableName: string) => {
    try {
      const blob = await downloadTable(url);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${tableName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Table downloaded successfully!');
    } catch (error) {
      console.error('Error downloading table:', error);
      toast.error('Failed to download table. Please try again.');
    }
  };

  return {
    selectedFile,
    isLoading,
    extractedTables,
    showResults,
    handleFileChange,
    handleSubmit,
    handleDownload,
  };
}; 