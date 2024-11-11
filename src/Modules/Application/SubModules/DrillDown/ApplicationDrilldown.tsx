import { Avatar, Button, Col, Row, Space, Tabs, Typography } from "antd";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { Contracts, Licenses, OverView, Users } from ".";
import { get as _get, isEmpty } from "lodash";
import { useNavigate, useParams } from "react-router-dom";

import { ConnectToAdaptors } from "@modules/Application/SubModules/DrillDown/Overview/Components/Adaptors/ConnectToAdaptors";
import { ConnectToSSO } from "./Overview/Components/ConnectToSSO";
import { ContentWrapper } from "@components/index";
import { Icon } from "@iconify/react";
import { get } from "@services/api.service";
import { imageKey } from "@utils/Constants";
import { permissions } from "~/Utils/Roles";
import styles from "./ApplicationDrilldown.module.scss";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { useNotification } from "@hooks/useNotification";
import { useQuery } from "@hooks/useQuery";

export const ApplicationDrilldown = () => {
  const [data, setData] = useState<{ [key in string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const query = useQuery();
  const { openToast } = useNotification();
  const [tabPanelHeight, setTabPanelHeight] = useState<number>(0);
  const ref = useRef<any>(null);
  const { id } = useParams();
  const { hasPermissions } = useHasAccess();
  const navigate = useNavigate();
  const getApplicaitonDetail = () => {
    setIsLoading(true);
    get(`v1/application/overview?applicationId=${id}`)
      .then((res: any) => {
        setIsLoading(false);
        if (res?.response?.data) {
          let newData = res.response.data;
          newData.applicationOwner = _get(newData, "ownerDetails[0].applicaitonOwnerName");
          newData.applicationOwnerEmail = _get(newData, "ownerDetails[0].applicationOwnerEmail");
          newData.secondaryOwnerEmail = _get(newData, "ownerDetails[1].applicationOwnerEmail");
          setData(newData);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
  };
  useEffect(() => {
    if (isEmpty(data)) {
      getApplicaitonDetail();
    }
  }, [id]);

  useEffect(() => {
    if (ref.current) {
      setTabPanelHeight(ref.current.getBoundingClientRect().height - 30);
    }
  }, [ref]);

  const tabPanelStyle: CSSProperties = {
    height: tabPanelHeight,
    overflowY: "hidden",
    overflowX: "hidden",
  };

  if (!id) return null;

  const items = [
    {
      label: "Overview",
      key: "overview",
      children: (
        <div
          style={{
            height: tabPanelHeight,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <OverView
            {...data}
            applciationStatus={data.applciationStatus}
            applicationId={id}
            adminAvgCost={data.adminAvgCost}
            adminCost={data.adminCost}
            applicationAvgUsage={data.applicationAvgUsage}
            applicationActiveUserCount={data.applicationActiveUserCount}
            applicationActiveContracts={data.applicationActiveContracts}
            applicationUpcomingRenewal={data.applicationUpcomingRenewal}
            applicationCategory={data.applicationCategory}
            applicationDepartment={data.applicationDepartment}
            applicationOwner={data.applicationOwner}
            applicationOwnerEmail={data.applicationOwnerEmail}
            secondaryOwnerEmail={data.secondaryOwnerEmail}
            autoRenew={data.autoRenew}
            applicationLink={data.applicationLink}
            totalLicenses={data.totalLicenses}
            mappedLicenses={data.mappedLicenses}
            unmappedLicenses={data.unmappedLicenses}
            applicationLogo={data.applicationLogo}
            applicationName={data.applicationName}
            currencySymbol={data.currencySymbol}
            refreshData={getApplicaitonDetail}
          />
        </div>
      ),
    },
    {
      label: "Users",
      key: "users",
      children: (
        <div style={tabPanelStyle}>
          <Users
            id={id}
            height={tabPanelHeight}
          />{" "}
        </div>
      ),
    },
    {
      label: "Contracts",
      key: "contracts",
      children: (
        <div style={tabPanelStyle}>
          <Contracts
            id={id}
            height={tabPanelHeight}
          />{" "}
        </div>
      ),
    },
    {
      label: "Licenses",
      key: "licenses",
      children: (
        <div style={tabPanelStyle}>
          <Licenses
            id={id}
            height={tabPanelHeight}
          />
        </div>
      ),
    },
    {
      label: "App Insights",
      key: "App Insights",
      children: <></>,
      styles: { tabPanelStyle },
      disabled: true,
    },
  ];
  return (
    <ContentWrapper
      loading={isLoading}
      bodyStyle={{
        paddingTop: 0,
      }}
      actionItems={
        <>
          <div style={{ display: "flex", gap: 20 }}>
            {query.get("activeTab") === "overview" && hasPermissions([permissions.ADD_APPLICATION]) && (
              <>
                {data.isAdaptorAvailable && (
                  <ConnectToAdaptors
                    data={data}
                    refreshData={getApplicaitonDetail}
                  />
                )}
              </>
            )}
            {query.get("activeTab") === "overview" && hasPermissions([permissions.ADD_APPLICATION]) && (
              <>
                {data.isSsoIntegrated && (
                  <ConnectToSSO
                    data={data}
                    refreshData={getApplicaitonDetail}
                  />
                )}
              </>
            )}
          </div>
          {query.get("activeTab") === "contracts" && hasPermissions([permissions.ADD_APPLICATION]) && (
            <Button
              type="primary"
              onClick={() =>
                navigate(`/applications/${id}/contracts/add`, {
                  state: {
                    department: data.applicationDepartment,
                    applicationLogo: data.applicationLogo,
                    applicationName: data.applicationName,
                  },
                })
              }
            >
              <Space>
                <Icon
                  icon="akar-icons:plus"
                  inline
                />
                Add
              </Space>
            </Button>
          )}
        </>
      }
      customTitle={
        <Row>
          <Col>
            <Space style={{ alignItems: "center" }}>
              <Icon
                onClick={() => navigate("/applications")}
                icon="akar-icons:arrow-left"
                style={{
                  fontSize: "1.8rem",
                  cursor: "pointer",
                  color: styles.primary,
                  marginRight: styles.whitespace1,
                }}
              />
              <Avatar
                size={48}
                src={`${data.applicationLogo}${imageKey}`}
                shape="square"
              />
              <Space
                size={0}
                direction="vertical"
              >
                <Typography.Title
                  level={5}
                  style={{ marginBottom: 0 }}
                >
                  {data.applicationName}
                </Typography.Title>
                {data.applicationProviderName && (
                  <Typography.Text className={styles.companyName}>{data.applicationProviderName}</Typography.Text>
                )}
              </Space>
            </Space>
          </Col>
        </Row>
      }
    >
      <div
        ref={ref}
        style={{ height: "98%", width: "100%" }}
      >
        <Row
          gutter={16}
          style={{ marginTop: styles.whitespace1 }}
        >
          <Col span={24}>
            <Typography.Paragraph
              style={{
                paddingLeft: styles.whitespace5,
                whiteSpace: "normal",
                wordBreak: "break-word",
                fontWeight: "normal",
                fontSize: "1rem",
                color: styles.gray,
              }}
            >
              {data.applicationDescription}
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Tabs
              items={items}
              activeKey={query.get("activeTab") ?? ""}
              onChange={(activeKey) => navigate(`/applications/${id}?activeTab=${activeKey}`)}
            ></Tabs>
          </Col>
        </Row>
      </div>
    </ContentWrapper>
  );
};
