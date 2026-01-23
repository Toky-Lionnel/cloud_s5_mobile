import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logInOutline, personAddOutline, alertCircleOutline } from 'ionicons/icons';
import {
  IonContent, IonInput, IonButton, IonItem, IonLabel, IonIcon,
  IonCardContent, LoadingController, ToastController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton, IonItem, IonLabel, IonIcon, IonCardContent],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email = '';
  password = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    addIcons({ mailOutline, lockClosedOutline, logInOutline, personAddOutline, alertCircleOutline });
  }

  async login() {
    const loading = await this.loadingCtrl.create({
      message: 'Connexion en cours...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.authService.login(this.email, this.password);
      await loading.dismiss();
      this.router.navigateByUrl('/map', { replaceUrl: true });
    } catch (err: any) {
      await loading.dismiss();

      const msg = err.message;
      this.presentToast(`Erreur : ${msg}`, 'danger', 'alert-circle-outline');
    }
  }


  // Fonction utilitaire pour afficher les messages
  async presentToast(message: string, color: 'success' | 'danger', icon: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
      icon: icon,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }
}
