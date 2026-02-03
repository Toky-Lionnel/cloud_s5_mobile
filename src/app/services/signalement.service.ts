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

  async compressImage(base64: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxWidth / img.width, 1); // ne pas agrandir l'image
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir à nouveau en base64, avec compression JPEG
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };

    img.onerror = () => resolve(base64); // fallback si erreur
  });
}


  async addSignalementAvecImages(data: any, photos : any[]) {
    // Référence à la collection Firestore
    const signalementsRef = collection(this.firestore, 'signalements');

    const validPhotos = photos
      .filter((p: any) => p && p.startsWith('data:image')) // évite les valeurs nulles ou invalides
      .slice(0, 3); // garde seulement les 3 premières images


    const compressedPhotos = await Promise.all(
      validPhotos.map((photo : any) => this.compressImage(photo))
    );

    // Création du document à insérer
    const docData = {
      ...data,
      images: compressedPhotos,  // tableau d’images base64 compressées
      dateCreation: new Date().toISOString(),
    };

    // Ajout dans Firestore
    return addDoc(signalementsRef, docData);
  }



  getSignalements() {
    const signalementsRef = collection(this.firestore, 'signalements');
    return collectionData(signalementsRef, { idField: 'id' }) as any;
  }
}
