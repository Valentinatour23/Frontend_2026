import { Component } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { NavbarComponent } from '../navbar/navbar';
import { Reserva } from '../reserva/reserva';

@Component({
  selector: 'app-info-alojamiento',
  standalone: true,
  imports: [CommonModule, NavbarComponent, Reserva], 
  templateUrl: './info-alojamiento.html',
  styleUrl: './info-alojamiento.css'
})
export class InfoAlojamientoComponent {}