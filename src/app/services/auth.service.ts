import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
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
}
