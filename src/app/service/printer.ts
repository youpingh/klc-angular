
import { Injectable, inject } from '@angular/core';
import { PainterService } from '../service/painter';
import { WordService } from '../service/words';
import { UtilsService } from '../service/utils';

@Injectable({
	providedIn: 'root'
})

/**
 * This is a printer utility to print character cards to printer/PDF.
 */
export class PrinterService extends UtilsService {

	private wordService: WordService = inject(WordService);
	private painter: PainterService = inject(PainterService);

	/**
	 * Prints all words of the current category into a PDF file
	 */
	public async printPages() {

		// save the current page <body> to restore after printing
		const body = document.body;
		const bodyOrig = body.innerHTML;

		const category = this.wordService.getCurrentCategory();
		const pdfHolder = document.createElement('div');
		let div, contents = null;

		// Create a page name and page footer with the category info
		// The elements page-name, page-footer, cname and ename must be there.
		const pageName = document.getElementById('page-name')!;
		const pageFooter = document.getElementById('page-footer')!;
		const cname = pageName.querySelector('#cname')!;
		const ename = pageName.querySelector('#ename')!;
		cname.textContent = category.cname;
		ename.textContent = ' (' + category.category + ')';
		pageFooter.textContent = cname.textContent + ename.textContent;

		// Add the book cover to the pdf holder as the first page
		const cover = document.getElementById('book-cover')!.cloneNode(true) as HTMLDivElement;
		cover.style.display = 'block';
		pdfHolder.appendChild(cover);

		// Create pages for all characters of the current category
		// and put them into a pdf holder
		this.painter.setAnimation(false);
		// for (let i = 0; i < category.words.length; i++) {
		// 	word = category.words[i];
		for (const word of category.words) {
			this.setFontSizes();
			this.hideSymbols();
			this.wordService.setCurrentWord3(category.category, category.cname, word);
			contents = document.getElementById('contents')!.parentElement!.cloneNode(true) as HTMLDivElement;
			div = document.createElement('div');
			div.replaceChildren(...contents.children);
			div.className = 'char-item page-break';
			pdfHolder.appendChild(div);
		}

		// push all cards into the <body> tag and print the pages
		body.innerHTML = '';
		body.appendChild(pdfHolder);
		// console.log(body.innerHTML);
		window.print();

		// restore the original page
		body.innerHTML = bodyOrig;
		location.reload();
		this.painter.setAnimation(true);
	}

	/**
	 * Sets the font sizes for printing.
	 * IMPORTANT! the following settings on 'contents' make the page fit the 6x4 printing page siz
	 */
	private setFontSizes() {

		// set some elements' position for printing
		const contents = document.getElementById('contents')!;
		const sidebar = document.getElementById('sidebar')!;
		const characterCard = document.getElementById('character-card')!;
		const pictureCard = document.getElementById('picture-card')!;
		const wordCard = document.getElementById('word-card')!;
		contents.style.width = '98%';
		contents.style.padding = '4px';
		if (sidebar)
			sidebar.remove();
		characterCard.style.width = '48%';
		pictureCard.style.width = '44%';
		pictureCard.style.marginTop = '20px';
		pictureCard.style.marginLeft = '-40px';
		wordCard.style.marginTop = '16px';
		wordCard.style.marginLeft = '24px';

		// make those text larger for printing
		const chinese = document.getElementById('chinese')!;
		const pinyin = document.getElementById('pinyin')!;
		const phrase = document.getElementById('phrase')!;
		const sentence = document.getElementById('sentence')!;

		pinyin.style.fontSize = '24px';
		chinese.style.fontSize = '32px';
		sentence.style.fontSize = '32px';
		phrase.style.fontSize = '32px';
		phrase.style.color = 'blue';
	}

	/**
	 * Hides some elements so that they will not be printed.
	 */
	private hideSymbols() {
		const classNames = ['speaker', 'mandarin', 'cantonese'];
		const iDs = ['header', 'category-words', 'word-search', 'category-row', 'usage-row', 'speech-check', 'error-message', 'textCanvas'];

		let elements: HTMLCollectionOf<Element>;
		let element;
		// for (let i = 0; i < classNames.length; i++) {
		for (const name of classNames) {
			elements = document.getElementsByClassName(name) as HTMLCollectionOf<Element>;
			// for (let j = 0; j < elements.length; j++) {
			for (const item of elements) {
				element = item as HTMLElement;
				if (element) {
					element.style.display = 'none';
				}
			}
		}

		// for (let i = 0; i < iDs.length; i++) {
		for (const id of iDs) {
			element = document.getElementById(id) as HTMLElement;
			if (element) {
				element.style.display = 'none';
			}
		}
	}
}
