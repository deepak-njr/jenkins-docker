import { Row, Col, Typography, Button, Form, Input, Space, Image } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Formik } from "formik";
import { OnBoarding } from "@components/index";
import VerifyIcon from "@assets/SVG/verifyIcon.svg";
import styles from "../Auth.module.scss";
import { useQuery } from "~/Hooks/useQuery";
import * as yup from "yup";
import { post } from "~/Services";
import { useNotification } from "~/Hooks/useNotification";
import { has } from "lodash";
import { useState } from "react";
const { Title, Text } = Typography;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const query = useQuery();
const { openNotification, openToast } = useNotification();
const [isLoading, setIsLoading] = useState(false);

  return (
    <OnBoarding>
      <Row>
        <Col span={18} offset={3}>
          <Title level={2} style={{ textAlign: "center" }}>
            Reset Password
          </Title>
          <Col
            span={24}
            style={{ marginTop: styles.whitespace3, textAlign: "center" }}
          >
            <Image src={VerifyIcon} preview={false} />
          </Col>
          <Col span={24}>
            <Formik
              initialValues={{
                password: "",
                confirmPassword: "",
              }}
              validationSchema={yup.object().shape({
                password: yup
                  .string()
                  .matches(
                    new RegExp(
                      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
                    ),
                    "Please enter valid password"
                  )
                  .required("Password required")
                  .min(8),
                confirmPassword: yup
                  .string()
                  .matches(
                    new RegExp(
                      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
                    ),
                    "Please enter valid password"
                  )
                  .required("Confirm password Required")
                  .min(8)
                  .oneOf([yup.ref("password"), null], "Passwords must match"),
              })}
              onSubmit={(values, action) => {
                if (
                  !query.get("emailAddress") ||
                  !query.get("verificationToken")
                ) {
                  return;
                }
                setIsLoading(true);
                post("userprofile/reset-password", {
                  confirmNewPassword: values.confirmPassword,
                  emailAddress: query.get("emailAddress"),
                  newPassword: values.password,
                  passwordResetCode: query.get("verificationToken"),
                })
                  .then((res: any) => {
                    if (has(res, "status") && res.status) {
                      setIsLoading(false);
                      openNotification({
                        title: "Success",
                        message: res.message,
                        type: "success",
                      });
                      navigate("/auth/password-updated-message");
                      action.resetForm();
                    }
                  })
                  .catch((err: any) => {
                    openToast({ content: err, type: "error" });
                    setIsLoading(false);
                  });
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isValid,
                dirty,
              }) => (
                <Form layout="vertical" onFinish={handleSubmit}>
                  <Form.Item
                    label="New Password"
                    tooltip={{
                      placement: "right",
                      color: "#fff",
                      icon: <Icon icon="bi:info-circle-fill" color="gray" />,
                      overlayInnerStyle: {
                        width: 300,
                      },
                      title: (
                        <>
                          <Typography.Text style={{ color: styles.primary }}>
                            Password must:
                          </Typography.Text>

                          <ul
                            style={{
                              paddingLeft: 0,
                              listStyleType: "circle",
                            }}
                          >
                            {[
                              {
                                title:
                                  "Have at least one capital letter, one lower case letter",
                              },
                              {
                                title:
                                  "Have at least one special character & number",
                                subText: "Ex: Abcd@123",
                              },
                              {
                                title: "Not be same as the email",
                              },
                              {
                                title: "Have at least 8 characters",
                              },
                            ].map(
                              (item: { title: string; subText?: string }) => (
                                <li>
                                  <Space align="start" size="small">
                                    <Typography.Text>
                                      <Icon icon="bi:dot" fontSize={20} />
                                    </Typography.Text>
                                    <Typography.Text>
                                      {item.title}
                                      {item.subText && (
                                        <Typography.Text
                                          style={{
                                            color: styles.primary,
                                            display: "flex",
                                          }}
                                        >
                                          {item.subText}
                                        </Typography.Text>
                                      )}
                                    </Typography.Text>
                                  </Space>
                                </li>
                              )
                            )}
                          </ul>
                        </>
                      ),
                    }}
                  >
                    <Input.Password
                      size="large"
                      iconRender={(visible) =>
                        visible ? (
                          <Icon
                            icon="akar-icons:eye-open"
                            color={styles.gray}
                          />
                        ) : (
                          <Icon
                            icon="akar-icons:eye-closed"
                            color={styles.gray}
                          />
                        )
                      }
                      name="password"
                      className={
                        errors.password && touched.password
                          ? styles.inputErrorFiled
                          : ""
                      }
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.password && touched.password && (
                      <Text type="danger">{errors.password}</Text>
                    )}
                  </Form.Item>
                  <Form.Item label="Confirm Password">
                    <Input.Password
                      size="large"
                      iconRender={(visible) =>
                        visible ? (
                          <Icon
                            icon="akar-icons:eye-open"
                            color={styles.gray}
                          />
                        ) : (
                          <Icon
                            icon="akar-icons:eye-closed"
                            color={styles.gray}
                          />
                        )
                      }
                      name="confirmPassword"
                      className={
                        errors.confirmPassword && touched.confirmPassword
                          ? styles.inputErrorFiled
                          : ""
                      }
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <Text type="danger">{errors.confirmPassword}</Text>
                    )}
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.loginButton}
                      disabled={!(isValid && dirty)}
                      size="large"
                      loading={isLoading}
                      block
                    >
                      Reset Password
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Formik>
            <Row>
              <Col
                span={24}
                style={{ marginTop: styles.whitespace3, textAlign: "center" }}
              >
                <Typography.Text className={styles.loginDontText}>
                  Go back to <Link to="/auth/login">Login</Link>
                </Typography.Text>
              </Col>
            </Row>
          </Col>
        </Col>
      </Row>
    </OnBoarding>
  );
};
