import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'; // <-- Importamos SweetAlert2 para los carteles lindos

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  usuario: string = '';
  contrasena: string = '';
  error: string = '';
  mensajeExito: string = '';
  cargando: boolean = false;
  modoRegistro: boolean = false;

  registro = {
    nombre: '',
    apellido: '',
    dni: '',
    usuario: '',
    email: '',
    telefono: '',
    contrasena: ''
  };

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  alternarModo(): void {
    this.modoRegistro = !this.modoRegistro;
    this.error = '';
    this.mensajeExito = '';
  }

  iniciarSesion(event: Event): void {
    event.preventDefault(); 

    if (!this.usuario.trim() || !this.contrasena.trim()) {
      this.error = 'Completa todos los campos';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensajeExito = '';

    this.authService.login(this.usuario.trim(), this.contrasena.trim()).subscribe({
      next: (res) => {
        this.authService.guardarToken(res.token);
        this.authService.guardarRol(res.rol);


        sessionStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.authService.guardarUsuario(res.usuario);
        
        this.cargando = false;

        Swal.fire({
          title: '¡Inicio de Sesión Exitoso!',
          text: `Bienvenido de nuevo`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/inicio'], { fragment: 'sobre-samarana' });
        }
      },
      error: (err) => {
        this.error = this.obtenerMensajeError(err, 'Usuario o contraseña incorrectos.');
        this.cargando = false;
      }
    });
  }

  registrarse(event: Event): void {
    event.preventDefault(); 

    if (!this.camposRegistroCompletos()) {
      this.error = 'Completa todos los campos obligatorios';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.mensajeExito = '';

    this.authService.registrar(this.normalizarRegistro()).subscribe({
      next: () => {
        this.cargando = false;
        
        const usuarioRegistrado = this.registro.usuario.trim();
        this.limpiarRegistro();

        this.modoRegistro = false; 
        this.usuario = usuarioRegistrado;
        this.contrasena = '';
        
        this.cdr.detectChanges(); 


        setTimeout(() => {
          Swal.fire({
            title: '¡Cuenta Creada!',
            text: 'Registro realizado correctamente. Ya puedes iniciar sesión con tu usuario.',
            icon: 'success',
            confirmButtonText: 'Genial',
            confirmButtonColor: '#28a745'
          });
        }, 50);
      },
      error: (err) => {
        this.error = this.obtenerMensajeError(err, 'No se pudo registrar el usuario.');
        this.cargando = false;
      }
    });
  }

  private camposRegistroCompletos(): boolean {
    return Object.values(this.registro).every(valor => valor && valor.trim().length > 0);
  }

  private normalizarRegistro(): any {
    return {
      nombre: this.registro.nombre.trim(),
      apellido: this.registro.apellido.trim(),
      dni: this.registro.dni.trim(),
      usuario: this.registro.usuario.trim(),
      email: this.registro.email.trim(),
      telefono: this.registro.telefono.trim(),
      contrasena: this.registro.contrasena.trim()
    };
  }

  private limpiarRegistro(): void {
    this.registro = {
      nombre: '',
      apellido: '',
      dni: '',
      usuario: '',
      email: '',
      telefono: '',
      contrasena: ''
    };
  }

  private obtenerMensajeError(err: any, fallback: string): string {
    if (typeof err?.error === 'string' && err.error.trim()) {
      return err.error;
    }

    if (err?.error?.mensaje) {
      return err.error.mensaje;
    }

    return fallback;
  }
}