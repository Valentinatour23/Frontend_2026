import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlojamientoService } from '../../services/alojamiento.service';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { Alojamiento } from '../../interfaces/alojamiento';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [AlojamientoService],
  templateUrl: './reserva.html',
  styleUrl: './reserva.css'
})
export class Reserva implements OnInit {

  // Signal: cuando se actualiza, la UI reacciona automáticamente sin recargar la página
  listaAlojamientos = signal<Alojamiento[]>([]);
  cantidadAlojamientos = computed(() => this.listaAlojamientos().length);

  errorReserva: string = '';
  usuarioLogueado: any = null;

  nuevaReserva = {
    fecha_inicio: '',
    fecha_fin: '',
    cantidad_personas: 1,
    alojamiento: null as Alojamiento | null
  };

  fechaMinima: string = new Date().toISOString().split('T')[0];

  constructor(
    private _alojamientoService: AlojamientoService,
    private _reservaService: ReservaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._alojamientoService.alojamientos().subscribe({
      next: (data: Alojamiento[]) => {
        // Al actualizar el Signal, la UI reacciona automáticamente
        this.listaAlojamientos.set(data);
      },
      error: (err: any) => console.error('Error al conectar:', err)
    });

    this.usuarioLogueado = this.authService.obtenerUsuarioCompleto();

    if (!this.usuarioLogueado) {
      console.warn('No hay ningún usuario logueado en este momento.');
    }
  }

  procesarReserva(): void {

    if (!this.usuarioLogueado) {
      Swal.fire({
        title: '¡Atención!',
        text: 'Debes iniciar sesión o registrarte para poder realizar una reserva.',
        icon: 'warning',
        confirmButtonText: 'Ir al Login',
        confirmButtonColor: '#ddd',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const bungalowElegido = this.nuevaReserva.alojamiento;
    this.normalizarCantidadPersonas();

    if (!bungalowElegido || !this.nuevaReserva.fecha_inicio || !this.nuevaReserva.fecha_fin || !this.nuevaReserva.cantidad_personas) {
      this.errorReserva = 'Selecciona bungalow, fechas y cantidad de personas.';
      return;
    }

    const reserva = {
      fecha_inicio: this.nuevaReserva.fecha_inicio,
      fecha_fin: this.nuevaReserva.fecha_fin,
      cantidad_personas: this.nuevaReserva.cantidad_personas,
      id_usuario: this.usuarioLogueado.id_usuario,
      alojamiento: {
        id_alojamiento: bungalowElegido.id_alojamiento
      }
    };

    this._reservaService.crearReserva(reserva).subscribe({
      next: (reservaGuardada: any) => {

        if (!reservaGuardada || reservaGuardada.mensaje || !reservaGuardada.id_reserva) {
          const mensajeOcupado = reservaGuardada?.mensaje || 'Lo sentimos, el bungalow ya está ocupado en esas fechas.';

          Swal.fire({
            title: 'Fechas No Disponibles',
            text: mensajeOcupado,
            icon: 'error',
            confirmButtonText: 'Elegir otras fechas',
            confirmButtonColor: '#d33'
          });

          this.errorReserva = mensajeOcupado;
          return;
        }

        this.errorReserva = '';
        const usuarioReserva = reservaGuardada.usuario || {};
        const nombreCompleto = `${usuarioReserva.nombre || ''} ${usuarioReserva.apellido || ''}`.trim() || usuarioReserva.usuario;

        const mensaje = `Hola Samarana! Quiero confirmar mi reserva. 
          *Nro de Reserva:* #${reservaGuardada.id_reserva}
          *Alojamiento:* ${reservaGuardada.alojamiento.nombre_alojamiento}
          *Nombre:* ${nombreCompleto}
          *DNI:* ${usuarioReserva.dni || ''}
          *Email:* ${usuarioReserva.email || ''}
          *Telefono:* ${usuarioReserva.telefono || ''}
          *Desde:* ${reservaGuardada.fecha_inicio} 
          *Hasta:* ${reservaGuardada.fecha_fin}
          *Personas:* ${reservaGuardada.cantidad_personas}
          *Total a abonar:* $${reservaGuardada.total_tarifa}
          Adjunto el comprobante de pago.`;

        Swal.fire({
          title: '¡Reserva Registrada!',
          text: 'Redirigiendo a WhatsApp para enviar el comprobante...',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          const urlWhatsApp = `https://api.whatsapp.com/send?phone=5493447542330&text=${encodeURIComponent(mensaje)}`;
          window.open(urlWhatsApp, '_blank');
        });
      },
      error: (err: any) => {
        console.error('Error crítico del servidor:', err);
        Swal.fire({
          title: 'Error de Conexión',
          text: 'No se pudo comunicar con el servidor. Intentalo más tarde.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  normalizarCantidadPersonas(): void {
    const maximo = this.nuevaReserva.alojamiento?.capacidad_max || 10;
    let cantidad = Number(this.nuevaReserva.cantidad_personas) || 1;

    if (cantidad < 1) cantidad = 1;
    if (cantidad > maximo) cantidad = maximo;

    this.nuevaReserva.cantidad_personas = cantidad;
  }
}