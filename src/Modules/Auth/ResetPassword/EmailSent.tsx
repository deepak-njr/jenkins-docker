import { Row, Col, Typography, Image } from "antd";
import { OnBoarding } from "@components/index";
import VerifyIcon from "@assets/SVG/verifyIcon.svg";
import styles from "../Auth.module.scss";

const { Title, Text } = Typography;

export const EmailSent = () => {
  return (
    <OnBoarding>
      <Row>
        <Col span={18} offset={3}>
          <Title level={2} style={{ textAlign: "center" }}>
            Email Verification
          </Title>
          <Col
            span={24}
            style={{ marginTop: styles.whitespace3, textAlign: "center" }}
          >
            <Image src={VerifyIcon} preview={false} />
          </Col>
          <Col
            span={24}
            style={{ marginTop: styles.whitespace3, textAlign: "center" }}
          >
            <Typography.Text className={styles.loginDontText}>
              We have sent you a verification email to the registered email
              address. Please click on the verify button in the email to reset
              password.
            </Typography.Text>
          </Col>
        </Col>
      </Row>
    </OnBoarding>
  );
};
