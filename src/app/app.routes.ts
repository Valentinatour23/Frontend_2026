import { Routes } from '@angular/router';
import { InicioComponent } from './componentes/inicio/inicio';
import { LoginComponent } from './componentes/login/login';
import { InfoAlojamientoComponent } from './componentes/info-alojamiento/info-alojamiento';
import { AdminComponent } from './componentes/admin/admin';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/Admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'info-alojamiento', component: InfoAlojamientoComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: 'inicio' }
];