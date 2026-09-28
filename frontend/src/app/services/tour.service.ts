import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  TourSummary,
  TourDetail,
  Category,
  BookingInquiryRequest,
  BookingInquiryResponse,
  Testimonial,
  AgencyInfo
} from '../models/tour.model';
import {
  BOOKINGS_STORAGE_KEY,
  TOURS_STORAGE_KEY,
  MESSAGES_STORAGE_KEY,
  TESTIMONIALS_STORAGE_KEY
} from './admin.service';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private sanitizeTour<T extends TourSummary>(tour: T): T {
    let img = tour.mainImageUrl;
    if (img && (img.startsWith('data:image/') || img.startsWith('blob:'))) {
      return tour;
    }
    if (!img || img.includes('unsplash.com') || img.startsWith('http') || img.includes('oficial') || img.includes('qollpa') || img.includes('qochapampa') || img.includes('guaman') || img.includes('caniche')) {
      const slug = (tour.slug || '').toLowerCase();
      const title = (tour.title || '').toLowerCase();
      if (slug.includes('condor') || title.includes('cóndor') || title.includes('condor') || slug.includes('mayobamba')) {
        img = '/assets/images/condor_mayobamba.jpg';
      } else if (slug.includes('andenes') || title.includes('andamarca') || title.includes('tijeras') || title.includes('caniche')) {
        img = '/assets/images/andenes_andamarca.jpg';
      } else if (slug.includes('volcan') || slug.includes('pachapupum') || slug.includes('termal') || title.includes('termas') || slug.includes('qollpa')) {
        img = '/assets/images/volcan_pachapupum.jpg';
      } else if (slug.includes('qarhuarazo') || slug.includes('pampa') || slug.includes('galeras') || title.includes('qarhuarazo') || title.includes('vicuña')) {
        img = '/assets/images/pampa_galeras_vicunas.jpg';
      } else if (slug.includes('pueblo') || title.includes('pueblos') || title.includes('aucara') || title.includes('cabana') || title.includes('chipao') || slug.includes('guaman')) {
        img = '/assets/images/pueblo_andamarca.jpg';
      } else {
        img = '/assets/images/hero_sondondo.jpg';
      }
    }
    return { ...tour, mainImageUrl: img };
  }

  // Fallback initial data for instant loading
  private fallbackTours: TourSummary[] = [
    {
      id: 1,
      title: 'Kuntur Ñan: El Majestuoso Vuelo del Cóndor',
      slug: 'kuntur-nan-vuelo-del-condor',
      subtitle: 'Avistamiento de hasta 35 cóndores en Mayobamba y descenso al bebedero sagrado',
      categoryId: 1,
      categoryName: 'Ruta del Cóndor',
      categorySlug: 'ruta-condor',
      duration: 'Full Day',
      durationDays: 1,
      priceSoles: 140,
      priceUsd: 38,
      difficulty: 'Fácil a Moderado',
      altitudeMax: '3,200 msnm',
      startingPoint: 'Mayobamba / Andamarca, Lucanas, Ayacucho',
      featured: true,
      mainImageUrl: '/assets/images/condor_mayobamba.jpg'
    },
    {
      id: 2,
      title: 'Andenes Vivos de Andamarca, Caniche & Danza de Tijeras',
      slug: 'andenes-andamarca-danza-tijeras',
      subtitle: 'Colosal sistema agrícola preínca Huari e Inca, fortaleza de Caniche y ritual de tijeras',
      categoryId: 2,
      categoryName: 'Cultura Viva & Andenes',
      categorySlug: 'cultura-viva-andenes',
      duration: '2 Días / 1 Noche',
      durationDays: 2,
      priceSoles: 320,
      priceUsd: 88,
      difficulty: 'Fácil a Moderado',
      altitudeMax: '3,459 msnm',
      startingPoint: 'Plaza Mayor de Andamarca, Lucanas',
      featured: true,
      mainImageUrl: '/assets/images/andenes_andamarca.jpg'
    },
    {
      id: 3,
      title: 'Minivolcanes de Pachapupum & Termas Medicinales',
      slug: 'volcan-pachapupum-termas-mayobamba',
      subtitle: 'Monumento pétreo volcánico de sal y azufre a 4,022 msnm y pozas termomedicinales',
      categoryId: 3,
      categoryName: 'Aguas Termales & Cañones',
      categorySlug: 'aguas-termales-canones',
      duration: 'Full Day',
      durationDays: 1,
      priceSoles: 130,
      priceUsd: 36,
      difficulty: 'Fácil',
      altitudeMax: '4,022 msnm',
      startingPoint: 'Sacsamarca / Chipao, Lucanas',
      featured: false,
      mainImageUrl: '/assets/images/volcan_pachapupum.jpg'
    },
    {
      id: 4,
      title: 'Trek Pampa Galeras & Bofedales del Apu Qarhuarazo',
      slug: 'apu-qarhuarazo-pampa-galeras',
      subtitle: 'Travesía por la Reserva Nacional Pampa Galeras, manadas de vicuñas y nevado tutelar',
      categoryId: 4,
      categoryName: 'Alta Montaña & Vicuñas',
      categorySlug: 'alta-montana-vicunas',
      duration: '2 Días',
      durationDays: 2,
      priceSoles: 180,
      priceUsd: 49,
      difficulty: 'Exigente',
      altitudeMax: '4,800 msnm',
      startingPoint: 'Pampa Galeras / Lucanas, Ayacucho',
      featured: false,
      mainImageUrl: '/assets/images/pampa_galeras_vicunas.jpg'
    },
    {
      id: 5,
      title: 'Gran Travesía Valle del Sondondo: Ruta de la Mancomunidad',
      slug: 'gran-travesia-valle-del-sondondo',
      subtitle: 'Expedición completa por los seis distritos ancestrales de los Hurin Rukanas',
      categoryId: 2,
      categoryName: 'Mancomunidad Sondondo',
      categorySlug: 'mancomunidad-sondondo',
      duration: '4 Días / 3 Noches',
      durationDays: 4,
      priceSoles: 720,
      priceUsd: 195,
      difficulty: 'Moderado',
      altitudeMax: '3,459 msnm',
      startingPoint: 'Puquio / Nasca / Ayacucho',
      featured: true,
      mainImageUrl: '/assets/images/hero_sondondo.jpg'
    }
  ];

  private fallbackCategories: Category[] = [
    { id: 1, name: 'Ruta del Cóndor', slug: 'ruta-condor', description: 'Avistamiento de cóndores en Mayobamba', icon: 'feather', displayOrder: 1, toursCount: 1 },
    { id: 2, name: 'Andenes & Danza', slug: 'cultura-viva-andenes', description: 'Terrazas de Andamarca y Danzantes de Tijeras', icon: 'compass', displayOrder: 2, toursCount: 1 },
    { id: 3, name: 'Aguas Termales', slug: 'aguas-termales-volcanes', description: 'Volcán Pachapupum y baños medicinales', icon: 'droplets', displayOrder: 3, toursCount: 1 },
    { id: 4, name: 'Pampa Galeras', slug: 'alta-montana-vicunas', description: 'Reserva de vicuñas y Apu Qarhuarazo', icon: 'mountain', displayOrder: 4, toursCount: 1 },
    { id: 5, name: 'Pueblos Vivos', slug: 'pueblos-historicos', description: 'Aucará, Cabana Sur, Chipao y Guamán Poma', icon: 'compass', displayOrder: 5, toursCount: 1 },
    { id: 6, name: 'Circuito 3 Días', slug: 'expedicion-integral', description: 'La expedición completa por todo el valle', icon: 'map', displayOrder: 6, toursCount: 1 }
  ];

  getTours(category?: string, featured?: boolean, search?: string): Observable<TourSummary[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (featured !== undefined) params = params.set('featured', featured);
    if (search) params = params.set('search', search);

    return this.http.get<TourSummary[]>(`${this.apiUrl}/tours`, { params }).pipe(
      map(tours => tours.map(t => this.sanitizeTour(t))),
      catchError(() => {
        let allTours: TourSummary[] = [];
        try {
          const stored = localStorage.getItem(TOURS_STORAGE_KEY);
          if (stored) {
            allTours = JSON.parse(stored);
          }
        } catch {}
        if (!allTours || allTours.length === 0) {
          allTours = [...this.fallbackTours];
        }

        // Filter out hidden/paused tours
        let filtered = allTours.filter(t => t.isActive !== false);

        if (category) filtered = filtered.filter(t => t.categorySlug === category);
        if (featured !== undefined) filtered = filtered.filter(t => t.featured === featured);
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(t => (t.title && t.title.toLowerCase().includes(s)) || (t.subtitle && t.subtitle.toLowerCase().includes(s)));
        }
        return of(filtered.map(t => this.sanitizeTour(t)));
      })
    );
  }

  getTourBySlug(slug: string): Observable<TourDetail> {
    return this.http.get<TourDetail>(`${this.apiUrl}/tours/${slug}`).pipe(
      map(detail => {
        const sanitized = this.sanitizeTour(detail);
        let gallery = sanitized.galleryImages || [];
        if (gallery.length === 0 || gallery.some(g => !g || g.includes('unsplash.com') || g.startsWith('http'))) {
          gallery = [
            sanitized.mainImageUrl,
            '/assets/images/andenes_andamarca.jpg',
            '/assets/images/pueblo_andamarca.jpg',
            '/assets/images/bosque_piedras.jpg',
            '/assets/images/rio_sondondo.jpg'
          ];
        }
        return {
          ...sanitized,
          galleryImages: gallery
        };
      }),
      catchError(() => {
        let allTours: any[] = [];
        try {
          const stored = localStorage.getItem(TOURS_STORAGE_KEY);
          if (stored) allTours = JSON.parse(stored);
        } catch {}
        if (!allTours || allTours.length === 0) {
          allTours = [...this.fallbackTours];
        }

        const item = allTours.find((t: any) => t.slug === slug) || allTours[0] || this.fallbackTours[0];
        const is3Days = item.durationDays === 3;
        const detail: TourDetail = {
          ...item,
          description: item.description || `Explora ${item.title} en el corazón del Valle del Sondondo (Lucanas, Ayacucho) con guías locales nativos, conocimiento ancestral de las rutas prehispánicas y respeto total por las comunidades campesinas.`,
          galleryImages: (item.galleryImages && item.galleryImages.length > 0) ? item.galleryImages : [
            item.mainImageUrl || '/assets/images/hero_sondondo.jpg',
            '/assets/images/andenes_andamarca.jpg',
            '/assets/images/pueblo_andamarca.jpg',
            '/assets/images/bosque_piedras.jpg',
            '/assets/images/rio_sondondo.jpg'
          ],
          included: [
            'Transporte turístico privado ida y vuelta desde Ayacucho / Puquio',
            'Guía oficial y baquianos locales nacidos en el Valle del Sondondo',
            'Entradas a todos los miradores, zonas arqueológicas y baños termales',
            'Alimentación con productos locales andinos de la cuenca',
            'Noche cultural y conversatorio sobre mitos, leyendas y Danza de Tijeras',
            'Botiquín de primeros auxilios y asistencia permanente'
          ],
          notIncluded: [
            'Gastos personales y compras de artesanías',
            'Propinas voluntarias para guías y arrieros locales'
          ],
          recommendations: [
            'Ropa abrigadora para la noche y mañanas en altura',
            'Calzado cómodo de trekking con buen agarre',
            'Bloqueador solar, sombrero de ala ancha y lentes con protección UV',
            'Botella reutilizable para agua',
            'Cámara fotográfica o binoculares para avistamiento de aves'
          ],
          itineraries: is3Days ? [
            {
              id: 1,
              dayNumber: 1,
              title: 'Día 1: Ayacucho / Huancasancos - Volcán Pachapupum - Andamarca',
              description: 'Salida temprana hacia el cañón y catarata Wiskiri. Visita al volcán pétreo de Pachapupum (4,022 msnm), baño en pozas termomedicinales y llegada a Andamarca.',
              activities: 'Visita geológica a Pachapupum, termalismo andino y acomodación en Andamarca.',
              meals: 'Desayuno andino, almuerzo campestre y cena.',
              accommodation: 'Hospedaje rural en Andamarca.'
            },
            {
              id: 2,
              dayNumber: 2,
              title: 'Día 2: Andenerías de Andamarca, Sitio Arqueológico de Kanichi & Aucará',
              description: 'Recorrido por el anfiteatro de andenes vivos de Waylla y Aya Urqu, sitio arqueológico de Kanichi Antamarkas, pueblo de Cabana Sur, casa de Felipe Guamán Poma de Ayala en Sondondo y laguna Ccochapampa en Aucará.',
              activities: 'Caminata entre terrazas prehispánicas, interpretación histórica y demostración de Danza de Tijeras.',
              meals: 'Desayuno, almuerzo típico y cena con fogata cultural.',
              accommodation: 'Hospedaje rural en Andamarca.'
            },
            {
              id: 3,
              dayNumber: 3,
              title: 'Día 3: Mirador de Cóndores Mayobamba, Bosque de Piedras, Chipao & Retorno',
              description: 'Avistamiento de cóndores en Mayobamba (6:30 - 8:30 am), recorrido por el bosque de piedras de Julián Cuaresma, minivolcanes de Villa San José, arte topiario en Chipao y retorno a Ayacucho o Puquio.',
              activities: 'Avistamiento del Cóndor Andino en vuelo, fotografía y retorno.',
              meals: 'Desayuno con vista al cañón y almuerzo regional.',
              accommodation: 'Fin de los servicios.'
            }
          ] : [
            {
              id: 1,
              dayNumber: 1,
              title: 'Encuentro e inicio de la expedición en Valle del Sondondo',
              description: 'Recepción en el punto de encuentro, charla de contextualización cultural y recorrido por los atractivos emblemáticos del circuito.',
              activities: 'Recorrido guiado, fotografía paisajística e interacción con la comunidad local.',
              meals: 'Refrigerio andino o almuerzo típico según programa.',
              accommodation: 'Retorno o alojamiento local según paquete.'
            }
          ]
        };
        return of(detail);
      })
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      catchError(() => of(this.fallbackCategories))
    );
  }

  getTestimonials(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(`${this.apiUrl}/testimonials`).pipe(
      catchError(() => {
        try {
          const stored = localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
          if (stored) {
            const list = JSON.parse(stored) as any[];
            const approved = list.filter(t => t.isApproved).map(t => ({
              id: t.id,
              authorName: t.authorName || t.author || 'Viajero',
              location: t.location || 'Perú',
              rating: t.rating || 5,
              comment: t.comment || t.content || '',
              tourName: t.tourName || 'Valle del Sondondo',
              avatarUrl: t.avatarUrl,
              date: t.date || '2026-08'
            }));
            if (approved.length > 0) return of(approved);
          }
        } catch {}

        return of([
          {
            id: 1,
            authorName: 'Lucía Mendoza',
            location: 'Lima, Perú',
            rating: 5,
            comment: 'Ver más de 20 cóndores volar a pocos metros en el mirador de Mayobamba fue una experiencia espiritual inigualable. Los guías locales de Andamarca conocen la cuenca como nadie.',
            tourName: 'Kuntur Ñan: El Vuelo del Cóndor',
            date: '2026-08-15'
          },
          {
            id: 2,
            authorName: 'Carlos Restrepo',
            location: 'Medellín, Colombia',
            rating: 5,
            comment: 'Los andenes vivos de Andamarca superan con creces lo que uno imagina. La gastronomía tradicional y la danza de tijeras en la plaza nos dejaron sin palabras.',
            tourName: 'Gran Circuito Andenes Vivos de Andamarca',
            date: '2026-07-22'
          },
          {
            id: 3,
            authorName: 'Sophie Dubois',
            location: 'Lyon, Francia',
            rating: 5,
            comment: 'El volcán de sal y azufre de Pachapupum es una joya geológica desconocida por el turismo masivo. Excelente organización y respeto total a la comunidad.',
            tourName: 'Minivolcanes de Pachapupum & Termas Medicinales',
            date: '2026-06-30'
          }
        ]);
      })
    );
  }

  getAgencyInfo(): Observable<AgencyInfo> {
    return this.http.get<AgencyInfo>(`${this.apiUrl}/agency`).pipe(
      catchError(() => of({
        name: environment.agencyName,
        whatsappNumber: environment.fallbackWhatsApp,
        phoneNumber: environment.agencyPhone,
        email: environment.agencyEmail,
        address: environment.agencyAddress,
        safeTravelsCertified: true,
        facebookUrl: 'https://www.facebook.com/valledelsondondoexpeditions',
        instagramUrl: 'https://www.instagram.com/valledelsondondoexpeditions'
      }))
    );
  }

  createBooking(data: BookingInquiryRequest): Observable<BookingInquiryResponse> {
    const phone = environment.fallbackWhatsApp;
    const bookingCode = 'VSE-2026-' + Math.floor(1000 + Math.random() * 9000);

    // Resolve tour title and price
    let tourTitle = 'Consulta de Expedición';
    let tourPrice = 180;
    try {
      const stored = localStorage.getItem(TOURS_STORAGE_KEY);
      const tours = stored ? JSON.parse(stored) : this.fallbackTours;
      const found = tours.find((t: any) => t.id === data.tourId);
      if (found) {
        tourTitle = found.title;
        tourPrice = found.priceSoles || 180;
      }
    } catch {}

    const totalAmount = tourPrice * (data.numberOfPeople || 1);

    const msg = encodeURIComponent(
      `¡Hola Valle del Sondondo Expeditions! 👋\nMi nombre es *${data.fullName}* y deseo reservar el tour: *${tourTitle}*.\n🎫 Código: ${bookingCode}\n👥 Personas: ${data.numberOfPeople}\n📅 Fecha: ${data.travelDate || 'Por coordinar'}\n📱 Teléfono: ${data.phone}\n${data.message ? '💬 Mensaje: ' + data.message : ''}`
    );

    const newBooking: any = {
      id: Date.now(),
      voucherCode: bookingCode,
      tourId: data.tourId || 1,
      tourTitle: tourTitle,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      numberOfPeople: data.numberOfPeople || 1,
      travelDate: data.travelDate || new Date().toISOString().split('T')[0],
      message: data.message || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      whatsAppDirectUrl: `https://wa.me/${phone}?text=${msg}`,
      paymentMethod: 'Pendiente',
      paymentStatus: 'Pendiente',
      totalAmount: totalAmount,
      paidAmount: 0,
      passengers: [
        {
          id: 'p-1',
          fullName: data.fullName,
          documentType: 'DNI',
          documentNumber: '',
          nationality: 'Peruana',
          age: 30,
          emergencyPhone: data.phone
        }
      ]
    };

    // Store in shared bookings cache for admin panel
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newBooking);
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save booking to shared storage', e);
    }

    return this.http.post<BookingInquiryResponse>(`${this.apiUrl}/bookings`, data).pipe(
      catchError(() => {
        return of({
          id: newBooking.id,
          fullName: data.fullName,
          tourTitle: tourTitle,
          status: 'Pending',
          createdAt: newBooking.createdAt,
          whatsAppDirectUrl: newBooking.whatsAppDirectUrl
        });
      })
    );
  }

  sendContactMessage(data: any): Observable<{ success: boolean; message: string }> {
    const newMsg: any = {
      id: Date.now(),
      fullName: data.fullName || data.name || 'Viajero',
      email: data.email,
      phone: data.phone || '',
      subject: data.subject || 'Consulta Turística Web',
      message: data.message || '',
      createdAt: new Date().toISOString(),
      isRead: false
    };

    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newMsg);
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save message to shared storage', e);
    }

    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/contact`, data).pipe(
      catchError(() => of({
        success: true,
        message: '¡Gracias por comunicarte con nosotros! Te responderemos muy pronto.'
      }))
    );
  }
}
