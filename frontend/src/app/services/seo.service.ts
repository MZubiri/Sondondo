import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { TourDetail, TourSummary } from '../models/tour.model';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  private readonly siteBaseUrl = 'https://valledelsondondoexpeditions.com';
  private readonly defaultOgImage = 'https://valledelsondondoexpeditions.com/assets/images/og-sondondo.jpg';

  /**
   * Sets generic SEO metadata for any route
   */
  setMeta(config: SeoConfig): void {
    // Title
    this.titleService.setTitle(config.title);

    // Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }

    const canonical = config.canonicalUrl || this.siteBaseUrl;
    const ogImage = config.ogImage ? this.resolveAbsoluteUrl(config.ogImage) : this.defaultOgImage;
    const ogType = config.ogType || 'website';

    // Canonical
    this.updateCanonicalUrl(canonical);

    // Open Graph Tags
    this.metaService.updateTag({ property: 'og:title', content: config.title });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:url', content: canonical });
    this.metaService.updateTag({ property: 'og:type', content: ogType });
    this.metaService.updateTag({ property: 'og:image', content: ogImage });
    this.metaService.updateTag({ property: 'og:image:secure_url', content: ogImage });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Valle del Sondondo Expeditions' });
    this.metaService.updateTag({ property: 'og:locale', content: 'es_PE' });

    // Twitter Card Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: config.title });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    this.metaService.updateTag({ name: 'twitter:image', content: ogImage });
  }

  /**
   * Updates or injects the canonical link in <head>
   */
  updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /**
   * Injects or replaces a JSON-LD structured data script in <head>
   */
  setJsonLd(schema: object, scriptId: string = 'structured-data-jsonld'): void {
    let script: HTMLScriptElement | null = this.document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = this.document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);
  }

  /**
   * Resets SEO for the Homepage with TravelAgency schema
   */
  setHomeSeo(): void {
    const title = 'Valle del Sondondo Expeditions | Turismo Vivencial, Cóndores y Aventura en Ayacucho';
    const description = 'Descubre la magia del Valle del Sondondo en Ayacucho con Valle del Sondondo Expeditions. Avistamiento del Cóndor Andino en Mayobamba, colosales andenerías vivas de Andamarca, trekking al Apu Qarhuarazo (5,112 msnm), aguas termales y la ancestral Danza de las Tijeras. Operador certificado Safe Travels.';
    const keywords = 'Valle del Sondondo, Tours Sondondo, Cóndor Mayobamba, Andamarca Ayacucho, Danza de las Tijeras, Apu Qarhuarazo, Cabana Sur, Chipao, Aucará, Turismo Ayacucho, Puquio';

    this.setMeta({
      title,
      description,
      keywords,
      canonicalUrl: `${this.siteBaseUrl}/`,
      ogImage: this.defaultOgImage,
      ogType: 'website'
    });

    // TravelAgency JSON-LD Schema
    const travelAgencySchema = {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      '@id': `${this.siteBaseUrl}/#agency`,
      name: 'Valle del Sondondo Expeditions',
      url: this.siteBaseUrl,
      image: this.defaultOgImage,
      description: 'Operador turístico local formal en el Valle del Sondondo, Lucanas, Ayacucho, Perú. Especialistas en Kuntur Ñan (Ruta del Cóndor), andenerías vivas de Andamarca y alta montaña.',
      telephone: '+51966380590',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Apu Chauccalla 402',
        addressLocality: 'Aucará',
        addressRegion: 'Ayacucho',
        postalCode: '05400',
        addressCountry: 'PE'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -14.2833,
        longitude: -73.9667
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '07:00',
        closes: '21:00'
      }
    };

    this.setJsonLd(travelAgencySchema, 'travel-agency-jsonld');
  }

  /**
   * Configures high-fidelity dynamic SEO and JSON-LD for a Tour page
   */
  setTourSeo(tour: TourDetail | TourSummary): void {
    const duration = tour.duration ? ` (${tour.duration})` : '';
    const title = `${tour.title}${duration} | Valle del Sondondo Expeditions`;
    
    // Create rich description from subtitle or description
    let description = tour.subtitle || (tour as TourDetail).description || '';
    if (description.length > 220) {
      description = description.slice(0, 217).trim() + '...';
    }
    if (!description.includes('Valle del Sondondo')) {
      description += ' Reserva tu expedición guiada en el Valle del Sondondo, Ayacucho.';
    }

    const canonicalUrl = `${this.siteBaseUrl}/tour/${tour.slug}`;
    const ogImage = tour.mainImageUrl ? this.resolveAbsoluteUrl(tour.mainImageUrl) : this.defaultOgImage;

    const keywords = `${tour.title}, ${tour.categoryName || 'Tour Sondondo'}, Valle del Sondondo, Ayacucho turismo, excursiones Ayacucho, ${tour.startingPoint || 'Aucará'}`;

    this.setMeta({
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage,
      ogType: 'article'
    });

    // 1. TouristTrip Schema
    const tourDetail = tour as TourDetail;
    const touristTripSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      '@id': `${canonicalUrl}#trip`,
      name: tour.title,
      description: tour.subtitle || tourDetail.description || tour.title,
      touristType: ['Aventura', 'Turismo Vivencial', 'Naturaleza'],
      image: ogImage,
      offers: {
        '@type': 'Offer',
        price: tour.priceSoles || 180,
        priceCurrency: 'PEN',
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        validFrom: '2026-01-01'
      },
      provider: {
        '@type': 'TravelAgency',
        name: 'Valle del Sondondo Expeditions',
        url: this.siteBaseUrl,
        telephone: '+51966380590',
        image: this.defaultOgImage
      }
    };

    // Add Itineraries if available
    if (tourDetail.itineraries && tourDetail.itineraries.length > 0) {
      touristTripSchema.itinerary = {
        '@type': 'ItemList',
        itemListElement: tourDetail.itineraries.map((it, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: it.title,
          description: it.description
        }))
      };
    }

    this.setJsonLd(touristTripSchema, 'tourist-trip-jsonld');

    // 2. BreadcrumbList Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: `${this.siteBaseUrl}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tours & Circuitos',
          item: `${this.siteBaseUrl}/#tours`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: tour.title,
          item: canonicalUrl
        }
      ]
    };

    this.setJsonLd(breadcrumbSchema, 'tour-breadcrumbs-jsonld');
  }

  /**
   * Configures SEO for legal and institutional pages
   */
  setLegalSeo(pageTitle: string, path: string, description: string): void {
    const fullTitle = `${pageTitle} | Valle del Sondondo Expeditions`;
    const canonicalUrl = `${this.siteBaseUrl}/${path}`;

    this.setMeta({
      title: fullTitle,
      description,
      canonicalUrl,
      ogImage: this.defaultOgImage,
      ogType: 'website'
    });

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: `${this.siteBaseUrl}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageTitle,
          item: canonicalUrl
        }
      ]
    };

    this.setJsonLd(breadcrumbSchema, 'legal-breadcrumbs-jsonld');
  }

  private resolveAbsoluteUrl(url: string): string {
    if (!url) return this.defaultOgImage;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${this.siteBaseUrl}${cleanPath}`;
  }
}
