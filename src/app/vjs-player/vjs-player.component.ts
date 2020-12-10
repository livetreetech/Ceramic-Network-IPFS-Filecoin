// vjs-player.component.ts
import { Component, ElementRef, Input, OnDestroy, OnInit, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import videojs from 'video.js';
import { IpldService } from '../_services/ipld.service';
import { DatePipe } from '@angular/common';
import { VASTClient, VASTParser, VASTTracker } from 'vast-client';
import ads from 'videojs-contrib-ads';

const vastClient = new VASTClient();

videojs.registerPlugin('ads', function() {
  ads( {
    debug: true
  });
  // Ad plugin logic goes here
});

@Component({
  selector: 'app-vjs-player',
  template: `
    <video #target class="video-js" controls muted playsinline preload="none"></video>
  `,
  styleUrls: [
    './vjs-player.component.css'
  ],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})

export class VjsPlayerComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('target', {static: true}) target!: ElementRef;
  // see options: https://github.com/videojs/video.js/blob/mastertutorial-options.html
  /* @Input() options!: {
      fluid: boolean,
      aspectRatio: string,
      autoplay: boolean,
      controls: boolean,
      muted: boolean,
      sources: {
          src: string,
          type: string,
      }[],
  }; */
  @Input() options: string = '';
  player!: videojs.Player;

  constructor(
    private elementRef: ElementRef, private iservice: IpldService, private dPipe: DatePipe
  ) {
    // Create vastClient with default values
    console.log("vastClient: ", vastClient);
    console.log("ads: ", ads);
    console.log("options (constructor): ", this.options);

 }

  private strExists(str: any):boolean {
    if (typeof str == "undefined") {return false};
    if (str.length == 0) {return false}
    return true;
  }

  private playVideo(options: any):void {

    // Get vast client ...
    // With the options optional parameter
    const opts = {
      withCredentials: false,
      resolveAll: false,
      wrapperLimit: 7
    };

    console.log("options (playVideo): ", options);

    vastClient.get(options.vast).then(res => {
    // Do something with the parsed VAST response
       //console.log('vastClient.get: ', res);
       console.log('ad: ', res.ads[0].creatives[0].mediaFiles[0].fileURL);
     }).catch(err => {
    // Deal with the error
       console.log('vastClient.get err: ', err);
    });;
    let THIS = this;
    let myDate = new Date();
    let event = "{ did: " + options.did + ", \nevent: started" + ", \nsrc: " + ", \nat: " + this.dPipe.transform(myDate, 'yyyy-MM-dd hh:mm:ss') + "}"; 
    this.iservice.sendEvent(options.did, event);
    this.player = videojs(this.target.nativeElement, options, function onPlayerReady(){
      // console.log('onPlayerReady', this);
      console.log('onPlayerReady: ', THIS.player);        
     });

  }

  ngOnInit() {
    // instantiate Video.js - OnChanges is called on init anyway, deal with in that event handler
  }

  ngOnDestroy() {
    // destroy player
    if (this.player) {
      this.player.dispose();
    }
  }

  ngOnChanges() {
    // change player
    console.log("options (ngOnChanges): ", this.options);

    let OPTIONS = JSON.parse(this.options);
    console.log('video.js option: ', OPTIONS);
    if(!this.strExists(OPTIONS.did)) {
      if(!this.strExists(OPTIONS.seed)) {
      	console.log('No DID or Seed provided.');
       } else {
        this.playVideo(OPTIONS); 
      }
    } else {
      this.playVideo(OPTIONS); 
    }
  }

}