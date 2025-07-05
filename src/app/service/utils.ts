
/**
 * This is common utility service that is a super class for all the service classes.
 */
export class UtilsService {

	/**
	* Checks the device is a mobile device (iPhone or Android phone)
	*/
	public isMobile() {
		const userAgent = navigator.userAgent.toLowerCase();
		return (/iphone|ipod/.test(userAgent) || /android/.test(userAgent));
	}
}
