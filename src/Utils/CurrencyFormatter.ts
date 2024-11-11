import { adminCurrency } from './getLocalStorage';
import { filter } from "lodash";
import { currencyData } from "./CurrencyCodes";
import { currencyCode as defaultCurrency } from "@utils/Constants";


export const currencyFormat = (
  value: number,
  isAdmin?: boolean,
  currencyCode?: Intl.NumberFormatOptions["currency"],
  notation: Intl.NumberFormatOptions["notation"] = "standard",
  style: Intl.NumberFormatOptions["style"] = "currency",
) => {
  const preferredCurrency = isAdmin ? String(adminCurrency()) : currencyCode || defaultCurrency;

  const currencyDataFiltered = filter(
    currencyData,
    (data) => data.code === preferredCurrency
  );
  const currencySymbol = currencyDataFiltered[0].symbol_native;
  const defaultLanguage = currencyDataFiltered[0].defaultLanguage;


  return new Intl.NumberFormat(defaultLanguage, {
    style,
    currency: preferredCurrency,
    notation,
  })
    .format(value)
    .replace(preferredCurrency, currencySymbol);
};


export const unitFormat = (
  value: number,
  notation: Intl.NumberFormatOptions["notation"] = "standard"
) => new Intl.NumberFormat("en-us", { notation }).format(value);
