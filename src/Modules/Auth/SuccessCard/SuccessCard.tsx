import { Row, Col, Typography, Button, Form } from "antd";
import { Icon } from "@iconify/react";
import { OnBoarding } from "@components/index";
import { useNavigate } from "react-router-dom";
import styles from "../Auth.module.scss";

const { Title } = Typography;

export const SuccessCard = () => {
  const navigate = useNavigate();
  const handleSubmit = () => {};
  return (
    <OnBoarding>
      <Row>
        <Col span={18} offset={3}>
          <Title level={2} style={{ textAlign: "center" }}>
            Success!
          </Title>
          <Col
            span={24}
            style={{ marginTop: styles.whitespace3, textAlign: "center" }}
          >
            <Icon
              icon="ep:success-filled"
              color={styles.primary}
              width="124"
              height="124"
            />
          </Col>
          <Col span={24}>
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item>
                <Row>
                  <Col
                    span={24}
                    style={{
                      marginTop: styles.whitespace3,
                      textAlign: "center",
                    }}
                  >
                    <Typography.Text className={styles.loginDontText}>
                      Your account set up completed successfully. Click on
                      continue to Login
                    </Typography.Text>
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className={styles.loginButton}
                  size="large"
                  block
                  onClick={
                    () => navigate("/auth/login")
                    //navigate("/auth/change-password")
                  }
                >
                  Continue
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Col>
      </Row>
    </OnBoarding>
  );
};
