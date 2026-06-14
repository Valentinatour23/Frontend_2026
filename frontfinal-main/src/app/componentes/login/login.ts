import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
  cargando: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion(): void {
    if (!this.usuario || !this.contrasena) {
      this.error = 'Completá todos los campos';
      return;
    }
    this.cargando = true;
    this.error = '';

    this.authService.login(this.usuario, this.contrasena).subscribe({
        next: (res) => {

        console.log('Respuesta:', res);

        this.authService.guardarToken(res.token);

        console.log('Rol detectado:',
        this.authService.obtenerRol());

      if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
         this.router.navigate(['/home'], {fragment: 'sobre-samarana'});
        }
      },
      error: () => {
        this.error = 'Usuario o contraseña incorrectos.';
        this.cargando = false;
      }
    });
  }
}