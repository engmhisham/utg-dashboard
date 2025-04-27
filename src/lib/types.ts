// lib/types.ts
export type Project = {
    id: string;
    title: string;
    description: string;
    images: string[];      // up to 4 absolute URLs
    url: string;
    createdAt?: string;
};

export type Client = {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'inactive';
    logoUrl: string;
    url: string;
    createdAt?: string; // Optional if not always returned
};
  
export type BlogStatus = 'draft' | 'published' | 'archived';

export interface Blog {
  id:            string;
  slug:          string;
  status:        BlogStatus;
  title:         string;   // already language‑filtered by the API
  description:   string;
  content:       string;
  coverImageUrl: string;
  publishedAt?:  string;
  createdAt:     string;
  updatedAt:     string;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  path: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  createdAt: string;
}