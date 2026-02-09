import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-recap-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: 'recap.component.html',
  styleUrls: ['recap.component.scss'],
})
export class RecapModalComponent implements OnInit {
  @Input() signalements: any[] = [];
  stats = {
    count: 0,
    surface: 0,
    budget: 0,
    avancement: 0,
    termine: 0,
    nouveau: 0,
    en_cours: 0,
  };

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.calculate();
  }

  // nouveau = 0%
  // en cours = 50%
  // terminé = 100%

  calculate() {
    if (!this.signalements) return;

    this.stats.count = this.signalements.length;
    this.signalements.forEach((s) => {
      this.stats.surface += s.surface || 0;

      const b =
        typeof s.budget === 'string'
          ? parseFloat(s.budget.replace(/\s/g, ''))
          : s.budget || 0;
      this.stats.budget += b;

      if (s.idStatus === 4) this.stats.termine++;
      if (s.idStatus === 3) this.stats.en_cours++;
      if (s.idStatus === 2 || s.idStatus === 1) this.stats.nouveau++;
    });

    if (this.stats.count > 0) {
      const totalScore =
        this.stats.termine * 100 +
        this.stats.en_cours * 50 +
        this.stats.nouveau * 0;

      this.stats.avancement = Math.round(totalScore / this.stats.count);
    } else {
      this.stats.avancement = 0;
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
