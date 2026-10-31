export interface PlanRequestPayload {
  destination: string;
  startDate: string;
  endDate: string;
  travellers: number;
  pace?: string;
  interests?: string[];
  budgetTier?: string;
  notes?: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface PlanRequestRecord extends PlanRequestPayload {
  id: number;
  reference: string;
  status: 'pending' | 'reviewing' | 'matched' | 'confirmed' | 'cancelled';
  assignedBuddyId?: number | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Buddy {
  id: string | number;
  name: string;
  location: string;
  city?: string;
  avatar?: string;
  image?: string;
  tagline?: string;
  bio?: string;
  languages?: string[];
  interests?: string[];
  rating?: number;
  reviewsCount?: number;
  pricePerDay?: number;
  verified?: boolean;
}

export interface Story {
  id: string | number;
  title: string;
  destination: string;
  author: string;
  authorRole?: string;
  date?: string;
  image?: string;
  readTime?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
}

export interface DestinationCity {
  id: string;
  name: string;
  state: string;
  tagline: string;
  description?: string;
  image: string;
  highlight?: string;
  featured?: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

