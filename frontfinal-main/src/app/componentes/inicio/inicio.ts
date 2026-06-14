import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AlojamientoService } from '../../services/alojamiento.service';
import { ReservaService } from '../../services/reserva.service';
import { Alojamiento } from '../../interfaces/alojamiento';
import { Prueba } from '../../services/prueba';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule, NavbarComponent], // ← AGREGAR NavbarComponent
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

  nuevaReserva = {
    telefono: '',
    fecha_inicio: '',
    fecha_fin: '',
    cantidad_personas: 1,
    alojamiento: null as any,
    usuario: { usuario: '' }
  };

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
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
    if (fragment) {
      this.mostrarContenido = true;
    }
    });
    
    /*
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
    });   */

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
    this._reservaService.crearReserva(this.nuevaReserva).subscribe({
      next: (reservaGuardada: any) => {
        const mensaje = `Hola Samarana! Quiero confirmar mi reserva. 
          *Nro de Reserva:* #${reservaGuardada.id_reserva}
          *Alojamiento:* ${reservaGuardada.alojamiento.nombre_alojamiento}
          *Nombre:* ${reservaGuardada.usuario.usuario}
          *Desde:* ${reservaGuardada.fecha_inicio} 
          *Hasta:* ${reservaGuardada.fecha_fin}
          Adjunto el comprobante de pago.`;

        const urlWhatsApp = `https://api.whatsapp.com/send?phone=5493447542330&text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');
      },
        error: (err: any) => {
        console.error('Error al crear reserva:', err);
        // Cartel emergente para superposición de reservas
        alert('Lo sentimos. Las fechas seleccionadas ya se encuentran reservadas para este bungalow. Por favor, seleccioná otro período.');
      }
    });
  }


}
