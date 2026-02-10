import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonHeader, IonToolbar, IonButton, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { ReportModalComponent } from 'src/app/components/modal/report/report.component';
import {IonContent,IonFab,IonFabButton,IonIcon,
  IonLabel,LoadingController,ToastController,IonMenuButton, IonButtons, } from '@ionic/angular/standalone';
import * as L from 'leaflet';
import { locate, add, search, alertCircle, person, peopleOutline, personOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GeoPoint } from 'firebase/firestore';
import { SignalementService } from 'src/app/services/signalement.service';
import { Observable, Subscription } from 'rxjs';
import { SidebarComponent } from "src/app/components/shared/sidebar/sidebar.component";
import { SessionService } from 'src/app/services/session.service';
import { RecapModalComponent } from 'src/app/components/modal/recap/recap.component';


@Component({
  selector: 'app-map',
  templateUrl: './carte.page.html',
  styleUrls: ['./carte.page.scss'],
  standalone: true,
  imports: [
    SidebarComponent, IonMenuButton, IonButtons,
    IonContent, IonFab, IonFabButton,
    IonIcon, CommonModule, FormsModule, IonLabel,
    IonHeader, IonToolbar, IonButton,
    IonSegment,
    IonSegmentButton
],
})

export class MapPage implements OnInit, OnDestroy {

  map!: L.Map;
  userMarker?: L.Marker;
  selectedLatLng: L.LatLng | null = null;
  tempMarker: L.Marker | null = null;
  private signalementsSub?: Subscription;

  onlyMyReports: boolean = false;
  allMarkers: L.LayerGroup = L.layerGroup();
  allSignalements: any[] = [];


  constructor(
    private modalCtrl: ModalController,
    private signalementService: SignalementService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private sessionService : SessionService,
  ) {
    addIcons({ locate, add, search, alertCircle, person, peopleOutline, personOutline });
  }


  async openRecap() {
    const modal = await this.modalCtrl.create({
      component: RecapModalComponent,
      componentProps: {
        signalements: this.allSignalements
      },
      breakpoints: [0, 0.5, 0.9], // S'ouvre à moitié ou presque plein écran
      initialBreakpoint: 0.5
    });
    await modal.present();
  }


  ngOnInit() {
    setTimeout(
      () => {
        this.initMap();
        this.loadSignalementsOnInit();
      }, 500);
  }

  toggleFilter() {
    this.onlyMyReports = !this.onlyMyReports;
    this.displaySignalementsOnMap();
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


  loadSignalementsOnInit() {
    if (this.signalementsSub) {
      this.signalementsSub.unsubscribe();
    }

    const data$ = this.signalementService.getSignalements() as Observable<any[]>;

    this.signalementsSub = data$.subscribe({
      next: (signalements) => {
        this.allSignalements = signalements;
        this.displaySignalementsOnMap();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des signalements :', err);
      }
    });
  }

  displaySignalementsOnMap() {
    const currentUserId = this.sessionService.getUser().uid;
    this.allMarkers.clearLayers();

    this.allSignalements.forEach(sig => {
      const isOwner = sig.idUser === currentUserId;
      if (this.onlyMyReports && !isOwner) return;

      if (sig.localisation) {
        const lat = sig.localisation.latitude;
        const lng = sig.localisation.longitude;

        const circle = L.circle([lat, lng], {
          color: isOwner ? '#2dd36f' : 'orange',
          fillColor: isOwner ? '#2dd36f' : '#f03',
          fillOpacity: 0.5,
          radius: Math.sqrt(sig.surface || 10) * 5
        });

        circle.bindPopup(`
          <div style="text-align: center; max-width: 250px;">
            <b>${isOwner ? 'Votre signalement' : 'Signalement externe'}</b><br>
            ${sig.description || 'Pas de description'}<br>
            Surface: ${sig.surface ? sig.surface + ' m²' : 'Non spécifiée'}<br>
            ${sig.status && sig.status !== 1 ? `Statut: ${sig.status}<br>` : ''}
            ${sig.Entreprise ? `Entreprise: ${sig.Entreprise}<br>` : ''}
            ${sig.Budget ? `Budget: ${sig.Budget}<br>` : ''}
            ${sig.createdAt ? `Créé le: ${new Date(sig.createdAt.seconds * 1000).toLocaleString('fr-FR', { timeZone: 'Indian/Antananarivo' })}<br>` : ''}

            ${
              sig.images && sig.images.length > 0
                ? `
                  <div style="margin-top: 8px;">
                    ${sig.images
                      .map(
                        (img: string) => `
                        <img
                          src="${img}"
                          alt="photo signalement"
                          style="width: 70px; height: 70px; object-fit: cover; margin: 2px; border-radius: 5px; border: 1px solid #ccc;"
                        />
                      `
                      )
                      .join('')}
                  </div>
                `
                : '<i>Aucune image</i>'
            }
          </div>
        `);


        this.allMarkers.addLayer(circle);
      }
    });
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
      initialBreakpoint: 1,
      breakpoints: [0, 1]
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.saveSignalement(data);
    }
  }


  async sauvegarderSignalement(data: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Envoi des photos et du signalement...',
    });
    await loading.present();

    try {
      const userId = this.sessionService.getUser().uid;

      // 2. Enregistrement Firestore avec les URLs des images
      await this.signalementService.addSignalementAvecImages({
        localisation: new GeoPoint(data.lat, data.lng), // vérifiez bien les clés data.lat/lng
        surface: data.surface,
        description: data.description,
        createdAt: new Date(),
        idUser: userId,
        idStatus: null,
        status: 'nouveau'
      },data.photos);

      await loading.dismiss();
      this.presentToast('Signalement enregistré avec les photos !', 'success', 'happy-outline');

      // Reset de la sélection sur la carte si nécessaire
      this.selectedLatLng = null;

    } catch (error: any) {
      await loading.dismiss();
      console.error("Erreur complète:", error);
      this.presentToast('Erreur lors de l\'envoi. Vérifiez votre connexion.', 'danger', 'close-circle-outline');
    }
  }

  async saveSignalement(data: any) {
    await this.sauvegarderSignalement(data);
    L.circle([data.location.lat, data.location.lng], {
      color: '#2dd36f',
      fillColor: '#2dd36f',
      fillOpacity: 0.5,
      radius: Math.sqrt(data.surface) * 5 // Exemple visuel basé sur la surface
    }).addTo(this.map)
      .bindPopup(`<div style="text-align: center">
            <b>Votre nouveau signalement</b><br>
            ${data.description || 'Pas de description'}<br>
            Surface: ${data.surface + ' m²'}<br>
          </div>`);

    this.selectedLatLng = null; // Reset
    if (this.tempMarker) this.map.removeLayer(this.tempMarker);
  }


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
