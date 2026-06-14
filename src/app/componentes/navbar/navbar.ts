import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  imports: [CommonModule, RouterModule], 
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

get estaLogueado(): boolean {
    return !!sessionStorage.getItem('token') || !!sessionStorage.getItem('usuario'); 
  }

get nombreUsuario(): string {
    const usuarioRaw = sessionStorage.getItem('usuario');
    if (usuarioRaw) {
      const nombreLimpio = usuarioRaw.replace(/^"|"$/g, '').trim();
      
      if (nombreLimpio.startsWith('{')) {
        try {
          const usuarioObjeto = JSON.parse(nombreLimpio);
          return usuarioObjeto.nombre || usuarioObjeto.usuario || 'Usuario';
        } catch (e) {
          return 'Usuario';
        }
      }
      return nombreLimpio || 'Usuario';
    }
    return '';
  }

cerrarSesion(): void {
  sessionStorage.clear();
  localStorage.clear();

  this.router.navigate(['/login']);
}


  irA(idSeccion: string) {
    const elemento = document.getElementById(idSeccion);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn(`No se encontró la sección con el id: ${idSeccion}`);
    }
  }

  irTurismo() {
    window.open('https://www.sanjose.tur.ar/', '_blank');
  }
}