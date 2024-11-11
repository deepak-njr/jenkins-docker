import { currencyCode } from "./Constants";

export const getAccessToken = () => {
  return JSON.parse(localStorage.getItem('user') || '{}')?.token;
};

export const getRefreshToken = () => {
  return JSON.parse(localStorage.getItem('user') || '{}')?.refreshToken;
};
export const updateAccessToken = (accessToken: string, refreshToken: string): void => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.token = accessToken;
  user.refreshToken = refreshToken;
  localStorage.setItem('user', JSON.stringify(user));
};

export const adminCurrency = () => {
  const user = JSON.parse(localStorage.getItem('user') ?? '{}');
  return user.currency ?? currencyCode;
};

export const updateCurrency = (currency: string): void => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.currency = currency;
  localStorage.setItem('user', JSON.stringify(user));
};  