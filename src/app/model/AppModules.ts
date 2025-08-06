

/** The word category */
export class Category {
    category: string;
    cname: string;
    words: Word[];

    constructor(category: Category) {
        if (category) {
            this.category = category.category.trim();
            this.cname = category.cname.trim();
            this.words = category.words;
        } else {
            this.category = '';
            this.cname = '';
            this.words = [];
        }
    }
}

/** The word */
export class Word {
    chinese = '';
    english = '';
    pinyin = '';
    phrase: string[] = [];
    sentence = '';
    image = '';
}

/** The current word */
export class CurrentWord {
    category = '';
    cname = '';
    word: Word = new Word();

    constructor(category: string, cname: string, word: Word) {
        this.category = category;
        this.cname = cname;
        this.word = word;
    }
}

/** The pinyin retrieved from Google's translation service */
export class Pinyin {
    status = true;
    text = '';
    pinyin = '';
    error = '';
}

/** The greeting image */
export class GreetingImage {
    category = '';
    wrong = '';
    ok = '';
    icon = '';
    great: string[] = [];
}

/** The speech to text info */
export class SpeechToTextCheck {
    recordingImage = '';
    text = '';
    pinyin = '';
    error = '';

    public clear() {
        this.recordingImage = '';
        this.text = '';
        this.pinyin = '';
        this.error = '';
    }

    public init() {
        this.recordingImage = 'assets/images/greetings/talk-recording.jpg';
        this.text = '';
        this.pinyin = '';
        this.error = '';
    }

    public setRecording() {
        this.recordingImage = 'assets/images/greetings/talk-recording.jpg';
        this.text = '';
        this.pinyin = '';
        this.error = '';
    }

    public setResult(image: string, text: string, pinyin: string, message: string) {
        this.recordingImage = image;
        this.text = text;
        this.pinyin = pinyin;
        this.error = message;
    }

    public setImage(image: string) {
        this.recordingImage = image;
        this.text = '';
        this.pinyin = '';
        this.error = '';
    }

    public setError(message: string) {
        this.recordingImage = 'assets/images/greetings/try-again-1.jpg';
        this.text = '';
        this.pinyin = '';
        this.error = message;
    }
}

/** The sidebar TOC */
export class TOC {
    category = '';
    image = '';
    words: TocWord[] = [];
}

/** The category table item */
export class TocCategory {
    id = '';
    english = '';
    chinese = '';
    icon = '';
}

/** The sidebar TOC word */
export class TocWord {
    id = '';
    english = '';
    chinese = '';
}

/** The page footer for printing */
export class PageFooter {
    english = '';
    chinese = '';
}