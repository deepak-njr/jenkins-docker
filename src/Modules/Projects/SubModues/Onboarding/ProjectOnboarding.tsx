import { Icon } from "@iconify/react";
import { Space, Typography, Modal, Row, Col, Radio, Result } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { ContentWrapper } from "~/Components";

import { SingleProject } from "./SingleProject";

import styles from "../../Projects.module.scss";
import { MultipleProject } from "./MultipleProject";

const { confirm } = Modal;
export const ProjectOnboarding = () => {
  const [selectionType, setSelectionType] = useState();
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation() as any as {
    state: { departmentName: string };
  };

  return (
    <ContentWrapper
      customTitle={
        <Space style={{ alignItems: "center" }}>
          <Icon
            onClick={() => {
              confirm({
                className: styles.confirmModal,
                title: "",
                icon: "",
                okText: "Go Back",
                onOk: () => navigate(`/departments/${id}?activeTab=projects`),
                content: (
                  <Row gutter={16} style={{ textAlign: "center" }}>
                    <Col span={24}>
                      <Typography.Text>
                        By going back you will loose all filled project details
                      </Typography.Text>
                    </Col>
                  </Row>
                ),
              });
            }}
            icon="akar-icons:arrow-left"
            style={{
              fontSize: "1.8rem",
              cursor: "pointer",
              color: styles.primary,
              marginRight: styles.whitespace1,
            }}
          />
          <Space direction="vertical" size={4}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Project Onboarding
            </Typography.Title>
            <Typography.Text>
              {state?.departmentName} Department
            </Typography.Text>
          </Space>
        </Space>
      }
    >
      <Row style={{ marginTop: styles.whitespace3 }}>
        <Col>
          <Typography.Title level={5}>Type of Onboarding</Typography.Title>
          <Radio.Group
            value={selectionType}
            onChange={(e) => {
              setSelectionType(e.target.value);
            }}
          >
            <Radio value="single">Single Project</Radio>
            <Radio value="multiple">Mutiple Projects</Radio>
          </Radio.Group>
        </Col>
      </Row>
      <Row style={{ marginTop: styles.whitespace3 }}>
        <Col xs={24} md={16}>
          {selectionType === "single" && <SingleProject />}
          {selectionType === "multiple" && <MultipleProject />}
        </Col>
      </Row>
    </ContentWrapper>
  );
};
