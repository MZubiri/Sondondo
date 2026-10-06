import { ItineraryDay } from './tour.model';

export interface AdminUser {
  username: string;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
}

export interface PassengerManifestItem {
  id: string;
  fullName: string;
  documentType: 'DNI' | 'Pasaporte' | 'Carnet Ext.';
  documentNumber: string;
  nationality: string;
  age: number;
  emergencyPhone: string;
}

export interface AdminBooking {
  id: number;
  voucherCode?: string;
  tourId?: number;
  tourTitle: string;
  tourPriceSoles?: number;
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  travelDate?: string;
  message: string;
  status: 'Pending' | 'Contacted' | 'Confirmed' | 'Cancelled';
  createdAt: string;
  whatsAppDirectUrl: string;

  // Payments & receipts
  paymentMethod?: 'MercadoPago' | 'Yape' | 'Plin' | 'Transferencia BCP' | 'Banco de la Nación' | 'Efectivo' | 'Pendiente';
  paymentStatus?: 'Pendiente' | 'Adelanto 50%' | 'Pagado 100%' | 'Reembolsado';
  totalAmount?: number;
  paidAmount?: number;
  paymentReceiptUrl?: string; // Base64 dataUrl or image url

  // Passenger Manifest
  passengers?: PassengerManifestItem[];
  guideName?: string;
  driverName?: string;
  vehiclePlate?: string;
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
  itineraries?: ItineraryDay[];
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  activeTours: number;
  totalTours: number;
  unreadMessages: number;
  totalRevenueSoles?: number;
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

export interface AdminTestimonial {
  id: number;
  authorName: string;
  authorCityOrCountry: string;
  rating: number; // 1 to 5
  comment: string;
  tourName: string;
  date: string;
  avatarUrl?: string;
  isApproved: boolean; // Toggle visible on web
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Fauna' | 'Paisajes' | 'Cultura' | 'Aventura';
  url: string;
  location: string;
  altText: string;
  uploadedAt: string;
}

export * from './hotel.model';

