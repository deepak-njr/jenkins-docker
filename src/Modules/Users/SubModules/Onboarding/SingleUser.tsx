import { Button, Col, DatePicker, Form, Input, Modal, Result, Row, Select, Space, Spin, Typography } from "antd";
import { Field, FieldProps, Formik } from "formik";
import moment from "moment";
import { ReactNode, useEffect, useState } from "react";
import * as yup from "yup";
import { NumberInput } from "@components/index";
import { post, get } from "@services/api.service";
import { Link, useNavigate } from "react-router-dom";

import styles from "../../Users.module.scss";
import { useNotification } from "~/Hooks/useNotification";
import { CountryCode, parsePhoneNumber } from "libphonenumber-js";
import "yup-phone";
import SuccessModal from "~/Components/Modal/SuccessModal";
import { CheckCountryCode } from "~/Utils/CountryCode";

const phoneSchema = yup.string().phone().required();

const defaultValue = {
  userFirstName: "",
  userLastName: "",
  userEmailAddress: "",
  userDepartment: "",
  userReportingManager: "",
  userJoiningDate: "",
  userType: "",
  userDesignation: "",
  userGender: "",
  userMobileNumber: {
    value: "",
    countryCode: "IN",
  },
};

export const SingleUser = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reqId, setReqId] = useState("");
  const { openToast } = useNotification();
  const navigate = useNavigate();
  const [dept, setDept] = useState([]);
  const EqualCol = ({ children }: { children: ReactNode }) => (
    <Col
      xs={24}
      md={12}
    >
      {children}
    </Col>
  );

  const getDepartments = () => {
    setIsLoading(true);
    get("v1/department/list")
      .then((res: any) => {
        setDept(res.response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({
          content: err,
          type: "error",
        });
      });
  };

  useEffect(() => {
    getDepartments();
  }, []);

  const handleSubmit = (values: { [key in string]: any }, SetFieldValue: any) => {
    post("v1/user/onboarding/single-user", {
      createUserRequest: {
        userInfo: {
          ...values,
          userMobileNumber: parsePhoneNumber(
            values.userMobileNumber.value as string,
            values.userMobileNumber.countryCode as CountryCode
          ).formatInternational(),
          userJoiningDate: moment(values.userJoiningDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
        },
      },
    }).then((res: any) => {
      if (res.status === "OK" || res.status === "CREATED") {
        setShowSuccess(true);
        setReqId(res.response.data.requestId);
      } else if (res.status === "CONFLICT") {
        SetFieldValue("userEmailAddress", "This email address already exists");
      }
    });
  };

  if (isLoading) return <Spin />;
  return (
    <>
      <SuccessModal
        open={showSuccess}
        onClose={() => navigate("/users")}
        content={
          <Typography.Text style={{ textAlign: "center" }}>
            Your onboarding request is submitted successfully. To view the status of your request, use the <br />{" "}
            Request ID: &nbsp;
            <b>
              <Link to={`/track-requests?activeTab=user&id=${reqId}`}>{reqId}</Link>
            </b>
          </Typography.Text>
        }
      />
      <Formik
        initialValues={defaultValue}
        onSubmit={(values, { setFieldError }) => {
          handleSubmit(values, setFieldError);
        }}
        validationSchema={yup.object().shape({
          userFirstName: yup
            .string()
            .trim()
            .min(3, "First name must be at least 3 characters")
            .trim("First name cannot include leading and trailing spaces")
            .strict(true)
            .matches(/^[a-zA-Z\s]+$/, "Only alphabets are allowed for first name ")
            .required("First name required"),
          userLastName: yup
            .string()
            .min(1, "Last name must be at least 1 characters")
            .trim("Last name cannot include leading and trailing spaces")
            .strict(true)
            .matches(/^[a-zA-Z\s]+$/, "Only alphabets are allowed for last name")
            .required("Last name required"),
          userEmailAddress: yup
            .string()
            .lowercase("Email address must be a lowercase")
            .strict(true)
            .email("Email address must be a valid email")
            .test('no-leading-special-characters', 'Email address cannot start with special characters', value => {
              if (!value) return true;
              return /^[a-zA-Z0-9]/.test(value);
          })
            .required("Email address required"),
          userDepartment: yup.string().required("Department required"),
          userReportingManager: yup
            .string()
            .trim("Reporting manager cannot include leading and trailing spaces")
            .strict(true)
            .matches(/^[a-zA-Z\s]+$/, "Only alphabets are allowed for Reporting manager")
            .min(4, "Reporting manager must be at least 4 characters")
            .required("Reporting manager required"),
          userJoiningDate: yup.string().required("Joining date required"),
          userType: yup.string().required("Employement type required"),
          userDesignation: yup.string().required("Designation required"),
          userGender: yup.string().required("Gender required"),
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
        })}
      >
        {({ submitForm, setFieldValue, touched, errors, isValid, setFieldTouched }) => {
          return (
            <Form
              onFinish={submitForm}
              layout="vertical"
            >
              <Row>
                <Col>
                  <Typography.Title level={5}>User Details</Typography.Title>
                </Col>
              </Row>
              <Row gutter={16}>
                <EqualCol>
                  <Field name="userFirstName">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="First Name">
                          <Input
                            size="large"
                            {...field}
                            status={(touched.userFirstName && errors.userFirstName && "error") || ""}
                          />
                          {touched.userFirstName && errors.userFirstName && (
                            <Typography.Text type="danger">{errors.userFirstName}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="userLastName">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Last Name">
                          <Input
                            size="large"
                            {...field}
                            status={(touched.userLastName && errors.userLastName && "error") || ""}
                          />
                          {touched.userLastName && errors.userLastName && (
                            <Typography.Text type="danger">{errors.userLastName}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="userEmailAddress">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Email Address">
                          <Input
                            size="large"
                            {...field}
                            status={(touched.userEmailAddress && errors.userEmailAddress && "error") || ""}
                          />
                          {touched.userEmailAddress && errors.userEmailAddress && (
                            <Typography.Text type="danger">{errors.userEmailAddress}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="userDepartment">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Department">
                          <Select
                            size="large"
                            onBlur={() => setFieldTouched("userDepartment", true)}
                            showSearch
                            value={field.value}
                            status={(touched.userDepartment && errors.userDepartment && "error") || ""}
                            onChange={(e) => setFieldValue("userDepartment", e)}
                          >
                            {dept &&
                              dept.map((d: { departmentName: string }) => (
                                <Select.Option
                                  value={d.departmentName}
                                  key={d.departmentName}
                                >
                                  {d.departmentName}
                                </Select.Option>
                              ))}
                          </Select>
                          {touched.userDepartment && errors.userDepartment && (
                            <Typography.Text type="danger">{errors.userDepartment}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="userReportingManager">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Reporting Manager">
                          <Input
                            size="large"
                            {...field}
                            status={(touched.userReportingManager && errors.userReportingManager && "error") || ""}
                          />
                          {touched.userReportingManager && errors.userReportingManager && (
                            <Typography.Text type="danger">{errors.userReportingManager}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="userJoiningDate">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Joining Date">
                          <DatePicker
                            size="large"
                            allowClear
                            onBlur={() => setFieldTouched("userJoiningDate", true)}
                            onChange={(e) => setFieldValue(`userJoiningDate`, e ? moment(e).format("DD/MM/YYYY") : "")}
                            status={(touched.userJoiningDate && errors.userJoiningDate && "error") || ""}
                            format="DD/MM/YYYY"
                            {...(field.value && {
                              value: moment(field.value, "DD/MM/YYYY"),
                            })}
                            style={{ width: "100%" }}
                          />
                          {touched.userJoiningDate && errors.userJoiningDate && (
                            <Typography.Text type="danger">{errors.userJoiningDate}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="userType">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Type of Employement">
                          <Select
                            size="large"
                            showSearch
                            onBlur={() => setFieldTouched("userType", true)}
                            value={field.value}
                            onChange={(e) => setFieldValue("userType", e)}
                            status={(touched.userType && errors.userType && "error") || ""}
                          >
                            {["Permanent", "Contract"].map((type) => (
                              <Select.Option
                                value={type}
                                key={type}
                              >
                                {type}
                              </Select.Option>
                            ))}
                          </Select>
                          {touched.userType && errors.userType && (
                            <Typography.Text type="danger">{errors.userType}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="userDesignation">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Designation">
                          <Select
                            size="large"
                            showSearch
                            onBlur={() => setFieldTouched("userDesignation", true)}
                            value={field.value}
                            onChange={(e) => setFieldValue("userDesignation", e)}
                            status={(touched.userDesignation && errors.userDesignation && "error") || ""}
                          >
                            {[
                              "Software Engineer",
                              "Technical Lead",
                              "Software Architect",
                              "Technology Analyst",
                              "UI/UX Engineer",
                              "QA Engineer",
                              "Platform Engineer",
                              "Team Lead",
                              "Consultant",
                              "Platform Architect",
                              "HR Recruiter",
                              "Platform Admin",
                              "Business Analyst",
                              "Product Owner",
                              "Operations Staff",
                              "Operations Lead",
                              "Accountant",
                            ].map((type) => (
                              <Select.Option
                                value={type}
                                key={type}
                              >
                                {type}
                              </Select.Option>
                            ))}
                          </Select>
                          {touched.userDesignation && errors.userDesignation && (
                            <Typography.Text type="danger">{errors.userDesignation}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="userGender">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Gender">
                          <Select
                            size="large"
                            showSearch
                            onBlur={() => setFieldTouched("userGender", true)}
                            value={field.value}
                            status={(touched.userGender && errors.userGender && "error") || ""}
                            onChange={(e) => setFieldValue("userGender", e)}
                          >
                            {["Male", "Female", "Others"].map((type) => (
                              <Select.Option
                                value={type}
                                key={type}
                              >
                                {type}
                              </Select.Option>
                            ))}
                          </Select>
                          {touched.userGender && errors.userGender && (
                            <Typography.Text type="danger">{errors.userGender}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="userMobileNumber">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Mobile Number">
                          <NumberInput
                            {...field}
                            onChange={(value: { value: string; countryCode: CountryCode; code: string }) =>
                              setFieldValue("userMobileNumber", value)
                            }
                            status={(touched.userMobileNumber && errors.userMobileNumber && "error") || ""}
                          />
                          {touched.userMobileNumber && errors.userMobileNumber?.value && (
                            <Typography.Text type="danger">{errors.userMobileNumber.value}</Typography.Text>
                          )}
                          {/* <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          countrySelectComponent={Select}
                          {...field}
                          inputComponent={Input}
                        /> */}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
              </Row>
              <Row justify="end">
                <Col>
                  <Button
                    htmlType="submit"
                    type="primary"
                    disabled={!isValid}
                  >
                    Submit
                  </Button>
                </Col>
              </Row>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};
