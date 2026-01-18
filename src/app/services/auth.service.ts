import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface UserData {
  uid: string;
  email: string;
  createdAt: Date;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth,
    private firestore: Firestore

  ) {}

  async inscription(data: any) {
    try {
      const userCredential = await this.register(data.email, data.password);
      const user = userCredential.user;

      await this.addUser({
        uid: user.uid,
        email: data.email,
        createdAt: new Date()
      });

      console.log("Inscription réussie !");
    } catch (error) {
      console.error("Erreur d'inscription :", error);
    }
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  get user() {
    return this.auth.currentUser;
  }

  addUser(data: UserData) {
    const usersRef = collection(this.firestore, 'users');
    return addDoc(usersRef, data);
  }

  getUsers(): Observable<UserData[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'id' }) as Observable<UserData[]>;
  }
}
