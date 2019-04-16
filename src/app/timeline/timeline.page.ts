import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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

  loadImg(img: string) {
    this.loadedImgs.push(img);
  }

  checkImg(img): boolean {
    return this.loadedImgs.includes(img);
  }

}
