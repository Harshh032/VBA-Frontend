export interface Article {
  path: string;
  name: string;
  source: 'PubMed' | 'Google Scholar' | 'CSV' | 'Images' | 'included' | 'excluded';
} 