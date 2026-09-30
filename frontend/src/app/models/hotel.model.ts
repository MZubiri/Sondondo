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
  isActive?: boolean;
  totalUnits?: number;
  floorOrZone?: string;
  housekeepingStatus?: 'clean' | 'dirty' | 'occupied' | 'maintenance';
}

export interface HotelDateBlock {
  id: number;
  roomId?: number | null; // null, 0 or undefined = Todas las habitaciones
  roomTitle?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  isBlocked: boolean; // true = Bloqueado para reservas, false = Tarifa especial
  priceOverrideSoles?: number;
  priceOverrideUsd?: number;
  notes?: string;
  createdAt?: string;
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
  dateBlocks?: HotelDateBlock[];
}

export interface HotelBooking {
  id: number;
  voucherCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestDocumentType?: 'DNI' | 'Pasaporte' | 'Carnet Ext.';
  guestDocumentNumber?: string;
  roomId: number;
  roomTitle: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  numberOfGuests: number;
  totalPriceSoles: number;
  paidAmountSoles?: number;
  paymentMethod?: 'MercadoPago' | 'Yape' | 'Plin' | 'Transferencia BCP' | 'Banco de la Nación' | 'Efectivo' | 'Pendiente';
  paymentStatus?: 'Pendiente' | 'Adelanto 50%' | 'Pagado 100%' | 'Reembolsado';
  status: 'Pending' | 'Confirmed' | 'CheckedIn' | 'Completed' | 'Cancelled';
  specialRequests?: string;
  createdAt: string;
  whatsAppDirectUrl?: string;
}
