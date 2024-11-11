import { createContext, useEffect, useState, useCallback } from "react";
import { ContentWrapper } from "@components/index";
import { Col, Modal, Row, Space, Steps, Typography } from "antd";
import { Icon } from "@iconify/react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";

import styles from "./ApplicationOnboarding.module.scss";

import { ApplicationDetails } from "./ApplicationDetails/ApplicationDetails";
import { SupportingDocuments } from "./SupportingDocuments";
import { ReviewApplication } from "./ReviewApplication";

import { UploadFile } from "antd/lib/upload/interface";
import { get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import { SimilarApps } from "./SimilarApps";
import { string } from "yup";
import { filter } from "lodash";

const { confirm } = Modal;

export type Contract = {
  name: string;
  startDate: string;
  endDate: string;
  renewalTerm: number;
  upcomingRenewalDate: string;
  contractType?: string;
  billingFrequency?: string;
  currencyCode: string;
  contractTenure: string;
  autoRenewal: boolean;
  autoRenewalCancellation: string;
  paymentMethod?: {
    type: string;
    cardHolderName?: string;
    cardNumber?: string;
    validThrough?: string;
    walletName?: "";
  };
  products: {
    productName: string;
    productType: string;
    unitPrice: number;
    quantity: number;
    totalCost: number;
    unitPriceType: string;
  }[];
};

export interface ApplicationFormItems {
  isSingle?: boolean;
  application: {
    applicationName: string;
    subscriptionName: string;
    subscriptionId: string;
    applictionCategory: string;
    ownerEmail: string;
    ownerName: string;
    ownerDepartment: string;
    secondaryContactEmail: string;
    secondaryContactName: string;
    projectName: string;
    providerName: string;
    reason?: string;
  };
  applicationExcel?: UploadFile;
  contracts: Contract[];
  supportingDocuments?: any;
}

interface ApplicationOnboardingContextT {
  formData: {
    application: ApplicationFormItems;
    supportingDocuments: UploadFile[];
  };
  setFormData: (data: any) => void;
  userData: any;
  applicationList: any;
  categories: any;
  projects: any;
  contacts: any;
  onBoardingType: string;
  getRecords: (departmentId: string) => void;
  getContacts: (departmentId: string, emailId: string, newUserData: any) => void;
  setOnBoardingType: (value: string) => void;
}
export const ApplicationOnboardingContext = createContext({} as ApplicationOnboardingContextT);
export const ApplicationOnboaringWrapper = () => {
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [onBoardingType, setOnboading] = useState("Purchased");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationOnboardingContextT["formData"] | null>();
  const [userData, setUserData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [applicationList, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const { pathname } = useLocation();

  const value: ApplicationOnboardingContextT = {
    formData: formData as any,
    setFormData,
    userData,
    applicationList,
    categories,
    projects,
    contacts,
    onBoardingType,
    getRecords: (departmentId) => {
      getRecords(departmentId);
    },
    getContacts: (departmentId, emailId, newUserData) => {
      getContacts(departmentId, emailId, newUserData);
    },
    setOnBoardingType: (value: string) => {
      setFormData(null);
      setOnboading(value);
    },
  };

  useEffect(() => {
    setFormData(null);
    setCurrentStep(0);
  }, [onBoardingType]);

  const getRecords = useCallback((departmentId: string) => {
    get(`v1/project/projectdetails?departmentId=${departmentId}`)
      .then((res: any) => {
        if (res && res.response.data) {
          setProjects(res.response.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setProjects([]);
        setIsLoading(false);
      });
  }, []);

  const getContacts = (departmentId: string, emailId: string, newUserData: any) => {
    if (departmentId && emailId && newUserData) {
      let contactList: any = filter(
        [...newUserData],
        (owner: any) => owner.departmentId === departmentId && owner.userEmail !== emailId
      );
      setContacts(contactList);
    }else{
      setContacts([]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    get("v1/user/details/users")
      .then((res: any) => {
        if (res && res.response.data) {
          setUserData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
    get("v1/application/categories")
      .then((res: any) => {
        if (res && res.response.data) {
          setCategories(res.response.data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
    get("v1/application/get-logos")
      .then((res: any) => {
        if (res && res.response.data) {
          setApplications(res.response.data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
  }, []);

  useEffect(() => {
    const paths = pathname.split("/");
    const currentModule = paths[paths.length - 1];
    if (currentModule === "application-details") {
      setCurrentStep(0);
    }
    if (currentModule === "supporting-docs") {
      setCurrentStep(1);
    }
    if (currentModule === "similar-apps") {
      setCurrentStep(2);
    }
    if (currentModule === "review") {
      setCurrentStep(onBoardingType === "New" ? 3 : 2);
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
                onOk: () => navigate("/applications"),
                content: (
                  <Row
                    gutter={16}
                    style={{ textAlign: "center" }}
                  >
                    <Col span={24}>
                      <Typography.Text>By going back you will loose all filled application details</Typography.Text>
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
          <Typography.Title
            level={3}
            style={{ margin: 0 }}
          >
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
          title="Application Detail"
          icon={<Icon icon={currentStep > 0 ? "charm:tick" : "carbon:application"} />}
        />
        <Steps.Step
          title="Supporting Documents"
          icon={<Icon icon={currentStep > 1 ? "charm:tick" : "ion:documents"} />}
        />
        {onBoardingType === "New" && (
          <Steps.Step
            title="Similar Applications"
            icon={<Icon icon={currentStep > 2 ? "charm:tick" : "icon-park-outline:triangle-round-rectangle"} />}
          />
        )}
        <Steps.Step
          title="Review &amp; Submit"
          icon={<Icon icon={"mdi:application-edit-outline"} />}
        />
      </Steps>
      <div
        style={{
          marginTop: styles.whitespace2,
          overflow: "auto",
          height: "80%",
        }}
      >
        <ApplicationOnboardingContext.Provider value={value}>
          <Routes>
            <Route
              path="application-details"
              key={onBoardingType}
              element={<ApplicationDetails />}
            />
            <Route
              path="supporting-docs"
              element={<SupportingDocuments />}
            />
            <Route
              path="similar-apps"
              element={<SimilarApps />}
            />
            <Route
              path="review"
              element={<ReviewApplication />}
            />
          </Routes>
        </ApplicationOnboardingContext.Provider>
      </div>
    </ContentWrapper>
  );
};
