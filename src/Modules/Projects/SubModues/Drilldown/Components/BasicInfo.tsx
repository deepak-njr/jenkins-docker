import { WrapperCard } from "@components/index";
import { Icon } from "@iconify/react";
import { Button, Col, Row, Space, Typography } from "antd";

import styles from "@styles/variables.module.scss";
import moment from "moment";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { permissions } from "~/Utils/Roles";
import { useState } from "react";

export const BasicInfo = ({
  projectManager,
  department,
  applicationsCount,
  startDate,
  fetchUser,
  endDate,
  projectCode,
}: {
  projectManager: string;
  department: string;
  applicationsCount: string;
  startDate: string;
  endDate: string;
  projectCode: any;
  fetchUser: () => void;
}) => {
  const { hasPermissions } = useHasAccess();
  const [openModal, setOpenModal] = useState(false);

  return (
    <WrapperCard title="Project Details">
      <Space
        style={{ display: "flex", width: "100%" }}
        direction="vertical"
        size={"large"}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text
              style={{ color: styles.primary }}
              strong
            >
              Project Code
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{projectCode}</Typography.Text>
          </Col>
        </Row>
        {projectManager && projectManager[0] && (
          <Row gutter={16}>
            <Col span={12}>
              <Typography.Text
                style={{ color: styles.primary }}
                strong
              >
                Project Manager
              </Typography.Text>
            </Col>
            <Col span={12}>
              <Typography.Text>{projectManager[0]}</Typography.Text>
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text
              style={{ color: styles.primary }}
              strong
            >
              Department
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{department}</Typography.Text>
          </Col>
        </Row>
        {projectManager && projectManager[1] && (
          <Row gutter={16}>
            <Col span={12}>
              <Typography.Text
                style={{ color: styles.primary }}
                strong
              >
                Secondary Contact
              </Typography.Text>
            </Col>
            <Col span={12}>
              <Typography.Text>{projectManager[1]}</Typography.Text>
            </Col>
          </Row>
        )}
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text
              style={{ color: styles.primary }}
              strong
            >
              Applications Count
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{applicationsCount}</Typography.Text>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text
              style={{ color: styles.primary }}
              strong
            >
              Start Date
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{moment(startDate, "YYYY-MM-DD").format("DD MMM YYYY")}</Typography.Text>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text
              style={{ color: styles.primary }}
              strong
            >
              End Date
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text> {moment(endDate, "YYYY-MM-DD").format("DD MMM YYYY")}</Typography.Text>
          </Col>
        </Row>
      </Space>
    </WrapperCard>
  );
};
