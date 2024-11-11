import React, { createContext, useMemo } from "react";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { useAuth } from "@hooks/useAuth";
import { get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import { MultiCloudContext as MultiCloudT } from "~/Types/Context/multicloud";
import { isEmpty } from "lodash";

export const MultiCloudContext = createContext({} as MultiCloudT);

export const MultiCloudProvider = ({ children }: { children: React.ReactNode }) => {
  const [multiCloudItems, setMultiCloudItems, removeMultiCloudItems] = useLocalStorage("onboardedCloudApps", []);

  // const { user } = useAuth();

  const { openToast } = useNotification();

  const fetchMultiCloud = () => {
    let user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.role === "CLM_USER") {
      return;
    } else {
      get("/cloud/integrated")
        .then((res: any) => {
          if (res.status === "OK" && !isEmpty(res.response)) {
            setMultiCloudItems(res.response.data);
          } else {
            setMultiCloudItems([]);
          }
        })
        .catch((err) => openToast({ content: err, type: "error" }));
    }
  };

  const value: MultiCloudT = useMemo(
    () => ({
      multiCloudItems,
      fetchMultiCloud,
    }),
    // eslint-disable-next-line
    [multiCloudItems]
  );

  return <MultiCloudContext.Provider value={value}>{children}</MultiCloudContext.Provider>;
};
