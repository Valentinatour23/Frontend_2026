import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'] // Si usas estilos en otro archivo, si no dejalos como los tenías
})
export class NavbarComponent {

  // Esta función hace el scroll suave a Inicio, Contacto y Ubicación
  irA(idSeccion: string) {
    const elemento = document.getElementById(idSeccion);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn(`No se encontró la sección con el id: ${idSeccion}`);
    }
  }

  // Esta función abre el blog de turismo oficial de San José
  irTurismo() {
    window.open('https://www.sanjose.tur.ar/', '_blank');
  }
}