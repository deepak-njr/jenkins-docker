import {
  ActiveApplications,
  AppAvgSpend,
  AverageMonthlySpend,
  AverageUsage,
  BasicInfo,
  TotalApps,
} from "./Components";
import { Avatar, Badge, Col, Row, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ContentWrapper } from "@components/index";
import { Icon } from "@iconify/react";
import { get } from "@services/api.service";
import { imageKey } from "@utils/Constants";
import styles from "../Users.module.scss";
import { useNotification } from "@hooks/useNotification";

export const UserDrilldown = () => {
  const { id } = useParams();
  const [data, setData] = useState<{ [key in string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { openToast } = useNotification();

  const fetchUser = () => {
    setIsLoading(true);
    get(`v1/user/details/user-details-overview?userId=${id}`)
      .then((res: any) => {
        if (res && res.response.data) {
          setData(res.response.data.getUserDetailsOverview);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  return (
    <ContentWrapper
      loading={isLoading}
      customTitle={
        <Space style={{ alignItems: "center" }}>
          <Icon
            onClick={() => navigate(-1)}
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
            src={data.userLogo && `${data.userLogo}${imageKey}`}
            icon={
              !data.userLogo &&
              data.userName &&
              data.userName.slice(0, 2).toUpperCase()
            }
          />
          <Space size={0} direction="vertical">
            <Typography.Title level={5} style={{ marginBottom: 0 }}>
              {data.userName}
            </Typography.Title>{" "}
            <Typography.Text>
              <Space>
                <Badge color={data.userStatus === "Active" ? "green" : "red"} />
                {data.userStatus}
              </Space>
            </Typography.Text>
          </Space>
        </Space>
      }
    >
      <Row gutter={16} align="stretch">
        <Col
          xs={24}
          md={12}
          lg={6}
          style={{ marginBottom: styles.whitespace2 }}
        >
          <AverageMonthlySpend amount={data.userAvgMonthlyAdminSpend} />
        </Col>
        <Col
          xs={24}
          md={12}
          lg={6}
          style={{ marginBottom: styles.whitespace2 }}
        >
          <AverageUsage usage={data.userAvgUsage} />
        </Col>
        <Col
          xs={24}
          md={12}
          lg={6}
          style={{ marginBottom: styles.whitespace2 }}
        >
          <ActiveApplications applications={data.userActiveApplications} />
        </Col>
        <Col
          xs={24}
          md={12}
          lg={6}
          style={{ marginBottom: styles.whitespace2 }}
        >
          <TotalApps apps={data.userApplicationsCount} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={24} lg={12}>
          <BasicInfo
            department={data.userDepartmentName}
            designation={data.userDesignation}
            type={data.userType}
            reportingto={data.userReportingManager}
            onboardedDate={data.userOnboardedDate}
            fetchUser={fetchUser}
          />
          {/* <AppAvgUsage /> */}
        </Col>
        <Col xs={24} md={24} lg={12}>
          <AppAvgSpend />
        </Col>
      </Row>
    </ContentWrapper>
  );
};
