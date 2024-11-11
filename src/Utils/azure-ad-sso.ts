import { azureClientId, azureTenantId } from "./Constants";

import { Configuration } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: azureClientId,
    authority: `https://login.microsoftonline.com/${azureTenantId}`, // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    redirectUri: `${window.location.origin}/auth/login`,
    postLogoutRedirectUri: `${window.location.origin}/auth/login`,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["User.Read", "Directory.Read.All"],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
