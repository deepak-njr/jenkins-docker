import { Row, Col, Typography, Button, Form, Input, Image, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Formik } from "formik";
import { OnBoarding } from "@components/index";
import VerifyIcon from "@assets/SVG/verifyIcon.svg";
import { useQuery } from "@hooks/useQuery";
import styles from "../Auth.module.scss";
import { api, post } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { has } from "lodash";

const { Title, Text } = Typography;

const Tooltip = () => {
  return (
    <ul className={styles.tooltipLine}>
      <Title level={5}>Password must</Title>
      <li>Have at least one capital letter , one lower case letter</li>
      <li>
        Have at least one special characher &amp; number
        <br />
        <Text className={styles.listEx}>Ex: Abcd@123</Text>
      </li>
      <li>Not be same as the email</li>
      <li>Have atleast 8 characters</li>
      <li>Not be same as the last three passwords</li>
    </ul>
  );
};
export const CreatePasswordCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { openToast } = useNotification();
  const navigate = useNavigate();
  const query = useQuery();
  const emailAddress = query.get("userEmail") || "";
  const [newVal, setNewVal] = useState({
    verificationCode: "",
    password: "",
    confirmPassword: "",
  });
  const onHandleVerification = () => {
    const formData = new FormData();
    setNewVal({
      verificationCode: "",
      password: "",
      confirmPassword: "",
    });
    formData.append("emailAddress", emailAddress);
    api
      .post(`v1/user/details/resend-activation-code`, formData)
      .then(() => {
        message.success("Verification code sent successfully");
        setIsButtonDisabled(true);
      })
      .catch(() => {
        message.error("Failed to send verification");
      });
  };

  useEffect(() => {});
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
            Create Password
          </Title>
          <Row>
            <Col
              span={24}
              style={{ marginTop: styles.whitespace1, textAlign: "center" }}
            >
              <Typography.Text className={styles.loginDontText}>
                Please enter the verification code received in your email
              </Typography.Text>
            </Col>
          </Row>
          <Col
            span={24}
            style={{ marginTop: styles.whitespace3, marginBottom: styles.whitespace, textAlign: "center" }}
          >
            <Image
              src={VerifyIcon}
              preview={false}
            />
          </Col>
          <Col
            span={24}
            style={{ marginTop: styles.whitespace3 }}
          >
            <Formik
              initialValues={newVal}
              enableReinitialize={true}
              validationSchema={yup.object().shape({
                verificationCode: yup
                  .string()
                  .matches(new RegExp(/^[0-9]+$/), "Please enter valid verification code")
                  .required("Verification Code required")
                  .min(6)
                  .max(6),
                password: yup
                  .string()
                  .matches(
                    new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
                    "Please enter valid password"
                  )
                  .required("Password required")
                  .min(8),
                confirmPassword: yup
                  .string()
                  .matches(
                    new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
                    "Please enter valid password"
                  )
                  .required("Confirm password Required")
                  .min(8)
                  .oneOf([yup.ref("password"), null], "Passwords must match"),
              })}
              onSubmit={(values, action) => {
                if (!query.get("userEmail")) {
                  return;
                }
                setIsLoading(true);
                post("auth/create-password", {
                  userEmail: query.get("userEmail"),
                  verificationCode: values.verificationCode,
                  password: values.password,
                  confirmPassword: values.confirmPassword,
                })
                  .then((res: any) => {
                    if (res.status === "OK") {
                      setIsLoading(false);
                      navigate("/auth/password-updated-message");
                      action.resetForm();
                    }
                  })
                  .catch((err) => {
                    if (err === `Verification Code Expired`) {
                      setIsButtonDisabled(false);
                    }
                    // openToast({ content: err, type: "error" });
                    setIsLoading(false);
                  });
              }}
            >
              {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid, dirty, resetForm }) => {
                return (
                  <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                  >
                    <Form.Item label="Verification Code">
                      <Input
                        size="large"
                        name="verificationCode"
                        className={errors.verificationCode && touched.verificationCode ? styles.inputErrorFiled : ""}
                        value={values.verificationCode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.verificationCode && touched.verificationCode && (
                        <Text type="danger">{errors.verificationCode}</Text>
                      )}
                    </Form.Item>
                    <Form.Item
                      label="New Password"
                      tooltip={{
                        placement: "right",
                        color: "#fff",
                        icon: (
                          <Icon
                            icon="bi:info-circle-fill"
                            color="gray"
                          />
                        ),
                        overlayInnerStyle: {
                          width: 300,
                        },
                        title: (
                          <>
                            <Typography.Text style={{ color: styles.primary }}>Password must:</Typography.Text>

                            <ul
                              style={{
                                paddingLeft: 0,
                                listStyleType: "circle",
                              }}
                            >
                              {[
                                {
                                  title: "Have at least one capital letter, one lower case letter",
                                },
                                {
                                  title: "Have at least one special character & number",
                                  subText: "Ex: Abcd@123",
                                },
                                {
                                  title: "Not be same as the email",
                                },
                                {
                                  title: "Have at least 8 characters",
                                },
                              ].map((item: { title: string; subText?: string }) => (
                                <li>
                                  <Space
                                    align="start"
                                    size="small"
                                  >
                                    <Typography.Text>
                                      <Icon
                                        icon="bi:dot"
                                        fontSize={20}
                                      />
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
                              ))}
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
                        className={errors.password && touched.password ? styles.inputErrorFiled : ""}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.password && touched.password && <Text type="danger">{errors.password}</Text>}
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
                        className={errors.confirmPassword && touched.confirmPassword ? styles.inputErrorFiled : ""}
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
                        style={{ marginTop: styles.whitespace3 }}
                        size="large"
                        loading={isLoading}
                        block
                      >
                        Submit
                      </Button>
                      <Button
                      className={styles.resendButton}
                        size="small"
                        // disabled={isButtonDisabled}
                        type="link"
                        onClick={() => {
                          resetForm();
                          onHandleVerification();
                        }}
                        block
                      >
                        Resend Verification Code
                      </Button>
                    </Form.Item>
                  </Form>
                );
              }}
            </Formik>
          </Col>
        </Col>
      </Row>
    </OnBoarding>
  );
};
