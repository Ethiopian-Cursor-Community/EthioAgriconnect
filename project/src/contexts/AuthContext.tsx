import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface UserData {
  uid: string;
  email: string;
  name: string;
  role: "farmer" | "consumer" | "admin" | "delivery_man";
}

const normalizeRole = (role: unknown): UserData['role'] | null => {
  if (role === 'delivery') {
    return 'delivery_man';
  }

  if (role === 'farmer' || role === 'consumer' || role === 'admin' || role === 'delivery_man') {
    return role;
  }

  return null;
};

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    name: string,
    role: "farmer" | "consumer" | "admin" | "delivery_man"
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: "farmer" | "consumer" | "admin" | "delivery_man"
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name,
        role,
        createdAt: new Date(),
      });

      // Wait for the user data to be set in state
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error: any) {
      // If Firestore write fails, delete the auth user to maintain consistency
      if (auth.currentUser) {
        await auth.currentUser.delete().catch(() => {
          // Ignore deletion errors, user can still login
        });
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const normalizedRole = normalizeRole(data.role);

          setUserData(
            normalizedRole
              ? {
                  ...data,
                  role: normalizedRole,
                } as UserData
              : null
          );
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
