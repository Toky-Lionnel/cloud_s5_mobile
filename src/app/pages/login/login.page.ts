import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logInOutline, personAddOutline, alertCircleOutline } from 'ionicons/icons';
import { 
  IonContent, IonInput, IonButton, IonItem, IonLabel, IonIcon, 
  IonCard, IonCardContent, LoadingController, ToastController 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton, IonItem, IonLabel, IonIcon, IonCard, IonCardContent],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  email = '';
  password = '';

  constructor(
    private router: Router, 
    private authService: AuthService,
    private loadingCtrl: LoadingController, // Injecter le controller
    private toastCtrl: ToastController    // Injecter le controller
  ) {
    addIcons({ mailOutline, lockClosedOutline, logInOutline, personAddOutline, alertCircleOutline });
  }

  async login() {
    // 1. Créer le loader
    const loading = await this.loadingCtrl.create({
      message: 'Connexion en cours...',
      spinner: 'crescent'
    });
    
    await loading.present();

    try {
      await this.authService.login(this.email, this.password);
      await loading.dismiss();
      
      // Message de succès
      this.presentToast('Connexion réussie !', 'success', 'checkmark-circle-outline');
      this.router.navigateByUrl('/map', { replaceUrl: true });

    } catch (err: any) {
      await loading.dismiss();
      // Message d'erreur
      this.presentToast('Erreur : Email ou mot de passe incorrect.', 'danger', 'alert-circle-outline');
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