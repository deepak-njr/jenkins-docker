import { Row, Col, Typography, Button, Form, Image } from "antd";
import { useNavigate } from "react-router-dom";
import { OnBoarding } from "@components/index";
import VerifyIcon from "@assets/SVG/verifyIcon.svg";
import styles from "../Auth.module.scss";
import { useAuth } from "@hooks/useAuth";

const { Title } = Typography;

export const PasswordUpdatedMessage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <OnBoarding>
      <Row>
        <Col
          span={18}
          offset={3}
        >
          <Title
            level={2}
            style={{ textAlign: "center" }}
          >
            Password Updated!
          </Title>
          <Col
            span={24}
            style={{ marginTop: styles.whitespace3, textAlign: "center" }}
          >
            <Image
              src={VerifyIcon}
              preview={false}
            />
          </Col>

          <Col span={24}>
            <Form layout="vertical">
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
                      Your password has been successfully updated
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
                  onClick={() => {
                    if (!user) {
                      navigate("/auth/login");
                    } else {
                      logout();
                    }
                  }}
                >
                  Log In
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Col>
      </Row>
    </OnBoarding>
  );
};
