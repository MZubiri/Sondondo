import { Component, EventEmitter, Input, OnInit, Output, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourSummary, Category } from '../../models/tour.model';
import { TourCardComponent } from '../tour-card/tour-card.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TourCardComponent, IconComponent],
  template: `
    <section class="tours-section" id="tours">
      <div class="container">
        <div class="section-title-wrap">
          <span class="section-tag">Experiencias y Rutas</span>
          <h2 class="section-title">Circuitos en el Valle del Sondondo</h2>
          <p class="section-subtitle">
            Elige tu viaje ideal entre avistamiento de cóndores, andenerías preíncas vivas, senderismo hacia el Apu Qarhuarazo y relajación en aguas termomedicinales.
          </p>
        </div>

        <!-- Filter & Search Controls Bar -->
        <div class="controls-bar glass-card">
          <!-- Category Tabs -->
          <div class="category-tabs">
            <button 
              class="tab-btn" 
              [class.active]="selectedCategory() === 'all'" 
              (click)="selectCategory('all')">
              <app-icon name="compass" [size]="16"></app-icon>
              <span>Todos ({{ allTours().length }})</span>
            </button>

            @for (cat of categories(); track cat.id) {
              <button 
                class="tab-btn" 
                [class.active]="selectedCategory() === cat.slug" 
                (click)="selectCategory(cat.slug)">
                <app-icon [name]="cat.icon" [size]="16"></app-icon>
                <span>{{ cat.name }}</span>
              </button>
            }
          </div>

          <!-- Search Input -->
          <div class="search-wrap">
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Buscar por destino o actividad..." 
              class="search-input" />
          </div>
        </div>

        <!-- Tours Grid -->
        @if (filteredTours().length > 0) {
          <div class="tours-grid">
            @for (tour of filteredTours(); track tour.id) {
              <app-tour-card 
                [tour]="tour" 
                (onBookClick)="onBook.emit($event)">
              </app-tour-card>
            }
          </div>
        } @else {
          <div class="empty-state glass-card">
            <app-icon name="compass" [size]="48" stroke="var(--primary)"></app-icon>
            <h3>No encontramos circuitos que coincidan</h3>
            <p>Intenta buscando con otra palabra o selecciona "Todos los circuitos".</p>
            <button (click)="resetFilters()" class="btn btn-secondary mt-2">
              Ver Todos los Circuitos
            </button>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .tours-section {
      padding: 6rem 0;
      background: var(--earth-50);
    }

    .controls-bar {
      padding: 1.25rem 1.5rem;
      margin-bottom: 3rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
      background: #FFFFFF;
      border: 1px solid var(--border-light);
    }

    .category-tabs {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1.1rem;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--earth-200);
      background: var(--earth-50);
      color: var(--night-900);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition-smooth);
    }

    .tab-btn:hover {
      background: var(--earth-100);
      border-color: var(--earth-300);
    }

    .tab-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(192, 57, 43, 0.3);
    }

    .search-wrap {
      min-width: 260px;
    }

    .search-input {
      width: 100%;
      padding: 0.6rem 1rem;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--earth-200);
      background: var(--earth-50);
      font-size: 0.88rem;
      transition: var(--transition-smooth);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary);
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.1);
    }

    .tours-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #FFFFFF;
      border: 1px solid var(--border-light);
    }

    .empty-state h3 {
      font-size: 1.4rem;
      margin: 1rem 0 0.5rem 0;
      color: var(--night-900);
    }

    .empty-state p {
      color: var(--earth-700);
      font-size: 0.95rem;
    }

    .mt-2 { margin-top: 1rem; }

    @media (max-width: 1100px) {
      .tours-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .controls-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .search-wrap {
        width: 100%;
      }
      .tours-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TourListComponent {
  allTours = input<TourSummary[]>([]);
  categories = input<Category[]>([]);
  @Output() onBook = new EventEmitter<TourSummary>();

  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');

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
        t.categoryName.toLowerCase().includes(q)
      );
    }

    return result;
  });

  selectCategory(slug: string): void {
    this.selectedCategory.set(slug);
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.searchQuery.set('');
  }
}
