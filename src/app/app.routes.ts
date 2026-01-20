import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { MapPage } from './pages/carte/carte.page';
import { ProfilePage } from './pages/profile/profile.page';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'map', component: MapPage, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [AuthGuard] },
];
