import { Button, Divider, Space, Form, Row, Col } from "antd";
import { Formik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { ApplicationInformation } from "../Components/ApplicationInformation";
import * as yup from "yup";
import { ApplicationFormItems, ApplicationOnboardingContext } from "../../Wrapper";
import { useLocation, useNavigate } from "react-router-dom";
import { NewLicenes } from "../Components/NewLicenes";
import { currencyCode } from "@utils/Constants";

const defaultValue: ApplicationFormItems = {
  application: {
    applicationName: "",
    subscriptionName: "",
    subscriptionId: "",
    applictionCategory: "",
    ownerEmail: "",
    ownerName: "",
    ownerDepartment: "",
    secondaryContactEmail: "",
    secondaryContactName: "",
    projectName: "",
    providerName: "",
    reason: "",
  },
  contracts: [
    {
      name: "",
      startDate: "",
      endDate: "",
      renewalTerm: 0,
      contractType: "",
      billingFrequency: "",
      contractTenure: "",
      upcomingRenewalDate: "",
      autoRenewal: false,
      autoRenewalCancellation: "",
      currencyCode: currencyCode,
      products: [
        {
          productType: "",
          productName: "",
          unitPrice: 0,
          quantity: 0,
          totalCost: 0,
          unitPriceType: "per month",
        },
      ],
    },
  ],
};
export const SingleApplication = () => {
  const { formData, setFormData } = useContext(ApplicationOnboardingContext);
  const [initialValue, setInitialValue] = useState(defaultValue);
  const navigate = useNavigate();
  const { state }: any = useLocation();
  const handleSubmit = (values: ApplicationFormItems) => {
    setFormData({
      ...formData,
      application: {
        ...formData.application,
        ...values,
      },
    });
    if (state && state.from && state.edit) {
      navigate(state.from);
    } else {
      navigate("/applications/onboarding/supporting-docs");
    }
  };

  useEffect(() => {
    if (formData && formData.application.application && formData.application.contracts) {
      setInitialValue({
        application: {
          ...formData.application.application,
          reason: formData.application.application.reason || "",
        },
        contracts: formData.application.contracts,
      });
    }
  }, []);

  return (
    <Formik
      enableReinitialize
      initialValues={initialValue}
      validationSchema={yup.object().shape({
        application: yup.object().shape({
          applicationName: yup.string().required("Application name required"),
          applictionCategory: yup.string().required("Application category required"),
          ownerEmail: yup
            .string()
            .strict(true)
            .lowercase("Email address must be a lowercase")
            .email("Please enter valid email address")
            .required("Owner email required"),
          ownerName: yup.string().required("Owner name required"),
          ownerDepartment: yup.string().required("Owner department required"),
          secondaryContactName: yup.string(),
          secondaryContactEmail: yup
            .string()
            .strict(true)
            .lowercase("Email address must be a lowercase")
            .email("Please enter valid email address")
            .test("duplicate-email", "Duplicate email found in Email Address fields", function (value) {
              if (value) {
                if (value === this.parent.ownerEmail) {
                  return false;
                }
                return true;
              } else {
                return true;
              }
            }),
          projectName: yup.string().required("Project name required"),
          providerName: yup
            .string()
            .trim("Provider name cannot include leading and trailing spaces")
            .strict(true)
            .required("Provider name required")
            .matches(/^[a-zA-Z\s]+$/, "Only alphabets values are allowed for provider name "),
          reason: yup
            .string()
            .trim("Reason for onboarding cannot include leading and trailing spaces")
            .strict(true)
            .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9\s_]*[a-zA-Z0-9])?$/,"Only alphabets and numbers are allowed")
            .required("Reason for onboarding Required"),
        }),
        contracts: yup.array().of(
          yup.object().shape({
            products: yup.array().of(
              yup.object().shape({
                productType: yup
                  .string()
                  .required("Product type required")
                  .matches(/^[aA-zZ\s]+$/, "Only alphabet values are allowed for product type "),
                productName: yup
                  .string()
                  .trim("Product name cannot include leading and trailing spaces")
                  .strict(true)
                  .required("Product name required")
                  .matches(/^[a-zA-Z0-9\s]+$/, "Only alphanumeric values are allowed for product name"),
                  unitPrice: yup
                  .number()
                  .transform((originalValue, originalObject) => {
                    return parseFloat(originalValue) ?? 0;
                  })
                  .min(0, "Unit price must be greater than or equal to 0")
                  .required("Unit price required"),
                unitPriceType: yup.string().required("Unit price type is required"),
                quantity: yup
                  .number()
                  .integer()
                  .min(1, "Product quantity must be greater than or equal to 1")
                  .required("Product quantity required"),
                  totalCost: yup
                  .number()
                  .transform((originalValue, originalObject) => {
                    return parseFloat(originalValue) ?? 0;
                  })
                  .test("hasDecimal", "Total cost must be a number", (value) => {
                    return typeof value === 'number' && !isNaN(value);
                  })
                  .required("Total cost license required"),
              })
            ),
          })
        ),
      })}
      onSubmit={handleSubmit}
    >
      {(props) => {
        return (
          <Form
            onFinish={props.handleSubmit}
            layout="vertical"
          >
            <Space
              direction="vertical"
              size="middle"
              style={{ width: "100%" }}
              split={<Divider />}
            >
              <Col
                xs={24}
                md={16}
              >
                <ApplicationInformation {...props} />
              </Col>
              <NewLicenes {...props} />
              <Row justify="end">
                <Col>
                  <Button
                    htmlType="submit"
                    type="primary"
                    disabled={!props.isValid}
                  >
                    Next
                  </Button>
                </Col>
              </Row>
            </Space>
          </Form>
        );
      }}
    </Formik>
  );
};
