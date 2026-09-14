export interface Photo {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  techStack: string[];
  thumbnail: string | null;
  createdAt: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
  type: string;
  createdAt: string;
}
