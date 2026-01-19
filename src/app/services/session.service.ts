import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private userData: any = null;

  constructor() {
    const stored = localStorage.getItem('userData');
    if (stored) {
      this.userData = JSON.parse(stored);
    }
  }

  setUser(user: User, token: string) {
    this.userData = {
      uid: user.uid,
      email: user.email,
      refreshToken: user.refreshToken,
      token: token
    };
    localStorage.setItem('userData', JSON.stringify(this.userData));
  }

  getUser() {
    return this.userData;
  }

  getToken() {
    return this.userData?.token;
  }

  clear() {
    this.userData = null;
    localStorage.removeItem('userData');
  }

  isLoggedIn(): boolean {
    return !!this.userData;
  }
}
