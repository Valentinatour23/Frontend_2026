import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ReservaService } from '../../services/reserva.service';




Chart.register(...registerables);




@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit, AfterViewInit {
  // Datos y estado
  listaReservas: any[] = [];
  bloqueosActivos: any[] = [];
  reservaSeleccionada: any = null;




  // Filtros y formularios
  textoBusqueda: string = '';
  cabanaSeleccionada: string = 'todas';
  fechaDesde: string = '';
  fechaHasta: string = '';
  filtroActual: string = 'todos';




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
    private reservaService: ReservaService
  ) {}




  ngOnInit(): void {
    this.cargarDatos();
  }




  ngAfterViewInit(): void {
    // Los gráficos se inicializan al cargar los datos
  }




  cargarDatos(): void {
    this.reservaService.listarTodas().subscribe({
      next: (data: any[]) => {
        this.listaReservas = data;
        this.cargarDiasCalendario();
        this.inicializarGraficos(); // Ahora sí inicializa con datos
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar reservas:', err)
    });
  }


  // --- MÉTODOS DE ACCIÓN ---

  eliminarTodosLosCancelados(): void {
    this.listaReservas = this.listaReservas.filter(res => res.estado?.id_estado !== 3);
    this.cargarDiasCalendario();
    this.inicializarGraficos();
  }


  cambiarFiltro(filtro: string): void {
    this.filtroActual = filtro;
  }


  debeMostrarReserva(res: any): boolean {
  // 1. Filtro por Cliente (Texto)
  if (this.textoBusqueda && !res.usuario?.usuario?.toLowerCase().includes(this.textoBusqueda.toLowerCase())) {
    return false;
  }


  // 2. Filtro por Unidad (Cabaña)
  if (this.cabanaSeleccionada !== 'todas' && res.alojamiento?.nombre_alojamiento !== this.cabanaSeleccionada) {
    return false;
  }


  // 3. Filtro por Fechas
  if (this.fechaDesde && new Date(res.fecha_inicio) < new Date(this.fechaDesde)) {
    return false;
  }
  if (this.fechaHasta && new Date(res.fecha_fin) > new Date(this.fechaHasta)) {
    return false;
  }


  // 4. Filtro por Estado (Tabs)
  if (this.filtroActual === 'pendientes' && res.estado?.id_estado !== 1) {
    return false;
  }
  if (this.filtroActual === 'canceladas' && res.estado?.id_estado !== 3) {
    return false;
  }


  // Si no se descartó por ninguno de los filtros anteriores, se muestra
  return true;
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
      this.cargarDatos(); // Recargar datos tras actualizar
    });
  }




  eliminarReservaIndividual(res: any): void {
    this.listaReservas = this.listaReservas.filter(r => r.id_reserva !== res.id_reserva);
    this.cargarDiasCalendario();
    this.inicializarGraficos();
  }




  // --- GESTIÓN DE BLOQUEOS (MANTENIMIENTO) ---




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




    // 1. Ocupación
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




    // 2. Ingresos
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




    // 3. Demanda
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
