import { TableExtractorResponse } from '../types/table';

const API_BASE_URL = 'http://52.55.17.100/v1/services';

export const extractTables = async (file: File): Promise<TableExtractorResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/table_extractor`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to extract tables');
  }

  return response.json();
};

export const downloadTable = async (url: string): Promise<Blob> => {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download table');
  }

  return response.blob();
}; 