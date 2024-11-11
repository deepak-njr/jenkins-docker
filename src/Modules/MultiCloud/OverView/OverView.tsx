import { useEffect, useState } from "react";
import { ContentWrapper } from "@components/index";
import { Col, Row, Space } from "antd";
import { CloudApps } from "./Components/CloudApps";
import { SpendHistory } from "./Components/SpendHistory";
import { TopExpensiveService } from "./Components/TopExpensiveService";
import { RecentSpendHistory } from "./Components/RecentSpendHistory";
import { TotalSpendYear } from "./Components/TotalSpendYear";
import { SpendThisMonth } from "./Components/SpendThisMonth";
import { CostByVendor } from "./Components/CostByVendor";
import styles from "./OverView.module.scss";
import { get } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { useAuth } from "~/Hooks/useAuth";

export const OverView = () => {
  const { user } = useAuth();
  const [currentMonthCost, setCurrentMonthCost] = useState(0);
  const [currentYearCost, setCurrentYearCost] = useState(0);
  const [currency, setCurrency] = useState(user.currency);
  const { openToast } = useNotification();
  useEffect(() => {
    get("/cloud/cost/yearly/monthly")
      .then(async (res: any) => {
        if (res.status === "OK") {
          if (res.response.data) {
            setCurrency(res.response.data.currency);
            setCurrentMonthCost(res.response.data.thisMonthSpend);
            setCurrentYearCost(res.response.data.thisYearSpend);
          }
        }
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
      });
  }, []);
  return (
    <ContentWrapper title="Overview">
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={24} lg={16}>
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              <CloudApps />
              <SpendHistory />
            </Space>
          </Col>
          <Col xs={24} sm={24} md={24} lg={8}>
            <Space direction="vertical" style={{ width: "100%" }} size={16}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <TotalSpendYear
                    cost={currentYearCost}
                    currency={currency}
                    key={currentYearCost}
                  />
                </Col>
                <Col xs={24} md={12}>
                  <SpendThisMonth
                    cost={currentMonthCost}
                    currency={currency}
                    key={currentMonthCost}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <CostByVendor />
                </Col>
              </Row>
            </Space>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col
            xs={24}
            md={24}
            lg={12}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <TopExpensiveService />
          </Col>
          <Col
            xs={24}
            md={24}
            lg={12}
            style={{ marginBottom: styles.whitespace2 }}
          >
            <RecentSpendHistory />
          </Col>
        </Row>
      </Space>
    </ContentWrapper>
  );
};
