import { Button, Col, Form, Input, Modal, Result, Row, Select, Space, Typography } from "antd";
import { Field, FieldProps, Formik } from "formik";
import { ReactNode, useEffect, useState } from "react";
import * as yup from "yup";

import { post } from "@services/api.service";
import { Link, useNavigate } from "react-router-dom";
import { currencyData } from "@utils/CurrencyCodes";

import styles from "../../Departments.module.scss";
import { keys } from "lodash";
import { useNotification } from "~/Hooks/useNotification";
import { currencyCode } from "@utils/Constants";
import { currency } from "@utils/StringConstants";
import { currencyOptions } from "@utils/CurrenyOptions";
import SuccessModal from "~/Components/Modal/SuccessModal";

const defaultValue = {
  departmentName: "",
  ownerEmailAddress: "",
  ownerName: "",
  secondaryOwnerEmailAddress: "",
  secondaryOwnerName: "",
  budget: 0,
  currencyCode: currencyCode,
};

export const SingleOnboarding = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [reqId, setReqId] = useState("");
  const navigate = useNavigate();
  const { openNotification } = useNotification();
  const EqualCol = ({ children }: { children: ReactNode }) => (
    <Col
      xs={24}
      md={12}
    >
      {children}
    </Col>
  );

  const handleSubmit = (values: { [key in string]: any }) => {
    let payload: any = {
      currencyCode: values.currencyCode,
      departmentBudget: values.budget,
      departmentName: values.departmentName,
      // departmentOwnerEmailAddress: values.ownerEmailAddress,
      // departmentOwnerName: values.ownerName,
      ownerDetails: [
        {
          departmentOwnerEmailAddress: values.ownerEmailAddress,
          departmentOwnerName: values.ownerName,
        },
      ],
    };
    if (values.secondaryOwnerName && values.secondaryOwnerEmailAddress) {
      payload.ownerDetails.push({
        departmentOwnerEmailAddress: values.secondaryOwnerEmailAddress,
        departmentOwnerName: values.secondaryOwnerName,
      });
    }
    post("v1/department/single/onboard", {
      createDepartmentRequest: [{ departmentInfo: payload, isSingle: true }],
    }).then((res: any) => {
      if (res.status === "OK" || res.status === "CREATED") {
        setShowSuccess(true);
        setReqId(res.response.data.requestId);
      }
      if (res.status === "CONFLICT") {
        openNotification({
          title: "Department Onboarding Failed",
          message: res.message,
          type: "error",
        });
      }
    });
  };

  return (
    <>
      <SuccessModal
        open={showSuccess}
        onClose={() => navigate("/departments")}
        content={
          <Typography.Text style={{ textAlign: "center" }}>
            Your onboarding request is submitted successfully. To view the status of your request, use the <br />{" "}
            Request ID: &nbsp;
            <b>
              <Link to={`/track-requests?activeTab=department&id=${reqId}`}>{reqId}</Link>
            </b>
          </Typography.Text>
        }
      />
      <Formik
        initialValues={defaultValue}
        onSubmit={handleSubmit}
        validationSchema={yup.object().shape({
          departmentName: yup
          .string()
          .min(2, "Department name must be at least 2 characters")
          .trim("Department name cannot include leading and trailing spaces")
          .strict(true)
          .matches(/^[aA-zZ\s]+$/, "Only alphabets are allowed for Department Name ")
          .required("Department name required"),
        ownerName: yup
          .string()
          .min(4, "Owner name must be at least 4 characters")
          .trim("Owner name cannot include leading and trailing spaces")
          .strict(true)
          .matches(/^[a-zA-Z\s]+$/, "Only alphabets are allowed for owner name ")
          .required("Owner name required"),
        ownerEmailAddress: yup
          .string()
          .strict(true)
          .lowercase("Email address must be a lowercase")
          .email("Owner email address must be a valid email address")
          .test('no-leading-special-characters', 'Email address cannot start with special characters', value => {
            if (!value) return true;
            return /^[a-zA-Z0-9]/.test(value);
        })
          .required("Owner email address required"),
          secondaryOwnerName: yup
            .string()
            .trim("Name cannot include leading and trailing spaces")
            .strict(true)
            .test("name-and-email", "Name is required when Email is provided", function (value) {
              const secondaryOwnerEmailAddress = this.parent.secondaryOwnerEmailAddress;
              if (secondaryOwnerEmailAddress && !value) {
                return false;
              }
              return true;
            })
            .matches(new RegExp(/^[a-zA-Z][^\d_!¡?÷?¿/\\+=@#$%^&*(){}|~<>;:[\]-]+$/), "Invalid Name")
            .test("not-same-as-owner", "Secondary Owner Name should not be the same as Owner Name", function (value) {
              const ownerName = this.parent.ownerName;
              if (value === ownerName) {
                return false;
              }
              return true;
            })
            .matches(new RegExp(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/), "Invalid Name"),
          secondaryOwnerEmailAddress: yup
            .string()
            .lowercase("Email address must be a lowercase")
            .strict(true)
            .email("Email address must be a valid email")
            .test('no-leading-special-characters', 'Email address cannot start with special characters', value => {
              if (!value) return true;
              return /^[a-zA-Z0-9]/.test(value);
          })
            .test("name-and-email", "Email is required when Name is provided", function (value) {
              const secondaryOwnerName = this.parent.secondaryOwnerName;
              if (secondaryOwnerName && !value) {
                return false;
              }
              return true;
            })
            .test("duplicate-email", "Duplicate email found in Email Address fields", function (value) {
              if (value) {
                if (value === this.parent.ownerEmailAddress) {
                  return false;
                }
                return true;
              } else {
                return true;
              }
            }),

          budget: yup.number().min(1, "Budget should be more than 0").nullable(true).required("Budget is required"),
        })}
      >
        {({ submitForm, setFieldValue, touched, errors, isValid, dirty, values }) => (
          <Form
            onFinish={submitForm}
            layout="vertical"
          >
            <Row>
              <Col>
                <Typography.Title level={5}>Department Details</Typography.Title>
              </Col>
            </Row>
            <Row gutter={16}>
              <EqualCol>
                <Field name="departmentName">
                  {({ field }: FieldProps) => {
                    return (
                      <Form.Item label="Department Name">
                        <Input
                          size="large"
                          {...field}
                          status={(touched.departmentName && errors.departmentName && "error") || ""}
                        />
                        {touched.departmentName && errors.departmentName && (
                          <Typography.Text type="danger">{errors.departmentName}</Typography.Text>
                        )}
                      </Form.Item>
                    );
                  }}
                </Field>
              </EqualCol>
              <EqualCol>
                <Field name="budget">
                  {({ field }: FieldProps) => {
                    return (
                      <Form.Item label="Budget">
                        <Input.Group compact>
                          <Select
                            showSearch
                            defaultValue={currencyCode}
                            size="large"
                            style={{ width: "30%" }}
                            value={values.currencyCode}
                            onChange={(e) => setFieldValue("currencyCode", e)}
                          >
                            {currencyOptions(currencyData, currency)}
                          </Select>
                          <Input
                            size="large"
                            {...field}
                            style={{ width: "70%" }}
                            type="number"
                            status={(touched.budget && errors.budget && "error") || ""}
                            min={0}
                            step="any"
                          />
                        </Input.Group>

                        {touched.budget && errors.budget && (
                          <Typography.Text type="danger">{errors.budget}</Typography.Text>
                        )}
                      </Form.Item>
                    );
                  }}
                </Field>
              </EqualCol>
              <EqualCol>
                <Field name="ownerEmailAddress">
                  {({ field }: FieldProps) => {
                    return (
                      <Form.Item label="Owner Email Address">
                        <Input
                          size="large"
                          {...field}
                          status={(touched.ownerEmailAddress && errors.ownerEmailAddress && "error") || ""}
                        />
                        {touched.ownerEmailAddress && errors.ownerEmailAddress && (
                          <Typography.Text type="danger">{errors.ownerEmailAddress}</Typography.Text>
                        )}
                      </Form.Item>
                    );
                  }}
                </Field>
              </EqualCol>
              <EqualCol>
                <Field name="ownerName">
                  {({ field }: FieldProps) => {
                    return (
                      <Form.Item label="Owner Name">
                        <Input
                          size="large"
                          // readOnly
                          {...field}
                          status={(touched.ownerName && errors.ownerName && "error") || ""}
                        />
                        {touched.ownerName && errors.ownerName && (
                          <Typography.Text type="danger">{errors.ownerName}</Typography.Text>
                        )}
                      </Form.Item>
                    );
                  }}
                </Field>
              </EqualCol>
              <EqualCol>
                <Field name="secondaryOwnerEmailAddress">
                  {({ field }: FieldProps) => {
                    return (
                      <Form.Item label="Secondary Owner Email Address">
                        <Input
                          size="large"
                          {...field}
                          status={
                            (touched.secondaryOwnerEmailAddress && errors.secondaryOwnerEmailAddress && "error") || ""
                          }
                        />
                        {touched.secondaryOwnerEmailAddress && errors.secondaryOwnerEmailAddress && (
                          <Typography.Text type="danger">{errors.secondaryOwnerEmailAddress}</Typography.Text>
                        )}
                      </Form.Item>
                    );
                  }}
                </Field>
              </EqualCol>
              <EqualCol>
                <Field name="secondaryOwnerName">
                  {({ field }: FieldProps) => {
                    return (
                      <Form.Item label="Secondary Owner Name">
                        <Input
                          size="large"
                          // readOnly
                          {...field}
                          status={(touched.secondaryOwnerName && errors.secondaryOwnerName && "error") || ""}
                        />
                        {touched.secondaryOwnerName && errors.secondaryOwnerName && (
                          <Typography.Text type="danger">{errors.secondaryOwnerName}</Typography.Text>
                        )}
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
                  disabled={!(isValid && dirty)}
                  // !isValid || !dirty
                >
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </>
  );
};
