import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonAvatar, IonList, IonNote, ToastController, LoadingController, IonListHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, mailOutline, lockClosedOutline,
  saveOutline, cameraOutline, keyOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonBackButton, IonItem, IonLabel, IonInput, IonButton,
    IonIcon, IonAvatar, IonList, IonNote, CommonModule, FormsModule,
    IonListHeader
]
})
export class ProfilePage implements OnInit {
  userProfile = {
    pseudo: '',
    email: '',
    photoURL: 'https://ionicframework.com/docs/img/demos/avatar.svg'
  };

  currentPassword = '';
  newEmail = '';
  newPassword = '';

  constructor(
    private auth: Auth,
    private authService: AuthService,
    private sessionService : SessionService,
    private firestore: Firestore,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      personOutline, mailOutline, lockClosedOutline,
      saveOutline, cameraOutline, keyOutline
    });
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'Recuperation des infos...' });
    await loading.present();

    const user = this.sessionService.getUser();
    if (user) {
      this.userProfile.email = user.email || '';
      this.newEmail = user.email || '';
      await this.loadFirestoreData(user.uid);
    }
    loading.dismiss();
  }

  async loadFirestoreData(uid: string) {
    const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
    if (userDoc.exists()) {
      this.userProfile.pseudo = userDoc.data()['pseudo'] || '';
    }
  }

  async updateProfile() {
    if (!this.currentPassword) {
      this.presentToast('Le mot de passe actuel est requis pour toute modification.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Mise à jour en cours...' });
    await loading.present();

    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("Utilisateur non trouvé");

      if (this.newEmail !== user.email) {
        await this.authService.changeEmail(user.email!, this.currentPassword, this.newEmail);
      }

      if (this.newPassword) {
        await this.authService.changePassword(user.email!, this.currentPassword, this.newPassword);
      }

      const userRef = doc(this.firestore, `users/${user.uid}`);
      await updateDoc(userRef, {
        pseudo: this.userProfile.pseudo
      });

      this.presentToast('Profil mis à jour avec succès !', 'success');
      this.currentPassword = '';
      this.newPassword = '';
    } catch (error: any) {
      console.error(error);
      let msg = "Erreur lors de la mise à jour.";
      if (error.code === 'auth/wrong-password') msg = "Mot de passe actuel incorrect.";
      if (error.code === 'auth/requires-recent-login') msg = "Veuillez vous reconnecter puis réessayer.";
      this.presentToast(msg, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }
}
