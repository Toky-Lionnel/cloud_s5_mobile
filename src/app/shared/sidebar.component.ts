import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonAvatar, IonMenuToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mapOutline, listOutline, settingsOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonIcon, IonLabel, IonAvatar, IonMenuToggle
  ],
  template: `
    <ion-menu contentId="main-map-content" type="overlay">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>RouteSafe</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <div class="menu-header">
          <ion-avatar>
            <img src="https://ionicframework.com/docs/img/demos/avatar.svg" />
          </ion-avatar>
          <h3>Utilisateur</h3>
          <p>Signalements actifs: 12</p>
        </div>

        <ion-list lines="none">
          <ion-menu-toggle>
            <ion-item button routerLink="/map">
              <ion-icon slot="start" name="map-outline"></ion-icon>
              <ion-label>Carte</ion-label>
            </ion-item>

            <ion-item button>
              <ion-icon slot="start" name="list-outline"></ion-icon>
              <ion-label>Mes signalements</ion-label>
            </ion-item>

            <ion-item button (click)="logout()">
              <ion-icon slot="start" name="log-out-outline" color="danger"></ion-icon>
              <ion-label color="danger">Déconnexion</ion-label>
            </ion-item>
          </ion-menu-toggle>
        </ion-list>
      </ion-content>
    </ion-menu>
  `,
  styles: [`
    .menu-header {
      padding: 30px 20px;
      background: var(--ion-color-primary);
      color: white;
      text-align: center;
      ion-avatar { margin: 0 auto 10px; width: 64px; height: 64px; border: 2px solid white; }
      h3 { margin: 0; font-weight: 600; }
      p { margin: 0; font-size: 0.8em; opacity: 0.8; }
    }
    ion-item { margin: 5px 10px; --border-radius: 8px; }
  `]
})
export class SidebarComponent {
  constructor(private router: Router) {
    addIcons({ mapOutline, listOutline, settingsOutline, logOutOutline, personCircleOutline });
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
