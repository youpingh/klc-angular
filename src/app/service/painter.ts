
import { Injectable, inject } from '@angular/core';
import HanziWriter from 'hanzi-writer';

import { WordService } from '../service/words';
import { UtilsService } from '../service/utils';
import { Word } from '../model/AppModules';

@Injectable({
	providedIn: 'root'
})

/**
 * This is a painter utility to creat and paint a character.
 */
export class PainterService extends UtilsService {

	private wordService: WordService = inject(WordService);

	static readonly WAIT_TIME = 300;
	static readonly DEFAULT_IMAGE = "assets/images/site/question-mark.png";

	private animation = true;
	private charSizeRate = 1.0;

	/**
	 * Sets this to start/stop animation for drawing a character.
	 * @param {} animation 
	 */
	public setAnimation(animation: boolean) {
		this.animation = animation;
	}

	/**
	 * Sets this to start/stop animation for drawing a character.
	 * @param {} rate 
	 */
	public setCharSizeRate(rate: number) {
		this.charSizeRate = rate;
	}

	public getDefaultImage() {
		return PainterService.DEFAULT_IMAGE;
	}

	/**
	 * Draws a Chinese character in the standard strok order.
	 * It's called from some HTML tag onclick events.
	 */
	public draw() {
		const word: Word = this.wordService.getCurrentWord().word;
		const character = word.chinese.trim();
		this.drawCharacter('character', character, 200);
	}

	/**
	 * Draws a Chinese character in the standard strok order.
	 * It's called from some HTML tag onclick events.
	 */
	public drawCharacter(elementId: string, character: string, delay: number) {
		const charSize = this.getCharSize(character.length);
		const chars = Array.from(character);
		let writer;
		// for (let i = 0; i < chars.length; i++) {
		for (const char of chars) {
			writer = HanziWriter.create(elementId, char, {
				width: charSize,
				height: charSize * 0.9,
				padding: 5,
				strokeColor: '#006400',
				showOutline: true,
				strokeAnimationSpeed: 1, // normal speed
				delayBetweenStrokes: delay // milliseconds
			});
			if (this.animation && chars.length == 1) {
				writer.animateCharacter();
			}
		}
	}

	/**
	 * Builds an image for some specialy characters
	 * @param {*} char 
	 */
	public createCharImage(char: string) {
		const today = new Date();
		const yesterday = new Date(today);
		const tomorrow = new Date(today);
		const texts = [];
		switch (char) {
			case '今':
				texts.push('今天：');
				texts.push(today.getFullYear() + '年' + (today.getMonth() + 1) + '月' + today.getDate() + '号');
				texts.push('------');
				texts.push('今年：');
				texts.push(today.getFullYear() + '年 ');
				break;
			case '昨':
				yesterday.setDate(today.getDate() - 1);
				texts.push('昨天：')
				texts.push(today.getFullYear() + '年' + (yesterday.getMonth() + 1) + '月' + yesterday.getDate() + '号');
				texts.push('------');
				texts.push('去年：');
				texts.push((today.getFullYear() - 1) + '年');
				break;
			case '明':
				tomorrow.setDate(today.getDate() + 1);
				texts.push('明天：');
				texts.push(tomorrow.getFullYear() + '年' + (tomorrow.getMonth() + 1) + '月' + tomorrow.getDate() + '号');
				texts.push('------');
				texts.push('明年：');
				texts.push((tomorrow.getFullYear() + 1) + '年');
				break;
			default:
				texts.push('Picture');
				texts.push('is coming');
				texts.push('soon ...');
		}
		return this.createBase64Image(texts);
	}

	/**
	 * Creates a based 64 image for the text.
	 * @param {*} texts 
	 * @returns 
	 */
	createBase64Image(texts: string[]) {
		const canvas = document.getElementById("textCanvas")! as HTMLCanvasElement;
		const ctx = canvas.getContext("2d")!;
		canvas.height = 300;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Set text properties: volot, size, style, align, etc.
		ctx.fillStyle = "Brown";
		ctx.font = "40px SimSun";
		ctx.textAlign = "left";
		// ctx.textBaseline = "baseline";

		// Draw text on the canvas
		let height = 48;
		// for (let i = 0; i < texts.length; i++) {
		for (const text of texts) {
			ctx.fillText(text, 10, height);
			height += 45;
		}

		// Convert canvas content to Base64
		const base64Image = canvas.toDataURL("image/png"); // Image format: PNG
		return base64Image;
	}

	/**
	 * Gets the size of the image of the character to be drawn.
	 * @param {*} charLength 
	 * @returns 
	 */
	private getCharSize(charLength: number) {
		let charSize = 32;
		if (this.isMobile()) {
			switch (charLength) {
				case 1:
					charSize = 190;
					break;
				case 2:
					charSize = 90;
					break;
				case 3:
					charSize = 60;
					break;
				default:
					charSize = 32;
			};
		} else {
			switch (charLength) {
				case 1:
					charSize = 320;
					break;
				case 2:
					charSize = 140;
					break;
				case 3:
					charSize = 90;
					break;
				default:
					charSize = 32;
			};
		}
		return (charSize * this.charSizeRate);
	}
}
