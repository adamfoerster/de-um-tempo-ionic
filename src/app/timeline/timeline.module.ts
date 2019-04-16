import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { LazyModule } from '@herodevs/lazy-af';
import { TimelinePage } from './timeline.page';
import { MusicComponent } from './music/music.component';
import { DeferLoadDirective } from '../defer-load.directive';

const routes: Routes = [
  {
    path: '',
    component: TimelinePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LazyModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    TimelinePage,
    MusicComponent,
    DeferLoadDirective
  ]
})
export class TimelinePageModule {}
