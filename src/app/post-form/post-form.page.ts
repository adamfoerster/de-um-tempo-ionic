import { ServiceService } from './../service.service';
import { GalleryComponent } from './../gallery/gallery.component';
import { Meeting } from './../interfaces';
import { Component, OnInit } from '@angular/core';
import * as dayjs from 'dayjs';
import { ModalController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.page.html',
  styleUrls: ['./post-form.page.scss']
})
export class PostFormPage implements OnInit {
  selectedDate: Date;
  meeting: Meeting = {
    id: null,
    message: '',
    photo: '',
    songId: '',
    verseId: ''
  };

  constructor(
    private service: ServiceService,
    private modal: ModalController,
    private router: Router,
    public loading: LoadingController
  ) { }

  ngOnInit() {
    this.service.selectedPhoto$.subscribe(photo => {
      this.meeting.photo = photo;
      this.modal.dismiss();
    });
  }

  async post() {
    const id = new Date(this.selectedDate + 'T05:00:01Z');
    this.meeting.id = parseInt(dayjs(id).format('YYYYMMDD'), 10).toString();
    this.getYoutubeId();
    const loading = await this.loading.create();
    await loading.present();
    await this.service.postMeeting(this.meeting);
    await loading.dismiss();
    this.router.navigate(['timeline']);
  }

  getYoutubeId() {
    if (!this.meeting.songId) {
      return null;
    }
    let start = this.meeting.songId.indexOf('v=') + 2;
    if (start === 1) {
      start = this.meeting.songId.indexOf('youtu.be/') + 9;
    }
    const end = this.meeting.songId.substr(start).indexOf('&');
    this.meeting.songId = this.meeting.songId.substr(
      start !== 7 ? start : 0,
      end !== -1 ? end : undefined
    );
  }

  async openGallery() {
    const gallery = await this.modal.create({
      component: GalleryComponent,
    });
    await gallery.present();
  }
}
