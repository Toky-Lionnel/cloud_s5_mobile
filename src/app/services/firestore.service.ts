import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface UserData {
  email: string;
  password: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  addUser(data: UserData) {
    const usersRef = collection(this.firestore, 'users');
    return addDoc(usersRef, data);
  }

  getUsers(): Observable<UserData[]> {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'id' }) as Observable<UserData[]>;
  }
}
