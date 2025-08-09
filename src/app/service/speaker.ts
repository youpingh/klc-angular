
import { Injectable, inject } from '@angular/core';
import { WordService } from '../service/words';
import { SpeechToTextCheck, Pinyin } from '../model/AppModules';
import { UtilsService } from '../service/utils';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
/**
 * This is a speaker utility to use text-to-speech and speech-to-text for speaking and check pronounazation.
 */
export class SpeakerService extends UtilsService {

	private wordService: WordService = inject(WordService);

	/**
	 * Uses Google's text to speech service to say the specified text.
	 * Chinese Mandarin, female cmn-CN-Standard-A
	 * Chinese Mandarin, female cmn-TW-Wavenet-A (better)
	 * Chinese Cantonese, female yue-HK-Standard-A
	 * English U.S., female en-US-Standard-E
	 */
	public async say(lang: string, text: string) {
		if (!text || text.length == 0) {
			return 'No text provided';
		}

		let langCode: string, langName: string;

		if (lang == 'zh-CN') {
			langCode = 'cmn-CN';
			langName = 'cmn-TW-Wavenet-A'
		} else if (lang == 'yue-HK') {
			langCode = 'yue-HK';
			langName = 'yue-HK-Standard-A'
		} else {
			langCode = 'en-US';
			langName = 'en-US-Standard-E'
		}

		const request = {
			input: {
				text: text
			},
			voice: {
				languageCode: langCode,
				name: langName
			},
			audioConfig: {
				audioEncoding: 'MP3',
				speakingRate: 0.9
			}
		};

		try {
			const response = await fetch(environment.services.tts, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(request)
			});

			if (!response.ok) {
				console.error('Text to speech failed:', response.statusText);
				return response.statusText;
			}

			const data = await response.json();
			const audioContent = data.audioContent;

			// Create a Blob from the base64 audio content  
			const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], {
				type: 'audio/mp3'
			});
			const audioUrl = URL.createObjectURL(audioBlob);

			// Create a dynamic audio element  
			const audioElement = new Audio(audioUrl);
			audioElement.play().catch(error => {
				console.error('Error playing audio:', error);
				return ('Error playing audio:' + error);
			});

			// Remove the audio element after playback ends  
			audioElement.addEventListener('ended', () => {
				URL.revokeObjectURL(audioUrl); // Clean up the URL  
			});
		} catch (error) {
			console.error("Error: " + error);
			return ("Error: " + error);
		}
		return '';
	}

	/** 
	 * Gets speech from microphone and recognizes it to a text. 
	 * Recording time: 3 characters per second, 3 seconds minumum.
	 */
	public async recognizeSpeech(sttCheck: SpeechToTextCheck, text: string, callback: () => void) {
		const waitTime = (text.length < 10 ? 3 : (text.length / 3)) * 1000;
		let message = '';
		try {
			// Get pinyin of the original text to match the recgnized text 
			const originalText = await this.getPinyin(text);

			// Get microphone access
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Create MediaRecorder to capture audio
			const mediaRecorder = new MediaRecorder(stream);
			const audioChunks: BlobPart[] = [];

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = async () => {
				const sttStart = new Date().getTime();
				console.log("STT starts from:", sttStart);

				// Create an audio blob for sending to the STT service (only audio/webm works now)
				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				console.log("Blob size:", audioBlob.size, "type:", audioBlob.type, "rec time:", waitTime / 1000);

				// send the audio clip to Google Speech-to-Text API
				const formData = new FormData();
				formData.append('file', audioBlob, 'audio.webm');
				// formData.append('language', 'zh'); // optional but helpful
				try {
					const response = await fetch(environment.services.stt, {
						method: "POST",
						body: formData
					});
					if (response.ok) {
						const recognizedText = await response.json();
						this.checkPinyin(originalText, recognizedText, sttCheck);
						callback();
					} else {
						message = "No speech detected, speak louder. " + response.statusText;
						console.error(message);
						sttCheck.setError(message);
						callback();
					}
				} catch (error) {
					message = "Error with Google STT API: " + error;
					console.error(message);
					sttCheck.setError(message);
					callback();
				}
				const sttEnd = new Date().getTime();
				console.log("STT ends at:", sttEnd, ', it takes', (sttEnd - sttStart), 'millionseconds');
			};

			// Start recording
			mediaRecorder.start();
			const recordingStart = new Date().getTime();
			console.log("Recording started at:", recordingStart, 'text length', text.length);

			// Stop recording after waitTime seconds
			setTimeout(() => {
				mediaRecorder.stop();
				const recordingEnd = new Date().getTime();
				console.log("Recording stopped at:", recordingEnd, ', it takes', (recordingEnd - recordingStart), 'milliseconds');
			}, waitTime);
		} catch (error) {
			message = "Error accessing microphone:" + error;
			console.error(message);
			sttCheck.setError(message);
			callback();
		}
	}

	/** 
	 * Gets pinyin of the text using Google's translator. 
	 */
	private async getPinyin(text: string) {
		let pinyin = new Pinyin();

		const request = {
			text: text
		}

		try {
			const response = await fetch(environment.services.pinyin, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(request)
			});
			pinyin = await response.json();
		} catch (error) {
			pinyin.status = false;
			pinyin.error = 'Error with Google PINYIN API: ' + error;
			console.error("Error: " + error);
		}
		return pinyin;
	}

	/**
	 * Checks if the pinyins of two texts are same.
	 * Exactly same or there are some wrong tones.
	 */
	private checkPinyin(oringinalText: Pinyin, recognizedText: Pinyin, sttCheck: SpeechToTextCheck) {
		const oringinalPinyin = this.removePuntuciation(oringinalText.pinyin);
		const recognizedPinyin = this.removePuntuciation(recognizedText.pinyin);
		const oringinalToneless = this.removeTones(oringinalPinyin);
		const recognizedToneless = this.removeTones(recognizedPinyin);

		// Compare the oringinal and recognized pinyins and
		// modify the SpeechToTextCheck object for the GUI to show the result
		const categoryName = this.wordService.getCurrentCategory().category;
		const images = this.wordService.getGreetingImage(categoryName);
		let image = '';
		if (oringinalPinyin.localeCompare(recognizedPinyin, undefined, { sensitivity: 'accent' }) === 0) {
			image = images.great;
		} else if (oringinalToneless.localeCompare(recognizedToneless, undefined, { sensitivity: 'accent' }) === 0) {
			image = images.ok;
		} else {
			image = images.wrong;
		}
		sttCheck.setResult(image, recognizedText.text, recognizedPinyin, '');
	}

	/**
	 * Removes tones from a pinyin string.
	 * @param pinyin 
	 * @returns 
	 */
	private removeTones(pinyin: string) {
		return pinyin
			.normalize("NFD") // Normalize Unicode
			.replace(/[\u0300-\u036f]/g, "");
	}

	/**
	 * Removes all the puntuciation marks (English, Chinese and spaces)
	 */
	private removePuntuciation(text: string) {
		let chars = text.trim();
		const starter = chars.substring(0, 3);
		if (starter.localeCompare('Hēi', undefined, { sensitivity: 'base' }) === 0) {
			chars = chars.substring(3);
		}
		chars = chars.replace(/[ .,/#!$%^&*;:{}=\-_`~()?"'<>[\]\\]/g, "");
		chars = chars.replace(/[，。；：？‘’“”！【】]/g, "");
		return chars;
	}
}
