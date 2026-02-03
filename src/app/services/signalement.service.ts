import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, GeoPoint } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';


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

  constructor(private firestore: Firestore, private storage: Storage) {}

  async uploadImages(photos: string[], path: string): Promise<string[]> {
    const uploadPromises = photos.map(async (photo, index) => {
      const fileName = `${path}/${Date.now()}_${index}.jpg`;
      const storageRef = ref(this.storage, fileName);
      await uploadString(storageRef, photo, 'data_url');
      return await getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
  }

  addSignalement(data: any) {
    const signalementsRef = collection(this.firestore, 'signalements');
    return addDoc(signalementsRef, data);
  }


  getSignalements() {
    const signalementsRef = collection(this.firestore, 'signalements');
    return collectionData(signalementsRef, { idField: 'id' }) as any;
  }
}
