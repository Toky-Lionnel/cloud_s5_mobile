import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, signInWithEmailAndPassword, updateEmail, updatePassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, collection, query, where,getDocs, updateDoc } from '@angular/fire/firestore';
import { SessionService } from './session.service';
import { FCM } from '@capacitor-community/fcm';
import { PushNotifications } from '@capacitor/push-notifications';
import { Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private sessionService: SessionService
  ) {}

  async inscription(data: any) {
    try {
      const userCredential = await this.register(data.email, data.password);
      const user = userCredential.user;

      await this.addUser({
        uid: user.uid,
        email: data.email,
        createdAt: new Date(),
        pseudo: data.pseudo
      });
    } catch (error) {
      console.error("Erreur d'inscription :", error);
    }
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async login(email: string, password: string) {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw new Error('Utilisateur non trouvé.');

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(this.firestore, `users/${userDoc.id}`);
    const userData = userDoc.data() as any;

    if (userData.nbrTentative >= 3)
      throw new Error("Compte bloqué après 3 tentatives.");

    try {
      // 🔐 Authentification
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // ✅ Mise à jour immédiate Firestore (sans FCM pour l’instant)
      await updateDoc(userRef, {
        nbrTentative: 0,
        firebaseUid: user.uid,
        updatedAt: Timestamp.now(),
      });

      // ✅ Enregistrer la session et continuer la navigation
      this.sessionService.setUser(user, token);

      // 🔔 Lancer la récupération du token FCM en arrière-plan
      this.registerNotifications(userRef);

    } catch (error: any) {
      const newCount = (userData.nbrTentative || 0) + 1;
      await updateDoc(userRef, {
        nbrTentative: newCount,
        updatedAt: Timestamp.now()
      });

      if (newCount >= 3)
        throw new Error("Compte bloqué après 3 tentatives.");

      throw new Error("Email ou mot de passe incorrect.");
    }
  }

  async registerNotifications(userRef: any) {
    try {
      // Attendre un peu pour éviter le blocage (optionnel)
      await new Promise(resolve => setTimeout(resolve, 500));

      const permission = await PushNotifications.requestPermissions();

      if (permission.receive === 'granted') {
        await PushNotifications.register();
        //const result = await FCM.getToken();

        console.log('Récupération du token FCM...');
        const result = await FCM.getToken();
        console.log('Résultat brut FCM:', result);

        const fcmToken = result.token;
        await updateDoc(userRef, { fcmToken });
      } else {
        console.log('Notifications refusées.');
      }
    } catch (error : any) {
      console.log(error);
      console.error('Erreur lors de l\'enregistrement des notifications :', error);
     // throw new Error('Erreur lors de l\'enregistrement des notifications : ' + error.message);
     throw new Error('Erreur lors de l\'enregistrement des notifications : ' + (error.message || error));
    }
  }



  logout() {
    this.auth.signOut();
    this.sessionService.clear();
  }

  private addUser(userData: any) {
    const userRef = doc(this.firestore, `users/${userData.uid}`);
    return setDoc(userRef, userData);
  }


async changeEmail(currentEmail: string, currentPassword: string, newEmail: string) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Aucun utilisateur connecté");

    const credential = EmailAuthProvider.credential(currentEmail, currentPassword);
    await reauthenticateWithCredential(user, credential);

    await updateEmail(user, newEmail);

    const token = await user.getIdToken(true);
    this.sessionService.setUser(user, token);
  }

  async changePassword(currentEmail: string, currentPassword: string, newPassword: string) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Aucun utilisateur connecté");

    const credential = EmailAuthProvider.credential(currentEmail, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    const token = await user.getIdToken(true);
    this.sessionService.setUser(user, token);
  }
}
