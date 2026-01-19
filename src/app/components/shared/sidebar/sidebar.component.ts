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
  templateUrl: `./sidebar.component.html`,
  styleUrl : 'sidebar.component.scss'
})
export class SidebarComponent {
  constructor(private router: Router) {
    addIcons({ mapOutline, listOutline, settingsOutline, logOutOutline, personCircleOutline });
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
