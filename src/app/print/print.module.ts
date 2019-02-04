import { AdminGuard } from './../admin.guard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PrintPage } from './print.page';

const routes: Routes = [
  {
    path: '',
    component: PrintPage,
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
  declarations: [PrintPage]
})
export class PrintPageModule {}
