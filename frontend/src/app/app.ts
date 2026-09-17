import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { TourService } from './services/tour.service';
import { AgencyInfo } from './models/tour.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private tourService = inject(TourService);
  private router = inject(Router);

  agency = signal<AgencyInfo | null>(null);
  isAdminRoute = signal<boolean>(false);

  ngOnInit(): void {
    this.tourService.getAgencyInfo().subscribe(info => this.agency.set(info));

    // Check current path immediately
    this.checkAdminRoute(this.router.url);

    // Reactively update on navigation changes
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkAdminRoute(event.urlAfterRedirects || event.url);
    });
  }

  private checkAdminRoute(url: string): void {
    const isCurrentAdmin = url.startsWith('/admin') || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));
    this.isAdminRoute.set(isCurrentAdmin);
  }
}
