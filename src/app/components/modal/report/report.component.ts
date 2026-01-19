import { Component, Input } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
  IonInput, IonButton, IonButtons, ModalController, IonIcon
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline, resizeOutline, locationOutline } from 'ionicons/icons';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel,
    IonInput, IonButton, IonButtons, IonIcon, FormsModule
  ],
  templateUrl: './report.component.html'
})
export class ReportModalComponent {
  @Input() lat!: number;
  @Input() lng!: number;
  surface: number | null = null;

  constructor(private modalCtrl: ModalController) {
    addIcons({ checkmarkOutline, closeOutline, resizeOutline, locationOutline });
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss({
      location: { lat: this.lat, lng: this.lng },
      surface: this.surface
    }, 'confirm');
  }
}
