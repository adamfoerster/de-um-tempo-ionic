import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceService } from '../service.service';
import { switchMap, filter, first } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-passages',
  templateUrl: './passages.page.html',
  styleUrls: ['./passages.page.scss']
})
export class PassagesPage implements OnInit {
  reference$: Observable<any>;
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
            console.log(res.data);
            
            this.service
              .addCommentToReference(refId, res.data.values.comment)
              .subscribe(_ => this.getReferences());
          }
        });
      });
  }

  getReferences() {
    this.reference$ = this.service.user.pipe(
      switchMap(user =>
        this.service.getFromUser(user.email).pipe(
          filter(refs => !!refs),
          first()
        )
      )
    );
  }
}
