import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageContent } from '../abstract/PageContent';
import { TocCategory, Word } from '../model/AppModules';
import { PainterService } from '../service/painter';
import { SpeakerService } from '../service/speaker';
import { WordService } from '../service/words';

@Component({
	selector: 'app-practice',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './practice.html',
	styleUrls: ['./practice.css']
})
export class PracticeComponent extends PageContent implements OnInit {

	public imageChoices: Word[] = [];

	constructor(
		protected override wordService: WordService,
		protected override painter: PainterService,
		protected override speaker: SpeakerService,
		protected override cdr: ChangeDetectorRef
	) {
		super(wordService, painter, speaker, cdr);
		this.painter.setAnimation(true);
		this.buildMultiChoices();
	}

	override ngOnInit() {
		super.ngOnInit();
	}

	override ngAfterViewInit() {
		super.ngAfterViewInit();
		this.draw();
		this.initSpeechCheck();
	}

	/**
	 * Searches a word (Chinese or English) from the allWord list. Note that if the word
	 * is not unique in the list, returns the first one.
	 */
	public override searchWord(): boolean {
		const found = super.searchWord();
		if (found) {
			this.draw();
			this.buildMultiChoices();
		}
		return found;
	}

	/**
	 * Set the SpeechCheck for this component.
	 */
	public override initSpeechCheck() {
		super.initSpeechCheck();
		this.sttCheck.init();
	}

	/**
	 * Changes the current category and uses its first word as the current word
	 * @param category 
	 */
	public changeCategory(category: TocCategory) {
		const fullCategory = this.wordService.getCategory(category.id);
		if (fullCategory) {
			this.wordService.setCurrentWord3(fullCategory.category, fullCategory.cname, fullCategory.words[0])
			this.draw();
			this.buildMultiChoices();
		}
	}

	/**
	 * Finds the next character of the current category and set it as the current one
	 */
	public nextCharacter() {
		this.wordService.setNextWord();
		this.draw();
		this.buildMultiChoices();
	}

	/**
	 * Shows 4 pictures of the current category randomly, one of them matches the current word.
	 */
	public buildMultiChoices() {
		this.imageChoices = []
		const category = this.wordService.getCurrentCategory();
		const matchWord = this.wordService.getCurrentWord().word;
		const word = category.words.find(item => item.english == matchWord.english)!;
		this.imageChoices.push(word);

		// Make a copy of the array to avoid mutating the original
		const shuffled = category.words.filter(item => item.english !== matchWord.english);;

		// Fisher-Yates Shuffle
		let j;
		for (let i = shuffled.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		this.imageChoices.push(...shuffled.slice(0, 3));

		// Shuffle the final result of 4 items
		for (let i = this.imageChoices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.imageChoices[i], this.imageChoices[j]] = [this.imageChoices[j], this.imageChoices[i]];
		}
		this.sttCheck.init();
	}

	/**
	 * Shows 4 pictures of the current category randomly, one of them matches the current word.
	 */
	public checkSelection(selected: string) {
		const english = this.getEnglish();
		const greetingImage = this.wordService.getGreetingImage('MultipleChoice');
		let greetingImageSrc;
		if (english === selected) {
			greetingImageSrc = greetingImage.great;
		} else {
			greetingImageSrc = greetingImage.wrong;
		}
		this.sttCheck.setImage(greetingImageSrc);
	}
}