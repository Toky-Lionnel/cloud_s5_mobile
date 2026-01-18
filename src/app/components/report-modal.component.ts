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
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-button (click)="cancel()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Nouveau Signalement</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item lines="full" class="ion-margin-bottom">
        <ion-icon name="location-outline" slot="start"></ion-icon>
        <ion-label position="stacked">Coordonnées séléctionnées</ion-label>
        <ion-input [value]="lat + ', ' + lng" readonly></ion-input>
      </ion-item>

      <ion-item lines="full">
        <ion-icon name="resize-outline" slot="start"></ion-icon>
        <ion-label position="stacked">Surface estimée (m²)</ion-label>
        <ion-input type="number" [(ngModel)]="surface" placeholder="Ex: 15"></ion-input>
      </ion-item>

      <ion-button expand="block" class="ion-margin-top" (click)="confirm()" [disabled]="!surface">
        <ion-icon name="checkmark-outline" slot="start"></ion-icon>
        Confirmer le signalement
      </ion-button>
    </ion-content>
  `
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
