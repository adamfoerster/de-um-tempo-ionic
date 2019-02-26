import { FromUser } from './../interfaces';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceService } from '../service.service';
import { switchMap, filter, first, map } from 'rxjs/operators';
import { Reference } from '@angular/fire/storage/interfaces';

@Component({
  selector: 'app-print',
  templateUrl: './print.page.html',
  styleUrls: ['./print.page.scss']
})
export class PrintPage implements OnInit {
  reference$: Observable<any>;
  constructor(public service: ServiceService) {}

  ngOnInit() {
    this.getReferences();
  }

  getReferences() {
    this.reference$ = this.service.getFromUserAdmin().pipe(
      map(this.mapFromUsersToRefs),
      first()
    );
  }

  getPt(book) {
    return this.service.getBookPt(book);
  }

  mapFromUsersToRefs(fromUsers: FromUser[]): Reference[] {
    return [].concat.apply([], fromUsers.map(fromUser => fromUser.references));
  }
}
