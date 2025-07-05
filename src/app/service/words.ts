
import { Injectable } from '@angular/core';

import { Category, CurrentWord, Word, TocCategory } from '../model/AppModules';
import { ALL_WORDS, GREETING_IMAGES } from '../model/AllWords';
import { UtilsService } from '../service/utils';

@Injectable({
	providedIn: 'root'
})

/**
 * This is a word utility to creat and paint a character.
 */
export class WordService extends UtilsService {

	private readonly GREETING_IMG_DIR = 'assets/images/greetings/';
	private currentWord: CurrentWord;

	constructor() {
		super();
		const category = ALL_WORDS[0];
		this.currentWord = new CurrentWord(category.category, category.cname, category.words[0]);
	}

	//
	// The following are utilities for greeting images
	//
	/**
	 * Gets an image from an array randomly for the category of the current word.
	 * @returns 
	 */
	public getGreetingImage(category: string) {
		let images = GREETING_IMAGES.find(item => item.category == category);
		if (images === undefined) {
			images = GREETING_IMAGES.find(item => item.category == 'All')!;
		}
		const min = Math.ceil(0);
		const max = Math.floor(images.great.length - 1);
		const idx = Math.floor(Math.random() * (max - min + 1) + min);
		const greetingImages = {
			wrong: this.GREETING_IMG_DIR + images.wrong,
			ok: this.GREETING_IMG_DIR + images.ok,
			great: this.GREETING_IMG_DIR + images.great[idx]
		}
		// console.log(greetingImages);
		return greetingImages;
	}

	/**
	 * Gets a gatgory icon image URL.
	 * @returns 
	 */
	public getCategoryIcon(category: string) {
		let images = GREETING_IMAGES.find(item => item.category == category);
		if (images === undefined) {
			images = GREETING_IMAGES.find(item => item.category == 'All')!;
		}
		return this.GREETING_IMG_DIR + images.icon;
	}

	//
	// The following are utilities for words (find, set, etc. currentWord, allWords)
	//
	public getAllWords() {
		return ALL_WORDS;
	}

	public getCurrentWord() {
		return this.currentWord;
	}

	public setNextWord() {
		const currentWord = this.getCurrentWord();
		const categoryName = currentWord.category;
		const english = currentWord.word.english;
		const category = this.getCategory(categoryName);
		let currentIdx = -1;
		for (let i = 0; i < category.words.length && currentIdx < 0; i++) {
			if (category.words[i].english == english) {
				currentIdx = i;
			}
		}

		const min = Math.ceil(0);
		const max = Math.floor(category.words.length - 1);
		const idx = Math.floor(Math.random() * (max - min + 1) + min);
		currentWord.word = category.words[idx];
	}

	public setCurrentWord3(category: string, cname: string, word: Word) {
		const currentWord = this.getCurrentWord();
		currentWord.category = category;
		currentWord.cname = cname;
		currentWord.word = word;
	}

	public setCurrentWord1(word: CurrentWord) {
		const currentWord = this.getCurrentWord();
		currentWord.category = word.category;
		currentWord.cname = word.cname;
		currentWord.word = word.word;
	}

	/**
	 * Gets a word by Chinese or English from the allWord list and sets it as the current word.
	 * Note that if the word is not unique, return the first one found.
	 * @returns currentWord {category, cname, word} if dound, otherwise null;
	 */
	public findWord(searchWord: string) {
		let category: Category = ALL_WORDS[0];
		let word: Word = new Word();
		let found = false;
		let item = null;
		for (let i = 0; i < ALL_WORDS.length && !found; i++) {
			category = ALL_WORDS[i];
			item = category.words.find(
				item => item.english.toLowerCase() == searchWord.toLowerCase() || item.chinese == searchWord);
			if (item) {
				word = item as Word;
				found = true;
			}
		}
		if (found) {
			this.setCurrentWord3(category.category, category.cname, word);
			return this.getCurrentWord();
		} else {
			return null;
		}
	}

