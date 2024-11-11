import React, { useEffect, useState } from "react";
import Subscriptions from "@assets/SVG/shareData.svg";
import Renewals from "@assets/SVG/Wallet.svg";
import Spend from "@assets/SVG/Vector.svg";
import Application from "@assets/SVG/applicationIcon.svg";
import { MetricsCard } from "@components/index";
import { Col, Image, Row, Space, Tooltip, Typography } from "antd";
import { currencyFormat } from "@utils/CurrencyFormatter";
import styles from "./Widgets.module.scss";
import { useNotification } from "@hooks/useNotification";
import { get } from "@services/api.service";
import { TinyMockGraph } from "~/mocks/TinyMockGraph";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import moment from "moment";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { TinyBarGraph } from "../../../mocks/TinyBarGraph";

const metricsCardData = [
  {
    icon: <Image src={Application} preview={false} />,
    title: "Applications",
    graphUp: true,
    url: "/applications",
    totalInPercentage: "+2.5",
  },
  {
    icon: <Image src={Renewals} preview={false} />,
    title: "Renewals",
    graphUp: false,
    url: "/renewals",
    totalInPercentage: "-4.4",
  },

  {
    icon: <Image src={Spend} preview={false} />,
    title: "Spend (YTD)",
    graphUp: true,
    url: "",
    totalInPercentage: "+0.5",
  },
  {
    icon: <Image src={Spend} preview={false} />,
    title: "Total Spend",
    graphUp: true,
    url: "",
    totalInPercentage: "+2.5",
  },
];

export const Metric = () => {
  const { openToast } = useNotification();
  const [data, setData] = useState<any>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [count, setCount] = useState<any>([]);

  useEffect(() => {
    getDashBoardView();
    getAnalyticsView();
  }, []);

  const getAnalyticsView = () => {
    setIsAnalyticsLoading(true);
    get("v1/dashboard/analytics/view")
      .then((res: any) => {
        setData(res.response.data);
        setIsAnalyticsLoading(false);
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
        setIsAnalyticsLoading(false);
      });
  };

  const getDashBoardView = () => {

    setIsDashboardLoading(true);
    get("v1/dashboard/view")
      .then((res: any) => {
        setCount(res.response.data);
        setIsDashboardLoading(false);
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
        setIsDashboardLoading(false);
      });
  };

  const getCount = (title: string) => {
    switch (title) {
      case "Applications":
        return data.application;
      case "Renewals":
        return data.renewal;
      case "Total Spend":
        return currencyFormat(data.adminCost, true);
      case "Spend (YTD)":
        return currencyFormat(data.adminCostYTD, true);
      default:
    }
  };
  const getTotalCount = (title: string) => {
    if (data) {
      switch (title) {
        case "Applications":
          return count.applications;
        case "Renewals":
          return count.renewals;
        case "Total Spend":
          return currencyFormat(count.adminCost, true);
        case "Spend (YTD)":
          return currencyFormat(count.adminCostYTD, true);
        default:
      }
    }
  };
  const getMonthCount = (title: string) => {
    if (data) {
      switch (title) {
        case "Applications":
          return data.application?.firstMonth;
        case "Renewals":
          return data.renewal?.firstMonth;
        default:
      }
    }
  };
  return (
    <Row gutter={16}>
      {metricsCardData.map((item) => (
        <Col
          xs={24}
          sm={12}
          lg={6}
          key={item.title}
          style={{ marginBottom: styles.whitespace2 }}
        >
          <MetricsCard
            style={{ height: "100%" }}
            icon={item.icon}
            isLoading={isDashboardLoading || isAnalyticsLoading}
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
                {(count && (
                  (item.url === "") ? <Typography.Title ellipsis
                    level={4}
                    style={{ margin: 0 }}
                    className={styles.amount}
                  >
                    <Tooltip
                      title={
                        getTotalCount(item.title)}> {getTotalCount(item.title)}
                    </Tooltip>

                  </Typography.Title> : getTotalCount(item.title)
                )

                ) || 0}
              </Link>
            }
            {...(!["Spend (YTD)", "Total Spend"].includes(item.title) && {
              graph: (
                <Space direction="vertical" style={{ display: "flex" }}>
                  {data && (
                    <TinyBarGraph
                      data={data && getCount(item.title)}
                      title={item.title}
                      count={getMonthCount(item.title)}
                      months={data && data.months}
                    />
                  )}
                </Space>
              ),
            })}
          />
        </Col>
      ))}
    </Row>
  );
};
