import { Directive, ElementRef, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';

import { CurrentWord } from '../model/AppModules';
import { WordService } from '../service/words';
import { PainterService } from '../service/painter';
import { SpeakerService } from '../service/speaker';
import { SpeechToTextCheck } from '../model/AppModules';
import { TocCategory } from '../model/AppModules';

/**
 * The abstract class of all content pages (Character, Practice, Print.)
 */
@Directive()
export abstract class PageContent implements OnInit, AfterViewInit {

	@ViewChild('sttCheck', { static: false }) sttCheckDiv!: ElementRef<HTMLDivElement>;
	@ViewChild('recognization', { static: false }) recognizationDiv!: ElementRef<HTMLDivElement>;

	protected sttCheck: SpeechToTextCheck;
	protected categoryRows: TocCategory[][];
	protected errorMessage: string;

	constructor(
		protected wordService: WordService,
		protected painter: PainterService,
		protected speaker: SpeakerService,
		protected cdr: ChangeDetectorRef) {
		this.errorMessage = '';
		this.categoryRows = [];
		this.sttCheck = new SpeechToTextCheck();

		/** create category list for the navigatable category list */
		const categories = this.wordService.getCategories();
		const columns = (this.wordService.isMobile() ? 4 : 5);
		this.categoryRows = this.chunk(categories, columns);
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
		this.addListener();
	}

	/**
	 * Hides the category menu when click on anywhere of the page.
	 */
	private addListener() {
		const categoryRow = document.getElementById('category-row');
		if (categoryRow) {
			categoryRow.style.display = 'none';
		}
		document.addEventListener("click", function () {
			if (categoryRow) {
				categoryRow.style.display = 'none';
			}
		});
	}

	/**
	 * Draws or redraws the Chinese character(s) of the current word
	 * @returns 
	 */
	public draw() {
		// 🔥 Clear old SVG before drawing new one
		const container = document.getElementById('character');
		if (container) {
			container.innerHTML = '';
		}
		// draw or redraw the character.
		this.painter.draw();
	}

	/**
	 * Sets the current word that is used by this page.
	 * @param {*} word 
	 */
	public setCurrentWord(word: CurrentWord) {
		this.wordService.setCurrentWord1(word);
	}

	public getCurrentWord(): CurrentWord {
		return this.wordService.getCurrentWord();
	}

	/**
	 * Sets the error message for anything goes wrong
	 * @param message 
	 */
	public setErrorMessage(message: string) {
		this.errorMessage = message;
	}

	public getErrorMessage(): string {
		return this.errorMessage;
	}

	public hideError() {
		this.errorMessage = '';
	}

	/**
	 * Gets the english text of the current word
	 * @returns 
	 */
	public getEnglish() {
		return this.getCurrentWord().word.english;
	}

	/**
	 * Gets the english text of the current word
	 * @returns 
	 */
	public getChinese() {
		return this.getCurrentWord().word.chinese;
	}

	/**
	 * Gets the pinyin of the current word
	 * @returns 
	 */
	public getPinyin() {
		return this.getCurrentWord().word.pinyin;
	}

	/**
	 * Gets the first phrase text of the current word
	 * @returns 
	 */
	public getPhrase1() {
		return this.getCurrentWord().word.phrase[0];
	}

	/**
	 * Gets the 2nd phrase text of the current word
	 * @returns 
	 */
	public getPhrase2() {
		return this.getCurrentWord().word.phrase[1];
	}

	/**
	 * Gets the sentence text of the current word
	 * @returns 
	 */
	public getSentence() {
		return this.getCurrentWord().word.sentence;
	}

	/**
	 * Gets the image URL of the current word
	 * @returns 
	 */
	public getCharImage() {
		return this.getCurrentWord().word.image;
	}

	/** Speaks English */
	public speakEnglish(langCode: string) {
		const text = this.getEnglish();
		this.say(langCode, text);
	}

	/** Speaks Chinese character */
	public speakChinese(langCode: string) {
		const text = this.getChinese();
		this.say(langCode, text);
	}

	/** Speaks Chinese phrase */
	public speakPhrase1(langCode: string) {
		const text = this.getPhrase1();
		this.say(langCode, text);
	}

	/** Speaks Chinese phrase */
	public speakPhrase2(langCode: string) {
		const text = this.getPhrase2();
		this.say(langCode, text);
	}

	/** Speaks Chinese sentence */
	public speakSentence(langCode: string) {
		const text = this.getSentence();
		this.say(langCode, text);
	}

	/** Speaks the text and catches the error message */
	private async say(langCode: string, text: string) {
		this.errorMessage = await this.speaker.say(langCode, text);
		console.log('error:', this.getErrorMessage());
	}

	/**
	 * Gets voice from a microphone, converts it to a text, gets pinyins of both
	 * input text and the selected text, and finally checks if they are same. This is
	 * used to practice pronunciation.
	 */
	public async speechCheck(text: string) {
		// console.log('speech to text:', text);
		this.initSpeechCheck();

		// the sttCheck gets modified by speaker.recognizeSpeech() and calls detectChanges()
		// to inform the GUI to show the speech-to-text result
		this.speaker.recognizeSpeech(this.sttCheck, text, () => {
			this.updateRecognization(); // ✅ guaranteed to be after update
		});
	}

	private updateRecognization() {
		this.setErrorMessage(this.sttCheck.error);
		this.cdr.detectChanges()
	}
	
	/**
	 * Clears and hides the STT check section.
	 */
	public clearSpeechCheck() {
		const sttCheck = this.sttCheckDiv.nativeElement;
		const recognition = this.recognizationDiv.nativeElement;
		sttCheck.style.display = 'none';
		recognition.style.display = 'none';
		this.sttCheck.clear();
	}

	/**
	 * Initializes the STT check section and shows it.
	 */
	public initSpeechCheck() {
		this.sttCheck.setRecording();
		this.setErrorMessage('');
		const sttCheck = this.sttCheckDiv.nativeElement;
		const recognition = this.recognizationDiv.nativeElement;
		sttCheck.style.display = 'block';
		recognition.style.display = 'block';
	}

	/** Gets STT check imaage */
	public getSttImage() {
		return this.sttCheck.recordingImage;
	}

	/** Gets STT check text: string, pinyin: string, error: string */
	public getSttText() {
		return this.sttCheck.text;
	}

	/** Gets STT check pinyin */
	public getSttPinyin() {
		return this.sttCheck.pinyin;
	}

	/** Gets STT check error */
	public getSttError() {
		return this.sttCheck.error;
	}

	/**
	 * Hides all meun rows and shows the specified one.
	 * @param {*} id 
	 */
	public showMenuRow(id: string) {
		this.hideMenuRows();
		const element = document.getElementById(id);
		if (element) {
			element.style.display = 'block';
		}
	}

	/**
	 * Hides all menu rows. Implemented by a child class.
	 */
	public hideMenuRows() {
		const menuRows = document.getElementById('category-row');
		if (menuRows) {
			menuRows.style.display = 'none';
		}
		const usage = document.getElementById('usage-row');
		if (usage)
			usage.style.display = 'none';
	}

	/**
	 * Searches a word (Chinese or English) from the allWord list. Note that if the word
	 * is not unique in the list, uses the first one found. If found, wordService.findWord(value)
	 * sets the current word with it;
	 */
	public searchWord(): boolean {
		const search = document.getElementById('search-word') as HTMLInputElement | null;
		if (!search) {
			return false;
		}
		const value = search.value.trim();
		const error = document.getElementById('search-error') as HTMLParagraphElement | null;
		if (error) {
			error.textContent = '';
		}

		const searchWord = this.wordService.findWord(value);
		if (searchWord == null && error) {
			error.textContent = 'No this word: ' + value;
			return false;
		}
		return true;
	}

	/** Devides the categories in a few groups for creating navigatable category list */
	public chunk(list: TocCategory[], size: number): TocCategory[][] {
		const result = [];
		for (let i = 0; i < list.length; i += size) {
			result.push(list.slice(i, i + size));
		}
		return result;
	}

	/**
		 * Uses RETURN key instead of button for searching
		 */
	public enterKeyPressed(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			this.searchWord();
		}
	}
}