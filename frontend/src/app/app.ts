import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  agency = signal<AgencyInfo | null>(null);

  ngOnInit(): void {
    this.tourService.getAgencyInfo().subscribe(info => this.agency.set(info));
  }
}
