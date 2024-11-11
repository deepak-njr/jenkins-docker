import { Icon } from "@iconify/react";
import { Button, Col, Form, Row, Space, Steps, Typography, UploadFile } from "antd";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { ContentWrapper } from "~/Components";
import styles from "./BudgetsOnboarding.module.scss";
import { Formik } from "formik";
import { useAuth } from "~/Hooks/useAuth";
import { some, values } from "lodash";
import { useNotification } from "~/Hooks/useNotification";
import { BudgetInformation } from "./Components/BudgetInformation";
import { AlertDetails } from "./Components/AlertDetails";
import ReviewBudget from "./ReviewBudget";
import { post } from "~/Services";
import moment from "moment";

interface FormItems {
  budgetName: string;
  creationDate: string;
  expirationDate: string;
  budgetScope: string;
  resetPeriod: string;
  currencyCode: string;
  budgetAmount: string;
  emailAddress: string;
  languagePreference: string;
  alerts: {
    alertType: string;
    threshold: string;
    amount: string;
  }[];
}

export const BudgetDetails = () => {
  const [isLoading] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { openNotification } = useNotification();

  const onSubmit = async (values: any) => {
    setIsLoader(true);
    const payload = {
      budgetName: values.budgetName,
      creationDate: moment(values.creationDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      expiryDate: moment(values.expirationDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      budgetScope: values.budgetScope,
      resetPeriod: values.resetPeriod,
      budgetAmount: {
        currency: values.currencyCode,
        value: values.budgetAmount,
      },

      recipientEmail: values.emailAddress,
      languagePreference: "en-us",
      alertDetails: values.alerts.map((item: any) => ({
        threshold: item.threshold,
        type: item.alertType,
      })),
    };
    post("/cloud/budget/create", payload)
      .then((res: any) => {
        if (res) {
          openNotification({
            title: "Success",
            message: `${values.budgetName} is created successfully`,
            type: "success",
          });
          navigate("/multi-cloud/budget-forecast/Budgets");
        }
        setIsLoader(false);
      })
      .catch(() => setIsLoader(false));
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const stepItems: any = [
    {
      key: 0,
      item: "Budget Details",
      title: "Budget Details",
      icon: <Icon icon={currentStep > 0 ? "charm:tick" : "fluent-emoji-high-contrast:money-bag"} />,
    },
    {
      key: 2,
      item: "Set Alerts",
      title: "Set Alerts",
      icon: <Icon icon={currentStep > 1 ? "charm:tick" : "material-symbols:settings-alert-outline"} />,
    },
    {
      key: 3,
      item: "Review & Submit",
      title: "Review & Submit",
      icon: <Icon icon={currentStep > 2 ? "charm:tick" : "material-symbols:edit-outline"} />,
    },
  ];

  const step1 = yup.object().shape({
    budgetScope: yup.string().required("Budget Scope is required"),
    budgetName: yup
      .string()
      .trim("Budget Name cannot include leading and trailing spaces")
      .strict(true)
      .required("Budget Name is required"),
    resetPeriod: yup.string().required("Reset Period is required"),
    creationDate: yup.string().required("Creation Date is required"),
    expirationDate: yup
      .string()
      .test(
        "invalid-enddate",
        "Expiration Date should be greater than Creation Date",
        (value, context) =>
          moment(value, "DD/MM/YYY", true).diff(moment(context.parent.creationDate, "DD/MM/YYY", true), "days") >= 1
      )
      .required("Expiration Date required"),
    currencyCode: yup.string().required("Currency Code is required"),
    budgetAmount: yup
      .number()
      .positive()
      .required("Budget Amount is required")
      .min(0, "Budget Amount must be greater than or equal to 0"),
  });
  const step2 = yup.object().shape({
    alerts: yup.array().of(
      yup.object().shape({
        alertType: yup.string().required(`Alert Type required`),
        threshold: yup
          .string()
          .required(`Threshold Amount required`)
          .matches(
            new RegExp(/^[1-9]\d*$/),
            "Threshold Amount must be greater than 0 or Amount should not be negative value "
          ),
      })
    ),
    emailAddress: yup
      .string()
      .strict(true)
      .lowercase("Email address must be a lowercase")
      .email("Email address must be a valid email")
      .required("Email address required"),
  });

  const validationSchema = useMemo(() => {
    if (currentStep === 0) {
      return step1;
    } else {
      return step2;
    }
  }, [currentStep]);

  // const resetFormFields = (setValues)=>{

  //   setValues(
  //     ...values,
  //   )
  //   }

  return (
    <ContentWrapper
      loading={isLoading}
      customTitle={
        <Space align="start">
          <Icon
            onClick={() => navigate(-1)}
            icon="akar-icons:arrow-left"
            style={{
              fontSize: "1.8rem",
              cursor: "pointer",
              color: styles.primary,
              marginRight: styles.whitespace1,
            }}
          />
          <span>
            <Typography.Title
              level={5}
              style={{ margin: 0 }}
            >
              Add Budget
            </Typography.Title>
          </span>
        </Space>
      }
    >
      <Formik
        initialValues={
          {
            budgetName: "",
            budgetScope: "",
            creationDate: "",
            expirationDate: "",
            resetPeriod: "",
            currencyCode: "",
            budgetAmount: "",
            emailAddress: "",
            languagePreference: "",
            alerts: [
              {
                alertType: "",
                threshold: "",
                amount: "",
              },
            ],
          } as FormItems
        }
        onSubmit={(values) => onSubmit(values)}
        validationSchema={validationSchema}
      >
        {(props) => {
          return (
            <Form
              layout="vertical"
              onFinish={props.handleSubmit}
            >
              <Steps
                current={currentStep}
                items={stepItems}
                labelPlacement="vertical"
                size="default"
                responsive
              />
              <Row style={{ marginTop: 16 }}>
                <Col
                  xs={24}
                  md={16}
                >
                  {currentStep === 0 && <BudgetInformation {...(props as any)} />}
                  {currentStep === 1 && <AlertDetails {...(props as any)} />}
                  {currentStep === 2 && (
                    <ReviewBudget
                      {...(props as any)}
                      setCurrentStep={setCurrentStep}
                    />
                  )}
                  <Row>
                    <Col
                      xs={24}
                      md={24}
                      style={{ textAlign: "right" }}
                    >
                      {currentStep === 2 && (
                        <Space>
                          <Button
                            type="default"
                            onClick={() => setCurrentStep((current) => current - 1)}
                          >
                            Back
                          </Button>
                          <Button
                            htmlType="submit"
                            type="primary"
                            loading={isLoader}
                            disabled={
                              currentStep === 2 &&
                              some(
                                props.values.alerts,
                                (alerts) =>
                                  alerts.alertType === "" ||
                                  alerts.threshold === "" ||
                                  !validateEmail(props.values.emailAddress)
                              )
                            }
                          >
                            Submit
                          </Button>
                        </Space>
                      )}
                      {currentStep < 2 && (
                        <Space>
                          {currentStep > 0 && (
                            <Button
                              type="default"
                              disabled={currentStep === 0}
                              onClick={() => {
                                setCurrentStep((current) => current - 1);
                                props.values.alerts.forEach((_, index) => {
                                  props.setFieldTouched(`alerts[${index}].threshold`, false, false);
                                  props.setFieldTouched(`alerts[${index}].alertType`, false, false);
                                  props.setFieldTouched(`alerts[${index}].amount`, false, false);
                                });
                                props.setFieldTouched("emailAddress", false, false);
                              }}
                            >
                              Back
                            </Button>
                          )}
                          <Button
                            type="primary"
                            disabled={
                              (currentStep === 0 &&
                                !some(
                                  props.values.budgetName &&
                                    props.values.creationDate &&
                                    props.values.resetPeriod &&
                                    props.values.creationDate &&
                                    props.values.expirationDate &&
                                    props.values.currencyCode &&
                                    props.values.budgetAmount
                                )) ||
                              !(props.isValid && props.dirty) ||
                              (currentStep === 1 &&
                                some(
                                  props.values.alerts,
                                  (alerts) =>
                                    alerts.alertType === "" ||
                                    alerts.threshold === "" ||
                                    !validateEmail(props.values.emailAddress)
                                )) ||
                              !(props.isValid && props.dirty)
                            }
                            onClick={() => setCurrentStep((current) => current + 1)}
                          >
                            Next
                          </Button>
                        </Space>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
          );
        }}
      </Formik>
    </ContentWrapper>
  );
};
