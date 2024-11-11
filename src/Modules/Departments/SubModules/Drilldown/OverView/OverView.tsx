import { Col, Row } from "antd";
import styles from "@styles/variables.module.scss";
import { TotalSpend } from "./Components/TotalSpend";
import { NoOfUsers } from "./Components/NoOfUsers";
import { NoOfApplications } from "./Components/NoOfApplications";
import { AppAvgUsage } from "./Components/AppAvgUsage";
import { AppAvgSpend } from "./Components/AppAvgSpend";
import { Budget } from "./Components/Budget";
import { NoOfProjects } from "./Components/NoofProjects";

interface Props {
  avgCost: number;
  users: number;
  apps: number;
  projectCount: number;
}

export const OverView = ({ avgCost, users, apps, projectCount }: Props) => {
  return (
    <Row gutter={16}>
      <Col span={24}>
        <Row gutter={16}>
          <Col
            style={{ marginBottom: styles.whitespace2 }}
            xs={24}
            md={12}
            lg={6}
          >
            <TotalSpend cost={avgCost} />
          </Col>
          <Col
            style={{ marginBottom: styles.whitespace2 }}
            xs={24}
            md={12}
            lg={6}
          >
            <NoOfUsers users={users} />
          </Col>
          <Col
            style={{ marginBottom: styles.whitespace2 }}
            xs={24}
            md={12}
            lg={6}
          >
            <NoOfApplications apps={apps} />
          </Col>
          <Col
            style={{ marginBottom: styles.whitespace2 }}
            xs={24}
            md={12}
            lg={6}
          >
            <NoOfProjects projectCount={projectCount} />
          </Col>
        </Row>
        <Row gutter={16}>                    
          <Col md={24} lg={12} className="chartAvgUsage" style={{ marginBottom: styles.whitespace2 }}>
            <AppAvgUsage users={users} />
          </Col>
          <Col md={24} lg={12} className="chartAvgSpend" style={{ marginBottom: styles.whitespace2 }}>
            <AppAvgSpend />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24} style={{ marginBottom: styles.whitespace2 }}>
            <Budget />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
