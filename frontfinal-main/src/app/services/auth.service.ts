import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth/login';

  constructor(private http: HttpClient) {}

  login(usuario: string, contrasena: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { usuario, contrasena });
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
  }

  obtenerRol(): string | null {
    const token = this.obtenerToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol ?? null;
    } catch {
      return null;
    }
  }

  esAdmin(): boolean {
    return this.obtenerRol() === 'ADMIN';
  }
}