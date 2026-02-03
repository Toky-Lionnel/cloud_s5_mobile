import { Component, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, ActionSheetController, IonContent, IonItem, IonLabel, IonInput, IonButton, IonButtons, ModalController, IonIcon, IonFooter, IonBadge, IonList } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
// import { addIcons } from 'ionicons';
// import { checkmarkOutline, closeOutline, resizeOutline, locationOutline } from 'ionicons/icons';
// import { ActionSheetController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import {
  closeOutline, locationOutline, resizeOutline,
  documentTextOutline, cameraOutline, closeCircle, checkmarkOutline, imagesOutline
} from 'ionicons/icons';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
    IonInput, IonButton, IonButtons, IonIcon, FormsModule,
    IonFooter,
    IonBadge,
    CommonModule,
    IonList
],
  templateUrl: './report.component.html',
  styleUrl : './report.component.scss'
})
export class ReportModalComponent {

  @Input() lat!: number;
  @Input() lng!: number;
  surface: number | null = null;
  description : string | null = null;
  photos: string[] = [];
  selectedPreview: string | null = null; // Image en grand



  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {
    // addIcons({ checkmarkOutline, closeOutline, resizeOutline, locationOutline });

        addIcons({
      closeOutline, locationOutline, resizeOutline,
      documentTextOutline, cameraOutline, closeCircle, checkmarkOutline, imagesOutline
    });

  }

    cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async presentImageSourceHelper() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Source de l\'image',
      buttons: [
        {
          text: 'Appareil photo',
          icon: 'camera-outline',
          handler: () => this.captureImage(CameraSource.Camera)
        },
        {
          text: 'Galerie',
          icon: 'images-outline',
          handler: () => this.captureImage(CameraSource.Photos)
        },
        {
          text: 'Annuler',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async captureImage(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      if (image.dataUrl) {
        this.photos.push(image.dataUrl);
      }
    } catch (e) {
      console.log("Annulation de la capture");
    }
  }

  // removePhoto(index: number) {
  //   this.photos.splice(index, 1);
  // }

  previewImage(img: string) {
    this.selectedPreview = img;
  }

  removePhoto(index: number, event: Event) {
    event.stopPropagation(); // Empêche d'ouvrir la prévisualisation
    this.photos.splice(index, 1);
  }

  confirm() {
    const data = {
      lat: this.lat,
      lng: this.lng,
      surface: this.surface,
      description: this.description,
      photos: this.photos,
      createdAt: new Date()
    };
    return this.modalCtrl.dismiss(data, 'confirm');
  }
}
