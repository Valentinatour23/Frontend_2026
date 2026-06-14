import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AlojamientoService } from '../../services/alojamiento.service';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { Alojamiento } from '../../interfaces/alojamiento';
import { Prueba } from '../../services/prueba';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule, NavbarComponent],
  providers: [AlojamientoService],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})

export class InicioComponent implements OnInit {

  listaAlojamientos: Alojamiento[] = [];
  mostrarContenido = false;
  backendConectado = false;
  mensajeBackend = 'Conectando con backend...';
  resenaActual = 0;
  bungalowSeleccionado: number | null = null;
  errorReserva: string = '';

  irAInicio(): void { document.getElementById('inicio')?.scrollIntoView({ behavior: 'smooth' }); }
  irAUbicacion(): void { document.getElementById('ubicacion')?.scrollIntoView({ behavior: 'smooth' }); }
  irAContacto(): void { document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' }); }
  irAReserva(): void { document.querySelector('.reserva-section')?.scrollIntoView({ behavior: 'smooth' }); }

  resenas = [
    {
      inicial: 'L', nombre: 'Lorena Chaires', meta: '7 reseñas · 6 fotos',
      tiempo: 'Hace un año',
      texto: 'Excelente lugar, tranquilo, cerca de todo, con un parque y pileta hermosos! Especial para disfrutar! La atención de sus dueños, inmejorable!'
    },
    {
      inicial: 'O', nombre: 'Oscar Carruego', meta: 'Local guide · 59 reseñas',
      tiempo: 'Hace 8 años', texto: 'Muy bien, lindo lugar.'
    },
    {
      inicial: 'M', nombre: 'Maria Gomez', meta: 'Local guide · 10 reseñas',
      tiempo: 'Hace 3 años',
      texto: 'Un lugar soñado. Perfecto para relajarse y disfrutar en pareja o en familia. Seguro volvemos pronto.'
    }
  ];
  fotosCarrusel: string[] = [
    'fotos/fotodepiscina.jpeg',
    'fotos/foto2fondo.jpeg',
    'fotos/1c832aa5-e17a-4062-89ea-3b3f560b45c5.jpg',
    'fotos/5c7661e1-c6e9-46de-aab9-7c29ff0f5d25.jpg',
    'fotos/5ed995e9-fbfc-441a-b5ae-649e7e90ac6f.jpg',
    'fotos/8f6a6f92-0ea1-45cc-b93b-905e83c40758.jpg',
    'fotos/94bfa2e6-d71a-4025-bca9-4df14c8f5baa.jpg',
    'fotos/94c5827f-d82b-4f82-9d32-e145a6661b53.jpg',
    'fotos/443f5b87-0b51-4ea0-8a1a-f37b4f83c823.jpg',
    'fotos/958edcfb-b814-4200-93a1-d68588e284fd.jpg',
    'fotos/cfbf2d66-274b-489f-a5f5-0bc342dcc9b7.jpg',
    'fotos/df14f774-b5e3-4ffc-90cf-f4ec37ee8275.jpg',
    'fotos/f5a3d284-1947-4667-862f-e1a0dc93f729.jpg',
    'fotos/fa31592f-dc59-440c-bed8-7fec1734e259.jpg'
  ];

  fotoActual: number = 0;

  siguienteFoto(): void {
    this.fotoActual = (this.fotoActual + 1) % this.fotosCarrusel.length;
  }

  anteriorFoto(): void {
    this.fotoActual = (this.fotoActual - 1 + this.fotosCarrusel.length) % this.fotosCarrusel.length;
  }
  mostrarFormResena = false;

  nuevaResena = {
    nombre: '',
    meta: '',
    texto: '',
    inicial: ''
  };

  agregarResena(): void {
    if (!this.nuevaResena.nombre || !this.nuevaResena.texto) return;
    
    this.resenas.push({
      inicial: this.nuevaResena.nombre.charAt(0).toUpperCase(),
      nombre: this.nuevaResena.nombre,
      meta: this.nuevaResena.meta || 'Huésped de Samarana',
      tiempo: 'Ahora',
      texto: this.nuevaResena.texto
    });

    this.nuevaResena = { nombre: '', meta: '', texto: '', inicial: '' };
    this.mostrarFormResena = false;
    this.resenaActual = this.resenas.length - 3;
  }
  
  nuevaReserva = {
    telefono: '',
    fecha_inicio: '',
    fecha_fin: '',
    cantidad_personas: 1,
    alojamiento: null as any,
    usuario: { usuario: '' },
    total_tarifa: 0
  };

  tarifaEstimada: number = 0;
  precioPorNocheCalculado: number = 0;
  nochesCalculadas: number = 0;

  // ── Calendario ──
  diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  mesActual: number = new Date().getMonth();
  anioActual: number = new Date().getFullYear();
  diasCalendario: (Date | null)[] = [];
  nombresMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  fechaInicioDate: Date | null = null;
  fechaFinDate: Date | null = null;

  get nombreMes(): string {
    return this.nombresMeses[this.mesActual];
  }

  constructor(
    private _alojamientoService: AlojamientoService,
    private _reservaService: ReservaService,
    private prueba: Prueba,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        this.mostrarContenido = true;
      }
    });

    this.prueba.probar().subscribe({
      next: (respuesta) => {
        this.mensajeBackend = respuesta;
        this.backendConectado = true;
      },
      error: (err) => {
        this.mensajeBackend = 'No se pudo conectar con el backend';
        this.backendConectado = false;
        console.error('Error conectando con el backend:', err);
      }
    });   

    this._alojamientoService.alojamientos().subscribe({
      next: (data: Alojamiento[]) => { this.listaAlojamientos = data; },
      error: (err: any) => console.error('Error al conectar:', err)
    });
    this.generarCalendario();
  }

  saberMas(): void {
    this.mostrarContenido = true;
    setTimeout(() => {
      const seccion = document.getElementById('seccion-cabanas');
      if (seccion) seccion.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  siguienteResena(): void {
    this.resenaActual = (this.resenaActual + 1) % this.resenas.length;
  }

  anteriorResena(): void {
    this.resenaActual = (this.resenaActual - 1 + this.resenas.length) % this.resenas.length;
  }

seleccionarBungalow(index: number): void {
    this.errorReserva = '';

    const token = sessionStorage.getItem('token') || sessionStorage.getItem('usuario');

    if (!token) {
      const navegar = this.router;
      Swal.fire({
        title: '¡Atención!',
        text: 'Debes iniciar sesión para ver la disponibilidad y reservar en Cabañas Samarana.',
        icon: 'warning',
        confirmButtonText: 'Ir al Login',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          navegar.navigate(['/login']);
        }
      });
      return;
    }

    this.bungalowSeleccionado = index;
    this.limpiarFechas();
    if (this.listaAlojamientos.length > index) {
      this.nuevaReserva.alojamiento = this.listaAlojamientos[index];
    }
  }

  volverBungalows(): void {
    this.bungalowSeleccionado = null;
    this.limpiarFechas();
  }

  // ── Calendario ──
  generarCalendario(): void {
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    let diaSemana = primerDia.getDay();
    diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;
    const diasEnMes = new Date(this.anioActual, this.mesActual + 1, 0).getDate();
    this.diasCalendario = [];
    for (let i = 0; i < diaSemana; i++) this.diasCalendario.push(null);
    for (let d = 1; d <= diasEnMes; d++) {
      this.diasCalendario.push(new Date(this.anioActual, this.mesActual, d));
    }
  }

  mesAnterior(): void {
    if (this.mesActual === 0) { this.mesActual = 11; this.anioActual--; }
    else { this.mesActual--; }
    this.generarCalendario();
  }

  mesSiguiente(): void {
    if (this.mesActual === 11) { this.mesActual = 0; this.anioActual++; }
    else { this.mesActual++; }
    this.generarCalendario();
  }

  seleccionarFecha(dia: Date): void {
    if (!this.fechaInicioDate || (this.fechaInicioDate && this.fechaFinDate)) {
      this.fechaInicioDate = dia;
      this.fechaFinDate = null;
      this.nuevaReserva.fecha_inicio = this.formatearFecha(dia);
      this.nuevaReserva.fecha_fin = '';
    } else {
      if (dia <= this.fechaInicioDate) {
        this.fechaInicioDate = dia;
        this.nuevaReserva.fecha_inicio = this.formatearFecha(dia);
        this.nuevaReserva.fecha_fin = '';
        this.fechaFinDate = null;
      } else {
        this.fechaFinDate = dia;
        this.nuevaReserva.fecha_fin = this.formatearFecha(dia);
      }
    }
    this.calcularTarifa();
  }

  formatearFecha(d: Date): string {
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  limpiarFechas(): void {
    this.fechaInicioDate = null;
    this.fechaFinDate = null;
    this.nuevaReserva.fecha_inicio = '';
    this.nuevaReserva.fecha_fin = '';
    this.calcularTarifa(); 
  }

  esPasado(dia: Date): boolean {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    return dia < hoy;
  }

  esHoy(dia: Date): boolean {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    return dia.getTime() === hoy.getTime();
  }

  esFechaInicio(dia: Date): boolean {
    return !!this.fechaInicioDate && dia.getTime() === this.fechaInicioDate.getTime();
  }

  esFechaFin(dia: Date): boolean {
    return !!this.fechaFinDate && dia.getTime() === this.fechaFinDate.getTime();
  }

  estaEnRango(dia: Date): boolean {
    if (!this.fechaInicioDate || !this.fechaFinDate) return false;
    return dia > this.fechaInicioDate && dia < this.fechaFinDate;
  }

  procesarReserva(): void {
    this.errorReserva = '';

    const token = sessionStorage.getItem('token') || localStorage.getItem('token') || 
                  sessionStorage.getItem('usuario') || localStorage.getItem('usuario');

    if (!token) {
      const navegar = this.router;
      Swal.fire({
        title: '¡Sesión Requerida!',
        text: 'Para completar tu solicitud de reserva es necesario estar registrado.',
        icon: 'warning',
        confirmButtonText: 'Iniciar Sesión',
        confirmButtonColor: '#3085d6',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          navegar.navigate(['/login']);
        }
      });
      return;
    }

    this.normalizarCantidadPersonas();

    if (!this.nuevaReserva.fecha_inicio || !this.nuevaReserva.fecha_fin || !this.nuevaReserva.alojamiento || !this.nuevaReserva.cantidad_personas) {
      this.errorReserva = 'Selecciona fecha de ingreso, egreso y cantidad de personas.';
      return;
    }

    const reserva = {
      fecha_inicio: this.nuevaReserva.fecha_inicio,
      fecha_fin: this.nuevaReserva.fecha_fin,
      cantidad_personas: this.nuevaReserva.cantidad_personas,
      alojamiento: {
        id_alojamiento: this.nuevaReserva.alojamiento.id_alojamiento
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
        console.error('Error al crear reserva:', err);
        
        let mensajeBackend = 'No se pudo registrar la reserva con las fechas seleccionadas.';
        
        if (typeof err?.error === 'string' && err.error.trim()) {
          mensajeBackend = err.error;
        } else if (err?.error?.mensaje) {
          mensajeBackend = err.error.mensaje;
        } else if (err?.error?.text) {
          mensajeBackend = err.error.text;
        }

        Swal.fire({
          title: 'Fechas No Disponibles',
          text: mensajeBackend,
          icon: 'error',
          confirmButtonText: 'Elegir otras fechas',
          confirmButtonColor: '#d33'
        });

        this.errorReserva = mensajeBackend;
      }
    });
  }

  calcularTarifa(): void {
    this.normalizarCantidadPersonas();

    if (!this.fechaInicioDate || !this.fechaFinDate || !this.nuevaReserva.alojamiento) {
      this.tarifaEstimada = 0;
      this.nuevaReserva.total_tarifa = 0;
      this.nochesCalculadas = 0;
      this.precioPorNocheCalculado = 0;
      return;
    }

    const milisegundosPorDia = 24 * 60 * 60 * 1000;
    this.nochesCalculadas = Math.round(Math.abs((this.fechaFinDate.getTime() - this.fechaInicioDate.getTime()) / milisegundosPorDia));

    if (this.nochesCalculadas > 0) {
      const personas = this.nuevaReserva.cantidad_personas || 1;
      const alojo = this.nuevaReserva.alojamiento;

      const base = alojo.precioBase ?? alojo.precio_base ?? 0;
      const full = alojo.precioFull ?? alojo.precio_full ?? 0;

      this.precioPorNocheCalculado = (personas > 2 && full > 0) ? full : base;

      this.tarifaEstimada = this.precioPorNocheCalculado * this.nochesCalculadas;
      this.nuevaReserva.total_tarifa = this.tarifaEstimada;
    } else {
      this.tarifaEstimada = 0;
      this.nuevaReserva.total_tarifa = 0;
      this.nochesCalculadas = 0;
      this.precioPorNocheCalculado = 0;
    }
  }

  normalizarCantidadPersonas(): void {
    const maximo = this.nuevaReserva.alojamiento?.capacidad_max || 10;
    let cantidad = Number(this.nuevaReserva.cantidad_personas) || 1;

    if (cantidad < 1) cantidad = 1;
    if (cantidad > maximo) cantidad = maximo;

    this.nuevaReserva.cantidad_personas = cantidad;
  }
}