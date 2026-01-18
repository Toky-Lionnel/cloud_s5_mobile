import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonFab, IonFabButton, IonIcon, IonSearchbar, IonLabel } from '@ionic/angular/standalone';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './carte.page.html',
  styleUrls: ['./carte.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonMenuButton, IonFab, IonFabButton, IonIcon, IonSearchbar,
    CommonModule, FormsModule,
    IonLabel
]
})
export class MapPage implements OnInit, OnDestroy {
  map!: L.Map;
  userMarker?: L.Marker;

  constructor() {}

  ngOnInit() {
    setTimeout(() => this.initMap(), 500);
  }

  initMap() {
    this.map = L.map('map', {
      zoomControl: false 
    }).setView([48.8566, 2.3522], 13); // Coordonnées par défaut (Paris)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  locateUser() {
    this.map.locate({ setView: true, maxZoom: 16 });

    this.map.on('locationfound', (e) => {
      const radius = e.accuracy;

      if (this.userMarker) {
        this.userMarker.setLatLng(e.latlng);
      } else {
        const userIcon = L.divIcon({
          className: 'user-location-icon',
          html: '<div class="blue-dot"></div>',
          iconSize: [20, 20]
        });
        this.userMarker = L.marker(e.latlng, { icon: userIcon }).addTo(this.map);
      }
    });

    this.map.on('locationerror', (e) => {
      alert("Impossible d'accéder à votre position");
    });
  }

  addReport() {
    console.log("Ouvrir le formulaire de signalement");
    // Ici vous pourrez ouvrir une Modal ou naviguer vers une page
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
