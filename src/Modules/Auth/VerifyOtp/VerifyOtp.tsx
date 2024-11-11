import { Row, Col, Typography, Button, Form, Input, Image, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { OnBoarding } from "@components/index";
import { useQuery } from "@hooks/useQuery";
import { useNotification } from "@hooks/useNotification";
import VerifyIcon from "@assets/SVG/verifyIcon.svg";
import { useAuth } from "~/Hooks/useAuth";

import { useEffect, useState } from "react";
import { api, post } from "~/Services";

import styles from "../Auth.module.scss";
import { InputOTP } from "antd-input-otp";

const { Title, Text } = Typography;

export const VerifyOtp = () => {
  const { verifyOtp, isLoading, isButtonDisabled, resendOtp } = useAuth();
  const [value, setValue] = useState([]);
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<{ [key in string]: string }>();
  const query = useQuery();
  const { openToast } = useNotification();
  useEffect(() => {
    if (query) {
      const verificationToken = query.get("verificationToken");
      const emailAddress = query.get("emailAddress");
      if (verificationToken && emailAddress) {
        setUserDetails({ verificationToken, emailAddress });
      }
    }
  }, [query]);
  const onHandleOtp = (values: any) => {
    setValue(values);
  };

  const onHandleResendOtp = () => {
    resendOtp();
    setValue([]);
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
            Verify OTP
          </Title>
          <Row>
            <Col
              span={24}
              style={{ marginTop: styles.whitespace3, textAlign: "center" }}
            >
              <Typography.Text className={styles.loginDontText}>
                Please enter the one-time-password received in your email
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
              initialValues={{
                authenticationcode: value.filter((str: any) => str !== "").join("") || "",
              }}
              validate={(values) => {
                let errors = {};

                if (!values) {
                  return (errors = {
                    authenticationcode: "Incorrect OTP code",
                  });
                }

                return errors;
              }}
              onSubmit={(values, action) => {
                const payload = {
                  email: localStorage.getItem("userEmail"),
                  code: values.authenticationcode,
                };
                verifyOtp(payload);
              }}
            >
              {({ values, errors, touched, handleChange, handleSubmit }) => (
                <Form
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Form.Item label="One-Time-Password">
                    <InputOTP
                      name="authenticationcode"
                      type={"text"}
                      size="large"
                      value={value}
                      onChange={onHandleOtp}
                      maxLength={1}
                      isPreserveFocus={true}
                    />
                    {(errors.authenticationcode && touched.authenticationcode && (
                      <Text type="danger">{errors.authenticationcode}</Text>
                    )) ||
                      (values.authenticationcode.length !== 6 && touched.authenticationcode && (
                        <Text type="danger">{"Please enter 6 digit code"}</Text>
                      ))}
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.loginButton}
                      size="large"
                      block
                      loading={isLoading}
                      disabled={values.authenticationcode.length !== 6}
                    >
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Formik>
          </Col>
          <Button
            size="small"
            type="link"
            block
            // disabled={isButtonDisabled}
            onClick={onHandleResendOtp}
          >
            Resend OTP
          </Button>
        </Col>
      </Row>
    </OnBoarding>
  );
};
