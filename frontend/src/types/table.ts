export interface TableData {
  table_name: string;
  table_data: any[][];
  download_url: string;
}

export interface TableExtractorResponse {
  tables: TableData[];
  message?: string;
  error?: string;
} 