	/**
	 * Gets a word by Chinese or English from the allWord list and sets it as the current word.
	 * Note that if the word is not unique, return the first one found.
	 * @returns currentWord {category, cname, word}
	 */
	public findAndSetWord(searchWord: string) {
		let category: Category = ALL_WORDS[0];
		let word: Word = category.words[0];
		let item;
		let found = false;
		for (let i = 0; i < ALL_WORDS.length && !found; i++) {
			category = ALL_WORDS[i];
			item = category.words.find(
				item => item.english.toLowerCase() == searchWord.toLowerCase() || item.chinese == searchWord);
			if (item) {
				found = true;
				word = item as Word;
			}
		}

		this.setCurrentWord3(category.category, category.cname, word);
		return this.getCurrentWord();
	}

	/**
	 * Gets a word by Chinese and English from the allWord list and sets it as the current word.
	 * @returns currentWord {category, cname, word}
	 */
	public findAndSetWord2(searchWord1: string, searchWord2: string) {
		let category: Category = ALL_WORDS[0];
		let word: Word = category.words[0];
		let item;
		let found = false;
		for (let i = 0; i < ALL_WORDS.length && !found; i++) {
			category = ALL_WORDS[i];
			item = category.words.find(item =>
				(item.english == searchWord1 && item.chinese == searchWord2) ||
				(item.english == searchWord2 && item.chinese == searchWord1));
			if (item) {
				found = true;
				word = item as Word;
			}
		}

		this.setCurrentWord3(category.category, category.cname, word);
		return this.getCurrentWord();
	}

	/**
	 * Finds a word by parameters [category, English/Chinese, English/Chinese] and sets it as the current word.
	 * @param {*} names 
	 */
	public findAndSetWord3(names: string[]) {
		let word: Word, item;
		let category = this.getCategory(names[0]);
		if (category == null || names.length == 0) {
			category = ALL_WORDS[0];
			this.setCurrentWord3(category.category, category.cname, category.words[0]);
			return this.getCurrentWord();
		}

		switch (names.length) {
			case 1: // category and the first word
				word = category.words[0];
				break;
			case 2:  // category and the English or Chinese word
				item = category.words.find(item => item.english == names[1] || item.chinese == names[1]);
				word = item as Word;
				break;
			case 3:  // category and the English and Chinese word
			default:
				item = category.words.find(item =>
					(item.english == names[1] && item.chinese == names[2]) ||
					(item.english == names[2] && item.chinese == names[1]));
				word = item as Word;
				break;
		}
		this.setCurrentWord3(category.category, category.cname, word);
		return this.getCurrentWord();
	}

	/**
	 * Finds a match category.
	 * @param {*} categoryName 
	 * @returns 
	 */
	public getCategory(categoryName: string) {
		let category = ALL_WORDS.find(item => item.category == categoryName);
		if (category == null) {
			category = ALL_WORDS[0];
		}
		return category;
	}

	/**
	 * Finds the category of the current word
	 * @returns 
	 */
	public getCurrentCategory() {
		const categoryName = this.getCurrentWord().category;
		let category = ALL_WORDS.find(item => item.category == categoryName);
		if (category == null) {
			category = ALL_WORDS[0];
		}
		return category;
	}

	/**
	 * Gets all categories for creating a navigatable table.
	 * @returns 
	 */
	public getCategories() {
		const categories: TocCategory[] = [];
		let tocCategory: TocCategory;
		// for (let i = 0; i < ALL_WORDS.length; i++) {
		// 	item = ALL_WORDS[i];
		// 	tocCategory = new TocCategory();
		// 	tocCategory.id = item.category;
		// 	tocCategory.chinese = item.cname;
		// 	tocCategory.icon = this.getCategoryIcon(item.category);
		// 	categories.push(tocCategory);
		// }
		for (const item of ALL_WORDS) {
			tocCategory = new TocCategory();
			tocCategory.id = item.category;
			tocCategory.chinese = item.cname;
			tocCategory.icon = this.getCategoryIcon(item.category);
			categories.push(tocCategory);
		}
		return categories;
	}
}
