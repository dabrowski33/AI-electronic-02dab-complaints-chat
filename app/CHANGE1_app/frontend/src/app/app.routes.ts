import { Routes } from '@angular/router';
import { ChatInterfaceComponent } from './chat/chat-interface/chat-interface.component';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: ChatInterfaceComponent },
];
