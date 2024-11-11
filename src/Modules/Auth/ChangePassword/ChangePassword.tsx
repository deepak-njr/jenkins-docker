import { Row, Col, Typography, Button, Form, Input, Image } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Formik } from "formik";
import { OnBoarding } from "@components/index";
import { useAuth } from "@hooks/useAuth";
import { useNotification } from "@hooks/useNotification";
import VerifyIcon from "@assets/SVG/verifyIcon.svg";

import { isNull } from "lodash";
import { useEffect } from "react";
import { post } from "~/Services";

import styles from "../Auth.module.scss";

const { Title, Text } = Typography;

export const ChangePassword = () => {
  const navigate = useNavigate();
  const { openNotification, openToast } = useNotification();
  const { user } = useAuth();
  useEffect(() => {
    if (isNull(user)) {
      navigate("/auth/login");
    }
  }, []);

  return (
    <OnBoarding>
      <Row>
        <Icon
          onClick={() => navigate(-1)}
          icon="akar-icons:arrow-left"
          style={{
            fontSize: "1.8rem",
            cursor: "pointer",
            color: styles.primary,
            marginTop: styles.whitespace1
          }}
        />
        <Col offset={3}>
          <Title level={2} style={{ textAlign: "center" }}>
            Change Password
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
                OldPassword: "",
                NewPassword: "",
                ConfirmNewPassword: "",
              }}
              validate={(values) => {
                let errors = {};
                const regex =
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/i;
                if (!values.OldPassword) {
                  return (errors = {
                    OldPassword: "Enter old password",
                  });
                }
                if (!regex.test(values.NewPassword)) {
                  return (errors = {
                    NewPassword: "Password did not match our criteria",
                  });
                }
                if (values.NewPassword !== values.ConfirmNewPassword) {
                  return (errors = {
                    ConfirmNewPassword: "Passwords did not match",
                  });
                }

                return errors;
              }}
              onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true);
                post("userprofile/changePassword ", values)
                  .then((res) => {
                    if (res) {
                      openNotification({
                        title: "Success",
                        message: "Password changed",
                        type: "success",
                      });
                      navigate("/auth/login");
                      window.location.reload();
                    }
                    setSubmitting(false);
                  })
                  .catch((err) => {
                    // openToast({
                    //   content: err,
                    //   type: "error",
                    // })
                    setSubmitting(false);
                  });
              }}
            >
              {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
                <Form layout="vertical" onFinish={handleSubmit}>
                  <Form.Item label="Old Password">
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
                      name="OldPassword"
                      className={
                        errors.OldPassword && touched.OldPassword
                          ? styles.inputErrorFiled
                          : ""
                      }
                      value={values.OldPassword}
                      onChange={handleChange}
                    />
                    {errors.OldPassword && touched.OldPassword && (
                      <Text type="danger">{errors.OldPassword}</Text>
                    )}
                  </Form.Item>
                  <Form.Item label="New Password">
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
                      name="NewPassword"
                      className={
                        errors.NewPassword && touched.NewPassword
                          ? styles.inputErrorFiled
                          : ""
                      }
                      value={values.NewPassword}
                      onChange={handleChange}
                    />
                    {errors.NewPassword && touched.NewPassword && (
                      <Text type="danger">{errors.NewPassword}</Text>
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
                      name="ConfirmNewPassword"
                      className={
                        errors.ConfirmNewPassword && touched.ConfirmNewPassword
                          ? styles.inputErrorFiled
                          : ""
                      }
                      value={values.ConfirmNewPassword}
                      onChange={handleChange}
                    />
                    {errors.ConfirmNewPassword &&
                      touched.ConfirmNewPassword && (
                        <Text type="danger">{errors.ConfirmNewPassword}</Text>
                      )}
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.loginButton}
                      size="large"
                      loading={isSubmitting}
                      block
                    >
                      Change Password
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Formik>
          </Col>
        </Col>
      </Row>
    </OnBoarding >
  );
};
