import { Card, Tabs } from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { string } from "yup";
import { ContentWrapper } from "~/Components";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "~/Hooks/useQuery";
import { get } from "~/Services";
import { AzureAd } from "./AzureAd";

type Item = {
  id: number;
  appId: string;
  hasAdminConsent: boolean;
  isConnected: boolean;
  companyId: string;
  applicationName: string;
  logo: string;
  category: string;
  discription: string;
};

export const Integrations = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { openToast } = useNotification();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.get("activeTab")) {
      query.append("activeTab", "all");
    }
  }, []);

  const getItem = (item: Item) => {
    switch (item.applicationName) {
      case "Azure AD": {
        return <AzureAd {...item} />;
      }
      default:
        return <AzureAd {...item} />;
    }
  };

  const getContents = () => {
    return map(integrations, (item) => getItem(item));
  };

  const items = [
    {
      label: "All Categories",
      key: "all",
      children: getContents(),
    },
    {
      label: "Single Sign-on",
      key: "sso",
      children: getContents(),
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    get("/admin/integrations")
      .then((res: any) => {
        if (res.status === "OK") {
          setIntegrations(res.response.data);
        }
        setIsLoading(false);
        openToast({
          content: res.message,
          type: "success",
        });
      })
      .catch((err) => openToast({ content: err, type: "error" }));
  }, []);

  return (
    <ContentWrapper title="Integrations">
      <Tabs
        items={items}
        className="tabs-plain"
        activeKey={query.get("activeTab") || ""}
        onChange={(activeKey) =>
          navigate(`/integrations?activeTab=${activeKey}`)
        }
      />
    </ContentWrapper>
  );
};
