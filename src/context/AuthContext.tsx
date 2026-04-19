import React, { createContext, useContext, useEffect, useState } from 'react';

interface VerificationState {
  nic: string;
  mobile: string;
  isOtpSent: boolean;
  isVerified: boolean;
  token: string | null;
}

export interface UserInfo {
  nic: string;
  fullName?: string;
  contactNo?: string;
  mailAddress?: string;
  district?: string;
  dsDivision?: string;
  gsDivision?: string;
  postalNo?: string;
  addressLine1?: string;
  addressLine2?: string;
}

interface AuthContextType {
  verification: VerificationState;
  updateVerification: (partial: Partial<VerificationState>) => void;
  isLoggedIn: boolean;
  user: UserInfo | null;
  login: (info: UserInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const VERIFICATION_KEY = 'mytax_verification_state_v1';
const USER_KEY = 'mytax_logged_user_v1';

const defaultVerificationState: VerificationState = {
  nic: '',
  mobile: '',
  isOtpSent: false,
  isVerified: false,
  token: null,
};

const readFromSession = <T,>(key: string): T | null => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [verification, setVerification] = useState<VerificationState>(() => {
    const stored = readFromSession<VerificationState>(VERIFICATION_KEY);
    if (!stored) {
      return defaultVerificationState;
    }

    return {
      nic: typeof stored.nic === 'string' ? stored.nic : '',
      mobile: typeof stored.mobile === 'string' ? stored.mobile : '',
      isOtpSent: stored.isOtpSent === true,
      isVerified: stored.isVerified === true,
      token: typeof stored.token === 'string' ? stored.token : null,
    };
  });

  const [user, setUser] = useState<UserInfo | null>(() => {
    const stored = readFromSession<UserInfo>(USER_KEY);
    if (!stored || typeof stored.nic !== 'string') {
      return null;
    }

    return {
      nic: stored.nic,
      fullName: stored.fullName,
      contactNo: stored.contactNo,
      mailAddress: stored.mailAddress,
      district: stored.district,
      dsDivision: stored.dsDivision,
      gsDivision: stored.gsDivision,
      postalNo: stored.postalNo,
      addressLine1: stored.addressLine1,
      addressLine2: stored.addressLine2,
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(readFromSession<UserInfo>(USER_KEY)?.nic));

  useEffect(() => {
    sessionStorage.setItem(VERIFICATION_KEY, JSON.stringify(verification));
  }, [verification]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      return;
    }

    sessionStorage.removeItem(USER_KEY);
  }, [user]);

  const updateVerification = (partial: Partial<VerificationState>) =>
    setVerification(prev => ({ ...prev, ...partial }));

  const login = (info: UserInfo) => {
    setUser(info);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setVerification(defaultVerificationState);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(VERIFICATION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ verification, updateVerification, isLoggedIn, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
