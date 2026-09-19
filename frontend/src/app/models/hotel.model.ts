export interface HotelAmenity {
  name: string;
  icon: string;
  description?: string;
}

export interface HotelRoom {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  capacityText: string;
  capacityAdults: number;
  bedConfiguration: string;
  pricePerNightSoles: number;
  pricePerNightUsd: number;
  mainImage: string;
  gallery: string[];
  amenities: string[];
  highlights: string[];
  bookingRoomUrl?: string;
}

export interface HotelInfo {
  name: string;
  stars: number;
  tagline: string;
  address: string;
  city: string;
  postalCode: string;
  description: string;
  bookingUrl?: string;
  whatsAppNumber: string;
  featuredAmenities: HotelAmenity[];
  checkInTime: string;
  checkOutTime: string;
  rooms: HotelRoom[];
}
