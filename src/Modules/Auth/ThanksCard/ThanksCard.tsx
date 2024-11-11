import { Row, Col, Typography, Image } from "antd";
import { OnBoarding } from "@components/index";
import ThanksCardSvg from "@assets/SVG/thanking-vector.svg";
import styles from "../Auth.module.scss";

const { Title } = Typography;

export const ThanksCard = () => {
  return (
    <OnBoarding>
      <Row>
        <Col span={18} offset={3}>
          <Title level={2} style={{ textAlign: "center" }}>
            Thank You!
          </Title>
          <Col span={24}>
            <Image src={ThanksCardSvg} preview={false} />
          </Col>
          <Row>
            <Col
              span={24}
              style={{ marginTop: styles.whitespace3, textAlign: "center" }}
            >
              <Typography.Text className={styles.loginDontText}>
                Your details has been submitted &amp; this is currently under
                verification. You will receive an email once it is verified.
              </Typography.Text>
            </Col>
          </Row>
        </Col>
      </Row>
    </OnBoarding>
  );
};
