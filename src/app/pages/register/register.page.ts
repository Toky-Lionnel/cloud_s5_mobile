import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonIcon,
  IonCard,
  IonCardContent,
  IonButtons,
  IonBackButton,
  IonText, // Add IonText
  IonCheckbox // Add IonCheckbox
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardContent,
    IonButtons,
    IonBackButton,
    IonText, // Import IonText
    IonCheckbox // Import IonCheckbox
  ],
})
export class RegisterPage {
  email = '';
  password = '';
  confirmPassword = '';
  termsAccepted = false; // Nouvelle propriété pour la checkbox
  errorMessage = ''; // Pour afficher les erreurs

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    this.errorMessage = ''; // Réinitialise l'erreur

    // Validation
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (!this.termsAccepted) {
      this.errorMessage = 'Vous devez accepter les conditions d\'utilisation.';
      return;
    }

    try {
      await this.authService.register(this.email, this.password);
      // Redirection vers la page de connexion avec un message de succès (optionnel)
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (err: any) {
      console.error('Erreur d\'inscription:', err);
      this.errorMessage = err.message || 'Une erreur est survenue lors de l\'inscription.';
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
