import { Icon } from "@iconify/react";
import { Col, Modal, Radio, Row, Space, Typography } from "antd";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContentWrapper } from "~/Components";

import styles from "../../Departments.module.scss";
import { MultipleOnboarding } from "./MultipleOnboarding";
import { SingleOnboarding } from "./SingleOnboarding";

export const DepartmentsOnboarding = () => {
  const [selectionType, setSelectionType] = useState("");

  const navigate = useNavigate();

  return (
    <ContentWrapper
      customTitle={
        <Space style={{ alignItems: "center", lineHeight: 1 }}>
          <Icon
            onClick={() => {
              Modal.confirm({
                className: styles.confirmModal,
                title: "",
                icon: "",
                okText: "Go Back",
                onOk: () => navigate("/departments"),
                content: (
                  <Row gutter={16} style={{ textAlign: "center" }}>
                    <Col span={24}>
                      <Typography.Text>
                        By going back you will loose all filled user details
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
          <Typography.Title level={3} style={{ margin: 0 }}>
            Department Onboarding
          </Typography.Title>
        </Space>
      }
    >
      {/* <Row>
        <Col span={24}>
          <Typography.Text>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum
            veritatis tenetur fugit accusamus temporibus iste? Dolorem,
            officiis. Nisi aperiam incidunt voluptates delectus nobis explicabo,
            quos tenetur deserunt laudantium, pariatur saepe.
          </Typography.Text>
        </Col>
      </Row> */}
      <Row style={{ marginTop: styles.whitespace3 }}>
        <Col>
          <Typography.Title level={5}>Type of Onboarding</Typography.Title>
          <Radio.Group
            value={selectionType}
            onChange={(e) => {
              setSelectionType(e.target.value);
            }}
          >
            <Radio value="single">Single Department</Radio>
            <Radio value="multipleDepartment">Mutiple Departments</Radio>
          </Radio.Group>
        </Col>
      </Row>
      <Row style={{ marginTop: styles.whitespace3 }}>
        <Col xs={24} md={16}>
          {selectionType === "single" && <SingleOnboarding />}
          {selectionType === "multipleDepartment" && <MultipleOnboarding department={"multipleDepartment"} />}
        </Col>
      </Row>
    </ContentWrapper>
  );
};
