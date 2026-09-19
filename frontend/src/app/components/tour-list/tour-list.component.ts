import { Component, EventEmitter, OnInit, Output, signal, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TourSummary, Category } from '../../models/tour.model';
import { TourCardComponent } from '../tour-card/tour-card.component';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TourCardComponent, IconComponent],
  template: `
    <section class="tours-section" id="tours">
      <div class="container">
        <!-- Section Header -->
        <div class="section-title-wrap text-center">
          <span class="section-tag">{{ ts.t('tours.badge') }}</span>
          <h2 class="section-title">{{ ts.t('tours.title') }}</h2>
          <p class="section-subtitle">{{ ts.t('tours.subtitle') }}</p>
        </div>

        <!-- Filter & Search Bar -->
        <div class="filter-bar">
          <div class="category-filters">
            <button 
              type="button"
              class="filter-btn" 
              [class.active]="selectedCategory() === 'all'" 
              (click)="selectCategory('all')">
              {{ ts.t('cat.all') }} ({{ allTours().length }})
            </button>

            @for (cat of categories(); track cat.id) {
              <button 
                type="button"
                class="filter-btn" 
                [class.active]="selectedCategory() === cat.slug" 
                (click)="selectCategory(cat.slug)">
                {{ getCategoryName(cat) }}
              </button>
            }
          </div>

          <div class="search-box">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              [placeholder]="ts.t('tours.searchPlaceholder')" 
              class="search-input" />
          </div>
        </div>

        <!-- Spotlight Featured Tour (Shown when browsing All without active search) -->
        @if (showSpotlight() && spotlightTour()) {
          <div class="featured-spotlight">
            <div class="spotlight-media">
              <img 
                [src]="spotlightTour()!.mainImageUrl" 
                [alt]="getTourTitle(spotlightTour()!)" 
                class="spotlight-img"
                (error)="onSpotlightImageError($event)" />
            </div>

            <div class="spotlight-info">
              <div class="spotlight-meta">
                <span class="spotlight-kicker">{{ ts.t('tours.badge') }}</span>
                <span class="meta-separator">•</span>
                <span class="meta-item">
                  <app-icon name="clock" [size]="14"></app-icon>
                  {{ spotlightTour()!.duration }}
                </span>
                <span class="meta-separator">•</span>
                <span class="meta-item">
                  <app-icon name="map-pin" [size]="14"></app-icon>
                  {{ spotlightTour()!.startingPoint }}
                </span>
              </div>

              <h3 class="spotlight-title">
                <a [routerLink]="['/tour', spotlightTour()!.slug]">{{ getTourTitle(spotlightTour()!) }}</a>
              </h3>

              <p class="spotlight-desc">
                {{ getTourSubtitle(spotlightTour()!) }}
              </p>

              <div class="spotlight-footer">
                <div class="spotlight-price">
                  <span class="price-label">{{ ts.t('tours.from') }}</span>
                  <span class="price-amount">
                    @if (spotlightTour()!.priceSoles > 0) {
                      S/ {{ spotlightTour()!.priceSoles }}
                    } @else {
                      {{ ts.t('tours.book') }}
                    }
                  </span>
                </div>

                <div class="spotlight-actions">
                  <button 
                    type="button"
                    (click)="onBook.emit(spotlightTour()!)" 
                    class="btn btn-primary"
                    [title]="ts.t('tours.book')">
                    <app-icon name="calendar" [size]="16" stroke="#FFFFFF"></app-icon>
                    <span>{{ ts.t('tours.book') }}</span>
                  </button>

                  <a [routerLink]="['/tour', spotlightTour()!.slug]" class="btn btn-secondary">
                    <span>{{ ts.t('tours.viewDetails') }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Grid of Other / Filtered Tours -->
        @if (gridTours().length > 0) {
          <div class="tours-grid">
            @for (tour of gridTours(); track tour.id) {
              <app-tour-card 
                [tour]="tour" 
                (onBookClick)="onBook.emit($event)">
              </app-tour-card>
            }
          </div>
        } @else if (!showSpotlight() || !spotlightTour()) {
          <div class="empty-state">
            <h3>{{ ts.t('tours.noResults') }}</h3>
            <button (click)="resetFilters()" class="btn btn-secondary" style="margin-top: 1rem;">
              {{ ts.t('cat.all') }}
            </button>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .tours-section {
      padding: 6rem 0;
      background: var(--cream-50);
    }

    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      margin-bottom: 3rem;
      flex-wrap: wrap;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-light);
    }

    .category-filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: transparent;
      border: 1px solid var(--earth-200);
      color: var(--earth-700);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.45rem 1rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
    }

    .filter-btn:hover {
      background: var(--cream-100);
      color: var(--earth-950);
    }

    .filter-btn.active {
      background: var(--forest-900);
      border-color: var(--forest-900);
      color: #FFFFFF;
    }

    .search-box {
      min-width: 260px;
    }

    .search-input {
      width: 100%;
      padding: 0.55rem 1rem;
      border: 1px solid var(--earth-200);
      border-radius: var(--radius-sm);
      background: #FFFFFF;
      font-size: 0.88rem;
      color: var(--earth-900);
      transition: var(--transition);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--forest-800);
      box-shadow: 0 0 0 2px rgba(27, 53, 39, 0.1);
    }

    /* Recorrido Destacado en Formato Grande */
    .featured-spotlight {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 2.5rem;
      align-items: center;
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-bottom: 3rem;
      box-shadow: var(--shadow-subtle);
    }

    .spotlight-media {
      height: 100%;
      min-height: 380px;
      overflow: hidden;
      background: var(--earth-100);
    }

    .spotlight-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .featured-spotlight:hover .spotlight-img {
      transform: scale(1.02);
    }

    .spotlight-info {
      padding: 2.5rem 2.5rem 2.5rem 0.5rem;
      display: flex;
      flex-direction: column;
    }

    .spotlight-meta {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: var(--earth-700);
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .spotlight-kicker {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-clay);
    }

    .meta-separator {
      color: var(--earth-300);
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .spotlight-title {
      font-size: 1.85rem;
      font-weight: 700;
      line-height: 1.25;
      color: var(--earth-950);
      margin-bottom: 1rem;
    }

    .spotlight-title a:hover {
      color: var(--forest-800);
    }

    .spotlight-desc {
      font-size: 0.98rem;
      line-height: 1.65;
      color: var(--earth-700);
      margin-bottom: 2rem;
    }

    .spotlight-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-light);
      flex-wrap: wrap;
    }

    .spotlight-price {
      display: flex;
      flex-direction: column;
    }

    .spotlight-price .price-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--earth-500);
      font-weight: 600;
    }

    .spotlight-price .price-amount {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--forest-900);
    }

    .spotlight-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Retícula Sencilla para los Demás */
    .tours-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 1.5rem;
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
    }

    .empty-state h3 {
      font-size: 1.35rem;
      color: var(--earth-950);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--earth-700);
    }

    @media (max-width: 992px) {
      .featured-spotlight {
        grid-template-columns: 1fr;
      }
      .spotlight-media {
        min-height: 280px;
      }
      .spotlight-info {
        padding: 2rem;
      }
      .tours-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .filter-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .search-box {
        width: 100%;
      }
      .spotlight-title {
        font-size: 1.4rem;
      }
      .spotlight-footer {
        flex-direction: column;
        align-items: stretch;
      }
      .spotlight-actions {
        width: 100%;
        flex-direction: column;
      }
      .spotlight-actions .btn {
        width: 100%;
      }
      .tours-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TourListComponent {
  public ts = inject(TranslationService);
  allTours = input<TourSummary[]>([]);
  categories = input<Category[]>([]);
  @Output() onBook = new EventEmitter<TourSummary>();

  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');

  getTourTitle(tour: TourSummary): string {
    if (!tour) return '';
    const key = `tour.${tour.id}.title`;
    const trans = this.ts.t(key);
    return trans !== key ? trans : tour.title;
  }

  getTourSubtitle(tour: TourSummary): string {
    if (!tour) return '';
    const key = `tour.${tour.id}.subtitle`;
    const trans = this.ts.t(key);
    return trans !== key ? trans : tour.subtitle;
  }

  getCategoryName(cat: Category): string {
    if (cat.slug === 'ruta-del-condor') return this.ts.t('cat.condor');
    if (cat.slug === 'andenes-vivos') return this.ts.t('cat.andenes');
    if (cat.slug === 'aguas-termales') return this.ts.t('cat.termas');
    if (cat.slug === 'pampa-galeras') return this.ts.t('cat.galeras');
    if (cat.slug === 'pueblos-vivos') return this.ts.t('cat.pueblos');
    if (cat.slug === 'gran-travesia') return this.ts.t('cat.circuito');
    return cat.name;
  }

  showSpotlight = computed(() => {
    return this.selectedCategory() === 'all' && !this.searchQuery().trim();
  });

  spotlightTour = computed(() => {
    const tours = this.allTours();
    return tours.find(t => t.featured) || (tours.length > 0 ? tours[0] : null);
  });

  filteredTours = computed(() => {
    const tours = this.allTours();
    let result = [...tours];
    const cat = this.selectedCategory();
    const q = this.searchQuery().trim().toLowerCase();

    if (cat !== 'all') {
      result = result.filter(t => t.categorySlug === cat);
    }

    if (q) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.subtitle.toLowerCase().includes(q) ||
        t.startingPoint.toLowerCase().includes(q) ||
        t.categoryName.toLowerCase().includes(q)
      );
    }

    return result;
  });

  gridTours = computed(() => {
    const all = this.filteredTours();
    if (this.showSpotlight() && this.spotlightTour()) {
      const spotId = this.spotlightTour()!.id;
      return all.filter(t => t.id !== spotId);
    }
    return all;
  });

  selectCategory(slug: string): void {
    this.selectedCategory.set(slug);
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.searchQuery.set('');
  }

  onSpotlightImageError(e: Event): void {
    const target = e.target as HTMLImageElement;
    target.src = '/assets/images/hero_sondondo.jpg';
  }
}
