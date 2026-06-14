import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appFilterReservas',
  standalone: true
})
export class FilterReservasPipe implements PipeTransform {

  transform(
    reservas: any[],
    textoBusqueda: string = '',         
    cabanaSeleccionada: string = 'todas', 
    fechaDesde: string = '',         
    fechaHasta: string = ''            
  ): any[] {
    if (!reservas) return [];

    return reservas.filter(reserva => {
      if (textoBusqueda && textoBusqueda.trim() !== '') {
        const busqueda = textoBusqueda.toLowerCase();
        const nombreCliente = (reserva.usuario?.usuario || '').toLowerCase();
        if (!nombreCliente.includes(busqueda)) return false;
      }

      if (cabanaSeleccionada && cabanaSeleccionada !== 'todas') {
        const nombreCabana = (reserva.alojamiento?.nombre_alojamiento || '').toLowerCase();
        if (!nombreCabana.includes(cabanaSeleccionada.toLowerCase())) return false;
      }

      if (reserva.fecha_inicio) {
        const fechaReservaStr = reserva.fecha_inicio.split('T')[0]; 

        if (fechaDesde && fechaReservaStr < fechaDesde) return false;
        if (fechaHasta && fechaReservaStr > fechaHasta) return false;
      } else if (fechaDesde || fechaHasta) {
        return false;
      }

      return true;
    });
  }
}