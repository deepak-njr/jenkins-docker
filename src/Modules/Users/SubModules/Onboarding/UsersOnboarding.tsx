import React, { useState } from "react";
import { ContentWrapper } from "@components/index";
import { Col, Modal, Radio, Row, Space, Typography } from "antd";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

import styles from "../../Users.module.scss";
import { SingleUser } from "./SingleUser";
import { MultipleUsers } from "./MultipleUsers";

export const UsersOnboarding = () => {
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
                onOk: () => navigate("/users"),
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
            User Onboarding
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
            <Radio value="single">Single User</Radio>
            <Radio value="multiple">Mutiple User</Radio>
          </Radio.Group>
        </Col>
      </Row>
      <Row style={{ marginTop: styles.whitespace3 }}>
        <Col xs={24} md={16}>
          {selectionType === "single" && <SingleUser />}
          {selectionType === "multiple" && <MultipleUsers />}
        </Col>
      </Row>
    </ContentWrapper>
  );
};
