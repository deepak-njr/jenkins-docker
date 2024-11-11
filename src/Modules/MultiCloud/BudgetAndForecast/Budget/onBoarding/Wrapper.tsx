import { createContext, useEffect, useState } from "react";
import { ContentWrapper } from "@components/index";
import { Col, Modal, Row, Space, Steps, Typography } from 'antd';
import { Icon } from "@iconify/react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";

import styles from "./BudgetsOnboarding.module.scss";
import { useNotification } from "@hooks/useNotification";
import { BudgetDetails } from "./BudgetDetails";

const { confirm } = Modal;


export interface BudgetFormItems {
  budgetName: string;
  creationDate: string;
  expirationDate: string;
  budgetScope: string;
  resetPeriod: string;
  currencyCode: string,
  budgetAmount: string,
  emailAddress: string,
  alerts: {
    alertType: string;
    threshold: string;
    amount: string;
  }[];
  errors: { [key in string]: string };
  touched: { [key in string]: string };
}

interface BudgetsOnboardingContextT {
  formData: {
    budget: BudgetFormItems;
  };
  setFormData: (data: any) => void;
}
export const BudgetsOnboardingContext = createContext(
  {} as BudgetsOnboardingContextT
);
export const BudgetsOnboardingWrapper = () => {
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [onBoardingType, setOnboading] = useState("Purchased");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<
    BudgetsOnboardingContextT["formData"] | null
  >();
  const { pathname } = useLocation();
  const value: BudgetsOnboardingContextT = {
    formData: formData as any,
    setFormData
  };

  useEffect(() => {
    setFormData(null);
    setCurrentStep(0);
  }, [onBoardingType]);


  useEffect(() => {
    const paths = pathname.split("/");
    const currentModule = paths[paths.length - 1];
    console.log(currentModule);

    if (currentModule === "budget-details") {
      setCurrentStep(0);
    }
    if (currentModule === "set-alerts") {
      setCurrentStep(1);
    }
    if (currentModule === "review") {
      setCurrentStep(2);
    }
  }, [pathname]);

  return (
    <ContentWrapper
      loading={isLoading}
      customTitle={
        <Space style={{ alignItems: "center", lineHeight: 1 }}>
          <Icon
            onClick={() => {
              confirm({
                className: styles.confirmModal,
                title: "",
                icon: "",
                okText: "Go Back",
                onOk: () => navigate(-1),
                content: (
                  <Row gutter={16} style={{ textAlign: "center" }}>
                    <Col span={24}>
                      <Typography.Text>
                        By going back you will loose all filled application
                        details
                      </Typography.Text>
                    </Col>
                  </Row>
                ),
              });
            }}
            icon="akar-icons:arrow-left"
            style={{
              fontSize: "1.8rem",
              cursor: "pointer",
              color: styles.primary,
              marginRight: styles.whitespace1,
            }}
          />
          <Typography.Title level={3} style={{ margin: 0 }}>
            Application Onboarding
          </Typography.Title>
        </Space>
      }
    >
      <Steps
        current={currentStep}
        labelPlacement="vertical"
        size="default"
        responsive
      >
        <Steps.Step
          title="Budget Details"
          icon={
            <Icon
              icon={currentStep > 0 ? "charm:tick" : "fluent-emoji-high-contrast:money-bag"}
            />
          }
        />
        <Steps.Step
          title="Set Alerts"
          icon={
            <Icon icon={currentStep > 1 ? "charm:tick" : "material-symbols:settings-alert-outline"} />
          }
        />
        <Steps.Step
          title="Review &amp; Submit"
          icon={<Icon icon={"material-symbols:edit-outline"} />}
        />
      </Steps>
      <div
        style={{
          marginTop: styles.whitespace2,
          overflow: "auto",
          height: "80%",
        }}
      >
        <BudgetsOnboardingContext.Provider value={value}>
          <Routes>
            <Route
              path="budget-details"
              element={<BudgetDetails />}
            />
            {/* <Route path="set-alerts" element={<SetAlerts />} /> */}
            {/* <Route path="review" element={<ReviewBudget />} /> */}
          </Routes>
        </BudgetsOnboardingContext.Provider>
      </div>
    </ContentWrapper>
  );
};
