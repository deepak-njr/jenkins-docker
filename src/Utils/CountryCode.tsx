import * as yup from "yup";
import { CountryCode, parsePhoneNumber } from "libphonenumber-js";

const phoneSchema = yup.string().phone().required();
export const CheckCountryCode = (value: any, countryCode: CountryCode, context: any) => {
  switch (countryCode) {
    case "IN": // India
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be exactly 10 digits" });
    case "SG": // Singapore
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "JP": // Japan
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "CN": // China
      return /^\d{11}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 11 digits" });
    case "AD": // Andorra
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "AE": // UAE
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be either 9 digits" });
    case "AF": //Afghanistan
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "AG": //Antigua and Barbuda
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "AI": //
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "AL": //Albania
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "AM": //Armenia
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "AO": //Angola
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be either 9 digits" });
    case "AR": //Argentina
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "AS": //American Samoa
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "AT": //Austria
      return /^\d{12}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 12 digits" });
    case "AU": //Australia
      return /^\d{9,10}$/.test(value) || context.createError({ message: "Mobile number must be either 9 or 10 digits" });
    case "AW": //Aruba
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "AX": //Aland Islands
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "AZ": //Azerbaijan
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "BA": //Bosnia and Herzegovina
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be either 8 digits" });
    case "BB": //Barbados
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "BD": //Bangladesh
      return /^\d{11}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 11 digits" });
    case "BE": //Belgium
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "BF": //Burkina Faso
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be either 8 or 11 digits" });
    case "BG": //Bulgarian
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "BH": //Bahrain
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "BI": //Burundi
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "BJ": //Benin
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "BL": //Guadeloupe
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "BM": //Bermudian
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "BY": //Darusslam
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "BO": //Bolivia
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "BQ": //caribbean Netherland
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "BR": //Brazil
      return /^\d{11}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 11 digits" });
    case "BS": //Bahamas
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "BT": //Bhutan
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "BW": //Botswana
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "BY": //Belarus
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be either 9 digits" });
    case "BZ": //Belize
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be either 7 digits" });
    case "CA": //Canada
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "CC": //Cocos (Keeling) Islands
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "CD": //Democratic Republic of the Congo (DRC)
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "CF": //Central African Republic
      return (
        /^\d{8,11}$/.test(value) || context.createError({ message: "Mobile number must be either 8 or 11 digits" })
      );
    case "CG": //Republic of the Congo
      return (
        /^\d{9,12}$/.test(value) || context.createError({ message: "Mobile number must be either 9 or 12 digits" })
      );
    case "CH": //Switzerland
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "CI": //Ivory Coast
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "CK": //Cook Islands
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "CL": //Chile
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be either 9 digits" });
    case "CM": //Cameroon
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "CN": //China
      return /^\d{11}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 11 digits" });
    case "CO": //Colombia
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be either 10 digits" });
    case "CR": //Coasta Rica
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "CU": //Cuba
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "CV": //Cape verde
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be either 7 digits" });
    case "CW": //caribbean Netherland
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "CX": //Christmas Island
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "CY": //Cyprus
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "CZ": //Czech Republic
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "DE": //German
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be either 10 digits" });
    case "DJ": //Djibouti
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be either 8 digits" });
    case "DK": //Denmark
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be either digits" });
    case "DM": //Dominica
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be either 7 digits" });
    case "DO": //Dominician Republic
      return /^\d{11}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 11 digits" });
    case "DZ": //Algeria
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at either 10 digits" });
    case "EC": //Ecuador
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "EE": //Estonia
      return /^\d{7,8}$/.test(value) || context.createError({ message: "Mobile number must be either 7 or 8 digits" });
    case "EG": //Egypt
      return /^\d{11}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 11 digits" });
    case "EH": //Morocco
      return (
        /^\d{10,12}$/.test(value) || context.createError({ message: "Mobile number must be either 10 or 12 digits" })
      );
    case "ER": //Eritrea
      return (
        /^\d{9,11}$/.test(value) || context.createError({ message: "Mobile number must be either 9 or 11 digits" })
      );
    case "ES": //Spain
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "ET": //Ethiopia's
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "FI": //Finland
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "FJ": //Fiji
      return (
        /^\d{8,11}$/.test(value) || context.createError({ message: "Mobile number must be either 8 or 11 digits" })
      );
    case "FK": //Falkland Island
      return /^\d{5,8}$/.test(value) || context.createError({ message: "Mobile number must be either 5 or 8 digits" });
    case "FM": //Federated States of Micronesia
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "FO": //Faroe Island
      return (
        /^\d{8,10}$/.test(value) || context.createError({ message: "Mobile number must be either 8 or 10 digits" })
      );
    case "FR": //France
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "GA": //Gabon
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "GB": //United Kingdom
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "GD": //Grenada
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "GE": //Georgia
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "GF": //French Guiana
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "GG": //Guernsey
      return /^\d{6,7}$/.test(value) || context.createError({ message: "Mobile number must be either 6 or 7 digits" });
    case "GH": //Ghana
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "GI": //Gibraltar
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "GL": //GreenLand
      return /^\d{6,7}$/.test(value) || context.createError({ message: "Mobile number must be either 6 or 7 digits" });
    case "GM": //Gambia
      return /^\d{7,8}$/.test(value) || context.createError({ message: "Mobile number must be either 7 or 8 digits" });
    case "GN": //Guinea
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "GP": //Guadeloupe
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "GQ": //Equatorial Guinea
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "GR": //Greece
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "GT": //Guatemala
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "GU": //Guam
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "GW": //Guinea-Bissau
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "GY": //Guyan
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "HK": //Hong Kong
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "HN": //Honduras
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "HR": //Croatia
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "HT": //Haiti
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "HU": //Hungary
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "ID": //Indonesia
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "IE": //Ireland
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "IL": //Israel
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "IM": //Isle of Man
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "IO": //British Indian Ocean Territory
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "IQ": //Iraq
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "IR": //Iran
      return (
        /^\d{10,11}$/.test(value) || context.createError({ message: "Mobile number must be either 10 or 11 digits" })
      );
    case "IS": //Iceland
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "IT": //Italy
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "JE": //Jersey
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "JM": //Jamaica
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "JO": //Jordan
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "JP": //Japan
      return /^\d{11}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 11 digits" });
    case "KE": //Kenya
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "KG": //Kyrgyzstan
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "KH": //Cambodia
      return (
        /^\d{9,10}$/.test(value) || context.createError({ message: "Mobile number must be either 9 or 10 digits" })
      );
    case "KI": //Kiribati
      return /^\d{5}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 5 digits" });
    case "KM": //comoros
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "KN": //Saint Kitts and Nevis
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "KP": //North Korea
      return /^\d{12}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 12 digits" });
    case "KR": //South Korea
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "KW": //Kuwait
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "KY": //Cayman Island
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "KZ": //Kazakhstan
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "LA": //Lao people Democratic Republic
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "LB": //Lebanon
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "LC": //Saint Lucia
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "LI": //Liechtenstein
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "LK": //Sri Lanka
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "LR": //Liberia
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "LS": //Lesotho
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "LT": //Lithuania
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "LU": //Luxembourg
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "LV": //Latvia
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "LY": //Libya
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "MA": //Morocco
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "MC": //Monacco
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "MD": //Moldova
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "ME": //Montenegro
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "MF": //Saint Martin
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "MG": //Madagascar
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "MH": //Marshall Islands
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "MK": //North Macedonia
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "ML": //Mali
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "MM": //Myanmar
      return /^\d{8,9}$/.test(value) || context.createError({ message: "Mobile number must be either 8 or 9 digits" });
    case "MN": //Mongolia
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "MO": //Macao
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "MP": //Northern Mariana Islands
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "MQ": //Martinique
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "MR": //Mauritania
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "MS": //Montserrat
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "MT": //Malta
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "MU": //Mauritius
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "MV": //Maldives
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "MW": //Malawi
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "MX": //Mexico
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "MY": //Malaysia
      return /^\d{10,11}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 or 11 digits" });
    case "MZ": //Mozambique
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "NA": //Namibia
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "NC": //New Calendonia
      return /^\d{6,7}$/.test(value) || context.createError({ message: "Mobile number must be either 6 or 7 digits" });
    case "NE": //Niger
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "NF": //Norfolk Island
      return /^\d{5}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 5 digits" });
    case "NG": //Nigeria
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "NI": //Nicaragua
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "NL": //Netherlands
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "NO": //Norway
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "NP": //Nepal
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "NR": //Nauru
      return /^\d{5}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 5 digits" });
    case "NU": //Niue
      return /^\d{4}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 4 digits" });
    case "NZ": //New Zealand
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "OM": //Oman
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "PA": //panama
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "PE": //Peru
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "PF": //French Polynesia
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "PG": //Papua New Guinea
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "PH": //Philippines
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "PK": //Pakistan
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "PL": //Poland
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "PM": //Saint Pierre and Miquelon
      return /^\d{12}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 12 digits" });
    case "PR": //Puerto Rico
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "PS": //Palestine
      return (
        /^\d{9,10}$/.test(value) || context.createError({ message: "Mobile number must be either 9 or 10 digits" })
      );
    case "PT": //Portugal
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "PW": //Palau
      return /^\d{7}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 7 digits" });
    case "PY": //Paraguay
      return /^\d{9}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 9 digits" });
    case "QA": //Qatar
      return /^\d{8}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 8 digits" });
    case "RE": //Reunion
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "RO": //Romania
      return /^\d{10}$/.test(value) || context.createError({ message: "Mobile number must be at exactly 10 digits" });
    case "RS": // Serbia
      return /^\d{9,10}$/.test(value) || { message: "Mobile number must be 9 or 10 digits" };
    case "RU": // Russia
      return /^\d{10}$/.test(value) || { message: "Mobile number must be exactly 10 digits" };
    case "RW": // Rwanda
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "SA": // Saudi Arabia
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "SB": // Solomon Islands
      return /^\d{5,7}$/.test(value) || { message: "Mobile number must be between 5 and 7 digits" };
    case "SC": // Seychelles
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "SD": // Sudan
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "SE": // Sweden
      return /^\d{7,11}$/.test(value) || { message: "Mobile number must be between 7 and 11 digits" };
    case "SG": // Singapore
      return /^\d{8}$/.test(value) || { message: "Mobile number must be between 8 digits" };
    case "SH": // Saint Helena
      return /^\d{4,5}$/.test(value) || { message: "Mobile number must be between 4 and 5 digits" };
    case "SI": // Slovenia
      return /^\d{6,8}$/.test(value) || { message: "Mobile number must be between 6 and 8 digits" };
    case "SJ": // Svalbard and Jan Mayen
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "SK": // Slovakia
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "SL": // Sierra Leone
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "SM": // San Marino
      return /^\d{10}$/.test(value) || { message: "Mobile number must be exactly 10 digits" };
    case "SN": // Senegal
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "SO": // Somalia
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "SR": // Suriname
      return /^\d{6}$/.test(value) || { message: "Mobile number must be exactly 6 digits" };
    case "SS": // South Sudan
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "ST": // Sao Tome and Principe
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "SV": // El Salvador
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "SX": // Sint Maarten
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "SY": // Syria
      return /^\d{8,9}$/.test(value) || { message: "Mobile number must be between 8 and 9 digits" };
    case "SZ": // Eswatini (Swaziland)
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "TA": // Tristan da Cunha
      return /^\d{4}$/.test(value) || { message: "Mobile number must be exactly 4 digits" };
    case "TC": // Turks and Caicos Islands
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "TD": // Chad
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "TG": // Togo
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "TH": // Thailand
      return /^\d{9,10}$/.test(value) || { message: "Mobile number must be between 9 and 10 digits" };
    case "TJ": // Tajikistan
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "TK": // Tokelau
      return /^\d{5}$/.test(value) || { message: "Mobile number must be exactly 5 digits" };
    case "TL": // Timor-Leste
      return /^\d{6,9}$/.test(value) || { message: "Mobile number must be between 6 and 9 digits" };
    case "TM": // Turkmenistan
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "TN": // Tunisia
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "TO": // Tonga
      return /^\d{5}$/.test(value) || { message: "Mobile number must be exactly 5 digits" };
    case "TR": // Turkey
      return /^\d{10}$/.test(value) || { message: "Mobile number must be exactly 10 digits" };
    case "TT": // Trinidad and Tobago
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "TV": // Tuvalu
      return /^\d{5}$/.test(value) || { message: "Mobile number must be exactly 5 digits" };
    case "TW": // Taiwan
      return /^\d{9,10}$/.test(value) || { message: "Mobile number must be between 9 and 10 digits" };
    case "TZ": // Tanzania
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "UA": // Ukraine
      const isUAValid = /^\d{9,12}$/.test(value);
      return isUAValid || context.createError({ message: "Mobile number must be exactly 9 or 12 digits" });
    case "UG": // Uganda
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "US": // United States
      const isUSValid = /^\d{10}$/.test(value);
      return isUSValid || context.createError({ message: "Mobile number must be exactly 10 digits" });
    case "UY": // Uruguay
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "UZ": // Uzbekistan
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "VA": // Vatican City
      return /^\d{10}$/.test(value) || { message: "Mobile number must be exactly 10 digits" };
    case "VC": // Saint Vincent and the Grenadines
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "VE": // Venezuela
      return /^\d{10}$/.test(value) || { message: "Mobile number must be exactly 10 digits" };
    case "VG": // British Virgin Islands
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "VI": // U.S. Virgin Islands
      return /^\d{10}$/.test(value) || { message: "Mobile number must be exactly 10 digits" };
    case "VN": // Vietnam
      return /^\d{9,10}$/.test(value) || { message: "Mobile number must be between 9 and 10 digits" };
    case "VU": // Vanuatu
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "WF": // Wallis and Futuna
      return /^\d{6}$/.test(value) || { message: "Mobile number must be exactly 6 digits" };
    case "WS": // Samoa
      return /^\d{7}$/.test(value) || { message: "Mobile number must be exactly 7 digits" };
    case "XK": // Kosovo
      return /^\d{8}$/.test(value) || { message: "Mobile number must be exactly 8 digits" };
    case "YE": // Yemen
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "YT": // Mayotte
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    case "ZA": // South Africa
      return /^\d{9,10}$/.test(value) || { message: "Mobile number must be between 9 and 10 digits" };
    case "ZM": // Zambia
      return /^\d{10}$/.test(value) || { message: "Mobile number must be exactly 10 digits" };
    case "ZW": // Zimbabwe
      return /^\d{9}$/.test(value) || { message: "Mobile number must be exactly 9 digits" };
    default:
      return (
        phoneSchema.isValidSync("+" + countryCode + value) ||
        context.createError({ message: "Invalid mobile number format" })
      );
  }
};
