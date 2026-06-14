import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  login(usuario: string, contrasena: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { usuario, contrasena });
  }

  registrar(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registro`, usuario);
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  guardarRol(rol: string): void {
    localStorage.setItem('rol', rol);
  }

  guardarUsuario(usuario: any): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  obtenerRol(): string | null {
    return localStorage.getItem('rol');
  }

  obtenerUsuarioCompleto(): any | null {
      const usuarioJson = localStorage.getItem('usuario');
      return usuarioJson ? JSON.parse(usuarioJson) : null;
    }

  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
  }

  esAdmin(): boolean {
    return this.obtenerRol() === 'ADMIN';
  }
}
