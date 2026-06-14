import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Sumamos ChangeDetectorRef acá
import { CommonModule } from '@angular/common'; 
import { ReservaService } from '../../services/reserva.service';

@Component({
  selector: 'app-admin',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {

  listaReservas: any[] = [];

  // 2. Lo inyectamos en el constructor como 'cdr'
  constructor(
    private reservaService: ReservaService,
    private cdr: ChangeDetectorRef 
  ) { }

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservaService.listarTodas().subscribe({
      next: (datos) => {
        this.listaReservas = datos;
        console.log('Reservas cargadas para el admin:', datos);
        
        // Forzamos a Angular a despertar la vista
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar las reservas:', err);
        alert('No se pudieron cargar las reservas. ¿Prendiste el Backend en IntelliJ? 😉');
      }
    });
  }

  actualizarEstado(idReserva: number, idNuevoEstado: number): void {
    this.reservaService.cambiarEstado(idReserva, idNuevoEstado).subscribe({
      next: (reservaActualizada) => {
        alert(`Reserva #${idReserva} actualizada con éxito.`);
        this.cargarReservas();
      },
      error: (err) => {
        console.error('Error al cambiar de estado:', err);
        alert('Error al intentar cambiar el estado de la reserva.');
      }
    });
  }
}