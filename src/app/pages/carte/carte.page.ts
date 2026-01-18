import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { ReportModalComponent } from 'src/app/components/report-modal.component';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonSearchbar,
  IonLabel,
} from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { locate, add, search, alertCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-map',
  templateUrl: './carte.page.html',
  styleUrls: ['./carte.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonSearchbar,
    CommonModule,
    FormsModule,
    IonLabel,
  ],
})
export class MapPage implements OnInit, OnDestroy {
  map!: L.Map;
  userMarker?: L.Marker;
  selectedLatLng: L.LatLng | null = null;
  tempMarker: L.Marker | null = null;

  constructor(private modalCtrl: ModalController) {
    addIcons({ locate, add, search, alertCircle });
  }

  ngOnInit() {
    setTimeout(() => this.initMap(), 500);
  }

  initMap() {
    this.map = L.map('map').setView([-18.8792, 47.5079], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e);
    });
  }


  onMapClick(e: L.LeafletMouseEvent) {
    this.selectedLatLng = e.latlng;

    if (this.tempMarker) {
      this.map.removeLayer(this.tempMarker);
    }

    this.tempMarker = L.marker(e.latlng, {
      icon: L.icon({
        iconUrl: 'assets/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      })
    }).addTo(this.map);

    this.tempMarker.bindPopup("Lieu du signalement").openPopup();
  }


  async addReport() {
    if (!this.selectedLatLng) {
      alert("Veuillez d'abord cliquer sur un point de la carte.");
      return;
    }

    const modal = await this.modalCtrl.create({
      component: ReportModalComponent,
      componentProps: {
        lat: this.selectedLatLng.lat,
        lng: this.selectedLatLng.lng
      },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log('Signalement enregistré :', data);

      // Ici vous pouvez transformer le marqueur temporaire en marqueur définitif
      this.saveSignalement(data);
    }
  }

  saveSignalement(data: any) {
    // Logique pour envoyer au serveur ou afficher sur la carte
    L.circle([data.location.lat, data.location.lng], {
      color: 'orange',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: Math.sqrt(data.surface) * 5 // Exemple visuel basé sur la surface
    }).addTo(this.map)
      .bindPopup(`Signalement: ${data.surface}m²`);

    console.log(data);
    this.selectedLatLng = null; // Reset
    if (this.tempMarker) this.map.removeLayer(this.tempMarker);
  }


  async locateUser() {
    const coordinates = await Geolocation.getCurrentPosition();
    const latlng = L.latLng(coordinates.coords.latitude, coordinates.coords.longitude);

    if (this.userMarker) {
      this.userMarker.setLatLng(latlng);
    } else {
      const userIcon = L.divIcon({
        className: 'user-location-icon',
        html: '<div class="blue-dot"></div>',
        iconSize: [20, 20],
      });
      this.userMarker = L.marker(latlng, { icon: userIcon }).addTo(this.map);
    }
    this.map.setView(latlng, 16);
  }


  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }


}
