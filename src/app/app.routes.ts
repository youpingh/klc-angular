import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { CharacterComponent } from './character/character';
import { PracticeComponent } from './practice/practice';
import { PrintComponent } from './print/print';

export const routes: Routes = [
  { path: 'character', component: CharacterComponent },
  { path: 'practice', component: PracticeComponent },
  { path: 'print', component: PrintComponent },
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];