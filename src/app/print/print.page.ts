import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceService } from '../service.service';
import { switchMap, filter, first } from 'rxjs/operators';

@Component({
  selector: 'app-print',
  templateUrl: './print.page.html',
  styleUrls: ['./print.page.scss'],
})
export class PrintPage implements OnInit {
  reference$: Observable<any>;
  constructor(public service: ServiceService) {}

  ngOnInit() {
    this.getReferences();
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

  getPt(book) {
    return this.service.getBookPt(book);
  }
}
