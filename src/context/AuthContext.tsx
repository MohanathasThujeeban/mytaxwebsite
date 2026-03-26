import React, { createContext, useContext, useState } from 'react';

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

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [verification, setVerification] = useState<VerificationState>({
    nic: '',
    mobile: '',
    isOtpSent: false,
    isVerified: false,
    token: null,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const updateVerification = (partial: Partial<VerificationState>) =>
    setVerification(prev => ({ ...prev, ...partial }));

  const login = (info: UserInfo) => {
    setUser(info);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setVerification({ nic: '', mobile: '', isOtpSent: false, isVerified: false, token: null });
  };

  return (
    <AuthContext.Provider
      value={{ verification, updateVerification, isLoggedIn, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
