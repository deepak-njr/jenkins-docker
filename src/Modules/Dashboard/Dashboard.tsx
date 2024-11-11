import { Col, Row } from "antd";
import {
  Analytics,
  BudgetAnalysis,
  Calendar,
  Contracts,
  ExpensesByDept,
  Invoices,
  Spend,
  TopApps,
  Metric,
  LatestApps,
} from "./Widgets";

import styles from "@styles/variables.module.scss";

export const Dashboard = () => {
  const colCommonStyles = {
    marginBottom: styles.whitespace2,
  };

  return (
    <>
      <Metric />
      <Row gutter={16} align="stretch">
        <Col xs={24} lg={16} style={colCommonStyles} className="usage-trends">
          <Analytics />
        </Col>
        <Col xs={24} lg={8} style={colCommonStyles}>
          <Calendar />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Row>
            <Col span={24} style={colCommonStyles}>
              <Spend />
            </Col>
            <Col span={24} style={colCommonStyles}>
              <ExpensesByDept />
            </Col>
            <Col span={24} style={colCommonStyles}>
              <TopApps />
            </Col>
          </Row>
        </Col>
        <Col xs={24} lg={12}>
          <Row gutter={16} align="stretch">
            <Col lg={12} md={24} xs={24} style={colCommonStyles}>
              <Invoices />
            </Col>
            <Col lg={12} md={24} xs={24} style={colCommonStyles}>
              <BudgetAnalysis />
            </Col>
          </Row>
          <Row>
            <Col span={24} style={colCommonStyles}>
              <Contracts />
            </Col>
          </Row>
          <Row>
            <Col span={24} style={colCommonStyles}>
              <LatestApps />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
