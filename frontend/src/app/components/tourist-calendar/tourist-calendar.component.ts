import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isWeekend: boolean;
  dateString: string; // YYYY-MM-DD
}

@Component({
  selector: 'app-tourist-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-widget">
      <!-- HEADER -->
      <div class="cal-header">
        <button type="button" class="nav-btn" (click)="prevMonth()" [disabled]="isPrevDisabled()" aria-label="Mes anterior">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span class="month-label">{{ currentMonthName }} {{ currentYear }}</span>
        <button type="button" class="nav-btn" (click)="nextMonth()" aria-label="Siguiente mes">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- QUICK SHORTCUTS -->
      <div class="cal-quick-picks">
        <button type="button" class="quick-chip" (click)="selectNextWeekend()">Fin de semana</button>
        <button type="button" class="quick-chip" (click)="selectDaysAhead(15)">En 15 días</button>
        <button type="button" class="quick-chip" (click)="selectDaysAhead(30)">En 1 mes</button>
      </div>

      <!-- DAYS OF WEEK -->
      <div class="weekdays-grid">
        <span *ngFor="let day of weekDays" class="weekday-name">{{ day }}</span>
      </div>

      <!-- DAYS MATRIX -->
      <div class="days-grid">
        <button
          *ngFor="let item of calendarDays()"
          type="button"
          class="day-cell"
          [class.other-month]="!item.isCurrentMonth"
          [class.today]="item.isToday"
          [class.selected]="item.isSelected"
          [class.weekend]="item.isWeekend"
          [disabled]="item.isDisabled"
          (click)="selectDate(item)"
        >
          <span>{{ item.dayNumber }}</span>
        </button>
      </div>

      <!-- SELECTED PREVIEW -->
      <div class="selected-bar" *ngIf="selectedDateString()">
        <div class="sel-info">
          <span class="sel-icon">📅</span>
          <div>
            <span class="sel-label">Fecha de Viaje Seleccionada</span>
            <strong class="sel-text">{{ formatDisplayDate(selectedDateString()) }}</strong>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-widget {
      background: #fdfaf6;
      border: 1px solid #ebd9c8;
      border-radius: 12px;
      padding: 1rem;
      user-select: none;
      box-shadow: 0 4px 12px rgba(18, 35, 26, 0.04);
    }

    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .month-label {
      font-weight: 800;
      color: #1b1510;
      font-size: 1rem;
      text-transform: capitalize;
      letter-spacing: -0.01em;
    }

    .nav-btn {
      background: #ffffff;
      border: 1px solid #e2d3c2;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #524336;
      transition: all 0.2s ease;
    }

    .nav-btn:hover:not(:disabled) {
      background: #c85a32;
      color: #ffffff;
      border-color: #c85a32;
    }

    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .cal-quick-picks {
      display: flex;
      gap: 0.4rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .quick-chip {
      background: #ffffff;
      border: 1px solid #e5d8cb;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
      font-size: 0.75rem;
      color: #6a5a4a;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.15s ease;
    }

    .quick-chip:hover {
      background: #c85a32;
      color: #ffffff;
      border-color: #c85a32;
    }

    .weekdays-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      margin-bottom: 0.4rem;
    }

    .weekday-name {
      font-size: 0.72rem;
      font-weight: 700;
      color: #927f70;
      text-transform: uppercase;
      padding: 0.25rem 0;
    }

    .days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    }

    .day-cell {
      aspect-ratio: 1;
      background: #ffffff;
      border: 1px solid transparent;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.88rem;
      font-weight: 600;
      color: #2b221a;
      cursor: pointer;
      transition: all 0.15s ease;
      padding: 0;
    }

    .day-cell:hover:not(:disabled) {
      background: #faece6;
      color: #c85a32;
      border-color: #f1cfc0;
    }

    .day-cell.other-month {
      color: #c9bea2;
      opacity: 0.45;
    }

    .day-cell.today {
      border: 1.5px solid #c85a32;
      color: #c85a32;
    }

    .day-cell.weekend {
      background: #fbf7f2;
    }

    .day-cell.selected {
      background: #c85a32 !important;
      color: #ffffff !important;
      font-weight: 800;
      box-shadow: 0 4px 10px rgba(200, 90, 50, 0.35);
    }

    .day-cell:disabled {
      opacity: 0.25;
      cursor: not-allowed;
      background: #f3ece6;
      color: #a4978c;
    }

    .selected-bar {
      margin-top: 0.85rem;
      padding: 0.65rem 0.85rem;
      background: #eef7f0;
      border: 1px solid #ccebd3;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .sel-info {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .sel-icon {
      font-size: 1.25rem;
    }

    .sel-label {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #2e7d32;
      font-weight: 700;
    }

    .sel-text {
      color: #1b5e20;
      font-size: 0.88rem;
    }
  `]
})
export class TouristCalendarComponent implements OnInit {
  @Input() initialDate: string = '';
  @Output() dateSelected = new EventEmitter<string>();

  viewDate: Date = new Date();
  selectedDateString = signal<string>('');
  calendarDays = signal<CalendarDay[]>([]);

  weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  ngOnInit(): void {
    if (this.initialDate) {
      this.selectedDateString.set(this.initialDate);
      const parsed = new Date(this.initialDate + 'T00:00:00');
      if (!isNaN(parsed.getTime())) {
        this.viewDate = parsed;
      }
    } else {
      // Default to next Saturday
      this.selectNextWeekend();
    }
    this.generateCalendar();
  }

  get currentMonthName(): string {
    return this.viewDate.toLocaleString('es-PE', { month: 'long' });
  }

  get currentYear(): number {
    return this.viewDate.getFullYear();
  }

  isPrevDisabled(): boolean {
    const today = new Date();
    return this.viewDate.getFullYear() === today.getFullYear() &&
           this.viewDate.getMonth() <= today.getMonth();
  }

  prevMonth(): void {
    if (this.isPrevDisabled()) return;
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(day: CalendarDay): void {
    if (day.isDisabled) return;
    this.selectedDateString.set(day.dateString);
    this.dateSelected.emit(day.dateString);
    this.generateCalendar();
  }

  selectNextWeekend(): void {
    const d = new Date();
    // find next saturday
    const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
    const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilSat);
    const dateStr = this.formatDateIso(d);
    this.selectedDateString.set(dateStr);
    this.viewDate = new Date(d);
    this.dateSelected.emit(dateStr);
    this.generateCalendar();
  }

  selectDaysAhead(days: number): void {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dateStr = this.formatDateIso(d);
    this.selectedDateString.set(dateStr);
    this.viewDate = new Date(d);
    this.dateSelected.emit(dateStr);
    this.generateCalendar();
  }

  generateCalendar(): void {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week: Monday=0, ..., Sunday=6
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay < 0) startingDay = 6;

    const days: CalendarDay[] = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      d.setHours(0, 0, 0, 0);
      const str = this.formatDateIso(d);
      days.push({
        date: d,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: d.getTime() === today.getTime(),
        isSelected: str === this.selectedDateString(),
        isDisabled: d.getTime() < today.getTime(),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        dateString: str
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      d.setHours(0, 0, 0, 0);
      const str = this.formatDateIso(d);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: d.getTime() === today.getTime(),
        isSelected: str === this.selectedDateString(),
        isDisabled: d.getTime() < today.getTime(),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        dateString: str
      });
    }

    // Next month filler days (fill up to 35 or 42)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      d.setHours(0, 0, 0, 0);
      const str = this.formatDateIso(d);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: d.getTime() === today.getTime(),
        isSelected: str === this.selectedDateString(),
        isDisabled: false,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        dateString: str
      });
    }

    this.calendarDays.set(days);
  }

  formatDateIso(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  formatDisplayDate(isoStr: string): string {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length !== 3) return isoStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
