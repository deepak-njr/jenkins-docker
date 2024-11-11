import * as yup from "yup";

import { Button, Checkbox, Col, Divider, Form, Image, Input, Modal, Row, Typography } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { Formik } from "formik";
import { Icon } from "@iconify/react";
import { OnBoarding } from "@components/index";
import SaasPE from "@assets/SVG/logo.svg";
import SessionLogout from "@assets/SVG/sessionLogout.svg";
import { SignInWithAzureAD } from "./SignInWithAzureAD";
import microsoft from "@assets/PNG/microsoft.png";
import microsoftbg from "@assets/PNG/microsoft-login-bg.png";
import { post } from "~/Services";
import { reactAuthFlow } from "~/Utils";
import { strings } from "~/Utils/Strings";
import styles from "../Auth.module.scss";
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export const Login = () => {
  const navigate = useNavigate();
  const { isLoading } = useAuth();
  const { state }: any = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if ((state && state.sessionExpired) || (window.history.state && window.history.state.sessionExpired)) {
      setOpen(true);
    }
  }, [state]);
  const handleModal = () => {
    setOpen(false);
    window.history.replaceState({}, document.title);
  };

  const onLogin = async (data: any) => {
    post("userprofile/login", data).then((res: any) => {
      if (res.response.data) {
        localStorage.setItem("userEmail", data.emailAddress);
        navigate("/auth/verify-otp");
      }
    });
  };

  return (
    <OnBoarding>
      {reactAuthFlow !== "AZURE" ? (
        <Row>
          <Col
            span={18}
            offset={3}
          >
            <Title
              level={2}
              className={styles.textCenter}
            >
              Login
            </Title>

            <Col span={24}>
              <Formik
                initialValues={{ emailAddress: "", password: "" }}
                validationSchema={yup.object().shape({
                  emailAddress: yup
                    .string()
                    .strict(true)
                    .lowercase("Email address must be a lowercase")
                    .email("Please enter valid email address")
                    .required("Email address required"),
                  password: yup
                    .string()
                    .matches(
                      new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
                      "Please enter valid password"
                    )
                    .trim("Email Message cannot include leading and trailing spaces")
                    .strict(true)
                    .required("Password required")
                    .min(8),
                })}
                onSubmit={(values) => {
                  onLogin(values);
                }}
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid, dirty }) => {
                  return (
                    <>
                      <Form
                        layout="vertical"
                        onFinish={handleSubmit}
                      >
                        <Form.Item label="Email">
                          <Input
                            name="emailAddress"
                            size="large"
                            value={values.emailAddress}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.emailAddress && touched.emailAddress ? styles.inputErrorFiled : ""}
                          />
                          {errors.emailAddress && touched.emailAddress && (
                            <Text type="danger">{errors.emailAddress}</Text>
                          )}
                        </Form.Item>
                        <Form.Item label="Password">
                          <Input.Password
                            size="large"
                            onBlur={handleBlur}
                            iconRender={(visible) =>
                              visible ? (
                                <Icon
                                  icon="akar-icons:eye-open"
                                  style={{ cursor: "pointer", color: styles.gray }}
                                />
                              ) : (
                                <Icon
                                  icon="akar-icons:eye-closed"
                                  style={{ cursor: "pointer", color: styles.gray }}
                                />
                              )
                            }
                            name="password"
                            className={errors.password && touched.password ? styles.inputErrorFiled : ""}
                            value={values.password}
                            onChange={handleChange}
                          />
                          {errors.password && touched.password && <Text type="danger">{errors.password}</Text>}
                        </Form.Item>
                        <Row
                          style={{ marginBottom: styles.whitespace2 }}
                          gutter={16}
                          justify="space-between"
                        >
                          <Col>
                            {/* <Checkbox>Remember me</Checkbox>s */}
                          </Col>
                          <Col>
                            <Link
                              className={styles.loginFormForgot}
                              to="/auth/verify-email"
                            >
                              Forgot password ?
                            </Link>
                          </Col>
                        </Row>
                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            className={styles.loginButton}
                            size="large"
                            block
                            loading={isLoading}
                          >
                            Log in
                          </Button>
                        </Form.Item>
                      </Form>
                      <Modal
                        open={open}
                        closable={false}
                        maskClosable={false}
                        footer={null}
                        centered
                        width={500}
                      >
                        <Row justify="center">
                          <Col>
                            <Image
                              src={SessionLogout}
                              preview={false}
                            />
                          </Col>
                        </Row>
                        <Row
                          justify="center"
                          style={{ margin: styles.whitespace2 }}
                        >
                          <Col className={styles.textCenter}>
                            <h3 style={{ fontWeight: "bold", color: "red", paddingBottom:  styles.whitespace2 }}>
                              {strings.sessionExpired}
                            </h3>
                            <Text>{strings.sessionExpireMsg}</Text>
                          </Col>
                        </Row>
                        <Row
                          justify="center"
                          style={{ margin: 20 }}
                        >
                          <Col>
                            <Button
                              key="submit"
                              type="primary"
                              onClick={() => handleModal()}
                            >
                              {strings.ok}
                            </Button>
                          </Col>
                        </Row>
                      </Modal>
                    </>
                  );
                }}
              </Formik>
            </Col>
            <Divider>
              <Text
                type="secondary"
                style={{ fontSize: "0.875rem" }}
              >
                OR LOGIN WITH BELOW OPTIONS
              </Text>
            </Divider>
            <>
              {/* SSO holders  */}
              {reactAuthFlow === "BOTH" && <SignInWithAzureAD />}
            </>
            <Row>
              <Col
               className={styles.textCenter}
                span={24}
                style={{ marginTop: styles.whitespace3}}
              >
                <Typography.Text className={styles.loginDontText}>
                  Don't have an account? <Link to="/auth/signup">Sign Up</Link>
                </Typography.Text>
              </Col>
            </Row>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col
            span={18}
            offset={3}
          >
            <Title
              level={2}
              className={styles.textCenter}
            >
              Log In to CLM
            </Title>
            <Col
              span={18}
              offset={8}
              style={{ marginTop: styles.whitespace4 }}
            >
              <img
                src={microsoft}
                alt="microsoft"
              />
            </Col>
            <Col
            className={styles.textCenter}
              span={27}
              style={{ padding: `${styles.whitespace4} 0px`, color: styles.gray }}
            >
              Effortlessly sign in with Microsoft for a secure and streamlined authentication experience
            </Col>
            <Col span={27}></Col>
          </Col>
        </Row>
      )}
      {reactAuthFlow === "AZURE" && <SignInWithAzureAD />}
    </OnBoarding>
  );
};
