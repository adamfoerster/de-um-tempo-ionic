import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
})
export class TimelinePage implements OnInit {
  meeting$: Observable<any>;

  constructor(public service: ServiceService) { }

  ngOnInit() {
    this.meeting$ = this.service.meeting$;
  }

  makeDate(dateText: string | number) {
    if (!dateText) {
      console.log(dateText);
      return '';
    }
    if (typeof dateText === 'number') {
      dateText = (dateText as number).toString();
    }
    const text = [
      `${dateText.substr(0, 4)}-`,
      `${dateText.substr(4, 2)}-`,
      `${dateText.substr(6, 2)}T03:00:00Z`
    ].join('');
    return new Date(text);
  }

}
