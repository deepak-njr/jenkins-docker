export const cardVendorIcon = (shortName: string) => {
  switch (shortName) {
    case "visa": {
      return "logos:visa";
    }
    case "mastercard": {
      return "logos:mastercard";
    }
    case "american-express": {
      return "logos:amex";
    }
    case "diners-club": {
      return "logos:amex";
    }
    case "discover": {
      return "logos:discover";
    }
    case "jcb": {
      return "logos:jcb";
    }
    case "unionpay": {
      return "logos:unionpay";
    }
    case "maestro": {
      return "logos:maestro";
    }
    case "mir": {
      return "";
    }
    case "elo": {
      return "logos:elo";
    }
    case "hiper": {
      return "logos:hipercard";
    }
    case "hipercard": {
      return "logos:hipercard";
    }
    default: {
      return "";
    }
  }
};
