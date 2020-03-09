import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable()
export class SwLogService {

	public currentVer: string;
	public availableVer: string;

	constructor(private updates: SwUpdate) {
		this.updates.available.subscribe(event => {
			console.log('old version was', event.current);
			console.log('new version is', event.available);
			debugger;
			this.currentVer = event.current.hash;
			this.availableVer = event.available.hash;
			this.updates.activateUpdate().then(() => document.location.reload());
		});
		this.updates.activated.subscribe(event => {
			console.log('old version was', event.previous);
			console.log('new version is', event.current);
		});
	}

	getNewVersion() {
		console.log(this.currentVer, this.availableVer);
		this.updates.activateUpdate().then(() => document.location.reload());
	}
}