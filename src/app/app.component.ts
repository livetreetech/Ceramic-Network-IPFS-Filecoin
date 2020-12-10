import { Component } from '@angular/core';
import { IpldService } from './_services/ipld.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
 	title = 'ipld-event-log';
	public seedInput:string  = '';
	public didOutput:string = '';
 
	public eventInput:string  = '';
	public fetchedEvents:string = '';
	public status:string = '';

  	constructor(private iservice: IpldService) {

  	}

  	setDid(): void {
	  //console.log("setting did:", this.seedInput);
	  this.iservice.createDID(this.seedInput).then((result) => {
	  	this.didOutput = result;
	  	this.status = "Created DID."
	  });
	}

	sendEvent(): void {
	  //console.log("setting did:", this.seedInput);
	  this.iservice.sendEvent(this.didOutput, this.eventInput).then((result) => {this.status = result});
	}

  	fetchEvents(): void {
	  //console.log("setting did:", this.seedInput);
	  this.iservice.fetchEvents(this.didOutput).then((result) => {
	  	this.status = result.msg;
	  	this.fetchedEvents = result.events;
	  });
	}

  	clearEvents(): void {
	  //console.log("setting did:", this.seedInput);
	  this.iservice.clearEvents(this.didOutput).then((result) => {
	  	this.status = result;
	  	this.fetchedEvents = "";
	  });
	}
	
}
