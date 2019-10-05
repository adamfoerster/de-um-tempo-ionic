import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
})
export class TimelinePage implements OnInit {
  meeting$: Observable<any>;
  loadedImgs: string[] = [];
  isAdmin: Observable<boolean> = this.service.user.pipe(
    switchMap(user => {
      if (!user || !user['email']) {
        return of(false);
      }
      return this.service.isAdmin(user['email']);
    })
  );
  lastMeetingDocRef: string;

  constructor(public service: ServiceService) { }

  ngOnInit() {
    this.meeting$ = this.service.meeting$.pipe(tap(m => {
      if (m.length) {
        this.lastMeetingDocRef = m[m.length - 1].ref;
      }
    }));
    this.service.loadMeetings();
  }

  makeDate(dateText) {
    if (!dateText ||  isNaN(dateText)) {
      return new Date();
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

  loadImg(img: string) {
    this.loadedImgs.push(img);
  }

  checkImg(img): boolean {
    return this.loadedImgs.includes(img);
  }

  loadData(e) {
    if (this.lastMeetingDocRef) {
      this.service.loadMeetings(this.lastMeetingDocRef);
      e.target.complete();
    }
  }

}
