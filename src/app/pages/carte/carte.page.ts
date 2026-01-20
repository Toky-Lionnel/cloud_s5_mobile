import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { ReportModalComponent } from 'src/app/components/modal/report/report.component';
import {IonContent,IonFab,IonFabButton,IonIcon,
  IonLabel,LoadingController,ToastController,IonMenuButton, IonButtons, } from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { locate, add, search, alertCircle, person, peopleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Geolocation } from '@capacitor/geolocation';
import { GeoPoint } from 'firebase/firestore';
import { SignalementService } from 'src/app/services/signalement.service';
import { Observable, Subscription } from 'rxjs';
import { SidebarComponent } from "src/app/components/shared/sidebar/sidebar.component";
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-map',
  templateUrl: './carte.page.html',
  styleUrls: ['./carte.page.scss'],
  standalone: true,
  imports: [
    SidebarComponent, IonMenuButton, IonButtons,
    IonContent, IonFab, IonFabButton,
    IonIcon, CommonModule, FormsModule, IonLabel,
    IonHeader,
    IonToolbar
],
})

export class MapPage implements OnInit, OnDestroy {
  map!: L.Map;
  userMarker?: L.Marker;
  selectedLatLng: L.LatLng | null = null;
  tempMarker: L.Marker | null = null;
  private signalementsSub?: Subscription;

  onlyMyReports: boolean = false;
  allMarkers: L.LayerGroup = L.layerGroup(); // Pour gérer facilement l'affichage/effacement


  constructor(
    private modalCtrl: ModalController,
    private signalementService: SignalementService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private sessionService : SessionService,
  ) {
    addIcons({ locate, add, search, alertCircle, person, peopleOutline });
  }

  ngOnInit() {
    setTimeout(
      () => {
        this.initMap();
        this.loadSignalements();
      }, 500);
  }

  toggleFilter() {
    this.onlyMyReports = !this.onlyMyReports;
    this.loadSignalements();
  }


  initMap() {
    this.map = L.map('map').setView([-18.8792, 47.5079], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e);
    });
    this.allMarkers.addTo(this.map);
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
      this.saveSignalement(data);
    }
  }

  loadSignalements() {
    const currentUserId = this.sessionService.getUser().uid;

    if (this.signalementsSub) this.signalementsSub.unsubscribe();

    const data$ = this.signalementService.getSignalements() as Observable<any[]>;

    this.signalementsSub = data$.subscribe(signalements => {

      this.allMarkers.clearLayers();

      signalements.forEach(sig => {
        const isOwner = sig.idUser === currentUserId; // Assurez-vous d'enregistrer userId dans saveSignalement

        if (this.onlyMyReports && !isOwner) return;

        if (sig.localisation) {
          const lat = sig.localisation.latitude;
          const lng = sig.localisation.longitude;

          const circle = L.circle([lat, lng], {
            color: isOwner ? '#2dd36f' : 'orange', // Vert si c'est le mien, orange sinon
            fillColor: isOwner ? '#2dd36f' : '#f03',
            fillOpacity: 0.5,
            radius: Math.sqrt(sig.surface || 10) * 5
          });

          circle.bindPopup(`
            <div style="text-align: center">
              <b>${isOwner ? 'Votre signalement' : 'Signalement externe'}</b><br>
              ${sig.description || 'Pas de description'}<br>
              Surface: ${sig.surface}m²
            </div>
          `);

          this.allMarkers.addLayer(circle);
        }
      });
    });
  }


  async sauvegarderSignalement(data: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Enregistrement du signalement...',
    });
    await loading.present();

    try {
      await this.signalementService.addSignalement({
        localisation: new GeoPoint(data.location.lat, data.location.lng),
        surface: data.surface,
        createdAt: new Date(),
        idUser : this.sessionService.getUser().uid,
        description : data.description,
        status : 1
      });

      await loading.dismiss();
      this.presentToast('Signalement effectué avec succès !', 'success', 'happy-outline');
    } catch (error : any) {
      await loading.dismiss();
      console.error("Erreur lors de l'enregistrement du signalement:", error);
      this.presentToast(error.message || `Erreur lors de l'enregistrement du signalement: ${error}`, 'danger', 'close-circle-outline');
    }
  }

  async saveSignalement(data: any) {
    await this.sauvegarderSignalement(data);
    L.circle([data.location.lat, data.location.lng], {
      color: 'orange',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: Math.sqrt(data.surface) * 5 // Exemple visuel basé sur la surface
    }).addTo(this.map)
      .bindPopup(`Signalement: ${data.surface}m²`);

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



  // Très important : se désabonner pour éviter les fuites de mémoire
  ngOnDestroy() {
    if (this.signalementsSub) {
      this.signalementsSub.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  async presentToast(message: string, color: 'success' | 'danger', icon: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
      icon: icon
    });
    await toast.present();
  }


}
