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
  { path: 'passages', loadChildren: './passages/passages.module#PassagesPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
