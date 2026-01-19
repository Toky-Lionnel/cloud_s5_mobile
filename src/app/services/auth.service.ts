import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, signInWithEmailAndPassword, updateEmail, updatePassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { SessionService } from './session.service';

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

      const token = await user.getIdToken();
      this.sessionService.setUser(user, token);
      console.log("Inscription réussie !");
    } catch (error) {
      console.error("Erreur d'inscription :", error);
    }
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    this.sessionService.setUser(user, token);
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

    const token = await user.getIdToken(true); // "true" pour forcer le refresh
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
