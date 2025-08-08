
import { Injectable, inject } from '@angular/core';
import { PainterService } from './painter';
import { WordService } from './words';
import { UtilsService } from './utils';

@Injectable({
	providedIn: 'root'
})

/**
 * This is a database utility to manage an online data store.
 */
export class DataService extends UtilsService {

	private wordService: WordService = inject(WordService);
	private painter: PainterService = inject(PainterService);

	/**
	 * Prints all words of the current category into a PDF file
	 */
}
