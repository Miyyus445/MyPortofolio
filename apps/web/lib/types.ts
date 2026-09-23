export interface Photo {
  id: string;
  title: string;
  description: string | null;
  descriptionId: string | null;
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

export interface AdminUser {
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AdminUser;
}

export interface CreatePhotoInput {
  title: string;
  description?: string | null;
  descriptionId?: string | null;
  imageUrl: string;
  category: string;
  isFeatured?: boolean;
}

export type UpdatePhotoInput = Partial<CreatePhotoInput>;

export interface CreateProjectInput {
  title: string;
  description: string;
  repoUrl?: string;
  demoUrl?: string;
  techStack: string[];
  thumbnail?: string;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface CreateExperienceInput {
  role: string;
  organization: string;
  period: string;
  description: string;
  type: string;
}

export type UpdateExperienceInput = Partial<CreateExperienceInput>;

