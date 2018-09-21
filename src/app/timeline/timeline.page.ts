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

}
