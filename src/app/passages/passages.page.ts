import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-passages',
  templateUrl: './passages.page.html',
  styleUrls: ['./passages.page.scss'],
})
export class PassagesPage implements OnInit {
  reference$: Observable<any>;

  constructor(public service: ServiceService) { }

  ngOnInit() {
    this.service.user
      .subscribe(user => this.reference$ = this.service.getReferencesFromUser(user.email));
  }
}
