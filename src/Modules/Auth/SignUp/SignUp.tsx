import { Row, Col, Typography, Button, Form, Input, Tooltip, Checkbox, Select, Space, List, Popover } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Field, FieldProps, Formik } from "formik";
import { OnBoarding } from "@components/index";
import { Icon } from "@iconify/react";
import { omit } from "lodash";
import { post } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { CountryCode, parsePhoneNumber } from "libphonenumber-js";
import "yup-phone";
import { useState } from "react";
import * as yup from "yup";
import { NumberInput } from "@components/index";

import styles from "../Auth.module.scss";
import { CheckCountryCode } from "~/Utils/CountryCode";

const phoneSchema = yup.string().phone().required();

const { Option } = Select;
const { Title, Text } = Typography;

export const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { openToast, openNotification } = useNotification();

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
            Create Account
          </Title>
          <Col span={24}>
            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                emailAddress: "",
                userMobileNumber: {
                  value: "",
                  countryCode: "IN",
                },
                designation: "",
                accept: false,
                password: "",
              }}
              validationSchema={yup.object().shape({
                firstName: yup
                  .string()
                  .trim("First Name cannot include leading and trailing spaces")
                  .strict(true)
                  .min(4,"Minimum 4 character required") 
                  .required("First name required")
                  .matches(/^[aA-zZ\s]+$/, "Invalid First Name"),
                lastName: yup
                  .string()
                  .trim("Last Name cannot include leading and trailing spaces")
                  .strict(true)
                  .required("Last name required")
                  .matches(/^[aA-zZ\s]+$/, "Invalid Last Name"),
                emailAddress: yup
                  .string()
                  .strict(true)
                  .lowercase("Email address must be lowercase")
                  .email("Please enter a valid email address")
                  .trim()
                  .required("Email address is required"),
                userMobileNumber: yup.object().shape({
                  code: yup.string(),
                  value: yup
                    .string()
                    .required("Mobile number required")
                    .test("is-valid-phone", "Invalid mobile number", function (value: any, context: any) {
                      const countryCode = context.parent.countryCode;
                      const checkvalue = CheckCountryCode(value, countryCode, context);
                      return checkvalue;
                    }),
                  countryCode: yup.string(),
                }),
                designation: yup.string().required("Designation required"),
                password: yup
                  .string()
                  .trim("Password cannot include leading and trailing spaces")
                  .strict()
                  .required("Password required")
                  .matches(
                    new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
                    "Password dosen't meet the requirements"
                  ),
                // .min(8),
                accept: yup
                  .bool() // use bool instead of boolean
                  .oneOf([true], "You must accept the terms and conditions"),
              })}
              onSubmit={(values, { setFieldError }) => {
                setIsLoading(true);
                const mobilePayload = {
                  ...values,
                  userMobileNumber: parsePhoneNumber(
                    values.userMobileNumber.value as string,
                    values.userMobileNumber.countryCode as CountryCode
                  ).formatInternational(),
                };
                const payload = {
                  ...omit(mobilePayload, "accept"),
                  verifyUrl: `${window.location.origin}/auth/verify`,
                };
                post("userprofile/signup", payload)
                  .then((res: any) => {
                    if (res) {
                      window.sessionStorage.setItem("signup-email", payload.emailAddress);
                      if (res.status) {
                        navigate("/auth/thanks");
                      }
                    }
                    setIsLoading(false);
                  })
                  .catch((err) => {
                    if (err === "user details already exist!") {
                      setFieldError("emailAddress", "This email address already exists");
                    }
                    setIsLoading(false);
                  });
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                setFieldValue,
                handleSubmit,
                handleBlur,
                isValid,
                setFieldTouched,
              }) => {
                return (
                  <Form
                    layout="vertical"
                    onFinish={handleSubmit}
                  >
                    <Form.Item
                      label="First Name"
                      rules={[
                        {
                          type: "regexp",
                          pattern: new RegExp("([a-zA-Z]{3,30}\\s*)+"),
                          message: "Format is wrong",
                        },
                      ]}
                    >
                      <Input
                        name="firstName"
                        type={"text"}
                        size="large"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.firstName && touched.firstName ? styles.inputErrorFiled : ""}
                      />
                      {errors.firstName && touched.firstName && <Text type="danger">{errors.firstName}</Text>}
                    </Form.Item>
                    <Form.Item label="Last Name">
                      <Input
                        name="lastName"
                        type={"text"}
                        size="large"
                        value={values.lastName}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        className={errors.lastName && touched.lastName ? styles.inputErrorFiled : ""}
                      />
                      {errors.lastName && touched.lastName && <Text type="danger">{errors.lastName}</Text>}
                    </Form.Item>
                    <Form.Item label="Email">
                      <Input
                        name="emailAddress"
                        size="large"
                        value={values.emailAddress}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={errors.emailAddress && touched.emailAddress ? styles.inputErrorFiled : ""}
                      />
                      {errors.emailAddress && touched.emailAddress && <Text type="danger">{errors.emailAddress}</Text>}
                    </Form.Item>

                    <Field name="userMobileNumber">
                      {({ field, form }: FieldProps) => (
                        <Form.Item label="Mobile Number">
                          <NumberInput
                            {...field}
                            onChange={(value: { value: string; countryCode: CountryCode; code: string }) =>
                              form.setFieldValue("userMobileNumber", value)
                            }
                            className={
                              form.errors.userMobileNumber && form.touched.userMobileNumber
                                ? styles.inputErrorFiled
                                : ""
                            }
                          />
                           {touched.userMobileNumber && errors.userMobileNumber?.value && (
                              <Typography.Text type="danger">{errors.userMobileNumber.value}</Typography.Text>   //#146 In Saaspe Application Sign Up Fields Mobile Number Field Is Not Getting Highlight While DIsplaying Error Message.
                            )}
                        </Form.Item>
                      )}
                    </Field>
                    <Form.Item label="Designation">
                      <Select
                        onChange={(value) => setFieldValue("designation", value)}
                        onBlur={() => setFieldTouched("designation")}
                        value={values.designation}
                        size="large"
                        showSearch
                        status={(touched.designation && errors.designation && "error") || ""}
                        className={errors.designation && touched.designation ? styles.inputErrorFiled : ""}
                      >
                        {[
                          "CxO",
                          "President/ Vice President",
                          "Director",
                          "Manager",
                          "Procurement Executive",
                          "PMO",
                        ].map((item, i) => (
                          <Option
                            value={item}
                            key={`${item}-${i}`}
                          >
                            {item}
                          </Option>
                        ))}
                      </Select>
                      {errors.designation && touched.designation && <Text type="danger">{errors.designation}</Text>}
                    </Form.Item>
                    <Form.Item
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
                      label={"Password"}
                    >
                      <Input.Password
                        name="password"
                        autoComplete="new-password"
                        size="large"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        minLength={8}
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
                        className={errors.password && touched.password ? styles.inputErrorFiled : ""}
                      />
                      {errors.password && touched.password && <Text type="danger">{errors.password}</Text>}
                    </Form.Item>
                    <Form.Item>
                      <Space>
                        <Checkbox
                          name="accept"
                          checked={values.accept}
                          value={values.accept}
                          onChange={handleChange}
                        />
                        <Link
                          className={styles.loginFormForgot}
                          to=""
                        >
                          Terms &amp; Conditions
                        </Link>
                      </Space>
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className={styles.loginButton}
                        size="large"
                        block
                        disabled={!isValid || (Object.keys(touched).length === 0 && touched.constructor === Object)}
                        loading={isLoading}
                      >
                        Sign Up
                      </Button>
                    </Form.Item>
                  </Form>
                );
              }}
            </Formik>
          </Col>
          <Row>
            <Col
              span={24}
              style={{ marginTop: styles.whitespace3, textAlign: "center" }}
            >
              <Typography.Text className={styles.loginDontText}>
                Already have an account? <Link to="/auth/login">Login </Link>
              </Typography.Text>
            </Col>
          </Row>
        </Col>
      </Row>
    </OnBoarding>
  );
};
