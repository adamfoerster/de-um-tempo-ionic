import { ServiceService } from './../service.service';
import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { EventEmitter } from 'events';
import { Observable, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LoadingController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  @Output() selectedPhoto: EventEmitter = new EventEmitter();
  photos$: Observable<string[]>;
  @ViewChild('file') file: any;
  @ViewChild('capture') capture: any;
  inputImage: any;

  constructor(
    public service: ServiceService,
    public loadingController: LoadingController,
    private modal: ModalController
  ) {}

  ngOnInit() {
    this.photos$ = this.service
      .getPhotos()
      .pipe(
        switchMap(photos => combineLatest(this.getPhotosUrl(photos.photos)))
      );
  }

  takePic(capture = false) {
    if (capture) {
      return this.capture.nativeElement.click();
    }
    this.file.nativeElement.click();
  }

  getPhotosUrl(photos: string[]) {
    return photos.map(photo => {
      return this.service.getPhotoUrl(photo);
    });
  }

  uploadFile(event) {
    const file = event.target.files[0];
    const filePath =
      Math.random()
        .toString(36)
        .substring(2) +
      this.inputImage.substring(this.inputImage.lastIndexOf('.') + 1);
    this.presentLoading();
    this.service
      .saveFile(filePath, file)
      .subscribe(fileref => {
        this.loadingController.dismiss();
      });
  }

  selectPhoto(photo) {
    this.service.selectedPhoto$.next(photo);
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Uploading'
    });
    return await loading.present();
  }

  close() {
    this.modal.dismiss();
  }
}
