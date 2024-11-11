import getUnifiCodeFlagIcon from "country-flag-icons/unicode";
import { CountryCode, getCountries, getCountryCallingCode, AsYouType, isValidNumber } from "libphonenumber-js";
import { Input, InputProps, Select } from "antd";
import { getName, getCode } from "country-list";
import { ChangeEvent, useEffect, useState } from "react";
import { filter, map } from "lodash";

interface Props extends Omit<InputProps, "onChange"> {
  onChange: (props: { value: string; countryCode: CountryCode; code: string }) => void;
}
export const NumberInput = ({ value, onChange, ...res }: Props) => {
  const propsValue = value as any as {
    value: string;
    countryCode: CountryCode;
    code: string;
  };

  const [country, setCountry] = useState<{
    countryName: string;
    shortCode: CountryCode;
    code: string;
  }>({
    countryName: "India",
    shortCode: "IN",
    code: "91",
  });
  useEffect(() => {
    if (propsValue.countryCode) {
      setCountry({
        countryName: getName(propsValue.countryCode) || "India",
        shortCode: propsValue.countryCode,
        code: getCountryCallingCode(propsValue.countryCode),
      });
    }
  }, [propsValue]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e) return;

    if (e.target.value.replace(/\D/g, "").length < 15 && onChange) {
      onChange({
        value: e.target.value.replace(/\D/g, ""),
        countryCode: country.shortCode,
        code: country.code,
      });
    }
  };

  const filteredCountries = filter(getCountries(), (country) => {
    const countryCode = country as CountryCode;
    return ["IN", "US", "PH", "MY", "AU", "SG"].includes(countryCode);
  });

  const getFormattedNumber = () => {
    const asYouType = new AsYouType(country.shortCode);
    if (propsValue) {
      if (isValidNumber(propsValue.value as string, country.shortCode)) {
        return asYouType.input(propsValue.value as string);
      } else {
        return propsValue.value;
      }
    }
  };
  return (
    <Input.Group
      compact
      size="large"
    >
      <Select
        style={{ width: "30%" }}
        size="large"
        dropdownMatchSelectWidth={false}
        listHeight={150}
        optionFilterProp="children"
        placement="bottomLeft"
        showSearch
        filterOption={true}
        onSelect={(value: string) => {
          setCountry({
            countryName: value,
            shortCode: getCode(value) as CountryCode,
            code: getCountryCallingCode(getCode(value) as CountryCode),
          });
          onChange({
            value: "",
            countryCode: getCode(value) as CountryCode,
            code: getCountryCallingCode(getCode(value) as CountryCode),
          });
        }}
        value={country.countryName}
      >
        {map(filteredCountries, (country) => (
          <Select.Option
            value={getName(country)}
            key={`${country} + ${getCountryCallingCode(country)}`}
          >
            {country} +{getCountryCallingCode(country)}
          </Select.Option>
        ))}
      </Select>
      <Input
        style={{ width: "70%" }}
        onChange={handleInputChange}
        value={getFormattedNumber()}
        {...res}
      />
    </Input.Group>
  );
};
