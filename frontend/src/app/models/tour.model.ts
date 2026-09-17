export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  toursCount: number;
}

export interface TourSummary {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  duration: string;
  durationDays: number;
  priceSoles: number;
  priceUsd: number;
  difficulty: string;
  altitudeMax: string;
  startingPoint: string;
  featured: boolean;
  mainImageUrl: string;
}

export interface ItineraryDay {
  id: number;
  dayNumber: number;
  title: string;
  description: string;
  activities: string;
  meals: string;
  accommodation: string;
}

export interface TourDetail extends TourSummary {
  description: string;
  galleryImages: string[];
  included: string[];
  notIncluded: string[];
  recommendations: string[];
  itineraries: ItineraryDay[];
}

export interface BookingInquiryRequest {
  tourId?: number;
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  travelDate?: string;
  message?: string;
  preferredLanguage?: string;
}

export interface BookingInquiryResponse {
  id: number;
  fullName: string;
  tourTitle: string;
  status: string;
  createdAt: string;
  whatsAppDirectUrl: string;
}

export interface Testimonial {
  id: number;
  authorName: string;
  location: string;
  rating: number;
  comment: string;
  tourName: string;
  avatarUrl?: string;
  date: string;
}

export interface AgencyInfo {
  name: string;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  safeTravelsCertified: boolean;
  facebookUrl: string;
  instagramUrl: string;
}
