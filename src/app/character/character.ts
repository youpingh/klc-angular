import { Component, ElementRef, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageContent } from '../abstract/PageContent';
import { TOC, TocCategory, TocWord } from '../model/AppModules';
import { PainterService } from '../service/painter';
import { SpeakerService } from '../service/speaker';
import { WordService } from '../service/words';

@Component({
	selector: 'app-character',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './character.html',
	styleUrls: ['./character.css']
})
export class CharacterComponent extends PageContent implements OnInit {

	@ViewChild('picture', { static: false }) charImage!: ElementRef<HTMLImageElement>;
	@ViewChild('pictureDefault', { static: false }) defaultCharImage!: ElementRef<HTMLImageElement>;

	toc: TOC;

	constructor(
		protected override wordService: WordService,
		protected override painter: PainterService,
		protected override speaker: SpeakerService,
		protected override cdr: ChangeDetectorRef
	) {
		super(wordService, painter, speaker, cdr);
		this.painter.setAnimation(true);
		this.toc = new TOC();
	}

	override ngOnInit() {
		this.createSidebar();
	}

	override ngAfterViewInit() {
		super.ngAfterViewInit();
		this.painter.draw();
		this.clearSpeechCheck();
		this.showDefaultImage();
	}

	/**
	 * Changes the current category and uses its first word as the current word
	 * @param category 
	 */
	public changeCategory(category: TocCategory) {
		const fullCategory = this.wordService.getCategory(category.id);
		if (fullCategory) {
			this.wordService.setCurrentWord3(fullCategory.category, fullCategory.cname, fullCategory.words[0])
			this.showDefaultImage();
			this.createSidebar();
			this.draw();
		}
	}

	/**
	 * Searches a word (Chinese or English) from the allWord list and resets
	 * the page with the current word if found.
	 */
	public override searchWord(): boolean {
		const found = super.searchWord();
		if (found) {
			this.showDefaultImage();
			this.createSidebar();
			this.draw();
		}
		return found;
	}

	/** Shows the default character image (question mark) */
	public showDefaultImage() {
		const charImg = this.charImage.nativeElement;
		const defaultCharImg = this.defaultCharImage.nativeElement;
		charImg.style.display = 'none';
		defaultCharImg.style.display = 'block';
	}

	/**
	 * Gets the image URL of the current word
	 * @returns 
	 */
	public override getCharImage() {
		let image = this.getCurrentWord().word.image;
		if (image) {
			return image;
		}
		image = this.painter.createCharImage(this.getChinese());
		return image;
	}

	/** Changes the current word */
	public changeWord(word: TocWord) {
		this.wordService.findAndSetWord2(word.english, word.chinese);
		this.showDefaultImage();
		this.toggleMenu();
		this.draw();
	}

	/**
	 * Shows the default picture or the character's picture.
	 */
	public flipPicture() {
		const charImg = this.charImage.nativeElement;
		const defaultCharImg = this.defaultCharImage.nativeElement;
		if (charImg.style.display == 'none') {
			charImg.style.display = 'block';
			defaultCharImg.style.display = 'none';
		} else {
			charImg.style.display = 'none';
			defaultCharImg.style.display = 'block';
		}
	}

	/**
	 * Gets the default image URL
	 * @returns 
	 */
	public getDefaultImage() {
		return this.painter.getDefaultImage();
	}

	/**
	 * Creates a sidebar when all words are ready to use.
	 */
	private createSidebar() {
		console.log('Start building a word list');
		this.toc = new TOC();
		const categoryName = this.wordService.getCurrentWord().category;
		const category = this.wordService.getCategory(categoryName);

		this.toc.category = categoryName + ' (' + category.words.length + ')';
		this.toc.image = this.wordService.getCategoryIcon(categoryName);

		for (const word of category.words) {
			if (word) {
				const tocWord = new TocWord();
				tocWord.id = word.chinese + '-' + word.english;
				tocWord.english = word.english;
				tocWord.chinese = word.chinese;
				this.toc.words.push(tocWord);
			}
		}
	}

	/**
	 * Shows/hides the hamburger siderar for mobile devices. Implemented by a child class
	 */
	public toggleMenu() {
		if (this.wordService.isMobile()) {
			const sidebar = document.getElementById("sidebar")!;
			const isOn = sidebar.style.display == 'block';
			sidebar.style.display = (isOn ? 'none' : 'block');
		}
	}
}