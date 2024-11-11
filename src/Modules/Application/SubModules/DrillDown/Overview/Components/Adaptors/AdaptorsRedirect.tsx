import { Avatar, Button, Col, Form, Image, Input, Modal, Row, Space, Steps, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContentWrapper } from "~/Components";
import { useNotification } from "~/Hooks/useNotification";
import { get, post } from "~/Services";
import { imageKey } from "~/Utils";
import { isEmpty, get as _get, uniqueId } from "lodash";
import { Field, FieldProps, Formik } from "formik";
import { Icon } from "@iconify/react";
import * as Yup from "yup";
import closeCircle from "@iconify-icons/mdi/close-circle";
import lockCheck from "@iconify-icons/mdi/lock-check";

export const AdaptorsRedirect = () => {
  const [formValues, setFormValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }>({});
  const { openToast } = useNotification();
  const { id } = useParams();
  const [adaptorFields, setAdaptorFields] = useState([]);
  const [appName, setAppName] = useState<string>(data?.applicationName);
  const [currentStep, setCurrentStep] = useState(0);
  const [keyValues, setKeyValues] = useState();
  const navigate = useNavigate();
  const { openNotification } = useNotification();
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const clearAdaptorsValues = () => {
    localStorage.removeItem("adaptorParamsValues");
    localStorage.removeItem("callBackApi");
  };

  const appId = localStorage?.getItem("appId") ?? "default-value";
  const callBackAPi = localStorage?.getItem("callBackApi");
  const callBackAPiValues = callBackAPi && JSON.parse(callBackAPi);
  const callBackApiEndPoints = callBackAPiValues?.callBackApiEndPoint?.split(",").map((url: string) => url?.trim());

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const codeParam = searchParams?.get("code") ?? "false";
    const realmId = searchParams?.get("realmId") ?? "";
    const adaptorParamsValues = {
      code: codeParam,
      realmId: realmId,
    };
    localStorage.setItem("adaptorParamsValues", JSON.stringify(adaptorParamsValues));
    if (codeParam !== "false") {
      setCurrentStep(1);
      setIsLoading(true);
      callBackApi();
    }
  }, []);

  const callBackApi = () => {
    const uniqueId = localStorage.getItem("uniqueId");
    setIsLoading(true);
    const storedAdaptorparams = localStorage.getItem("adaptorParamsValues");
    const paramValues = storedAdaptorparams && JSON.parse(storedAdaptorparams);
    if (callBackApiEndPoints) {
      let apiUrl = `${callBackApiEndPoints[1]}?appId=${appId}&code=${paramValues.code}&uniqueId=${uniqueId}`;

      if (paramValues.realmId !== null && paramValues.realmId !== undefined && paramValues.realmId !== "") {
        apiUrl += `&realmId=${paramValues.realmId}`;
      }
      get(apiUrl)
        .then((res: any) => {
          setOpen(true);
          if (res) {
            setSuccess(true);
            setCurrentStep(1);
            openNotification({
              title: "Success",
              message: "Application connected successfully",
              type: "success",
            });
            clearAdaptorsValues();
            setIsLoading(false);
          }
        })
        .catch(() => {
          setOpen(true);
          setSuccess(false);
          setCurrentStep(1);
          clearAdaptorsValues();
          openNotification({
            title: "Error",
            message: "Something went Wrong",
            type: "error",
          });
          setIsLoading(false);
        });
    } else {
      navigate(`/applications`);
    }
  };

  const getApplicaitonDetail = () => {
    if (appId) {
      get(`v1/application/overview?applicationId=${appId}`)
        .then((res: any) => {
          if (res && res.response.data) {
            let newData = res.response.data;
            newData.applicationOwner = _get(newData, "ownerDetails[0].applicaitonOwnerName");
            newData.applicationOwnerEmail = _get(newData, "ownerDetails[0].applicationOwnerEmail");
            newData.secondaryOwnerEmail = _get(newData, "ownerDetails[1].applicationOwnerEmail");
            setData(newData);
          }
        })
        .catch((err) => {
          openToast({ content: err, type: "error" });
        });
    }
  };

  const getApplicationDetails = () => {
    get(`/v1/application/adaptor/keys?applicationId=${appId}`)
      .then((res: any) => {
        if (res?.response?.data?.keyValues) {
          setAppName(res?.response?.data?.appName);
          setAdaptorFields(res?.response?.data?.keyValues);
        }
      })
      .catch((err) => {});
  };

  const defaultValue = adaptorFields?.reduce((acc: any, cur: any) => {
    acc[cur?.key] = "";
    return acc;
  }, {});

  useEffect(() => {
    if (isEmpty(data)) {
      getApplicaitonDetail();
      getApplicationDetails();
    }
  }, [id]);

  const stepItems: any = [
    {
      key: 0,
      item: "Authorization Setup",
      title: "Authorization Setup",
      icon: <Icon icon={currentStep > 0 ? "mdi:user" : "mdi:user"} />,
    },
    {
      key: 1,
      item: "Authorize",
      title: "Authorize",
      icon: (
        <Icon
          style={{ color: "white" }}
          icon={currentStep > 0 ? "mdi:lock-check" : "mdi:lock-check"}
        />
      ),
    },
  ];

  const validationSchema = Yup.object().shape(
    Object.keys(defaultValue).reduce((acc: any, key) => {
      const field: any = adaptorFields.find((item: any) => item.key === key);
      if (field) {
        let validation = Yup.string().required(`${field.label} is required`);
        if (field.regex) {
          validation = validation.matches(new RegExp(field.regex), {
            message: `${field.label} is invalid`,
            excludeEmptyString: true,
          });
        }
        if (field.trailspace) {
          validation = validation.matches(/^\S*$/, {
            message: `${field.label} should not contain leading or trailing spaces`,
          });
        }
        acc[key] = validation;
      }
      return acc;
    }, {})
  );

  const onAuthorize = () => {
    setIsLoading(true);
    post(`/v1/application/adaptor/save/details?applicationId=${appId}`, { adaptorValues: keyValues })
      .then((res: any) => {
        if (res.status === "OK") {
          openNotification({
            title: "Success",
            message: "Application Mapping success",
            type: "success",
          });
          if (callBackAPiValues?.oauthRequired === false) {
            const currentUrl = window.location.href;
            get(`${callBackApiEndPoints[0]}?appId=${appId}&redirectUri=${currentUrl}`).then((res: any) => {
              if (res) {
                localStorage.setItem("uniqueId", res.response.data.uniqueId);
                window.location.href = `${res.response.data.url}`;
                setCurrentStep(1);
              } else {
                setOpen(true);
                setSuccess(false);
                setCurrentStep(1);
                clearAdaptorsValues();
                openNotification({
                  title: "Error",
                  message: "Something went Wrong",
                  type: "error",
                });
              }
            });
          } else if (callBackAPiValues?.oauthRequired === true) {
            clearAdaptorsValues();
            navigate(`/applications/${appId}?activeTab=overview`);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setOpen(true);
        setSuccess(false);
        setCurrentStep(1);
        clearAdaptorsValues();
      });
  };

  function submitForm(values: any): void {
    setKeyValues(values);
  }

  const modalRedirect = () => {
    setOpen(false);
    success ? navigate(`/applications/${appId}?activeTab=overview`) : setCurrentStep(0);
    success && localStorage.removeItem("appId");
  };

  const handleSubmitForm = (values: any) => {
    setFormValues({ ...formValues, ...values });
    setCurrentStep(1);
    setKeyValues(values);
  };

  const handleCancel = ()=>{
    setFormValues({})
    setCurrentStep(0)
  }

  const onApplicationpage = () => {
    clearAdaptorsValues();
    navigate(`/applications/${appId}?activeTab=overview`);
  };

  return (
    <ContentWrapper>
      <Row
        gutter={16}
        style={{ marginTop: "12px" }}
      >
        <>
          <Row>
            <Col>
              <Space style={{ alignItems: "center" }}>
                <Icon
                  onClick={() => onApplicationpage()}
                  icon="akar-icons:arrow-left"
                  style={{
                    fontSize: "1.8rem",
                    cursor: "pointer",
                    color: "rgb(41, 37, 110)",
                    marginRight: "10px",
                  }}
                />
                <Avatar
                  size={48}
                  src={`${data.applicationLogo}${imageKey}`}
                  shape="square"
                />
                <Space
                  size={0}
                  direction="vertical"
                >
                  <Typography.Title
                    level={5}
                    style={{ marginBottom: 0 }}
                  >
                    {data.applicationName}
                  </Typography.Title>
                  {data.applicationProviderName && (
                    <Typography.Text style={{ color: "rgba(0, 0, 0, 0.85);" }}>
                      {data.applicationProviderName}
                    </Typography.Text>
                  )}
                </Space>
              </Space>
            </Col>
          </Row>
        </>
        <Col
          style={{ marginTop: "20px" }}
          span={24}
        >
          <Typography.Paragraph
            style={{
              paddingLeft: "50px",
              whiteSpace: "normal",
              wordBreak: "break-word",
              fontWeight: "400",
              fontSize: "14px",
              color: "gray",
            }}
          >
            {data.applicationDescription}
          </Typography.Paragraph>
        </Col>
        <Row style={{ width: "75%", display: "flex", justifyContent: "center" }}>
          <Steps
            style={{ width: "90%", margin: "25px 0px" }}
            current={currentStep}
            items={stepItems}
            labelPlacement="vertical"
            size="default"
            responsive
          />
          {currentStep === 0 && (
            <Row>
              <Typography.Paragraph
                style={{
                  paddingLeft: "50px",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  fontWeight: "400",
                  fontSize: "14px",
                  color: "gray",
                }}
              >
                Before you proceed with authorizing access to your data, we want to ensure transparency and provide you
                with essential information. Please take a moment to review our Standard Operating Procedure (SOP)
                document, which outlines the details of how your data will be handled.
              </Typography.Paragraph>
              <Row style={{ marginLeft: "50px" }}>
                <Button
                  disabled
                  style={{ color: "#1363DF", borderRadius: "8px", border: "1px solid #1363DF", fontWeight: "500" }}
                >
                  Access SOP Document
                </Button>
              </Row>
            </Row>
          )}
          <Row style={{ width: "90%", margin: "30px 0px" }}>
            {currentStep === 0 && (
              <Row style={{ display: "block", width: "100%" }}>
                <h2>Client Information</h2>
                <Formik
                  initialValues={formValues}
                  onSubmit={handleSubmitForm}
                  validationSchema={validationSchema}
                >
                  {(formik) => (
                    <Form
                      style={{ width: "100%" }}
                      layout="vertical"
                      onFinish={submitForm}
                    >
                      {adaptorFields.map((item: any, index) => (
                        <Row style={{ width: "100%" }}>
                          <Field name={item?.key}>
                            {({ field, meta }: FieldProps) => {
                              return (
                                <Form.Item
                                  style={{ width: "60%" }}
                                  // className={styles.InputStyle}
                                  label={item?.label}
                                  validateStatus={meta.touched && meta.error ? "error" : ""}
                                >
                                  <Input
                                    size="large"
                                    {...field}
                                  />
                                  {meta.touched && meta.error && (
                                    <Typography.Text type="danger">{meta.error.toString()}</Typography.Text>
                                  )}
                                </Form.Item>
                              );
                            }}
                          </Field>
                        </Row>
                      ))}
                      <Row style={{ display: "flex", justifyContent: "end", width: "60%" }}>
                        <Row style={{ width: "35%", display: "flex", justifyContent: "space-between" }}>
                          <Button
                            disabled={isLoading}
                            onClick={() => onApplicationpage()}
                          >
                            Cancel
                          </Button>
                          <Button
                            id="yourButton"
                            type="primary"
                            onClick={() => {
                              formik.handleSubmit();
                              if (!formik.isValid) {
                                setCurrentStep(1);
                              }
                            }}
                            disabled={formik.dirty && Object.keys(formik.errors).length === 0 ? false : true}
                          >
                            Submit
                          </Button>
                        </Row>
                      </Row>
                    </Form>
                  )}
                </Formik>
              </Row>
            )}
          </Row>
          <Row style={{ width: "90%", marginTop: "-30px" }}>
            {currentStep === 1 && (
              <>
                <h2>Authorize SaasPe Access</h2>
                <Typography.Paragraph
                  style={{
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    fontWeight: "400",
                    fontSize: "14px",
                    color: "gray",
                  }}
                >
                  To enable seamless integration of your application with SAASpe, we kindly request your authorization.
                  Your consent will facilitate a professional and efficient connection, ensuring a smooth and enhanced
                  experience for optimal functionality.
                </Typography.Paragraph>
                <Row style={{ display: "flex", justifyContent: "end", width: "100%", marginTop: "20px" }}>
                  <Row style={{ width: isLoading ? "30%" : "24%", display: "flex", justifyContent: "space-between" }}>
                    <Button
                      disabled={isLoading}
                      onClick={() => handleCancel()}
                    >
                      Cancel
                    </Button>
                    <Button
                      loading={isLoading}
                      onClick={() => onAuthorize()}
                      type="primary"
                    >
                      {isLoading ? "connecting..." : "Authorize"}
                    </Button>
                  </Row>
                </Row>
              </>
            )}
          </Row>
        </Row>
        <Modal
          open={open}
          footer={false}
          closable={false}
          centered
          bodyStyle={{ maxHeight: 300, overflowY: "auto" }}
        >
          <div
            style={{
              padding: "5px",
              textAlign: "center",
            }}
          >
            <Icon
              icon={success ? "mdi:tick-circle" : "mdi:close-circle"}
              style={{
                color: success ? "#34b233" : "red",
              }}
              inline
              fontSize={55}
            />
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                width: "100%",
                fontSize: "20px",
                color: success ? "#34b233" : "red",
              }}
            >
              {success ? "Authorized" : "Failed"}
            </div>
            <Typography.Text style={{ color: "rgba(0, 0, 0, 0.85);" }}>
              <strong>{success && data.applicationName} </strong>
              {success
                ? "adapter is now successfully connected and authorized"
                : "Something happened. Please enter the details correctly. We got error while connecting SaaSPe with"}{" "}
              <strong>{!success && data.applicationName}</strong>
            </Typography.Text>
          </div>
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "30px" }}>
            <Button
              type="primary"
              onClick={() => modalRedirect()}
            >
              Ok
            </Button>
          </div>
        </Modal>
      </Row>
    </ContentWrapper>
  );
};
