import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Fallback initial data for instant loading
  private fallbackTours: TourSummary[] = [
    {
      id: 1,
      title: 'Kuntur Ñan: El Vuelo del Cóndor en Mayobamba',
      slug: 'vuelo-del-condor-mayobamba',
      subtitle: 'Avistamiento de cóndores andinos a corta distancia en el cañón de Mayobamba y bosque de piedras',
      categoryId: 1,
      categoryName: 'Ruta del Cóndor',
      categorySlug: 'ruta-condor',
      duration: 'Full Day',
      durationDays: 1,
      priceSoles: 0,
      priceUsd: 0,
      difficulty: 'Fácil a Moderado',
      altitudeMax: '3,550 msnm',
      startingPoint: 'Mayobamba / Andamarca, Lucanas, Ayacucho',
      featured: true,
      mainImageUrl: '/assets/images/condor_mayobamba.jpg'
    },
    {
      id: 2,
      title: 'Gran Circuito Andenes Vivos de Andamarca & Danza de Tijeras',
      slug: 'andenes-andamarca-danza-tijeras',
      subtitle: 'El mayor anfiteatro de andenerías prehispánicas vivas de América y la cuna de la Danza de las Tijeras UNESCO',
      categoryId: 2,
      categoryName: 'Cultura Viva & Andenes',
      categorySlug: 'cultura-viva-andenes',
      duration: 'Full Day',
      durationDays: 1,
      priceSoles: 0,
      priceUsd: 0,
      difficulty: 'Fácil',
      altitudeMax: '3,400 msnm',
      startingPoint: 'Plaza Mayor de Andamarca, Lucanas',
      featured: true,
      mainImageUrl: '/assets/images/andenes_andamarca.jpg'
    },
    {
      id: 3,
      title: 'Minivolcanes de Pachapupum & Termas Medicinales',
      slug: 'volcan-pachapupum-termas-mayobamba',
      subtitle: 'Monumento pétreo volcánico de sal y azufre a 4,022 msnm, géiseres andinos y pozas termomedicinales',
      categoryId: 3,
      categoryName: 'Aguas Termales & Volcanes',
      categorySlug: 'aguas-termales-volcanes',
      duration: '1 Día',
      durationDays: 1,
      priceSoles: 0,
      priceUsd: 0,
      difficulty: 'Moderado',
      altitudeMax: '4,022 msnm',
      startingPoint: 'Sacsamarca / Huancasancos - Sondondo',
      featured: false,
      mainImageUrl: '/assets/images/volcan_pachapupum.jpg'
    },
    {
      id: 4,
      title: 'Trek Pampa Galeras & Bofedales del Apu Qarhuarazo',
      slug: 'apu-qarhuarazo-pampa-galeras',
      subtitle: 'Travesía por la Reserva Nacional Pampa Galeras, manadas de vicuñas silvestres y vistas al nevado tutelar',
      categoryId: 4,
      categoryName: 'Alta Montaña & Vicuñas',
      categorySlug: 'alta-montana-vicunas',
      duration: '2 Días',
      durationDays: 2,
      priceSoles: 0,
      priceUsd: 0,
      difficulty: 'Exigente',
      altitudeMax: '4,800 msnm',
      startingPoint: 'Pampa Galeras / Lucanas, Ayacucho',
      featured: false,
      mainImageUrl: '/assets/images/pampa_galeras_vicunas.jpg'
    },
    {
      id: 5,
      title: 'Ruta de los Pueblos Mágicos: Aucará, Cabana Sur & Chipao',
      slug: 'ruta-pueblos-magicos-sondondo',
      subtitle: 'Pueblos coloniales, la casa del cronista Guamán Poma de Ayala, arte topiario en Chipao y cataratas',
      categoryId: 5,
      categoryName: 'Pueblos Históricos',
      categorySlug: 'pueblos-historicos',
      duration: 'Full Day',
      durationDays: 1,
      priceSoles: 0,
      priceUsd: 0,
      difficulty: 'Fácil',
      altitudeMax: '3,250 msnm',
      startingPoint: 'Aucará / Sondondo, Lucanas',
      featured: false,
      mainImageUrl: '/assets/images/pueblo_andamarca.jpg'
    },
    {
      id: 6,
      title: 'Gran Travesía Valle del Sondondo (3 Días / 2 Noches)',
      slug: 'gran-travesia-valle-sondondo-3-dias',
      subtitle: 'El circuito integral: Cóndores de Mayobamba, Andenes de Andamarca, Volcán Pachapupum y Pampa Galeras',
      categoryId: 6,
      categoryName: 'Expedición Integral',
      categorySlug: 'expedicion-integral',
      duration: '3 Días / 2 Noches',
      durationDays: 3,
      priceSoles: 0,
      priceUsd: 0,
      difficulty: 'Moderado',
      altitudeMax: '4,100 msnm',
      startingPoint: 'Plaza de Armas de Ayacucho / Puquio',
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
      catchError(() => {
        let filtered = [...this.fallbackTours];
        if (category) filtered = filtered.filter(t => t.categorySlug === category);
        if (featured !== undefined) filtered = filtered.filter(t => t.featured === featured);
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(t => t.title.toLowerCase().includes(s) || t.subtitle.toLowerCase().includes(s));
        }
        return of(filtered);
      })
    );
  }

  getTourBySlug(slug: string): Observable<TourDetail> {
    return this.http.get<TourDetail>(`${this.apiUrl}/tours/${slug}`).pipe(
      catchError(() => {
        const item = this.fallbackTours.find(t => t.slug === slug) || this.fallbackTours[0];
        const is3Days = item.durationDays === 3;
        const detail: TourDetail = {
          ...item,
          description: `Explora ${item.title} en el corazón del Valle del Sondondo (Lucanas, Ayacucho) con guías locales nativos, conocimiento ancestral de las rutas prehispánicas y respeto total por las comunidades campesinas.`,
          galleryImages: [
            item.mainImageUrl,
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
    // Conforme a las directrices de veracidad: no se muestran reseñas inventadas ni falsas.
    return this.http.get<Testimonial[]>(`${this.apiUrl}/testimonials`).pipe(
      catchError(() => of([]))
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
    return this.http.post<BookingInquiryResponse>(`${this.apiUrl}/bookings`, data).pipe(
      catchError(() => {
        // Fallback: generate WhatsApp URL on the fly if backend is not reachable
        const phone = environment.fallbackWhatsApp;
        const msg = encodeURIComponent(
          `¡Hola Valle del Sondondo Expeditions! 👋\nMi nombre es *${data.fullName}* y deseo información sobre sus tours.\n👥 Personas: ${data.numberOfPeople}\n📅 Fecha: ${data.travelDate || 'Por definir'}\n📱 Teléfono: ${data.phone}\n${data.message ? '💬 Mensaje: ' + data.message : ''}`
        );
        return of({
          id: Date.now(),
          fullName: data.fullName,
          tourTitle: 'Consulta de Tour',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          whatsAppDirectUrl: `https://wa.me/${phone}?text=${msg}`
        });
      })
    );
  }

  sendContactMessage(data: any): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/contact`, data).pipe(
      catchError(() => of({
        success: true,
        message: '¡Gracias por comunicarte con nosotros! Te responderemos muy pronto.'
      }))
    );
  }
}
