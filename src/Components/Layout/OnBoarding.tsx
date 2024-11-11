import { Layout, Row, Col, Image, Card } from "antd";
import logo from "@assets/SVG/logo.svg";

import styles from "./Layout.module.scss";
import { imageKey, mediaHost } from "~/Utils";

export const OnBoarding = (props: any) => {
  return (
    <Layout.Content>
      <Row style={{ height: window.innerHeight }} align="middle">
        <Col
          xs={{ span: 0 }}
          md={{ span: 12 }}
          className={styles.rightSideSection}
        ></Col>
        <Col
          xs={{ span: 24 }}
          md={{ span: 12 }}
          className={styles.leftSideSection}
        >
          <div className={styles.onboardingContentWrapper}>
            <Row
              justify="center"
              style={{ width: "100%", marginBottom: styles.whitespace3 }}
            >
              <Col xs={{ span: 24 }} md={{ span: 16 }}>
                <Row gutter={8} justify="center" align="middle">
                  <Image src={`${mediaHost}/images/branding/logo.png${imageKey}`} width={295} height={52} preview={false} />
                </Row>
              </Col>
            </Row>
            <Row
              justify="center"
              align="middle"
              style={{ marginTop: styles.whitespace3, width: "100%" }}
            >
              <Col xs={{ span: 24 }} md={{ span: 18 }}>
                <Card
                  className={styles.cardStyle}
                  bodyStyle={{
                    width: "100%",
                    margin: "auto",
                    paddingBlock: styles.whitespace4,
                  }}
                >
                  {props.children}
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Layout.Content>
  );
};
