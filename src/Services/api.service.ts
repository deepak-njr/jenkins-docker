import { AccountInfo, InteractionType, PublicClientApplication } from "@azure/msal-browser";
import { get as _get, includes, isEmpty } from "lodash";
import { apiURL, basePath } from "@utils/Constants";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getAccessToken, getRefreshToken, updateAccessToken } from "@utils/getLocalStorage";
import { loginRequest, msalConfig } from "@utils/azure-ad-sso";

import { RefreshTokenClient } from "@azure/msal-common";
import { message as notificationMessage } from "antd";
import { strings } from "@utils/Strings";

export const apiBaseUrl = `${apiURL}/${basePath}`;

export const msalInstance = new PublicClientApplication(msalConfig);
const ignoreErrorEndpoints = ["v1/application/license/unmapped/count","/v1/application/adaptor/keys?applicationId=","/v1/application/adaptor/save/details?appName="];

const validateResponse = (res: AxiosResponse, resolve: Function, reject: Function, endpoint?: any) => {
  const { data } = res;

  if ((data && data.status === "OK") || data.status === "CREATED" || data.status === "ACCEPTED") {
    resolve(data);
  } else {
    if (endpoint && !ignoreErrorEndpoints.includes(endpoint)) {
      notificationMessage.error(data.message);
    }
    reject(data.message);
  }
};

const extractErrMsg = (err: AxiosError, reject: Function, endpoint?: any) => {
  if (err) {
    const { message } = err.response?.data as any;
    if (message) {
      if (endpoint && !ignoreErrorEndpoints.includes(endpoint)) {
        notificationMessage.error(message);
      }
      reject(message);
    }
    if (endpoint && !ignoreErrorEndpoints.includes(endpoint)) {
      notificationMessage.error(strings.someThingWentWrong);
    }
    reject(strings.someThingWentWrong);
  }
};

const handleErr = (err: AxiosError, reject: Function, endpoint?: string) => {
  // if (err.response?.status === 401) {
  //   localStorage.removeItem("user");
  //   window.location.reload();
  // }
  return extractErrMsg(err, reject, endpoint);
};

export const api = axios.create({
  baseURL: apiBaseUrl,
});

let isRefreshing = false;
let refreshQueue: any = [];
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("error", error);
    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // if refresh token is already being used, add the original request to the queue
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        let user: any = JSON.parse(localStorage.getItem("user") || "{}");
        if (user && user.role === "CLM_USER") {
          const accessTokenRequest = {
            scopes: loginRequest.scopes,
            account: msalInstance.getAllAccounts()[0],
          };
          let res: any = await msalInstance.acquireTokenSilent(accessTokenRequest);
          // Acquire token silent success
          if (res) {
            let accessToken = res.accessToken;
            if (accessToken) {
              // udpate access and refresh token
              updateAccessToken(accessToken, user.refreshtoken);
              api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
              // process the pending API calls
              refreshQueue.forEach((prom: any) => {
                prom.resolve(accessToken);
              });
              refreshQueue = [];
              originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
              isRefreshing = false;
              return api(originalRequest);
            } else {
              logout();
            }
          }
        } else {
          const refreshReq = await axios.post(`${apiBaseUrl}/userprofile/refresh/token`, {
            refreshToken: JSON.parse(localStorage.getItem("user") || "{}")?.refreshToken,
          });
          const { token, refreshToken } = _get(refreshReq, "data.response.data");
          let accessToken = token;
          if (token) {
            // udpate access and refresh token
            updateAccessToken(token, refreshToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            // process the pending API calls
            refreshQueue.forEach((prom: any) => {
              prom.resolve(accessToken);
            });
            refreshQueue = [];
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            isRefreshing = false;
            return api(originalRequest);
          } else {
            logout(); 
          }
        }
      } catch (error) {
        logout();
      } finally {
        isRefreshing = false;
        // refreshQueue = [];
      }
    }
    return Promise.reject(error);
  }
);


const logout = () => {
  window.localStorage.removeItem("user");
  window.localStorage.removeItem("onboardedCloudApps");
  window.history.pushState({ sessionExpired: true }, "", "/auth/login");
  window.location.reload();
};

export const silentRefresh = async () => {
  const refreshReq = await axios.post(`${apiBaseUrl}/userprofile/refresh/token`, {
    refreshToken: JSON.parse(localStorage.getItem("user") || "{}")?.refreshToken,
  });
  const { token, refreshToken } = _get(refreshReq, "data.response.data");
  if (token) {
    updateAccessToken(token, refreshToken);
  }else{
    logout();
  }
};

const updateHeader = () => {
  const user = JSON.parse(localStorage.getItem("user") as any) || {};
  const authProvider = JSON.parse(localStorage.getItem("authProvider") as any);
  if (!isEmpty(user)) {
    const { token } = user;
    api.defaults.headers.common["Authorization"] = `Bearer ${token} `;
    api.defaults.headers.common["X-Auth-Provider"] = authProvider || "internal";
    return;
  }
  api.defaults.headers.common["Authorization"] = "";
};

export const get = async (endpoint: string) => {
  updateHeader();
  return new Promise((resolve, reject) => {
    api
      .get(endpoint)
      .then((res: AxiosResponse) => {
        validateResponse(res, resolve, reject);
      })
      .catch((err: AxiosError) => {
        handleErr(err, reject);
      });
  });
};

export const post = async (
  endpoint: string,
  // eslint-disable-next-line
  payload: any,
  headers?: { [key in string]: any }
) => {
  updateHeader();
  return new Promise((resolve, reject) => {
    api
      .post(endpoint, payload, {
        ...(headers && {
          headers: {
            ...headers,
          },
        }),
      })
      .then((res: AxiosResponse) => {
        validateResponse(res, resolve, reject, endpoint);
      })
      .catch((err: AxiosError) => {
        handleErr(err, reject, endpoint);
      });
  });
};

// eslint-disable-next-line
export const put = async (endpoint: string, payload: any) => {
  updateHeader();
  return new Promise((resolve, reject) => {
    api
      .put(endpoint, payload)
      .then((res: AxiosResponse) => {
        validateResponse(res, resolve, reject);
      })
      .catch((err: AxiosError) => {
        handleErr(err, reject);
      });
  });
};

// eslint-disable-next-line
export const remove = async (endpoint: string, payload?: any) => {
  updateHeader();
  return new Promise((resolve, reject) => {
    api
      .delete(endpoint, {
        ...(payload && { data: payload }),
      })
      .then((res: AxiosResponse) => {
        validateResponse(res, resolve, reject);
      })
      .catch((err: AxiosError) => {
        handleErr(err, reject);
      });
  });
};

export const upload = (endpoint: string, payload: any) => {
  return new Promise((resolve, reject) => {
    const user = JSON.parse(localStorage.getItem("user") as any) || {};
    if (!user) reject("Unauthorized User");
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${user.token}`);

    fetch(`${apiURL}/${basePath}/${endpoint}`, {
      method: "POST",
      body: payload,
      headers: myHeaders,
      redirect: "follow",
    })
      .then((response) => response.json())
      .then((res: any) => {
        resolve(res);
      })
      .catch((err: AxiosError) => {
        reject(handleErr(err, reject));
      });
  });
};
