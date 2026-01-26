import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, GeoPoint } from '@angular/fire/firestore';


export interface SignalementData {
  localisation: GeoPoint;
  surface: number;
  createdAt: Date;
  idUser: string;
  description: string;
  idStatus : number;
}

@Injectable({
  providedIn: 'root'
})
export class SignalementService {
  constructor(private firestore: Firestore) {}

  addSignalement(data: SignalementData) {
    const signalementsRef = collection(this.firestore, 'signalements');
    return addDoc(signalementsRef, data);
  }

  getSignalements() {
    const signalementsRef = collection(this.firestore, 'signalements');
    return collectionData(signalementsRef, { idField: 'id' }) as any;
  }
}
