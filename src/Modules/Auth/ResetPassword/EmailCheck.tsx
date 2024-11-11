import { Row, Col, Typography, Button, Form, Input, Image } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import { OnBoarding } from "@components/index";
import { post } from "@services/api.service";
import VerifyIcon from "@assets/SVG/verifyIcon.svg";
import styles from "../Auth.module.scss";
import * as yup from "yup";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "@hooks/useQuery";
import { useState } from "react";

const { Title, Text } = Typography;

export const EmailCheck = () => {
  const navigate = useNavigate();
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const query = useQuery();
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
            Reset Password
          </Title>
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
              initialValues={{
                emailAddress: "",
              }}
              validationSchema={yup.object().shape({
                emailAddress: yup
                  .string()
                  .strict(true)
                  .lowercase("Email address must be a lowercase")
                  .email("Please enter valid email address")
                  .required("Email address required"),
              })}
              onSubmit={(values, action) => {
                const formData = new FormData();
                formData.append("emailAddress", values.emailAddress);
                formData.append("redirectUrl", `${window.location.origin}/auth/reset-password`);
                setIsLoading(true);
                post(`/userprofile/reset-initiate`, formData)
                  .then((res) => {
                    if (res) {
                      setIsLoading(false);

                      navigate("/auth/verify-email/sent");
                      action.resetForm();
                    }
                  })
                  .catch((err) => {
                    setIsLoading(false);

                    // openToast({
                    //   content: err,
                    //   type: "error",
                    // });
                  });
              }}
            >
              {({ values, errors, touched, handleChange, handleSubmit, handleBlur, isValid, dirty }) => (
                <Form
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Form.Item label="Email">
                    <Input
                      name="emailAddress"
                      type={"text"}
                      size="large"
                      value={values.emailAddress}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      className={errors.emailAddress && touched.emailAddress ? styles.inputErrorFiled : ""}
                    />
                    {errors.emailAddress && touched.emailAddress && <Text type="danger">{errors.emailAddress}</Text>}
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.loginButton}
                      size="large"
                      disabled={!(isValid && dirty)}
                      block
                      loading={isLoading}
                    >
                      Submit
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
