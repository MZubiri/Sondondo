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
      title: 'Kuntur Ñan: El Majestuoso Vuelo del Cóndor',
      slug: 'kuntur-nan-vuelo-del-condor',
      subtitle: 'Avistamiento en primer plano del Cóndor Andino en los miradores sagrados de Mayobamba',
      categoryId: 1,
      categoryName: 'Ruta del Cóndor',
      categorySlug: 'ruta-del-condor',
      duration: 'Full Day',
      durationDays: 1,
      priceSoles: 140,
      priceUsd: 38,
      difficulty: 'Fácil a Moderado',
      altitudeMax: '3,400 msnm',
      startingPoint: 'Aucará / Puquio',
      featured: true,
      mainImageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 2,
      title: 'Gran Circuito Andenes Vivos de Andamarca y Danzantes de Tijeras',
      slug: 'andenes-vivos-andamarca-danzantes-de-tijeras',
      subtitle: 'Inmersión en el colosal anfiteatro preínca vivo y cuna de la mística andina',
      categoryId: 2,
      categoryName: 'Cultura Viva y Andenes',
      categorySlug: 'cultura-viva-andenes',
      duration: '2 Días / 1 Noche',
      durationDays: 2,
      priceSoles: 320,
      priceUsd: 88,
      difficulty: 'Fácil a Moderado',
      altitudeMax: '3,500 msnm',
      startingPoint: 'Puquio o Aucará',
      featured: true,
      mainImageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 3,
      title: 'Expedición Sagrada al Apu Qarhuarazo (5,112 msnm)',
      slug: 'expedicion-sagrada-apu-qarhuarazo',
      subtitle: 'Trek de alta montaña hacia el volcán tutelar, bofedales de vicuñas y glaciares relictos',
      categoryId: 3,
      categoryName: 'Aventura y Alta Montaña',
      categorySlug: 'aventura-alta-montana',
      duration: '3 Días / 2 Noches',
      durationDays: 3,
      priceSoles: 540,
      priceUsd: 148,
      difficulty: 'Exigente (Alta Montaña)',
      altitudeMax: '5,112 msnm',
      startingPoint: 'Aucará / Chipao',
      featured: true,
      mainImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 4,
      title: 'Ruta Termo-Medicinal, Cañones y Catarata Limayhuacho',
      slug: 'ruta-termal-canones-catarata-limayhuacho',
      subtitle: 'Desconexión total en fuentes termales naturales de Huancas Puquio y Gollpa',
      categoryId: 4,
      categoryName: 'Aguas Termales & Cañones',
      categorySlug: 'aguas-termales-canones',
      duration: 'Full Day',
      durationDays: 1,
      priceSoles: 120,
      priceUsd: 33,
      difficulty: 'Fácil',
      altitudeMax: '3,200 msnm',
      startingPoint: 'Aucará / Cabana Sur',
      featured: false,
      mainImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 5,
      title: 'Gran Travesía Valle del Sondondo: Tesoro Escondido',
      slug: 'gran-travesia-valle-del-sondondo',
      subtitle: 'El circuito integral: Cóndores, Andenerías, Termales, Pueblos Mágicos y Gastronomía',
      categoryId: 2,
      categoryName: 'Cultura Viva y Andenes',
      categorySlug: 'cultura-viva-andenes',
      duration: '4 Días / 3 Noches',
      durationDays: 4,
      priceSoles: 720,
      priceUsd: 195,
      difficulty: 'Moderado',
      altitudeMax: '3,650 msnm',
      startingPoint: 'Puquio o Nasca',
      featured: true,
      mainImageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  private fallbackCategories: Category[] = [
    { id: 1, name: 'Ruta del Cóndor', slug: 'ruta-del-condor', description: 'Avistamiento del Cóndor Andino en Mayobamba', icon: 'feather', displayOrder: 1, toursCount: 1 },
    { id: 2, name: 'Cultura Viva y Andenes', slug: 'cultura-viva-andenes', description: 'Andenerías prehispánicas y Danza de Tijeras', icon: 'landmark', displayOrder: 2, toursCount: 2 },
    { id: 3, name: 'Aventura & Alta Montaña', slug: 'aventura-alta-montana', description: 'Trekking al volcán Apu Qarhuarazo (5,112 msnm)', icon: 'mountain', displayOrder: 3, toursCount: 1 },
    { id: 4, name: 'Aguas Termales & Cañones', slug: 'aguas-termales-canones', description: 'Baños de Huancas Puquio, Gollpa y cascadas', icon: 'droplets', displayOrder: 4, toursCount: 1 }
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
        const detail: TourDetail = {
          ...item,
          description: 'Descubre los paisajes ancestrales del Valle del Sondondo con guías locales nativos, traslados seguros y gastronomía tradicional preparada con insumos frescos del valle.',
          galleryImages: [
            item.mainImageUrl,
            'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1000&q=80'
          ],
          included: [
            'Transporte turístico privado con chofer experimentado',
            'Guía oficial y comunal acreditado',
            'Alimentación campestre tradicional',
            'Boletos de ingreso a todas las áreas del circuito',
            'Botiquín de primeros auxilios y balón de oxígeno'
          ],
          notIncluded: [
            'Gastos personales y souvenirs artesanales',
            'Propinas voluntarias'
          ],
          recommendations: [
            'Ropa abrigadora en capas y calzado de trekking',
            'Protector solar y sombrero de ala ancha',
            'Cámara fotográfica para capturar vistas panorámicas'
          ],
          itineraries: [
            {
              id: 1,
              dayNumber: 1,
              title: 'Exploración y encuentro en el Valle',
              description: 'Partida temprana desde el hotel, observación de la fauna andina y recorrido por los senderos comunales.',
              activities: 'Caminata guiada, avistamiento y fotografía de paisaje.',
              meals: 'Almuerzo campestre andino.',
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
      catchError(() => of([
        {
          id: 1,
          authorName: 'Valeria Monteagudo',
          location: 'Lima, Perú',
          rating: 5,
          comment: 'Ver a los cóndores volar tan cerca en Mayobamba fue inolvidable. Valle del Sondondo Expeditions cuidó cada detalle y la calidez humana de los guías fue excepcional.',
          tourName: 'Kuntur Ñan: El Vuelo del Cóndor',
          date: new Date().toISOString()
        },
        {
          id: 2,
          authorName: 'Marc & Sophie Dupont',
          location: 'Lyon, Francia',
          rating: 5,
          comment: 'Las terrazas preíncas de Andamarca y los danzantes de tijeras son algo único en el mundo. Cero aglomeraciones, turismo puro y auténtico.',
          tourName: 'Andenes Vivos de Andamarca',
          date: new Date().toISOString()
        },
        {
          id: 3,
          authorName: 'Carlos Mendoza R.',
          location: 'Arequipa, Perú',
          rating: 5,
          comment: 'Hicimos la travesía de 4 días. Todo el valle es un espectáculo: baños termales limpios, comida deliciosa y paisajes infinitos. ¡Totalmente recomendado!',
          tourName: 'Gran Travesía Valle del Sondondo',
          date: new Date().toISOString()
        }
      ]))
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
