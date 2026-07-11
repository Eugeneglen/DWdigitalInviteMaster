// Content block types from the CMS
export type BlockType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'gallery'
  | 'timeline-item'
  | 'faq-item'
  | 'venue-info'
  | 'map-embed';

export interface ContentBlock {
  id: string;
  key: string;
  type: BlockType;
  value: string;
  meta: string | null; // JSON: { alt?, label?, required?, placeholder? }
  sortOrder: number;
}

export interface ContentSection {
  slug: string;
  title: string;
  blocks: ContentBlock[];
}

export interface ContentPage {
  slug: string;
  title: string;
  sections: ContentSection[];
}

export interface WeddingContent {
  account: {
    id: string;
    coupleName1: string;
    coupleName2: string;
    slug: string;
  };
  pages: ContentPage[];
}

// Shape returned by workspace content API
export interface WorkspacePage {
  id: string;
  slug: string;
  title: string;
  isPublished: boolean;
  publishedAt: string | null;
  sections: WorkspaceSection[];
}

export interface WorkspaceSection {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  blocks: WorkspaceBlock[];
}

export interface WorkspaceBlock {
  id: string;
  key: string;
  type: BlockType;
  value: string;
  meta: string | null;
  sortOrder: number;
}