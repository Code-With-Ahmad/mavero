import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { auth, db, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setProfile(null);
      return null;
    }
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);
    let loaded;
    if (snap.exists()) {
      loaded = { id: snap.id, ...snap.data() };
    } else {
      const newProfile = {
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        phone: "",
        role: "customer",
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, newProfile);
      loaded = { id: firebaseUser.uid, ...newProfile };
    }
    setProfile(loaded);
    return loaded;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const loadedProfile = await loadProfile(firebaseUser);
        if (loadedProfile?.disabled) {
          await signOut(auth);
          toast.error("This account has been disabled. Contact support if you believe this is a mistake.");
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  const signup = useCallback(async (name, email, password) => {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(credential.user, { displayName: name });
      await setDoc(doc(db, "users", credential.user.uid), {
        name,
        email,
        phone: "",
        role: "customer",
        createdAt: serverTimestamp(),
      });
      return credential.user;
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        // The Auth account can outlive its Firestore profile (e.g. someone
        // deleted the `users/{uid}` doc directly in the console without
        // deleting the Auth account) — if this really is the same
        // person's password, sign them in instead of making them retype
        // everything on a separate login page. loadProfile() below
        // recreates the missing profile doc automatically once signed in.
        try {
          const credential = await signInWithEmailAndPassword(auth, email, password);
          return credential.user;
        } catch {
          // Not actually their account (wrong password) — fall through to
          // the original, more informative "already in use" error.
        }
      }
      throw error;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return credential.user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    return credential.user;
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  const resetPassword = useCallback(
    (email) => sendPasswordResetEmail(auth, email),
    []
  );

  const updateUserProfile = useCallback(
    async (updates) => {
      if (!user) return;
      if (updates.name && updates.name !== user.displayName) {
        await updateProfile(user, { displayName: updates.name });
      }
      await updateDoc(doc(db, "users", user.uid), updates);
      await refreshProfile();
    },
    [user, refreshProfile]
  );

  const changeUserPassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!user || !user.email) return;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    },
    [user]
  );

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === "admin",
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    changeUserPassword,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
