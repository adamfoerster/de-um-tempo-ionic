import { GalleryComponent } from './gallery/gallery.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'timeline',
    pathMatch: 'full'
  },
  {
    path: 'timeline',
    loadChildren: './timeline/timeline.module#TimelinePageModule'
  },
  {
    path: 'bible',
    loadChildren: './bible/bible.module#BiblePageModule'
  },
  {
    path: 'passages',
    loadChildren: './passages/passages.module#PassagesPageModule'
  },
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminPageModule'
  },
  {
    path: 'post',
    loadChildren: './post-form/post-form.module#PostFormPageModule'
  },
  {
    path: 'gallery',
    component: GalleryComponent
  },
  { path: 'print', loadChildren: './print/print.module#PrintPageModule' },
  {
    path: 'post-form',
    loadChildren: './post-form/post-form.module#PostFormPageModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
