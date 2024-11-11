import { Select, Space } from "antd";
import "flag-icon-css/css/flag-icon.min.css";

interface Currency {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
  defaultLanguage: string;
  countryCode?: string;
}
export const currencyOptions = (
  currencyData: Record<string, Currency>,
  currency: string[]
) => {
  return Object.entries(currencyData)
    .filter(([code]) => currency.includes(code))
    .map(([code, currency]) => {
      return (
        <>
          {currency && (
            <Select.Option key={code} value={code}>
              {"countryCode" in currency ? (
                <Space>
                  <span
                    className={`flag-icon flag-icon-${
                      currency.countryCode && currency.countryCode.toLowerCase()
                    }`}
                  ></span>
                  {code}
                </Space>
              ) : (
                code
              )}
            </Select.Option>
          )}
        </>
      );
    });
};
