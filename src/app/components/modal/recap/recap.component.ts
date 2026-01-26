import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-recap-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: 'recap.component.html',
  styleUrls: ['recap.component.scss']
})

export class RecapModalComponent implements OnInit {
  @Input() signalements: any[] = [];
  stats = { count: 0, surface: 0, budget: 0, avancement: 0, termine: 0, nouveau: 0, en_cours : 0 };

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.calculate();
  }

  calculate() {
    if (!this.signalements) return;

    this.stats.count = this.signalements.length;
    this.signalements.forEach(s => {
      this.stats.surface += (s.surface || 0);

      const b = typeof s.budget === 'string' ? parseFloat(s.budget.replace(/\s/g, '')) : (s.budget || 0);
      this.stats.budget += b;

      if (s.status === 'terminé') this.stats.termine++;
      if (s.status === 'nouveau') this.stats.nouveau++;
    });


    this.stats.avancement = this.stats.count > 0
      ? Math.round((this.stats.termine / this.stats.count) * 100)
      : 0;
  }

  close() { this.modalCtrl.dismiss(); }
}
