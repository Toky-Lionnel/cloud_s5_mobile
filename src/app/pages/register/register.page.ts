import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, shieldCheckmarkOutline, personAddOutline, personOutline } from 'ionicons/icons';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonIcon, IonCard, IonCardContent, IonButtons, IonBackButton, LoadingController, ToastController } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem, IonLabel, IonIcon, IonCardContent, IonButtons, IonBackButton],
})
export class RegisterPage {
  email = '';
  password = '';
  confirmPassword = '';
  pseudo = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
  ) {
    addIcons({ mailOutline, lockClosedOutline, shieldCheckmarkOutline, personAddOutline, personOutline });
  }

  async onRegister() {
    if (this.password !== this.confirmPassword) {
      this.presentToast('Les mots de passe ne correspondent pas.', 'danger', 'warning-outline');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Création du compte...',
    });
    await loading.present();

    try {
      await this.authService.inscription({email: this.email, password: this.password, pseudo: this.pseudo});
      await loading.dismiss();

      this.presentToast('Compte créé avec succès ! Connectez-vous.', 'success', 'happy-outline');
      this.router.navigateByUrl('/login');
    } catch (err: any) {
      await loading.dismiss();
      this.presentToast(err.message || "Erreur lors de l'inscription", 'danger', 'close-circle-outline');
    }
  }

  async presentToast(message: string, color: 'success' | 'danger', icon: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
      icon: icon
    });
    await toast.present();
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
