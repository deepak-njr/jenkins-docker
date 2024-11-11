import { AuthenticationResult, EventType } from "@azure/msal-browser";
import React, { createContext, useEffect, useMemo, useState } from "react";
import { api, apiBaseUrl, get, post } from "@services/api.service";

import { AuthContext as AuthContextT } from "@typedef/index";
import { UserConsent } from "~/Components/UserContext/UserConsent";
import { get as _get } from "lodash";
import axios from "axios";
import { decodeToken } from "react-jwt";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@hooks/useNotification";
import { message } from "antd";

export const AuthContext = createContext({} as AuthContextT);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser, removeUser] = useLocalStorage("user", null);
  const [, , removeMultiCloudItems] = useLocalStorage("onboardedCloudApps", []);
  const [xAuthProvider, setxAuthProvider] = useLocalStorage("authProvider", "internal");
  const [isLoading, setIsLoading] = useState(false);
  const [isSSOLoading, setIsSSOLoading] = useState(false);
  const { instance } = useMsal();
  const { openToast } = useNotification();
  const navigate = useNavigate();
  const [consentURL, setConsentURL] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

  useEffect(() => {
    instance.addEventCallback((event: any) => {
      if (
        (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
        event.payload
      ) {
        setIsSSOLoading(true);
        const response = event.payload as AuthenticationResult;
        axios
          .get(`${apiBaseUrl}/userprofile/access`, {
            headers: {
              Authorization: `Bearer ${response.accessToken}`,
              "X-Auth-Provider": "azure",
            },
          })
          .then(({ data }: any) => {
            let clmData = _get(data, "response.data.clm");
            if (clmData.enabled && !clmData.consentGiven) {
              axios.get(`${apiBaseUrl}/userprofile/consent-email/to-user`, {
                headers: {
                  Authorization: `Bearer ${response.accessToken}`,
                  "X-Auth-Provider": "azure",
                },
              });
              setConsentURL(clmData.consentUrl);
              setOpenModal(true);
              return null;
            } else {
              setUser({
                email: response.account?.username,
                refreshToken: "",
                token: response.accessToken,
                access: data.response.data.access,
                role: data.response.data.role,
              });
              setxAuthProvider("azure");
              return data;
            }
          })
          .then((data: any) => {
            setTimeout(() => {
              if (data.response && data.response.data.role === "CLM_USER") {
                window.location.pathname = "/clm/dashboard";
              } else {
                window.location.pathname = "/dashboard";
              }
            });
            setIsSSOLoading(false);
          })
          .catch(() => {
            setIsSSOLoading(false);
            openToast({ content: "Something went wrong!", type: "error" });
            instance.logout({ account: response.account });
          });
      }
    });
  }, [instance]);
  // call this function when you want to authenticate the user

  const verifyOtp = async (data: any) => {
    // api login here
    setIsLoading(true);
    post("userprofile/verify-otp", data)
      .then((res: any) => {
        const { token, refreshToken } = res.response.data;
        if (token) {
          const tokenDetails: any = decodeToken(token);
          axios
            .get(`${apiBaseUrl}/userprofile/access`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then(({ data }: any) => {
              if (data.status === "OK") {
                setUser({
                  token,
                  refreshToken: refreshToken,
                  email: tokenDetails.email,
                  access: data.response.data.access,
                  currency: data.response.data.currency,
                  role: data.response.data.role,
                });
                setxAuthProvider("internal");
                setTimeout(() => {
                  setIsLoading(false);
                  navigate("/dashboard");
                }, 100);
              }
            });
        }
      })
      .catch((err: any) => {
        if (err === "OTP Expired") {
          setIsButtonDisabled(false);
        }
        setIsLoading(false);
      });
  };

  const refreshProfile = async () => {
    if (user && user.role === "CLM_USER") return;
    get("/userprofile/access").then((res: any) => {
      if (res.status === "OK" && user.currency !== res.response.data.currency) {
        setUser({
          ...user,
          currency: res.response.data.currency,
        });
        // const newUser = JSON.parse(localStorage.getItem("user") || "{}");
        // newUser.currency = res.response.data.currency;
        // localStorage.setItem("user", JSON.stringify(newUser));
      }
    });
  };

  // call this function to sign out logged in user
  const logout = () => {
    // remove token here
    if (xAuthProvider === "azure" && instance.getActiveAccount()) {
      instance
        .logoutPopup({ account: instance.getActiveAccount() })
        .then(() => {
          removeUser("user");
          removeMultiCloudItems("onboardedCloudApps");
          window.location.reload();
        })
        .catch((e) => {
          openToast({ content: e, type: "error" });
        });
    } else {
      removeUser("user");
      removeMultiCloudItems("onboardedCloudApps");
      window.location.reload();
    }
  };
  const resendOtp = () => {
    const email = localStorage.getItem("userEmail") || "";
    const formdata = new FormData();
    formdata.append("emailAddress", email);
    api
      .post(`/userprofile/resend-otp`, formdata)
      .then((res) => {
        message.success("OTP Resent Successfully");
        setIsButtonDisabled(true);
      })
      .catch((err: any) => {
        message.error("Failed to send OTP");
      });
  };

  const value: AuthContextT = useMemo(
    () => ({
      user,
      logout,
      refreshProfile,
      isLoading,
      verifyOtp,
      isSSOLoading,
      resendOtp,
      isButtonDisabled,
    }),
    // eslint-disable-next-line
    [user, isLoading, isSSOLoading, isButtonDisabled]
  );

  return (
    <AuthContext.Provider value={value}>
      <UserConsent
        openModal={openModal}
        consentURL={consentURL}
        setOpenModal={(val) => setOpenModal(val)}
      />
      {children}
    </AuthContext.Provider>
  );
};
