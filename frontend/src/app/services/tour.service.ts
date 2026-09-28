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
    return { 
      ...tour, 
      isActive: tour.isActive !== false,
      mainImageUrl: img 
    };
  }

  // Canonical tours catalog with synchronized slugs
  private fallbackTours: TourSummary[] = [
    {
      id: 1,
      title: 'Kuntur Ñan: El Vuelo del Cóndor en Mayobamba',
      slug: 'vuelo-del-condor-mayobamba',
      subtitle: 'Avistamiento a 6:30 a.m. en el Cañón de Mayobamba, Aucará',
      categoryId: 1,
      categoryName: 'Ruta del Cóndor',
      categorySlug: 'ruta-condor',
      duration: 'Full Day (8 horas)',
      durationDays: 1,
      priceSoles: 180,
      priceUsd: 48,
      difficulty: 'Moderada',
      altitudeMax: '3,450 msnm',
      startingPoint: 'Aucará / Puquio',
      featured: true,
      isActive: true,
      mainImageUrl: '/assets/images/condor_mayobamba.jpg'
    },
    {
      id: 2,
      title: 'Gran Circuito Andenes Vivos de Andamarca & Danza de Tijeras',
      slug: 'andenes-andamarca-danza-tijeras',
      subtitle: 'Patrimonio de la Humanidad UNESCO, ingeniería pre-Inca y mística andina',
      categoryId: 2,
      categoryName: 'Cultura Viva & Andenes',
      categorySlug: 'cultura-viva-andenes',
      duration: '2 Días / 1 Noche',
      durationDays: 2,
      priceSoles: 320,
      priceUsd: 88,
      difficulty: 'Fácil - Moderada',
      altitudeMax: '3,459 msnm',
      startingPoint: 'Carmen Salcedo de Andamarca',
      featured: true,
      isActive: true,
      mainImageUrl: '/assets/images/andenes_andamarca.jpg'
    },
    {
      id: 3,
      title: 'Minivolcanes de Pachapupum & Termas Medicinales',
      slug: 'volcan-pachapupum-termas',
      subtitle: 'Monumento geotermal de sal y azufre a 4,022 msnm en Sacsamarca',
      categoryId: 3,
      categoryName: 'Aguas Termales & Cañones',
      categorySlug: 'aguas-termales-canones',
      duration: 'Full Day (10 horas)',
      durationDays: 1,
      priceSoles: 220,
      priceUsd: 59,
      difficulty: 'Moderada',
      altitudeMax: '4,022 msnm',
      startingPoint: 'Huancasancos / Sacsamarca',
      featured: false,
      isActive: true,
      mainImageUrl: '/assets/images/volcan_pachapupum.jpg'
    },
    {
      id: 4,
      title: 'Trek Pampa Galeras & Bofedales del Apu Qarhuarazo',
      slug: 'pampa-galeras-vicunas-apu-qarhuarazo',
      subtitle: 'Santuario de vicuñas silvestres y vistas al glaciar sagrado (5,112 msnm)',
      categoryId: 4,
      categoryName: 'Alta Montaña & Vicuñas',
      categorySlug: 'alta-montana-vicunas',
      duration: '2 Días / 1 Noche',
      durationDays: 2,
      priceSoles: 280,
      priceUsd: 75,
      difficulty: 'Moderada - Exigente',
      altitudeMax: '4,800 msnm',
      startingPoint: 'Puquio / Lucanas',
      featured: false,
      isActive: true,
      mainImageUrl: '/assets/images/pampa_galeras_vicunas.jpg'
    },
    {
      id: 5,
      title: 'Ruta de los Pueblos Mágicos: Aucará, Cabana Sur & Chipao',
      slug: 'pueblos-magicos-aucara-cabana-chipao',
      subtitle: 'Templos coloniales de piedra, mirador Chauccalla y la ruta de Guamán Poma',
      categoryId: 5,
      categoryName: 'Pueblos Vivos',
      categorySlug: 'pueblos-historicos',
      duration: 'Full Day (7 horas)',
      durationDays: 1,
      priceSoles: 160,
      priceUsd: 43,
      difficulty: 'Fácil',
      altitudeMax: '3,300 msnm',
      startingPoint: 'Aucará / Sondondo',
      featured: false,
      isActive: true,
      mainImageUrl: '/assets/images/pueblo_andamarca.jpg'
    },
    {
      id: 6,
      title: 'Gran Travesía Valle del Sondondo (3 Días / 2 Noches)',
      slug: 'gran-travesia-valle-sondondo-3d2n',
      subtitle: 'El viaje definitivo: Cóndores, Andenes, Volcán Pachapupum y Pampa Galeras',
      categoryId: 6,
      categoryName: 'Circuito 3 Días',
      categorySlug: 'expedicion-integral',
      duration: '3 Días / 2 Noches',
      durationDays: 3,
      priceSoles: 680,
      priceUsd: 182,
      difficulty: 'Moderada',
      altitudeMax: '4,022 msnm',
      startingPoint: 'Puquio / Aucará',
      featured: true,
      isActive: true,
      mainImageUrl: '/assets/images/hero_sondondo.jpg'
    }
  ];

  // Catálogo completo de itinerarios auténticos por cada tour
  private detailedCatalogById: Record<number, {
    description: string;
    galleryImages: string[];
    included: string[];
    notIncluded: string[];
    recommendations: string[];
    itineraries: any[];
  }> = {
    1: {
      description: 'Vive una experiencia sobrecogedora en el mirador de Mayobamba (3,450 msnm), el punto más privilegiado del Perú para la observación del Cóndor Andino (Apu Huamaní) en libertad. Al alba, contempla el despegue de más de 20 cóndores planeando en las corrientes térmicas ascendentes del cañón a escasos metros de distancia, guiado por baquianos quechuas de Aucará con respeto total por la avifauna.',
      galleryImages: [
        '/assets/images/condor_mayobamba.jpg',
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/bosque_piedras.jpg',
        '/assets/images/rio_sondondo.jpg',
        '/assets/images/pueblo_andamarca.jpg'
      ],
      included: [
        'Transporte turístico privado ida y vuelta desde punto de encuentro',
        'Guía oficial local especializado en avifauna andina',
        'Préstamo de binoculares de alta definición para avistamiento',
        'Desayuno andino campestre con mate caliente de muña y coca',
        'Almuerzo típico con trucha fresca del río Sondondo',
        'Botiquín de primeros auxilios y balón de oxígeno medicinal',
        'Tickets de acceso a miradores comunales'
      ],
      notIncluded: [
        'Gastos y compras personales de artesanías',
        'Propinas voluntarias para el guía y conductor'
      ],
      recommendations: [
        'Llegar abrigado en capas para la madrugada (polar, cortaviento, guantes)',
        'Calzado de trekking con suela antideslizante',
        'Cámara fotográfica con teleobjetivo o zoom óptico',
        'Lentes con protección UV y bloqueador solar'
      ],
      itineraries: [
        {
          id: 101,
          dayNumber: 1,
          title: '05:30 AM - Salida hacia el Cañón de Mayobamba & Avistamiento del Cóndor Andino',
          description: 'Salida de madrugada hacia el mirador natural de Mayobamba (Aucará). A partir de las 6:30 AM observaremos el despertar y vuelo circular de más de 20 cóndores andinos sobre las térmicas del cañón. Caminata guiada por el borde del precipicio hacia el bebedero ancestral de las aves y charla sobre conservación comunitaria.',
          activities: 'Avistamiento de cóndores andinos con binoculares ópticos, fotografía de paisaje y avifauna, descenso guiado a miradores intermedios.',
          meals: 'Desayuno campestre con mate caliente de muña y coca, almuerzo tradicional andino con trucha de río.',
          accommodation: 'Retorno a Aucará / Puquio al finalizar la tarde.'
        }
      ]
    },
    2: {
      description: 'Sumérgete en el sistema agrícola vivo más impresionante de los Andes peruanos: más de 5,000 hectáreas de andenes preíncas en uso continuo en Carmen Salcedo de Andamarca (declarados Patrimonio de la Humanidad por la UNESCO). Explora la fortaleza arqueológica de Caniche con sus colosales murallas defensivas de 12 metros de altura (culturas Wari e Inca) y asiste a una presentación exclusiva y sagrada de la Danza de las Tijeras con galas y arpistas tradicionales.',
      galleryImages: [
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/pueblo_andamarca.jpg',
        '/assets/images/condor_mayobamba.jpg',
        '/assets/images/bosque_piedras.jpg',
        '/assets/images/rio_sondondo.jpg'
      ],
      included: [
        'Transporte turístico privado durante los dos días',
        '1 Noche de alojamiento en posada rural típica en Andamarca',
        'Alimentación completa (1 desayuno andino, 2 almuerzos típicos, 1 cena campestre)',
        'Exhibición privada y conversatorio sobre la Danza de Tijeras con maestros Danzaq',
        'Guía local bilingüe y baquiano de la comunidad de Andamarca',
        'Entradas al complejo arqueológico de Caniche y museo comunitario',
        'Asistencia personalizada y botiquín de altura'
      ],
      notIncluded: [
        'Bebidas alcohólicas y consumos adicionales en posada',
        'Souvenirs textiles o artesanías locales'
      ],
      recommendations: [
        'Ropa cómoda para caminatas diurnas y abrigo fuerte para las noches andinas',
        'Calzado de trekking con buen agarre para subir andenes',
        'Llevar dinero en efectivo en soles (no hay cajeros automáticos en el pueblo)',
        'Batería externa o cargador portátil para cámara y celular'
      ],
      itineraries: [
        {
          id: 201,
          dayNumber: 1,
          title: 'Día 1: El Gran Anfiteatro de Andenerías de Andamarca (UNESCO) & Fortaleza de Caniche',
          description: 'Llegada a Carmen Salcedo de Andamarca (3,250 msnm). Recorrido a pie por los milenarios andenes de Waylla y Aya Urqu, el mayor sistema continuo de terrazas agrícolas vivas del continente. Ascenso al complejo arqueológico de Caniche con sus imponentes murallas defensivas de 12 metros de altura (culturas Wari e Inca) y visita al museo comunal de sitio.',
          activities: 'Caminata entre terrazas prehispánicas, interpretación de canales de irrigación hidráulica preínca, visita guiada al complejo de Caniche.',
          meals: 'Almuerzo típico andino en restaurante comunal, cena tradicional con productos orgánicos de la cuenca.',
          accommodation: 'Noche en posada rural tradicional en Carmen Salcedo de Andamarca.'
        },
        {
          id: 202,
          dayNumber: 2,
          title: 'Día 2: Mística Andina, Templo Colonial & Demostración Sagrada de la Danza de Tijeras',
          description: 'Desayuno andino con panes tradicionales de trigo y queso artesanal. Recorrido por las callejuelas empedradas de Andamarca y su iglesia virreinal de piedra. A media mañana, encuentro exclusivo con los maestros Danzaq (danzantes de tijeras) y músicos de arpa y violín, presenciando una exhibición ritual del Atipanakuy y conociendo el significado espiritual del pacto con los Apus.',
          activities: 'Demostración íntima de la Danza de las Tijeras (Patrimonio UNESCO), diálogo con maestros galas, taller vivencial y retorno por la tarde.',
          meals: 'Desayuno tradicional andino, almuerzo de despedida.',
          accommodation: 'Fin de la expedición.'
        }
      ]
    },
    3: {
      description: 'Una expedición geotermal única hacia uno de los monumentos geológicos más asombrosos del continente: el cono volcánico de sal y azufre de Pachapupum, ubicado a 4,022 msnm en Sacsamarca. Con 30 metros de altura sobre la meseta andina, su cráter expulsa aguas minerales calientes en constante ebullición. Disfruta de un baño reconstituyente en sus pozas termomedicinales ricas en azufre, hierro y sales que alivian el cansancio y benefician la salud.',
      galleryImages: [
        '/assets/images/volcan_pachapupum.jpg',
        '/assets/images/rio_sondondo.jpg',
        '/assets/images/bosque_piedras.jpg',
        '/assets/images/hero_sondondo.jpg'
      ],
      included: [
        'Transporte 4x4 o van turística acondicionada para alta montaña',
        'Guía oficial conocedor de la geología y cosmovisión local',
        'Ingreso al circuito geotermal y pozas termomedicinales de Pachapupum',
        'Almuerzo andino campestre caliente y mate de coca para aclimatación',
        'Botiquín de primeros auxilios y oxímetro/oxígeno'
      ],
      notIncluded: [
        'Toalla y artículos de aseo personal para las termas',
        'Gastos no especificados en el programa'
      ],
      recommendations: [
        'Llevar traje de baño, toalla, sandalias y muda de ropa seca',
        'Abrigo para la salida de las termas debido al viento de la puna',
        'Bloqueador solar resistente al agua y sombrero',
        'Hidratación abundante previa para evitar el soroche'
      ],
      itineraries: [
        {
          id: 301,
          dayNumber: 1,
          title: 'Expedición al Cono Geotermal de Pachapupum & Circuito de Aguas Termomedicinales',
          description: 'Salida hacia la puna alta de Sacsamarca / Chipao hasta alcanzar los 4,022 msnm. Llegada al colosal monumento geotermal de Pachapupum, una formación cónica única en el mundo de 30 metros de altura compuesta de sal, azufre y toba volcánica. Ascenso por sus gradas naturales hasta el cráter para ver el borboteo de agua a alta temperatura y tiempo libre de relax en las pozas termales curativas ricas en minerales.',
          activities: 'Trekking geológico sobre depósitos volcánicos, ascenso al cráter de Pachapupum, baño relajante en pozas termales medicinales y fotografía del cañón de Chipao.',
          meals: 'Box lunch energético andino, almuerzo típico de montaña caliente.',
          accommodation: 'Retorno al punto de origen al atardecer.'
        }
      ]
    },
    4: {
      description: 'Una travesía inolvidable por la inmensidad del altiplano ayacuchano. Conoce la Reserva Nacional Pampa Galeras Barbara D\'Achille, principal centro mundial de conservación y recuperación de la vicuña silvestre, el camélido de fibra más fina del planeta. Posteriormente, asciende a los bofedales altoandinos con vistas directas al colosal nevado Apu Qarhuarazo (5,112 msnm), montaña sagrada de los Rukanas, en un entorno de lagunas glaciares y fauna de puna.',
      galleryImages: [
        '/assets/images/pampa_galeras_vicunas.jpg',
        '/assets/images/bosque_piedras.jpg',
        '/assets/images/hero_sondondo.jpg',
        '/assets/images/andenes_andamarca.jpg'
      ],
      included: [
        'Transporte turístico privado adaptado a rutas de altura',
        '1 Noche de alojamiento en albergue ecológico o posada en Puquio',
        'Pensión completa (1 desayuno, 2 almuerzos campestres, 1 cena reconfortante)',
        'Guía especializado en biología y fauna altoandina',
        'Boletos de ingreso a la Reserva Nacional Pampa Galeras',
        'Ceremonia tradicional de pago a la tierra (Haywarikuy) con paqo local',
        'Botiquín de alta montaña y balón de oxígeno'
      ],
      notIncluded: [
        'Bolsa de dormir (si aplica campamento)',
        'Snacks energéticos adicionales'
      ],
      recommendations: [
        'Indumentaria técnica para frío extremo (primera capa térmica, polar, casaca cortaviento)',
        'Gorro de lana, guantes térmicos y bufanda',
        'Zapatillas o botas de trekking impermeables',
        'Gafas de sol con filtro UV de alta protección para el resplandor de altura'
      ],
      itineraries: [
        {
          id: 401,
          dayNumber: 1,
          title: 'Día 1: Reserva Nacional Pampa Galeras Barbara D\'Achille & El Santuario de la Vicuña',
          description: 'Viaje hacia la meseta altoandina de Pampa Galeras (4,100 msnm), el mayor refugio de vicuñas del planeta. Visita al Centro de Interpretación, recorrido por los cercos de manejo de vicuñas y safari fotográfico observando tropillas silvestres de vicuñas, guanacos, vizcachas y aves migratorias en los bofedales.',
          activities: 'Safari fotográfico de fauna silvestre andina, caminata de aclimatación por bofedales y charla sobre el Chaccu ancestral.',
          meals: 'Almuerzo campestre altoandino, cena reconfortante en albergue.',
          accommodation: 'Albergue ecológico en Pampa Galeras o posada en Puquio.'
        },
        {
          id: 402,
          dayNumber: 2,
          title: 'Día 2: Trekking Hacia las Faldas Glaciares del Apu Qarhuarazo (4,800 msnm)',
          description: 'Caminata de altura hacia las bases del nevado tutelar Apu Qarhuarazo (5,112 msnm), montaña sagrada de los pueblos Rukanas. Observación de lagunas glaciares turquesas, morrenas y flora de tundra andina (yaretas y puyas). Ceremonia ancestral de pago a la tierra (Haywarikuy) guiada por el guía local.',
          activities: 'Trekking de alta montaña, fotografía de glaciares y lagunas altoandinas, ritual tradicional de agradecimiento a los Apus.',
          meals: 'Desayuno de alta montaña con quinua y maca, refrigerio de marcha y almuerzo caliente de retorno.',
          accommodation: 'Fin del tour.'
        }
      ]
    },
    5: {
      description: 'Un recorrido fascinante por la historia virreinal y precolombina de la cuenca del Sondondo. Visita los seis pueblos históricos de la mancomunidad: en Sondondo conoce la casa solariega de don Felipe Guamán Poma de Ayala, autor de la emblemática "Primer Nueva Corónica y Buen Gobierno"; admira en Aucará su iglesia colonial de piedra con retablos barrocos en pan de oro; asciende al mirador de Chauccalla; y maravíllate en Chipao con sus plazas de arte topiario talladas en cipreses centenarios.',
      galleryImages: [
        '/assets/images/pueblo_andamarca.jpg',
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/rio_sondondo.jpg',
        '/assets/images/hero_sondondo.jpg'
      ],
      included: [
        'Transporte turístico privado para todo el circuito distrital',
        'Guía historiador e intérprete cultural de la zona',
        'Entradas a museos locales, casas históricas y templos coloniales',
        'Almuerzo gastronómico regional con recetas tradicionales de la cuenca',
        'Degustación de panes andinos en horno de leña colonial'
      ],
      notIncluded: [
        'Compras de artesanías de piedra o madera',
        'Gastos no contemplados en el programa'
      ],
      recommendations: [
        'Ropa ligera para el mediodía y casaca para el atardecer',
        'Sombrero de ala ancha y protector solar',
        'Cámara fotográfica para arquitectura colonial y panorámicas',
        'Zapatos cómodos para caminar por empedrados históricos'
      ],
      itineraries: [
        {
          id: 501,
          dayNumber: 1,
          title: 'Ruta de la Historia y Tradición: Tierra de Guamán Poma, Templos Coloniales & Miradores',
          description: 'Recorrido cultural por el corazón histórico del Valle del Sondondo. Visita en Sondondo a la casa-monumento del insigne cronista indígena Felipe Guamán Poma de Ayala. Continuación hacia Cabana Sur con su pintoresca plaza y templos de piedra sillar. En Aucará, visita a la majestuosa iglesia colonial con retablos barrocos en pan de oro, subida al mirador de Chauccalla y parada en Chipao, famoso por sus esculturas de ciprés en arte topiario.',
          activities: 'Recorrido cultural e histórico guiado, lectura de pasajes de la Nueva Corónica, visita a talleres de artesanos de piedra y madera, fotografía en mirador Chauccalla.',
          meals: 'Desayuno típico con café de altura y tamales, almuerzo gastronómico regional con productos de la cuenca.',
          accommodation: 'Retorno al punto de inicio.'
        }
      ]
    },
    6: {
      description: 'El viaje definitivo para conocer a fondo la magia del Valle del Sondondo en una sola expedición integral de 3 días y 2 noches. Integra los cuatro grandes hitos del destino: el majestuoso vuelo del cóndor andino en Mayobamba, el milenario anfiteatro de andenes vivos de Andamarca con la mística Danza de las Tijeras, el monumento geotermal de Pachapupum y los paisajes de la Reserva Nacional Pampa Galeras. La experiencia más completa de turismo rural comunitario en Ayacucho.',
      galleryImages: [
        '/assets/images/hero_sondondo.jpg',
        '/assets/images/condor_mayobamba.jpg',
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/volcan_pachapupum.jpg',
        '/assets/images/pampa_galeras_vicunas.jpg',
        '/assets/images/pueblo_andamarca.jpg'
      ],
      included: [
        'Transporte turístico privado integral durante los 3 días de expedición',
        '2 Noches de hospedaje rural con encanto en Carmen Salcedo de Andamarca',
        'Pensión completa: 2 desayunos andinos, 3 almuerzos típicos y 2 cenas campestres',
        'Avistamiento de cóndores con binoculares ópticos en Mayobamba',
        'Ingreso y circuito de aguas termales en el volcán Pachapupum',
        'Entradas al complejo arqueológico de Caniche y andenes de Andamarca',
        'Presentación ritual de Danza de Tijeras con músicos en vivo y fogata',
        'Guía oficial de turismo bilingüe nativo del Valle del Sondondo',
        'Botiquín de primeros auxilios y asistencia permanente 24/7'
      ],
      notIncluded: [
        'Pasajes de traslado interprovincial hacia el punto de inicio en Puquio o Ayacucho',
        'Gastos y compras personales',
        'Propinas voluntarias para guías y arrieros'
      ],
      recommendations: [
        'Mochila de viaje ligera con ropa abrigadora y muda térmica',
        'Ropa de baño y toalla para las aguas termales de Pachapupum',
        'Zapatos de trekking confortables ya adaptados al pie',
        'Cámara fotográfica con memorias y baterías de repuesto'
      ],
      itineraries: [
        {
          id: 601,
          dayNumber: 1,
          title: 'Día 1: Puquio - Volcán Geotermal Pachapupum & Llegada al Valle de Andamarca',
          description: 'Recepción y traslado privado hacia la cuenca del Sondondo. Visita al volcán mineral de Pachapupum (4,022 msnm) y sus termas curativas. Descenso panorámico por el cañón hacia el verde valle de Carmen Salcedo de Andamarca.',
          activities: 'Visita geotermal, baño termomedicinal y recepción con música andina en Andamarca.',
          meals: 'Almuerzo campestre, cena andina orgánica.',
          accommodation: 'Posada rural en Andamarca.'
        },
        {
          id: 602,
          dayNumber: 2,
          title: 'Día 2: Andenerías Patrimonio UNESCO, Sitio Arqueológico de Caniche & Velada de Tijeras',
          description: 'Caminata entre los andenes agrícolas prehispánicos de Waylla y Aya Urqu. Exploración de las murallas de Caniche y los pueblos coloniales de Cabana Sur y Sondondo. Por la noche, fogata mística y presentación exclusiva de la Danza de las Tijeras.',
          activities: 'Trekking cultural, exploración arqueológica Wari-Inca, demostración nocturna de Danza de Tijeras con arpistas.',
          meals: 'Desayuno tradicional, almuerzo típico de trucha fresca, cena con fogata andina.',
          accommodation: 'Posada rural en Andamarca.'
        },
        {
          id: 603,
          dayNumber: 3,
          title: 'Día 3: Cañón de Mayobamba, Vuelo Libre de Cóndores, Aucará & Retorno',
          description: 'Partida a las 5:30 AM hacia el Cañón de Mayobamba para presenciar el despertar y planeo majestuoso de cóndores andinos. Visita a la iglesia colonial de Aucará, laguna Ccochapampa y retorno a Puquio o Ayacucho con paradas fotográficas.',
          activities: 'Avistamiento de cóndores andinos en vuelo libre, fotografía panorámica, visita colonial y traslado final.',
          meals: 'Desayuno con vista al cañón de cóndores, almuerzo regional de despedida.',
          accommodation: 'Fin de los servicios.'
        }
      ]
    }
  };

  private resolveTourItemBySlug(allTours: any[], slug: string): any {
    const cleanSlug = (slug || '').toLowerCase().trim();

    // 1. Direct slug match
    let match = allTours.find(t => (t.slug || '').toLowerCase() === cleanSlug);
    if (match) return match;

    // 2. Intelligent keyword / alias matcher
    if (cleanSlug.includes('condor') || cleanSlug.includes('mayobamba') || cleanSlug.includes('kuntur')) {
      match = allTours.find(t => t.id === 1 || (t.slug || '').includes('condor') || (t.title || '').toLowerCase().includes('cóndor'));
      if (match) return match;
    }
    if (cleanSlug.includes('andenes') || cleanSlug.includes('andamarca') || cleanSlug.includes('tijeras')) {
      match = allTours.find(t => t.id === 2 || (t.slug || '').includes('andenes') || (t.title || '').toLowerCase().includes('andamarca'));
      if (match) return match;
    }
    if (cleanSlug.includes('pachapupum') || cleanSlug.includes('volcan') || cleanSlug.includes('termal') || cleanSlug.includes('termas')) {
      match = allTours.find(t => t.id === 3 || (t.slug || '').includes('pachapupum') || (t.slug || '').includes('volcan'));
      if (match) return match;
    }
    if (cleanSlug.includes('galeras') || cleanSlug.includes('qarhuarazo') || cleanSlug.includes('vicuna') || cleanSlug.includes('vicuñas')) {
      match = allTours.find(t => t.id === 4 || (t.slug || '').includes('galeras') || (t.slug || '').includes('qarhuarazo'));
      if (match) return match;
    }
    if (cleanSlug.includes('pueblo') || cleanSlug.includes('aucara') || cleanSlug.includes('cabana') || cleanSlug.includes('chipao') || cleanSlug.includes('guaman')) {
      match = allTours.find(t => t.id === 5 || (t.slug || '').includes('pueblo'));
      if (match) return match;
    }
    if (cleanSlug.includes('travesia') || cleanSlug.includes('mancomunidad') || cleanSlug.includes('integral') || cleanSlug.includes('3d2n')) {
      match = allTours.find(t => t.id === 6 || (t.slug || '').includes('travesia'));
      if (match) return match;
    }

    return allTours[0] || this.fallbackTours[0];
  }

  private fallbackCategories: Category[] = [
    { id: 1, name: 'Ruta del Cóndor', slug: 'ruta-condor', description: 'Avistamiento de cóndores en Mayobamba', icon: 'feather', displayOrder: 1, toursCount: 1 },
    { id: 2, name: 'Andenes & Danza', slug: 'cultura-viva-andenes', description: 'Terrazas de Andamarca y Danzantes de Tijeras', icon: 'compass', displayOrder: 2, toursCount: 1 },
    { id: 3, name: 'Aguas Termales', slug: 'aguas-termales-canones', description: 'Volcán Pachapupum y baños medicinales', icon: 'droplets', displayOrder: 3, toursCount: 1 },
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
        const detailedInfo = this.detailedCatalogById[sanitized.id] || this.detailedCatalogById[1];
        
        let gallery = (sanitized.galleryImages && sanitized.galleryImages.length > 0)
          ? sanitized.galleryImages
          : detailedInfo.galleryImages;

        let itineraries = (sanitized.itineraries && sanitized.itineraries.length > 0)
          ? sanitized.itineraries
          : detailedInfo.itineraries;

        return {
          ...sanitized,
          description: sanitized.description || detailedInfo.description,
          galleryImages: gallery,
          included: (sanitized.included && sanitized.included.length > 0) ? sanitized.included : detailedInfo.included,
          notIncluded: (sanitized.notIncluded && sanitized.notIncluded.length > 0) ? sanitized.notIncluded : detailedInfo.notIncluded,
          recommendations: (sanitized.recommendations && sanitized.recommendations.length > 0) ? sanitized.recommendations : detailedInfo.recommendations,
          itineraries: itineraries
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

        const item = this.resolveTourItemBySlug(allTours, slug);
        const detailedInfo = this.detailedCatalogById[item.id] || this.detailedCatalogById[1];

        const detail: TourDetail = {
          ...item,
          isActive: item.isActive !== false,
          description: item.description || detailedInfo.description,
          galleryImages: (item.galleryImages && item.galleryImages.length > 0) ? item.galleryImages : detailedInfo.galleryImages,
          included: (item.included && item.included.length > 0) ? item.included : detailedInfo.included,
          notIncluded: (item.notIncluded && item.notIncluded.length > 0) ? item.notIncluded : detailedInfo.notIncluded,
          recommendations: (item.recommendations && item.recommendations.length > 0) ? item.recommendations : detailedInfo.recommendations,
          itineraries: (item.itineraries && item.itineraries.length > 0) ? item.itineraries : detailedInfo.itineraries
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
