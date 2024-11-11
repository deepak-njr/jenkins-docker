import React, { useEffect, useState } from "react";
import InProgress from "@assets/SVG/InProgress.svg";
import Completed from "@assets/SVG/Completed.svg";
import Application from "@assets/SVG/applicationIcon.svg";
import { MetricsCard } from "@components/index";
import { Button, Card, Col, Image, Row, Space, Typography } from "antd";
import styles from "./Widgets.module.scss";
import { Link, useNavigate } from "react-router-dom";
import MetricStyles from "@components/MetricsCard/MetricsCard.module.scss";
import { useHasAccess } from "@hooks/useHasAccess";
import { permissions } from "@utils/Roles";

const metricsCardData = [
  {
    icon: (
      <Image
        src={Application}
        preview={false}
      />
    ),
    title: "Total Contracts",
    graphUp: false,
    url: "/clm/contracts",
    totalInPercentage: "+2.5",
    fieldName: "totalCount",
  },
  {
    icon: (
      <Image
        src={Completed}
        preview={false}
      />
    ),
    title: "Signature Completed",
    graphUp: false,
    url: "/clm/contracts?status=completed",
    totalInPercentage: "-4.4",
    fieldName: "completedCount",
  },

  {
    icon: (
      <Image
        src={InProgress}
        preview={false}
        width={30}
        height={30}
      />
    ),
    title: "Signature In Progress",
    graphUp: false,
    url: "/clm/contracts?status=sent",
    totalInPercentage: "+0.5",
    fieldName: "inProgressCount",
  },
  {
    icon: "",
    title: "",
    graphUp: false,
    url: "",
    fieldName: "",
    totalInPercentage: "+2.5",
  },
];

interface Props {
  data: any;
  isLoading: boolean;
}

export const Metric = ({ data, isLoading }: Props) => {
  const [count, setCount] = useState<any>({});
  const navigate = useNavigate();
  const { hasPermissions } = useHasAccess();

  useEffect(() => {
    getTotalCount();
  }, [data, isLoading]);

  const getTotalCount = () => {
    let count = {
      totalCount: 0,
      inProgressCount: 0,
      completedCount: 0,
    };
    if (data) {
      count.totalCount = data.totalContracts;
      count.inProgressCount = data.signInProgress;
      count.completedCount = data.signCompleted;
    }
    setCount(count);
  };

  return (
    <Row gutter={16}>
      {metricsCardData.map((item) => {
        return item.url ? (
          <Col
            xs={24}
            sm={12}
            lg={hasPermissions([permissions.ADD_APPLICATION]) ? 6 : 8}
            key={item.title}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <MetricsCard
              style={{ height: "100%" }}
              icon={item.icon}
              isLoading={isLoading}
              title={
                <Link
                  style={{ cursor: item.url ? "pointer" : "default" }}
                  to={item.url}
                >
                  {item.title}
                </Link>
              }
              totalCount={
                <Link
                  style={{ cursor: item.url ? "pointer" : "default" }}
                  to={item.url}
                >
                  {count[item.fieldName]}
                </Link>
              }
            />
          </Col>
        ) : (
          hasPermissions([permissions.ADD_APPLICATION]) && (
            <Col
              xs={24}
              sm={12}
              lg={6}
              key={item.title}
              style={{ marginBottom: styles.whitespace2 }}
            >
              <Card
                className={MetricStyles.container}
                style={{
                  // ...style,
                  height: "100%",
                }}
                bodyStyle={{ width: "100%" }}
              >
                <Space
                  direction="vertical"
                  align="center"
                  style={{ width: "100%" }}
                >
                  <Button
                    type="link"
                    onClick={() => navigate("/clm/contracts/add")}
                  >
                    <Space>
                      <Typography.Text
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: styles.primary,
                        }}
                      >
                        {/* <Icon icon="akar-icons:plus" inline /> */}
                        Add New Contract
                      </Typography.Text>
                    </Space>
                  </Button>
                </Space>
                {/* <Space
                direction="vertical"
                align="end"
                style={{ width: "100%", marginTop: 8 }}
              >
                <Link
                  style={{ cursor: "pointer" }}
                  to={"/clm/contracts"}
                >
                  View All
                </Link>
              </Space> */}
              </Card>
            </Col>
          )
        );
      })}
    </Row>
  );
};
