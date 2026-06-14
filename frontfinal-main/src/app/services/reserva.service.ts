import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private apiUrl = 'http://localhost:8080/api/reservas';

  constructor(private http: HttpClient, private authService: AuthService) {}

  crearReserva(reserva: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/guardar`, reserva);
  }

  getDisponibilidad(bungalowId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/disponibilidad?bungalowId=${bungalowId}`);
  }

  listarTodas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`, {
      headers: this.getHeaders()
    });
  }

  cambiarEstado(idReserva: number, idNuevoEstado: number): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/cambiar-estado/${idReserva}?nuevoEstado=${idNuevoEstado}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.obtenerToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}