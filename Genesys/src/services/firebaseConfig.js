import { initializeApp } from "firebase/app";
import { initializeAuth, getSecondaryAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCfTamd-cCerKdXxsl1SrOqKKKz5gf7qek",
  authDomain: "biosyntech-fe492.firebaseapp.com",
  projectId: "biosyntech-fe492",
  storageBucket: "biosyntech-fe492.firebasestorage.app",
  messagingSenderId: "731720654700",
  appId: "1:731720654700:web:40ecd6b5304b0cd1171d49"
};

const app = initializeApp(firebaseConfig);

// No React Native, precisamos dizer ao Firebase para usar o AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const storage = getStorage(app);

export { auth, storage };