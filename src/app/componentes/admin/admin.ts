import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ReservaService } from '../../services/reserva.service';
import { Router } from '@angular/router';
Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit, AfterViewInit {

  // Datos
  listaReservas: any[] = [];
  bloqueosActivos: any[] = [];
  reservaSeleccionada: any = null;

  // Pestañas
  pestanaActiva: string = 'dashboard';

  // Filtros
  textoBusqueda: string = '';
  cabanaSeleccionada: string = 'todas';
  fechaDesde: string = '';
  fechaHasta: string = '';
  filtroActual: string = 'todos';

  // Bloqueos
  nuevoBloqueo: any = { cabana: 'Bungalow A', motivo: '', inicio: '', fin: '' };

  // Calendario
  fechaCalendarioActual: Date = new Date();
  nombresMeses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  diasBungalowA: any[] = [];
  diasBungalowB: any[] = [];

  constructor(
  private cdr: ChangeDetectorRef,
  private reservaService: ReservaService,
  private router: Router 
) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}
  
  irAlInicio(): void {
  this.router.navigate(['/inicio']);
}

exportarExcel(): void {
  const reservasParaExportar = this.listaReservas
    .filter(r => r.estado?.id_estado !== 3) // Solo activas
    .map(r => ({
      'Nro Reserva': r.id_reserva,
      'Cliente': this.obtenerNombreCliente(r.usuario),
      'Email': r.usuario?.email || '',
      'Teléfono': r.usuario?.telefono || '',
      'Alojamiento': r.alojamiento?.nombre_alojamiento || '',
      'Ingreso': r.fecha_inicio,
      'Egreso': r.fecha_fin,
      'Personas': r.cantidad_personas,
      'Total': r.total_tarifa,
      'Estado': r.estado?.nombre_estado || ''
    }));

  // Convertir a CSV
  const headers = Object.keys(reservasParaExportar[0]);
  const csvContent = [
    headers.join(','),
    ...reservasParaExportar.map(row =>
      headers.map(h => `"${(row as any)[h] || ''}"`).join(',')
    )
  ].join('\n');

  // Descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reservas_samarana_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
  // --- CARGA DE DATOS ---

  cargarDatos(): void {
    this.reservaService.listarTodas().subscribe({
      next: (data: any[]) => {
        this.listaReservas = data;
        this.cargarDiasCalendario();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.inicializarGraficos();
        }, 100);
      },
      error: (err) => console.error('Error al cargar reservas:', err)
    });
  }

  // --- PESTAÑAS ---

  cambiarPestana(pestana: string): void {
    this.pestanaActiva = pestana;
    if (pestana === 'estadisticas') {
      setTimeout(() => this.inicializarGraficos(), 100);
    }
  }

  // --- KPIs ---

  get totalReservasActivas(): number {
    return this.listaReservas.filter(r => r.estado?.id_estado === 1 || r.estado?.id_estado === 2).length;
  }

  get ingresosMesActual(): number {
    const mesActual = new Date().getMonth();
    return this.listaReservas
      .filter(r => r.estado?.id_estado === 2 && new Date(r.fecha_inicio).getMonth() === mesActual)
      .reduce((acc, r) => acc + (r.total_tarifa || 0), 0);
  }

  get totalPendientes(): number {
    return this.listaReservas.filter(r => r.estado?.id_estado === 1).length;
  }

  get proximoCheckIn(): string {
    const hoy = new Date();
    const proxima = this.listaReservas
      .filter(r => r.estado?.id_estado === 2 && new Date(r.fecha_inicio) >= hoy)
      .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())[0];
    if (!proxima) return 'Sin próximos';
    return this.obtenerNombreCliente(proxima.usuario) + ' — ' + proxima.alojamiento?.nombre_alojamiento;
  }

  get proximasLlegadas(): any[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const en7dias = new Date(hoy);
    en7dias.setDate(hoy.getDate() + 7);

    return this.listaReservas
      .filter(r => {
        const fechaIngreso = new Date(r.fecha_inicio);
        fechaIngreso.setHours(0, 0, 0, 0);
        return (r.estado?.id_estado === 1 || r.estado?.id_estado === 2) &&
               fechaIngreso >= hoy &&
               fechaIngreso <= en7dias;
      })
      .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());
  }

  // --- FILTROS ---

  cambiarFiltro(filtro: string): void {
    this.filtroActual = filtro;
  }

  debeMostrarReserva(res: any): boolean {
    if (this.textoBusqueda && !res.usuario?.usuario?.toLowerCase().includes(this.textoBusqueda.toLowerCase())) {
      return false;
    }
    if (this.cabanaSeleccionada !== 'todas' && res.alojamiento?.nombre_alojamiento !== this.cabanaSeleccionada) {
      return false;
    }
    if (this.fechaDesde && new Date(res.fecha_inicio) < new Date(this.fechaDesde)) {
      return false;
    }
    if (this.fechaHasta && new Date(res.fecha_fin) > new Date(this.fechaHasta)) {
      return false;
    }
    if (this.filtroActual === 'pendientes' && res.estado?.id_estado !== 1) {
      return false;
    }
    if (this.filtroActual === 'canceladas' && res.estado?.id_estado !== 3) {
      return false;
    }
    return true;
  }

  // --- ACCIONES ---

  eliminarTodosLosCancelados(): void {
    this.listaReservas = this.listaReservas.filter(res => res.estado?.id_estado !== 3);
    this.cargarDiasCalendario();
    this.inicializarGraficos();
  }

  seleccionarReserva(res: any): void {
    this.reservaSeleccionada = res;
  }

  obtenerNombreCliente(usuarioData: any): string {
    if (!usuarioData) return 'Sin registrar';
    if (typeof usuarioData === 'object') {
      if (usuarioData.nombre) {
        const apellido = usuarioData.apellido ? ` ${usuarioData.apellido}` : '';
        return `${usuarioData.nombre}${apellido}`;
      }
      if (usuarioData.usuario) return usuarioData.usuario;
    }
    if (typeof usuarioData === 'string') {
      return usuarioData.replace(/^"|"$/g, '').trim();
    }
    return 'Sin registrar';
  }

  actualizarEstado(idReserva: number, idEstado: number): void {
    this.reservaService.cambiarEstado(idReserva, idEstado).subscribe(() => {
      const reserva = this.listaReservas.find(r => r.id_reserva === idReserva);
      if (reserva) {
        reserva.estado = {
          id_estado: idEstado,
          nombre_estado: idEstado === 2 ? 'Confirmada' : 'Cancelada'
        };
        if (idEstado === 2) {
          this.enviarConfirmacionWhatsApp(reserva);
        }
      }
      this.cargarDiasCalendario();
      this.inicializarGraficos();
    });
  }

  enviarConfirmacionWhatsApp(reserva: any): void {
    const usuario = reserva.usuario || {};
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || usuario.usuario;

    const mensaje = `Hola ${nombreCompleto}! 😊 Te confirmamos tu reserva en Cabañas Samarana.
*Nro de Reserva:* #${reserva.id_reserva}
*Alojamiento:* ${reserva.alojamiento?.nombre_alojamiento}
*Ingreso:* ${reserva.fecha_inicio}
*Egreso:* ${reserva.fecha_fin}
*Personas:* ${reserva.cantidad_personas}
*Total:* $${reserva.total_tarifa}
¡Los esperamos! 🏡`;

    const telefono = usuario.telefono?.replace(/\D/g, '') || '';
    const url = `https://api.whatsapp.com/send?phone=549${telefono}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  eliminarReservaIndividual(res: any): void {
    this.listaReservas = this.listaReservas.filter(r => r.id_reserva !== res.id_reserva);
    this.cargarDiasCalendario();
    this.inicializarGraficos();
  }

  // --- BLOQUEOS ---

  agregarBloqueoMantenimiento(): void {
    if (this.nuevoBloqueo.inicio && this.nuevoBloqueo.fin) {
      this.bloqueosActivos.push({ ...this.nuevoBloqueo });
      this.nuevoBloqueo = { cabana: 'Bungalow A', motivo: '', inicio: '', fin: '' };
      this.cargarDiasCalendario();
      this.inicializarGraficos();
    }
  }

  eliminarBloqueo(index: number): void {
    this.bloqueosActivos.splice(index, 1);
    this.cargarDiasCalendario();
    this.inicializarGraficos();
  }

  // --- CALENDARIO ---

  mesAnterior(): void {
    this.fechaCalendarioActual = new Date(this.fechaCalendarioActual.getFullYear(), this.fechaCalendarioActual.getMonth() - 1, 1);
    this.cargarDiasCalendario();
  }

  mesSiguiente(): void {
    this.fechaCalendarioActual = new Date(this.fechaCalendarioActual.getFullYear(), this.fechaCalendarioActual.getMonth() + 1, 1);
    this.cargarDiasCalendario();
  }

  cargarDiasCalendario(): void {
    this.diasBungalowA = [];
    this.diasBungalowB = [];
    const anio = this.fechaCalendarioActual.getFullYear();
    const mes = this.fechaCalendarioActual.getMonth();
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    let primerDia = new Date(anio, mes, 1).getDay();
    primerDia = primerDia === 0 ? 6 : primerDia - 1;

    for (let v = 0; v < primerDia; v++) {
      this.diasBungalowA.push({ numero: null, estado: 'vacio' });
      this.diasBungalowB.push({ numero: null, estado: 'vacio' });
    }

    for (let i = 1; i <= totalDias; i++) {
      const tiempoActual = new Date(anio, mes, i).getTime();
      this.diasBungalowA.push({ numero: i, estado: this.calcularEstado(tiempoActual, 'Bungalow A') });
      this.diasBungalowB.push({ numero: i, estado: this.calcularEstado(tiempoActual, 'Bungalow B') });
    }
  }

  private calcularEstado(tiempoActual: number, cabana: string): string {
    const bloqueo = this.bloqueosActivos.find(b =>
      b.cabana === cabana &&
      tiempoActual >= new Date(b.inicio).getTime() &&
      tiempoActual <= new Date(b.fin).getTime()
    );
    if (bloqueo) return 'mantenimiento';

    const reserva = this.listaReservas.find(res =>
      res.alojamiento?.nombre_alojamiento === cabana &&
      res.estado?.id_estado !== 3 &&
      tiempoActual >= new Date(res.fecha_inicio).getTime() &&
      tiempoActual <= new Date(res.fecha_fin).getTime()
    );

    if (reserva) return reserva.estado?.id_estado === 1 ? 'pendiente' : 'ocupado';
    return 'libre';
  }

  // --- GRÁFICOS ---

  inicializarGraficos(): void {
    if (!this.listaReservas) return;

    const pendientes = this.listaReservas.filter(r => r.estado?.id_estado === 1).length;
    const confirmados = this.listaReservas.filter(r => r.estado?.id_estado === 2).length;
    const mantenimientos = this.bloqueosActivos.length;

    this.renderChart('canvasOcupacion', 'doughnut', {
      labels: ['Pendiente', 'Reservado', 'Mantenimiento'],
      datasets: [{
        data: [pendientes, confirmados, mantenimientos],
        backgroundColor: ['#f59e0b', '#10b981', '#facc15']
      }]
    });

    const datosIngresos = new Array(12).fill(0);
    this.listaReservas.forEach(r => {
      const mes = new Date(r.fecha_inicio).getMonth();
      datosIngresos[mes] += (r.total_tarifa || 0);
    });

    this.renderChart('canvasIngresos', 'line', {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Ingresos ($)',
        data: datosIngresos,
        borderColor: '#433529',
        tension: 0.3
      }]
    });

    const datosDemanda = new Array(12).fill(0);
    this.listaReservas.forEach(r => {
      const mes = new Date(r.fecha_inicio).getMonth();
      datosDemanda[mes]++;
    });

    this.renderChart('canvasMesesReservas', 'bar', {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Reservas Totales',
        data: datosDemanda,
        backgroundColor: '#10b981'
      }]
    });
  }

  private renderChart(canvasId: string, tipo: any, data: any) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const existingChart = Chart.getChart(canvasId);
    if (existingChart) existingChart.destroy();
    new Chart(canvas, {
      type: tipo,
      data: data,
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

}