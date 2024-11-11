export interface AuthContext {
  user: {
    token: string;
    refreshtoken: string;
    email: string;
    role: string;
    currency: string;
    access: string[];
    userName?: string;
    userLogo?: string;
  };
  logout: () => void;
  refreshProfile: () => void;
  isLoading: boolean;
  verifyOtp: (data: any) => void;
  isSSOLoading: boolean;
  isButtonDisabled: boolean;
  resendOtp: () => void;
}
