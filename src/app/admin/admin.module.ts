import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AdminPage } from './admin.page';
import { AdminGuard } from '../admin.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminPage,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AdminPage],
  providers: [AdminGuard]
})
export class AdminPageModule {}
