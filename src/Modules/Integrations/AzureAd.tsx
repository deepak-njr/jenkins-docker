import { Icon } from "@iconify/react";
import { Button, Card, Form, Modal, Space, Steps, Tag, Typography } from "antd";
import { Image } from "antd";
import { has } from "lodash";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { useQuery } from "~/Hooks/useQuery";
import { get, post } from "~/Services";
import { imageKey } from "~/Utils";
import { permissions } from "~/Utils/Roles";
import styles from "./index.module.scss";
import { useNotification } from "~/Hooks/useNotification";

const { confirm } = Modal;

interface Props {
  id: number;
  appId: string;
  hasAdminConsent: boolean;
  isConnected: boolean;
  companyId: string;
  applicationName: string;
  logo: string;
  category: string;
  discription: string;
}

export const AzureAd = (item: Props) => {
  const { id } = useParams();
  const query = useQuery();
  const navigate = useNavigate();
  const { hasPermissions } = useHasAccess();
  const { openToast } = useNotification();

  useEffect(() => {
    if (id === "azure") {
      if (query.get("admin_consent") === "True" && query.get("tenant")) {
        post("/admin/consent", {
          adminConsent: true,
          tenantId: query.get("tenant"),
        }).then((res: any) => {
          if (res.status === "ACCEPTED") {
            navigate("/integrations?activeTab=all");
            openToast({
              content: res.message,
              type: "success",
            });
          }
        });
      }
      if (query.get("code") && query.get("state") === "saaspe-integration") {
        post("/admin/code", {
          authCode: query.get("code"),
        }).then((res: any) => {
          if (res.status === "ACCEPTED") {
            navigate("/integrations?activeTab=all");
          }
          openToast({
            content: res.message,
            type: "success",
          });
        });
      }
    }
  }, [id]);

  return (
    <Card
      className={styles.Card}
      title={
        <Card.Meta
          avatar={
            <Image
              src={`${item.logo}${imageKey}`}
              preview={false}
              className={styles.Logo}
            />
          }
          title={
            <Typography.Text ellipsis>
              {item.applicationName}
              {item.isConnected && (
                <Tag
                  color="green"
                  style={{ marginLeft: 4 }}
                >
                  Connected
                </Tag>
              )}
            </Typography.Text>
          }
          description={<Typography.Text ellipsis>{item.category}</Typography.Text>}
        />
      }
    >
      <Space
        direction="vertical"
        size={16}
      >
        <Typography.Paragraph
          ellipsis={{
            rows: item.isConnected ? 8 : 4,
            expandable: !item.isConnected,
            symbol: "more",
          }}
          style={{ margin: 0 }}
        >
          {item.discription}
        </Typography.Paragraph>

        {!item.hasAdminConsent && (
          <form
            method="get"
            action={`https://login.microsoftonline.com/common/adminconsent`}
          >
            <input
              type="hidden"
              name="client_id"
              value={item.appId}
            />
            <input
              type="hidden"
              name="redirect_uri"
              value={`${window.location.origin}/integrations/azure`}
            />
            {hasPermissions([permissions.ENABLE_INTEGRATION]) && (
              <Button
                block
                type="primary"
                htmlType="submit"
              >
                <Space>
                  <Icon
                    icon="mdi:link-variant"
                    inline
                  />
                  Connect
                </Space>
              </Button>
            )}
          </form>
        )}
        {item.hasAdminConsent && !item.isConnected && (
          <form
            method="get"
            action={`https://login.microsoftonline.com/${item.companyId || ""}/oauth2/v2.0/authorize`}
          >
            <input
              type="hidden"
              name="client_id"
              value={item.appId}
            />
            <input
              type="hidden"
              name="response_type"
              value="code"
            />
            <input
              type="hidden"
              name="response_mode"
              value="query"
            />
            <input
              type="hidden"
              name="state"
              value="saaspe-integration"
            />
            <input
              type="hidden"
              name="scope"
              value="openid offline_access https://graph.microsoft.com/.default"
            />
            <input
              type="hidden"
              name="redirect_uri"
              value={`${window.location.origin}/integrations/azure`}
            />
            {hasPermissions([permissions.ENABLE_INTEGRATION]) && (
              <Button
                block
                type="primary"
                htmlType="submit"
              >
                <Space>
                  <Icon
                    icon="mdi:account-secure"
                    inline
                  />
                  Authorize
                </Space>
              </Button>
            )}
          </form>
        )}
        {item.isConnected && hasPermissions([permissions.REMOVE_INTEGRATION]) && (
          <Button
            block
            type="primary"
            ghost
            htmlType="submit"
            onClick={() => {
              confirm({
                type: "error",
                okText: "Disconnect",
                title: "Are you sure?",
                content:
                  "Disconnecting Azure AD integration will permanently remove data associated to Azure Ad and application in saaspe.",
              });
            }}
          >
            <Space>
              <Icon
                icon="tabler:unlink"
                inline
              />
              Disconnect
            </Space>
          </Button>
        )}
      </Space>
    </Card>
  );
};
