import { Component } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'pwa-app';

	constructor() {
		console.log('APP_COMPONENT_CONSTRUCTOR_V4');
	}

	// getNewVersion() {
	// 	this.swLog.getNewVersion();
	// }

	// get hasNewVersion() {
	// 	return this.swLog.availableVer;
	// }
}
