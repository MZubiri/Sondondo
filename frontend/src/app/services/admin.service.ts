import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { AdminBooking, AdminTour, DashboardStats, AdminContactMessage } from '../models/admin.model';
import { environment } from '../../environments/environment';

const BOOKINGS_STORAGE_KEY = 'sondondo_admin_bookings_cache';
const TOURS_STORAGE_KEY = 'sondondo_admin_tours_cache';
const MESSAGES_STORAGE_KEY = 'sondondo_admin_messages_cache';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Initial mock bookings for immediate admin interaction
  private initialMockBookings: AdminBooking[] = [
    {
      id: 1,
      tourId: 1,
      tourTitle: 'Kuntur Ñan: El Vuelo del Cóndor en Mayobamba',
      fullName: 'Carlos Mendoza Ramos',
      email: 'carlos.mendoza@gmail.com',
      phone: '+51 984 123 456',
      numberOfPeople: 2,
      travelDate: '2026-10-15',
      message: 'Queremos ver el vuelo de cóndores temprano y visitar el templo de Aucará. ¿Tienen disponibilidad?',
      status: 'Pending',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      whatsAppDirectUrl: 'https://wa.me/51984123456?text=Hola%20Carlos,%20saludos%20de%20Valle%20del%20Sondondo%20Expeditions.'
    },
    {
      id: 2,
      tourId: 2,
      tourTitle: 'Gran Circuito Andenes Vivos de Andamarca & Danza de Tijeras',
      fullName: 'Lucía Fernández Morales',
      email: 'lucia.fernandez@outlook.com',
      phone: '+51 966 789 012',
      numberOfPeople: 4,
      travelDate: '2026-11-02',
      message: 'Somos una familia de 4 personas interesada en la exhibición de danza de tijeras y las andenerías.',
      status: 'Contacted',
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      whatsAppDirectUrl: 'https://wa.me/51966789012?text=Hola%20Lucia,%20saludos%20de%20Valle%20del%20Sondondo%20Expeditions.'
    },
    {
      id: 3,
      tourId: 3,
      tourTitle: 'Minivolcanes de Pachapupum & Termas Medicinales',
      fullName: 'Marc Dupont',
      email: 'marc.dupont@voyage.fr',
      phone: '+33 612 345 678',
      numberOfPeople: 2,
      travelDate: '2026-10-28',
      message: 'Buscamos tour privado a las aguas termales de Sacsamarca y el cono de Pachapupum.',
      status: 'Confirmed',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      whatsAppDirectUrl: 'https://wa.me/33612345678?text=Bonjour%20Marc,%20Valle%20del%20Sondondo%20Expeditions.'
    }
  ];

  private initialMockMessages: AdminContactMessage[] = [
    {
      id: 1,
      name: 'Dr. Alejandro Vargas',
      email: 'avargas@uni.edu.pe',
      phone: '+51 955 888 777',
      subject: 'Expedición académica sobre andenes de Andamarca',
      message: 'Buenas tardes, deseamos coordinar una salida de campo para 12 estudiantes de arqueología e ingeniería agrícola en noviembre.',
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      isRead: false
    },
    {
      id: 2,
      name: 'Silvia Huamán',
      email: 'silvia.huaman@viajesperu.pe',
      phone: '+51 999 444 333',
      subject: 'Alianza turística para grupos receptivos',
      message: 'Nos gustaría ofrecer sus circuitos del Valle del Sondondo en nuestro catálogo de turismo rural comunitario en Lima.',
      createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
      isRead: true
    }
  ];

  // In-memory signals
  bookingsSignal = signal<AdminBooking[]>(this.loadStoredBookings());
  messagesSignal = signal<AdminContactMessage[]>(this.loadStoredMessages());

  private loadStoredBookings(): AdminBooking[] {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return this.initialMockBookings;
  }

  private saveBookings(bookings: AdminBooking[]): void {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {}
    this.bookingsSignal.set(bookings);
  }

  private loadStoredMessages(): AdminContactMessage[] {
    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return this.initialMockMessages;
  }

  private saveMessages(messages: AdminContactMessage[]): void {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    this.messagesSignal.set(messages);
  }

  // --- STATS ---
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`).pipe(
      catchError(() => {
        const bookings = this.bookingsSignal();
        const total = bookings.length;
        const pending = bookings.filter(b => b.status === 'Pending').length;
        const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
        const unread = this.messagesSignal().filter(m => !m.isRead).length;

        const stats: DashboardStats = {
          totalBookings: total,
          pendingBookings: pending,
          confirmedBookings: confirmed,
          activeTours: 6,
          totalTours: 6,
          unreadMessages: unread,
          recentBookings: bookings.slice(0, 5)
        };
        return of(stats);
      })
    );
  }

  // --- BOOKINGS ---
  getBookings(status?: string, search?: string): Observable<AdminBooking[]> {
    let url = `${this.apiUrl}/bookings`;
    const params: string[] = [];
    if (status && status !== 'all') params.push(`status=${encodeURIComponent(status)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<AdminBooking[]>(url).pipe(
      tap(items => this.saveBookings(items)),
      catchError(() => {
        let list = this.bookingsSignal();
        if (status && status !== 'all') {
          list = list.filter(b => b.status.toLowerCase() === status.toLowerCase());
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(b => b.fullName.toLowerCase().includes(s) || 
                                  b.phone.includes(s) || 
                                  b.tourTitle.toLowerCase().includes(s));
        }
        return of(list);
      })
    );
  }

  updateBookingStatus(id: number, status: 'Pending' | 'Contacted' | 'Confirmed' | 'Cancelled'): Observable<boolean> {
    return this.http.patch<any>(`${this.apiUrl}/bookings/${id}/status`, { status }).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        const updated = this.bookingsSignal().map(b => b.id === id ? { ...b, status } : b);
        this.saveBookings(updated);
      })
    );
  }

  deleteBooking(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/bookings/${id}`).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        const filtered = this.bookingsSignal().filter(b => b.id !== id);
        this.saveBookings(filtered);
      })
    );
  }

  private sanitizeAdminTour(tour: AdminTour): AdminTour {
    let img = tour.mainImageUrl;
    if (!img || img.includes('unsplash.com') || img.startsWith('http')) {
      const slug = (tour.slug || '').toLowerCase();
      const title = (tour.title || '').toLowerCase();
      if (slug.includes('condor') || title.includes('cóndor') || title.includes('condor') || slug.includes('mayobamba')) {
        img = '/assets/images/condor_mayobamba.jpg';
      } else if (slug.includes('andenes') || title.includes('andamarca') || title.includes('tijeras') || slug.includes('cultura')) {
        img = '/assets/images/andenes_andamarca.jpg';
      } else if (slug.includes('volcan') || slug.includes('pachapupum') || slug.includes('termal') || title.includes('termas') || title.includes('volcán')) {
        img = '/assets/images/volcan_pachapupum.jpg';
      } else if (slug.includes('qarhuarazo') || slug.includes('pampa') || slug.includes('galeras') || title.includes('qarhuarazo') || title.includes('vicuña')) {
        img = '/assets/images/pampa_galeras_vicunas.jpg';
      } else if (slug.includes('pueblo') || title.includes('pueblos') || title.includes('aucara') || title.includes('cabana') || title.includes('chipao')) {
        img = '/assets/images/pueblo_andamarca.jpg';
      } else {
        img = '/assets/images/hero_sondondo.jpg';
      }
    }
    return { ...tour, mainImageUrl: img };
  }

  // --- TOURS ---
  getTours(includeInactive = true): Observable<AdminTour[]> {
    return this.http.get<AdminTour[]>(`${this.apiUrl}/tours?includeInactive=${includeInactive}`).pipe(
      map(tours => tours.map(t => this.sanitizeAdminTour(t))),
      catchError(() => {
        // Fallback using stored tours or defaults
        try {
          const stored = localStorage.getItem(TOURS_STORAGE_KEY);
          if (stored) return of(JSON.parse(stored) as AdminTour[]);
        } catch {}

        const defaultTours: AdminTour[] = [
          {
            id: 1,
            title: 'Kuntur Ñan: El Vuelo del Cóndor en Mayobamba',
            slug: 'vuelo-del-condor-mayobamba',
            subtitle: 'Avistamiento a 6:30 a.m. en el Cañón de Mayobamba, Aucará',
            description: 'Presencia el vuelo majestuoso del cóndor andino desde miradores naturales en Mayobamba.',
            categoryId: 1,
            categoryName: 'Aventura & Naturaleza',
            duration: 'Full Day (8 horas)',
            durationDays: 1,
            priceSoles: 180,
            priceUsd: 48,
            difficulty: 'Moderada',
            altitudeMax: '3,450 msnm',
            startingPoint: 'Aucará / Puquio',
            featured: true,
            isActive: true,
            mainImageUrl: '/assets/images/condor_mayobamba.jpg',
            displayOrder: 1
          },
          {
            id: 2,
            title: 'Gran Circuito Andenes Vivos de Andamarca & Danza de Tijeras',
            slug: 'andenes-andamarca-danza-tijeras',
            subtitle: 'Patrimonio de la Humanidad UNESCO, ingeniería pre-Inca y mística andina',
            description: 'Caminata por el anfiteatro de andenes agrícolas más extenso del Perú y exhibición de danzaq tradicional.',
            categoryId: 2,
            categoryName: 'Cultura & Arqueología',
            duration: 'Full Day (9 horas)',
            durationDays: 1,
            priceSoles: 195,
            priceUsd: 52,
            difficulty: 'Fácil - Moderada',
            altitudeMax: '3,250 msnm',
            startingPoint: 'Andamarca',
            featured: true,
            isActive: true,
            mainImageUrl: '/assets/images/andenes_andamarca.jpg',
            displayOrder: 2
          },
          {
            id: 3,
            title: 'Minivolcanes de Pachapupum & Termas Medicinales',
            slug: 'volcan-pachapupum-termas',
            subtitle: 'Monumento geotermal de sal y azufre a 4,022 msnm en Sacsamarca',
            description: 'Visita el impresionante cono volcánico salino de 30 metros de altura y disfruta de sus pozas termales.',
            categoryId: 1,
            categoryName: 'Aventura & Naturaleza',
            duration: 'Full Day (10 horas)',
            durationDays: 1,
            priceSoles: 220,
            priceUsd: 59,
            difficulty: 'Moderada',
            altitudeMax: '4,022 msnm',
            startingPoint: 'Huancasancos / Sacsamarca',
            featured: true,
            isActive: true,
            mainImageUrl: '/assets/images/volcan_pachapupum.jpg',
            displayOrder: 3
          },
          {
            id: 4,
            title: 'Trek Pampa Galeras & Bofedales del Apu Qarhuarazo',
            slug: 'pampa-galeras-vicunas-apu-qarhuarazo',
            subtitle: 'Santuario de vicuñas silvestres y vistas al glaciar sagrado (5,112 msnm)',
            description: 'Safari andino por la Reserva Nacional Pampa Galeras y caminata hacia bofedales altoandinos.',
            categoryId: 1,
            categoryName: 'Aventura & Naturaleza',
            duration: 'Full Day (8 horas)',
            durationDays: 1,
            priceSoles: 210,
            priceUsd: 56,
            difficulty: 'Moderada - Exigente',
            altitudeMax: '4,100 msnm',
            startingPoint: 'Puquio / Lucanas',
            featured: false,
            isActive: true,
            mainImageUrl: '/assets/images/pampa_galeras_vicunas.jpg',
            displayOrder: 4
          },
          {
            id: 5,
            title: 'Ruta de los Pueblos Mágicos: Aucará, Cabana Sur & Chipao',
            slug: 'pueblos-magicos-aucara-cabana-chipao',
            subtitle: 'Templos coloniales de piedra, mirador Chauccalla y la ruta de Guamán Poma',
            description: 'Recorrido por la arquitectura colonial andina, plazas históricas e iglesias de piedra.',
            categoryId: 2,
            categoryName: 'Cultura & Arqueología',
            duration: 'Full Day (7 horas)',
            durationDays: 1,
            priceSoles: 160,
            priceUsd: 43,
            difficulty: 'Fácil',
            altitudeMax: '3,300 msnm',
            startingPoint: 'Aucará',
            featured: false,
            isActive: true,
            mainImageUrl: '/assets/images/pueblo_andamarca.jpg',
            displayOrder: 5
          },
          {
            id: 6,
            title: 'Gran Travesía Valle del Sondondo (3 Días / 2 Noches)',
            slug: 'gran-travesia-valle-sondondo-3d2n',
            subtitle: 'El viaje definitivo: Cóndores, Andenes, Volcán Pachapupum y Pampa Galeras',
            description: 'Expedición completa con transporte privado, guías locales quechuahablantes y hospedaje rural.',
            categoryId: 3,
            categoryName: 'Expediciones Completas',
            duration: '3 Días / 2 Noches',
            durationDays: 3,
            priceSoles: 680,
            priceUsd: 182,
            difficulty: 'Moderada',
            altitudeMax: '4,022 msnm',
            startingPoint: 'Puquio / Aucará',
            featured: true,
            isActive: true,
            mainImageUrl: '/assets/images/hero_sondondo.jpg',
            displayOrder: 6
          }
        ];
        return of(defaultTours);
      })
    );
  }

  toggleTourActive(id: number): Observable<boolean> {
    return this.http.patch<any>(`${this.apiUrl}/tours/${id}/toggle-active`, {}).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }

  saveTour(tour: AdminTour): Observable<AdminTour> {
    if (tour.id > 0) {
      return this.http.put<any>(`${this.apiUrl}/tours/${tour.id}`, tour).pipe(
        map(() => tour),
        catchError(() => of(tour))
      );
    } else {
      return this.http.post<any>(`${this.apiUrl}/tours`, tour).pipe(
        map(res => ({ ...tour, id: res.id || Date.now() })),
        catchError(() => of({ ...tour, id: Date.now() }))
      );
    }
  }

  deleteTour(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/tours/${id}`).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }

  // --- MESSAGES ---
  getContactMessages(): Observable<AdminContactMessage[]> {
    return this.http.get<AdminContactMessage[]>(`${this.apiUrl}/contact`).pipe(
      tap(items => this.saveMessages(items)),
      catchError(() => of(this.messagesSignal()))
    );
  }

  toggleMessageRead(id: number): Observable<boolean> {
    return this.http.patch<any>(`${this.apiUrl}/contact/${id}/read`, {}).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        const updated = this.messagesSignal().map(m => m.id === id ? { ...m, isRead: !m.isRead } : m);
        this.saveMessages(updated);
      })
    );
  }

  deleteMessage(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/contact/${id}`).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        const filtered = this.messagesSignal().filter(m => m.id !== id);
        this.saveMessages(filtered);
      })
    );
  }
}
