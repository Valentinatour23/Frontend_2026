import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AlojamientoService } from '../../services/alojamiento.service';
import { ReservaService } from '../../services/reserva.service';
import { Alojamiento } from '../../interfaces/alojamiento';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [AlojamientoService],
  templateUrl: './reserva.html',
  styleUrl: './reserva.css'
})
export class Reserva implements OnInit {

  listaAlojamientos: Alojamiento[] = [];

  nuevaReserva = {
    telefono: '',
    fecha_inicio: '',
    fecha_fin: '',
    cantidad_personas: 1,
    alojamiento: null as any,
    usuario: {
      nombre_usuario: ''
    }
  };

  fechaMinima: string = new Date().toISOString().split('T')[0];

  constructor(
    private _alojamientoService: AlojamientoService,
    private _reservaService: ReservaService
  ) {}

  ngOnInit(): void {
    this._alojamientoService.alojamientos().subscribe({
      next: (data: Alojamiento[]) => {
        this.listaAlojamientos = data;
      },
      error: (err: any) => console.error('Error al conectar:', err)
    });
  }

  procesarReserva(bungalowElegido: Alojamiento): void {
    this.nuevaReserva.alojamiento = bungalowElegido;

    this._reservaService.crearReserva(this.nuevaReserva).subscribe({
      next: (reservaGuardada: any) => {
        console.log('Reserva creada en BD con éxito:', reservaGuardada);

        const mensaje = `Hola Samarana! Quiero confirmar mi reserva. 
        *Nro de Reserva:* #${reservaGuardada.id_reserva}
        *Alojamiento:* ${reservaGuardada.alojamiento.nombre}
        *Nombre:* ${reservaGuardada.usuario.usuario}
        *Desde:* ${reservaGuardada.fecha_inicio} 
        *Hasta:* ${reservaGuardada.fecha_fin}
        Adjunto el comprobante de pago.`;

        const numeroTelefono = '5493447542330';
        const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');
      },
      error: (err: any) => console.error('Error al crear reserva:', err)
    });
  }
}