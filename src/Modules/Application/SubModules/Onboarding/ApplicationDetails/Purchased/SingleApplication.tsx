import { Button, Divider, Space, Form, Row, Col } from "antd";
import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { ApplicationInformation } from "../Components/ApplicationInformation";
import { ContractInformation } from "../Components/ContractInformation";
import * as yup from "yup";
import {
  ApplicationFormItems,
  ApplicationOnboardingContext,
} from "../../Wrapper";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CONTRACT_VALIDATION_SCHEMA,
  APP_VALIDATION_SCHEMA,
} from "@utils/formValidationSchemas";
import { currencyCode } from "@utils/Constants";

export const defaultValue: ApplicationFormItems = {
  application: {
    applicationName: "",
    subscriptionId: "",
    subscriptionName: "",
    applictionCategory: "",
    ownerEmail: "",
    ownerName: "",
    ownerDepartment: "",
    secondaryContactName: "",
    secondaryContactEmail : "",
    projectName: "",
    providerName: "",
  },
  contracts: [
    {
      name: "",
      startDate: "",
      endDate: "",
      renewalTerm: 0,
      contractType: "",
      upcomingRenewalDate: "",
      contractTenure: "",
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
    if (
      formData &&
      formData.application.application &&
      formData.application.contracts
    ) {
      setInitialValue(formData.application);
    }
  }, []);

  useEffect(() => { 
    if (state && state.application) {
      const element = document.getElementById('application');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (state && state.contractEdit) {
      const element = document.getElementById('contract');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
    }
  })
  
  return (
    <Formik
      enableReinitialize
      initialValues={initialValue}
      validationSchema={yup.object().shape({
        application: APP_VALIDATION_SCHEMA,
        contracts: CONTRACT_VALIDATION_SCHEMA,
      })}
      onSubmit={handleSubmit}
    >
      {(props) => {
        return (
          <Form onFinish={props.handleSubmit} layout="vertical">
            <Space
              direction="vertical"
              size="middle"
              style={{ width: "100%" }}
              split={<Divider />}
            >
              <Col xs={24} md={16} id="application">
                <ApplicationInformation {...props} />
              </Col>
              <Col id="contract">
              <ContractInformation {...props} />
              </Col>

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
