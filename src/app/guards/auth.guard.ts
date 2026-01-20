import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.sessionService.getUser();

    if (user && user.token) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
