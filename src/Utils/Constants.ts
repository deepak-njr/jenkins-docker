import { keys, pick, values } from "lodash";

import { MENUITEMS } from "./StringConstants";

declare global {
  interface Window {
    appConfig: {
      imageKey: string;
      apiURL: string;
      apiBase: string;
      inactivityTimeout: string;
      logoutTimeout: string;
      saltKey: string;
      menusEnabled: string;
      defaultRedirect: string;
      multicloudAWSMock: string;
      multicloudAzureMock: string;
      multicloudDOMock: string;
      multicloudGCPMock: string;
      multicloudOraclePMock: string;
      azureADTenantID: string;
      azureADClientID: string;
      authflow: string;
      flowType: string;
    };
  }
}

const appConfig = window.appConfig as any;

export const mockMulticloudAWS = appConfig.multicloudAWSMock === "true",
  saltCode = appConfig.saltKey || "",
  currencyCode = appConfig.currencyCode || "",
  mockMulticloudAzure = appConfig.multicloudAzureMock === "true",
  multiCloudCurrencyCode = appConfig.currencyCodeMultiCloud || "",
  mockMulticloudDO = appConfig.multicloudDOMock === "true",
  mockMulticloudGCP = appConfig.multicloudGCPMock === "true",
  mockMulticloudOracle = appConfig.multicloudOraclePMock === "true",
  logoutTimout = appConfig.logoutTimeout,
  refreshTokenTime = appConfig.refreshTime,
  inaAcitvityTimeout = appConfig.inactivityTimeout,
  stripeDomain = appConfig.stripeDomain || "",
  stripeSecret = appConfig.stripeKey || "",
  apiURL = appConfig.apiURL || "",
  basePath = appConfig.apiBase || "api",
  imageKey = appConfig.imageKey,
  orgName = appConfig.orgName,
  supportEmail = appConfig.supportEmail,
  mediaHost = appConfig.mediaHost,
  defaultRedirect = appConfig.defaultRedirect || "/clm/dashboard",
  stripeEnabled = appConfig.stripeEnabled === "true",
  azureTenantId = appConfig.azureADTenantID || "",
  azureClientId = appConfig.azureADClientID || "",
  reactAuthFlow = appConfig.authflow || "Interna",
  flowType = appConfig.flowType || "PCD";

let menuItems = appConfig.menusEnabled;
let user = JSON.parse(localStorage.getItem("user") || "{}");
if (user && user.role == "CLM_USER") {
  menuItems = "CLM";
}
const itemsfromEnv = menuItems?.split(",") as Array<string>;

export const enabledMenuItems = values(pick(MENUITEMS, itemsfromEnv));
