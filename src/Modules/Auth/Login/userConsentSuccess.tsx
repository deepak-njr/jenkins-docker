import { Row, Col, Typography, Button, Form, Divider, Input, Checkbox, Image, Modal } from "antd";
import { OnBoarding } from "@components/index";
import styles from "../Auth.module.scss";
import ThanksCardSvg from "@assets/SVG/thanking-vector.svg";
import AccessDenied from "@assets/SVG/access-denied.svg";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "~/Hooks/useQuery";

const { Title, Text } = Typography;

export const UserConsentSuccess = () => {
  const [showDenied, setShowDenied] = useState(false);
  const query = useQuery();

  useEffect(() => {
    const errorParam = query.get("error");

    if (errorParam === "access_denied") {
      setShowDenied(true);
    }
  }, []);

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
            {showDenied ? "Access Denied" : "Consent Success!"}
          </Title>
          <Col
            className={styles.textCenter}
            span={24}
          >
            {showDenied && (
              <Image
                className="access-denied"
                src={AccessDenied}
                preview={false}
              />
            )}
            {!showDenied && (
              <Image
                src={ThanksCardSvg}
                preview={false}
              />
            )}
          </Col>
          {showDenied && (
            <Col className="consent-access-denied" style={{ padding: `${styles.whitespace2} 0px`}}>
                <div>
                  <Typography.Text>User consent is a mandatory requirement for using Saaspe CLM.</Typography.Text>
                  </div>
                  <div>
                  <Typography.Text>
                    To ensure uninterrupted access and to continue benefiting from our services, we kindly ask you to
                    log in again and submit your consent.
                  </Typography.Text>
                  </div>
                  <div>
                  <Typography.Text>
                    If you have any questions about submitting consent, feel free to contact our support team
                  <a style={{ marginLeft: styles.whitespace1 }} href="mailto:support@saaspe.com">
                  support@saaspe.com.
                    </a>
                  </Typography.Text></div>
                  
              </Col>
          )}
          {!showDenied && (
            <Col className={styles.textCenter} >
              <Typography.Text style={{ padding: `${styles.whitespace2} 0px`, color: styles.gray }}>        
                Exciting news! Yours account
                 on DocuSign has been successfully created through Saaspe's seamless integration with Microsoft
              </Typography.Text>
            </Col>
          )}
          <Col
            className={styles.textCenter}
            span={24}
            style={{ marginTop: styles.whitespace1 }}
          >
            <Typography.Text className={styles.loginDontText}>
              Go back to <Link to="/auth/login">Login</Link>
            </Typography.Text>
          </Col>
        </Col>
      </Row>
    </OnBoarding>
  );
};
