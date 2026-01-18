import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import {
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonIcon,
  IonCard,
  IonCardContent,
  IonText // Add IonText for error messages
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardContent,
    IonText // Import IonText
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email: string = ''; // Laissez vide pour une meilleure UX
  password: string = ''; // Laissez vide
  errorMessage: string = ''; // Pour afficher les erreurs

  constructor(private router: Router, private authService: AuthService) {}

  async login() {
    this.errorMessage = ''; // Réinitialise l'erreur à chaque tentative
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigateByUrl('/map', { replaceUrl: true });
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      this.errorMessage = 'Identifiants incorrects ou problème de connexion.'; // Message générique
    }
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }
}
