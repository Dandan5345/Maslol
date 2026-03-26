import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let firebaseConfig;
if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
} else {
    firebaseConfig = {
        apiKey: "AIzaSyAbqXOWCHseGglYMFRJsTeug6DMbnXrows",
        authDomain: "hovsim-e9fef.firebaseapp.com",
        projectId: "hovsim-e9fef",
        storageBucket: "hovsim-e9fef.firebasestorage.app",
        messagingSenderId: "522816980545",
        appId: "1:522816980545:web:b5721ac41a4e5769ba68c0",
        measurementId: "G-NDDDR1M3LL"
    };
}

export const AXES = [
    { id: 'resuscitation', label: 'ציר החייאה', href: 'resuscitation.html' },
    { id: 'resuscitation-schema', label: 'ציר סכמת טיפול בפצוע', href: 'resuscitation-schema.html' },
    { id: 'trauma', label: 'ציר טראומה', href: 'trauma-quiz/index.html' },
    { id: 'routine', label: 'ציר שגרה', href: 'routine.html', underConstruction: true },
    { id: 'anamnesis', label: 'ציר אנמנזה', href: 'anamnesis.html', underConstruction: true },
    { id: 'mental-health', label: 'ציר בריאות הנפש', href: 'mental-health.html', underConstruction: true }
];

export const DEFAULT_AXIS = 'resuscitation';
export const appIdStr = typeof __app_id !== 'undefined' ? __app_id : 'hovsim-app';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

let authInitialized = false;

export async function ensureInitialAuth() {
    if (authInitialized) return;
    authInitialized = true;
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
            await signInWithCustomToken(auth, __initial_auth_token);
        } catch (error) {
            console.error('Canvas token auth failed', error);
        }
    }
}

export function onUserChanged(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle() {
    return signInWithPopup(auth, provider);
}

export async function signOutUser() {
    return signOut(auth);
}

function progressRef(userId) {
    return doc(db, 'artifacts', appIdStr, 'users', userId, 'data', 'progress');
}

function preferencesRef(userId) {
    return doc(db, 'artifacts', appIdStr, 'users', userId, 'data', 'preferences');
}

export async function loadProgress(userId, cards) {
    if (!userId) return cards;
    try {
        const docSnap = await getDoc(progressRef(userId));
        if (!docSnap.exists()) return cards;
        const statuses = docSnap.data().statuses || {};
        return cards.map(card => ({
            ...card,
            status: statuses[card.id] || 'unseen'
        }));
    } catch (error) {
        console.error('Error loading progress', error);
        return cards;
    }
}

export async function saveProgress(userId, cards) {
    if (!userId) return;
    try {
        const statuses = {};
        cards.forEach(card => {
            if (card.status !== 'unseen') statuses[card.id] = card.status;
        });
        await setDoc(progressRef(userId), { statuses }, { merge: true });
    } catch (error) {
        console.error('Error saving progress', error);
    }
}

export async function loadUserPreferences(userId) {
    if (!userId) return {};
    try {
        const docSnap = await getDoc(preferencesRef(userId));
        return docSnap.exists() ? docSnap.data() || {} : {};
    } catch (error) {
        console.error('Error loading preferences', error);
        return {};
    }
}

export async function saveUserPreferences(userId, preferences) {
    if (!userId) return;
    try {
        await setDoc(preferencesRef(userId), preferences, { merge: true });
    } catch (error) {
        console.error('Error saving preferences', error);
    }
}

export async function setLastAxis(userId, axisId) {
    if (!userId || !axisId) return;
    await saveUserPreferences(userId, { lastAxis: axisId });
}

export function getAxisHref(axisId) {
    return AXES.find(axis => axis.id === axisId)?.href || 'axes.html';
}

export function getAxisLabel(axisId) {
    return AXES.find(axis => axis.id === axisId)?.label || 'ציר';
}

export function isUnderConstruction(axisId) {
    return AXES.find(axis => axis.id === axisId)?.underConstruction === true;
}
