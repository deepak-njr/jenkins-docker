import { Icon } from "@iconify/react";
import {
  Button,
  Col,
  Dropdown,
  Layout,
  Menu,
  Radio,
  Row,
  Space,
  Typography,
} from "antd";
import { isBoolean } from "lodash";
import { memo, useContext, useEffect, useState } from "react";

import styles from "../ApplicationOnboarding.module.scss";
import { ApplicationOnboardingContext } from "../Wrapper";
import { NewApplication } from "./New/NewApplication";
import { Purchased } from "./Purchased/Purchased";

export const ApplicationDetails = memo(() => {
  const [applicationQuantity, setapplicationQuantity] = useState<string>("");
  const { onBoardingType, setOnBoardingType, formData, setFormData } =
    useContext(ApplicationOnboardingContext);

  const preselect = () => {
    if (!formData || !formData.application) {
      setapplicationQuantity("");
      return;
    }

    const { isSingle } = formData.application;
    setapplicationQuantity(
      isBoolean(isSingle) && Boolean(isSingle) === true ? "single" : "multiple"
    );
  };
  useEffect(() => {
    if (onBoardingType) {
      preselect();
      setTimeout(() => {
        if (onBoardingType === "New") {
          setFormData(
            formData
              ? formData
              : {
                  application: {
                    isSingle: true,
                  },
                }
          );
          setapplicationQuantity("single");
          return;
        }
      }, 100);
    }
  }, [onBoardingType]);

  useEffect(() => {
    preselect();
  }, []);

  return (
    <Layout style={{ background: styles.white }}>
      <Typography.Title level={5}>Type of Application</Typography.Title>
      <Row>
        <Col span={24}>
          <Space direction="vertical" size={"large"}>
            <Dropdown
              overlay={
                <Menu
                  onClick={(e) => setOnBoardingType(e.key)}
                  items={[
                    {
                      key: "Purchased",
                      label: "Purchased",
                    },
                    {
                      key: "New",
                      label: "New",
                    },
                  ]}
                />
              }
            >
              <Button style={{ width: 130, justifyContent: "space-between" }}>
                {onBoardingType}
                <Icon
                  icon="akar-icons:chevron-down"
                  style={{ marginLeft: styles.whitespace1 }}
                />
              </Button>
            </Dropdown>
            {/* 
            <Radio.Group
              value={applicationQuantity}
              onChange={(e) => setapplicationQuantity(e.target.value)}
            >
              <Radio value="single">Single Application</Radio>
              <Radio value="multiple">Mutiple Applications</Radio>
            </Radio.Group> */}
          </Space>
        </Col>
      </Row>
      {onBoardingType === "Purchased" && (
        <Row style={{ marginTop: styles.whitespace3 }}>
          <Col>
            <Radio.Group
              value={applicationQuantity}
              onChange={(e) => {
                setapplicationQuantity(e.target.value);
                setFormData({
                  ...formData,
                  application: {
                    isSingle: e.target.value === "single",
                  },
                });
              }}
            >
              <Radio value="single">Single Application</Radio>
              <Radio value="multiple">Mutiple Applications</Radio>
            </Radio.Group>
          </Col>
        </Row>
      )}

      <Row style={{ marginTop: styles.whitespace3 }}>
        <Col xs={24} md={23}>
          {onBoardingType === "Purchased" && <Purchased />}
          {onBoardingType === "New" && <NewApplication />}
        </Col>
      </Row>
    </Layout>
  );
});
