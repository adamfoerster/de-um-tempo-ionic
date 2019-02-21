import { FromUser } from './../interfaces';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceService } from '../service.service';
import { AlertController } from '@ionic/angular';
import { switchMap, filter, first, tap } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss']
})
export class AdminPage implements OnInit {
  reference$: Observable<FromUser[]>;
  totalRefs = 0;
  refsLength: any;
  constructor(public service: ServiceService, public alert: AlertController) {}

  ngOnInit() {
    this.getReferences();
  }

  removeReference(id: number) {
    this.alert
      .create({
        message: 'Tem certeza que deseja remover esta passagem?',
        buttons: [
          {
            text: 'Sim',
            role: 'yes'
          },
          {
            text: 'Não',
            role: 'no'
          }
        ]
      })
      .then(alert => {
        alert.present();
        alert.onWillDismiss().then(res => {
          if (res && res.role && res.role === 'yes') {
            this.service.removePassage(id).subscribe(_ => {
              this.getReferences();
            });
          }
        });
      });
  }

  sendComment(refId: number) {
    this.alert
      .create({
        header: 'Comentário',
        inputs: [
          {
            name: 'comment',
            type: 'text',
            placeholder: 'Escreva seu comentário'
          }
        ],
        buttons: ['Cancelar', { text: 'Salvar', role: 'save' }]
      })
      .then(alert => {
        alert.present();
        alert.onWillDismiss().then(res => {
          if (res && res.role && res.role === 'save') {
            this.service
              .addCommentToReference(refId, res.data.values.comment)
              .subscribe(_ => this.getReferences());
          }
        });
      });
  }

  getReferences() {
    this.reference$ = this.service.getFromUserAdmin().pipe(
      tap(refs => {
        let allRefs = 0;
        refs.forEach(ref => allRefs = allRefs + ref.references.length);
        this.refsLength = allRefs;
      }),
      filter(refs => !!refs),
      tap(_ => this.totalRefs = 0),
      tap(users => users.forEach(user => {
        this.totalRefs += this.getTotalRefFromUser(user);
      })),
      first()
    );
  }

  getTotalRefFromUser(user: FromUser): number {
    return user.references.length;
  }

  getPt(book) {
    return this.service.getBookPt(book);
  }
}
