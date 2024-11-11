import * as yup from "yup";
import moment from "moment";
import { MultiCloud } from "~/Modules/MultiCloud/CloudConstants";
import { contractType as contractTypes } from "./StringConstants";

export const PAYMENT_VALIDATION_SCHEMA = yup.object().when("autoRenewal", {
  is: true,
  then: yup.object().shape({
    type: yup.string().required("Payment method required"),
    cardHolderName: yup
      .string()
      .when("type", {
        is: (val: any) => val === "Credit / Debit Card",
        then: yup
          .string()
          .trim("Cardholder name cannot include leading and trailing spaces")
          .strict(true)
          .required("Cardholder name required"),
      })
      .matches(/^[aA-zZ\s]+$/, "Only alphabet values are allowed for card holder name "),
    cardNumber: yup.string().when("type", {
      is: (val: any) => val === "Credit / Debit Card",
      then: yup
        .string()
        .required("Card number required")
        .matches(/^[0-9\s]+$/, "Only numbers are allowed for card number")
        .test("correctLength", "Invalid card number", (val: any) => val && val.length === 19),
    }),
    validThrough: yup.string().when("type", {
      is: (val: any) => val === "Credit / Debit Card",
      then: yup.string().required("Card valid through required"),
    }),
    walletName: yup.string().when("type", {
      is: (val: any) => val === "wallet",
      then: yup.string().required("Wallet name required"),
    }),
  }),
});

export const PRODUCT_VALIDATION_SCHEMA = yup.array().of(
  yup.object().shape({
    productType: yup
      .string()
      .trim("Product type cannot include leading and trailing spaces")
      .strict(true)
      .required("Product type required"),
    productName: yup
      .string()
      .trim("Product name cannot include leading and trailing spaces")
      .strict(true)
      .required("Product name required")
      .matches(/^[a-zA-Z0-9\s]+$/, "Only alphanumeric values are allowed for product name "),
    unitPrice: yup
      .number()
      .positive()
      .min(0, "Unit price must be greater than or equal to 0")
      .required("Unit price required"),
    quantity: yup
      .number()
      .integer()
      .min(1, "Quantity must be greater than or equal to 1")
      .required("Product quantity required"),
 totalCost: yup
      .number()
      .transform((originalValue, originalObject) => {
        return parseFloat(originalValue) ?? 0;
      })
      .test("hasDecimal", "Total cost must be a number", (value) => {
        return typeof value === 'number' && !isNaN(value);
      })
      .required("Total cost license required"),
  })
);

export const CONTRACT_VALIDATION_SCHEMA = yup.array().of(
  yup.object().shape({
    name: yup
      .string()
      .trim("Contract name cannot include leading and trailing spaces")
      .strict(true)
      .required("Contract name required")
      .matches(/^[a-zA-Z0-9][a-zA-Z0-9_\s]*[a-zA-Z0-9]$/, "Only alphanumeric values are allowed for contract name "),
    startDate: yup.string().required("Contract start date required"),
    endDate: yup.string().required("Contract end date required"),
    contractType: yup.string().required("Contract type required"),
    upcomingRenewalDate: yup.string().when(["autoRenewal"], {
      is: (autoRenewal: boolean) => {
        return autoRenewal;
      },
      then: yup
        .string()
        .required("Next renewal date for the contract is required.")
        .test(
          "isvalid-renewaldate",
          "Renewal date should be greater than or equals to end date",
          (value, context) =>
            moment(value, "DD/MM/YYY", true).diff(moment(context.parent.startDate, "DD/MM/YYY", true), "days") >= 1 &&
            moment(value, "DD/MM/YYY", true).diff(moment(context.parent.endDate, "DD/MM/YYY", true), "days") >= 0
        ),
    }),
    autoRenewal: yup.boolean().default(false),
    autoRenewalCancellation: yup.number().when(["autoRenewal", "contractType"], {
      is: (autoRenewal: boolean, contractType: string) => {
        if (autoRenewal && contractType === contractTypes[1]) {
          return true;
        } else {
          return false;
        }
      },
      then: yup
        .number()
        .min(1, "Cancel Notification should be minimum 1")
        .max(60, "Cancel Notification should be less than or equal to 60")
        .required("Cancel Notification Required"),
    }),
    billingFrequency: yup.string().when("contractType", {
      is: (contractType: string) => {
        if (contractType === contractTypes[1]) {
          return true;
        } else {
          return false;
        }
      },
      then: yup.string().required("Billing frequency required"),
    }),
    contractTenure: yup.string().when("contractType", {
      is: contractTypes[1],
      then: yup
        .string()
        .required("Contract Tenure required")
        .min(1, "Contract Tenure should be greater than or equals to 1")
        .matches(/^[1-5]$/, "Contract Tenure should not be greater than 5"),
    }),
    paymentMethod: PAYMENT_VALIDATION_SCHEMA,
    products: PRODUCT_VALIDATION_SCHEMA,
  })
);
export const APP_VALIDATION_SCHEMA = yup.object().shape({
  applicationName: yup.string().required("Application name required"),
  subscriptionName: yup
    .string()
    .trim("Subscription name cannot include leading and trailing spaces")
    .strict(true)
    .required("Subscription name required")
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9_\s]*[a-zA-Z0-9]$/, "Only alphanumeric values are allowed for subscription name "),
  subscriptionId: yup
    .string()
    .trim("Subscription Id cannot include leading and trailing spaces")
    .strict(true)
    .required("Subscription Id required")
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9_\s]*[a-zA-Z0-9]$/, "Only alphanumeric values are allowed for subscription Id "),
  applictionCategory: yup.string().required("Application category required"),
  ownerEmail: yup
    .string()
    .strict(true)
    .lowercase("Email address must be a lowercase")
    .email()
    .required("Owner email required"),
  ownerName: yup.string().required("Owner name required"),
  ownerDepartment: yup.string().required("Owner department required"),
  secondaryContact: yup
    .string()
    .strict(true)
    .lowercase("Email address must be a lowercase")
    .email("Please enter valid email address"),
  secondaryContactName: yup.string().strict(true),
  projectName: yup.string().required("Project name required"),
  providerName: yup
    .string()
    .trim("Provider name cannot include leading and trailing spaces")
    .strict(true)
    .required("Provider name required")
    .matches(/^[a-zA-Z\s]+$/, "Only alphabet values are allowed for provider name "),
});

export const MULTICLOUD_ONBOARDING_SCHEMA = yup.object().shape({
  provider: yup.string().strict(true).required("Cloud provider required"),
  clientId: yup.string().when("provider", {
    is: MultiCloud.AZURE,
    then: yup
      .string()
      .strict(true)
      .trim("Client id cannot include leading and trailing spaces")
      .required("Client id required"),
  }),
  clientSecret: yup.string().when("provider", {
    is: (provider: string) => provider === MultiCloud.AZURE,
    then: yup
      .string()
      .trim("Client secret cannot include leading and trailing spaces")
      .strict(true)
      .required("Client secret required"),
  }),
  tenantId: yup.string().when("provider", {
    is: (provider: string) => provider === MultiCloud.AWS || provider === MultiCloud.AZURE,
    then: yup
      .string()
      .trim("Tenant id cannot include leading and trailing spaces")
      .strict(true)
      .required("Tenant id required"),
  }),
});
