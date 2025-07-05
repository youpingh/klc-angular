import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TocCategory, Word, PageFooter } from '../model/AppModules';
import { PageContent } from '../abstract/PageContent';
import { PainterService } from '../service/painter';
import { WordService } from '../service/words';
import { SpeakerService } from '../service/speaker';

@Component({
	selector: 'app-print',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './print.html',
	styleUrls: ['./print.css']
})
export class PrintComponent extends PageContent implements OnInit {

	wordList: [Word];
	pageFooter: PageFooter;

	constructor(
		protected override wordService: WordService,
		protected override painter: PainterService,
		protected override speaker: SpeakerService,
		protected override cdr: ChangeDetectorRef
	) {
		super(wordService, painter, speaker, cdr);
		this.painter.setAnimation(false);
		this.pageFooter = new PageFooter();
		this.wordList = [new Word()];
	}

	override ngOnInit() {
		this.createWordList();
		this.createFooter();
	}

	override ngAfterViewInit() {
		super.ngAfterViewInit();
		this.draw();
	}

	/**
	 * Initializes the word list of the current category.
	 */
	public createWordList() {
		const category = this.wordService.getCurrentCategory();
		this.wordList.splice(0, this.wordList.length);
		this.wordList.push(...category.words);
	}

	/**
	 * Creates a page footer for the current category
	 */
	public createFooter() {
		const category = this.wordService.getCurrentCategory();
		this.pageFooter.chinese = category.cname;
		this.pageFooter.english = category.category;
	}

	/**
	 * Changes the current category and uses its first word as the current word
	 * @param category 
	 */
	public changeCategory(category: TocCategory) {
		const fullCategory = this.wordService.getCategory(category.id);
		this.wordService.setCurrentWord3(category.id, category.chinese, fullCategory.words[0]);
		this.createWordList();
		this.createFooter();
		setTimeout(() => {
			this.draw();
		}, 1000);
	}

	/**
	 * Drews or redres the characters of the current category.
	 */
	public override draw() {
		const prefix = 'char-';
		for (let i = 0; i < this.wordList.length; i++) {
			const pic = document.getElementById(prefix + i) as HTMLSpanElement;
			pic.innerHTML = '';
			this.painter.drawCharacter(prefix + i, this.wordList[i].chinese, 1);
		}
	}

	//
	// Printing related methods
	//
	/**
	 * Prints all words of the current category into a PDF file
	 */
	public async printPages() {
		// 	// save the current page <body> to restore after printing
		const body = document.body;
		const bodyOrig = body.innerHTML;

		const cover = document.getElementById('book-cover') as HTMLDivElement;
		const contents = document.getElementById('contents') as HTMLDivElement;

		body.innerHTML = '';
		body.appendChild(cover);
		body.appendChild(contents);
		// console.log(body.innerHTML);
		window.print();

		// restore the original page
		body.innerHTML = bodyOrig;
		location.reload();
	}
}