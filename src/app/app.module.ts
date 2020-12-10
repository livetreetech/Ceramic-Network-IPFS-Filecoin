import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { IpldService } from './_services/ipld.service';
import { VjsPlayerComponent } from './vjs-player/vjs-player.component';

@NgModule({
  declarations: [
    AppComponent,
    VjsPlayerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [IpldService],
  bootstrap: [AppComponent]
})
export class AppModule { }
