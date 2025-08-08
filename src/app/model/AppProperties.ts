
/**
 * The firebase configuration. the apiKey is an id of the project, not a securit key, 
 * so it's okay to check in the code.
 */
export const FirebaseConfig = {
    apiKey: "AIzaSyClRfxf9Fa6vtgWZnvUJFiZTDYoOZlzzW0",
    authDomain: "pingeter-blogger.firebaseapp.com",
    projectId: "pingeter-blogger",
    storageBucket: "pingeter-blogger.firebasestorage.app",
    messagingSenderId: "1041397028813",
    appId: "1:1041397028813:web:ee065d4499b7a522091684",
    measurementId: "G-SV3PZ23CTE"
}

/**
 * The proxy service URL.
 */
export const PROXY_SERVER = 'https://learner-gateway.uc.r.appspot.com/';
// export const PROXY_SERVER = 'http://127.0.0.1:8080/';

/**
 * Service URLs (all from Google)
 */
export const ServiceURLs = {
	tts: PROXY_SERVER + 'tts',
	stt: PROXY_SERVER + 'stt',
	pinyin: PROXY_SERVER + 'pinyin'
}