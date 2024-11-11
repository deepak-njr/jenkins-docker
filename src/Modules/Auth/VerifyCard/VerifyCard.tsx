import { Row, Col, Typography, Button, Form, Input, Image, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { OnBoarding } from "@components/index";
import { useQuery } from "@hooks/useQuery";
import { useNotification } from "@hooks/useNotification";
import VerifyIcon from "@assets/SVG/verifyIcon.svg";
import { useEffect, useState } from "react";
import { api, post } from "~/Services";
import styles from "../Auth.module.scss";

const { Title, Text } = Typography;

export const VerifyCard = () => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<{ [key in string]: string }>();
  const query = useQuery();
  const { openToast } = useNotification();
  const emailAddress = query.get("emailAddress") || "";

  useEffect(() => {
    if (query) {
      const verificationToken = query.get("verificationToken");
      const emailAddress = query.get("emailAddress");
      if (verificationToken && emailAddress) {
        setUserDetails({ verificationToken, emailAddress });
      }
    }
  }, [query]);
  const [newVal, setNewVal] = useState({ authenticationcode: userDetails?.verificationToken || "" });
  const handleAuthenticationCode = () => {
    const formData = new FormData();
    formData.append("emailAddress", emailAddress);
    api
      .post(`v1/user/details/resend-activation-code`, formData)
      .then(() => {
        message.success("Authentication code sent successfully");
        setNewVal({
          authenticationcode: "",
        });
      })
      .catch(() => {
        message.error("Failed to send authentication");
      });
  };

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
            Verify
          </Title>
          <Row>
            <Col
              span={24}
              style={{ marginTop: styles.whitespace3, textAlign: "center" }}
            >
              <Typography.Text className={styles.loginDontText}>
                Please enter the authentication code received in your email
              </Typography.Text>
            </Col>
          </Row>
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
            <Formik
              enableReinitialize
              initialValues={newVal}
              validate={(values) => {
                let errors = {};

                if (!values.authenticationcode.trim()) {
                  return (errors = {
                    authenticationcode: "Incorrect authentication code",
                  });
                }

                return errors;
              }}
              onSubmit={(values, action) => {
                post(
                  `userprofile/verify-email?emailAddress=${userDetails?.emailAddress}&verificationToken=${values.authenticationcode}`,
                  {}
                )
                  .then((res) => {
                    if (res) {
                      navigate("/auth/signup/success");
                      action.resetForm();
                    }
                  })
                  .catch((err) => {
                    // openToast({
                    //   content: err,
                    //   type: "error",
                    // });
                  });
              }}
            >
              {({ values, errors, touched, handleChange, handleSubmit, resetForm }) => (
                <Form
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Form.Item label="Authentication code">
                    <Input
                      name="authenticationcode"
                      type={"text"}
                      size="large"
                      value={values.authenticationcode}
                      onChange={handleChange}
                      className={errors.authenticationcode && touched.authenticationcode ? styles.inputErrorFiled : ""}
                    />
                    {errors.authenticationcode && touched.authenticationcode && (
                      <Text type="danger">{errors.authenticationcode}</Text>
                    )}
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.loginButton}
                      size="large"
                      block
                    >
                      Submit
                    </Button>
                  </Form.Item>
                  <Button
                    block
                    size="small"
                    type="link"
                    onClick={() => {
                      resetForm();
                      handleAuthenticationCode();
                    }}
                  >
                    Resend Authentication Code
                  </Button>
                </Form>
              )}
            </Formik>
          </Col>
        </Col>
      </Row>
    </OnBoarding>
  );
};
