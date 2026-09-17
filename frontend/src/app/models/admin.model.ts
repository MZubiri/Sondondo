export interface AdminUser {
  username: string;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
}

export interface AdminBooking {
  id: number;
  tourId?: number;
  tourTitle: string;
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  travelDate?: string;
  message: string;
  status: 'Pending' | 'Contacted' | 'Confirmed' | 'Cancelled';
  createdAt: string;
  whatsAppDirectUrl: string;
}

export interface AdminTour {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  duration: string;
  durationDays: number;
  priceSoles: number;
  priceUsd: number;
  difficulty: string;
  altitudeMax: string;
  startingPoint: string;
  featured: boolean;
  isActive: boolean;
  mainImageUrl: string;
  displayOrder: number;
  galleryImages?: string[];
  included?: string[];
  notIncluded?: string[];
  recommendations?: string[];
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  activeTours: number;
  totalTours: number;
  unreadMessages: number;
  recentBookings: AdminBooking[];
}

export interface AdminContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
