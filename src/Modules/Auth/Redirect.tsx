import { useMsal } from "@azure/msal-react";
import React, { useEffect, useState } from "react";
import { loginRequest } from "@utils/azure-ad-sso";
import { useLocalStorage } from "~/Hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiBaseUrl } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";

export const Redirect = () => {
  const { instance, accounts, inProgress } = useMsal();
  const [user, setUser] = useLocalStorage("user", null);
  const [accessToken, setAccessToken] = useState(null);

  const navigate = useNavigate();
  const { openToast } = useNotification();
  const name = accounts[0] && accounts[0].name;

  // useEffect(() => {
  //   if (accessToken) {
  //     axios
  //       .get(`${apiBaseUrl}/userprofile/access`, {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       })
  //       .then((res) => console.log(res));
  //     // setUser(
  //     //   JSON.stringify({
  //     //     token: accessToken,
  //     //     method: "azure_sso",
  //     //   })
  //     // );
  //     // navigate("/dashboard");
  //   }
  // }, [accessToken]);
  return <div>{JSON.stringify(accessToken)}</div>;
};
