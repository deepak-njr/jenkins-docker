import { Image, Button, Modal, Typography, Input, Form, Row, Tag } from "antd";
import { useEffect, useState } from "react";
import { FormikState } from "formik/dist/types";
import * as yup from "yup";
import { Field, FieldProps, Formik, FormikValues } from "formik";
import Title from "antd/es/typography/Title";

import { useNotification } from "@hooks/useNotification";
import { get, post } from "~/Services";
import { imageKey } from "~/Utils";
import Close from "@assets/SVG/Close.svg";
import { useNavigate } from "react-router-dom";
import Connection from "@assets/SVG/Connection.svg";

import styles from "./ConnectToAdaptors.module.scss";
import axios from "axios";

interface Props {
  data: { [key in string]: any };
  refreshData: () => void;
}

interface callBackApi {
  completed: any;
  callBackApiEndPoint?: any; 
}

export const ConnectToAdaptors = ({ data, refreshData }: Props) => {
  const { openNotification, openToast } = useNotification();
  const [selectedApp, setSelectedApp] = useState("");
  const [adaptorFields, setAdaptorFields] = useState([]);
  const [callBackApi, setcallBackApi] = useState<callBackApi | undefined>();
  const [openApplicationModal, setOpenApplicationModal] = useState(false);
  const [keyValues, setKeyValues] = useState();
  const [isloading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [accessToken,setAccessToken] = useState()
  const [errorModal, setErrorModal] = useState(false);
  const [appName, setAppName] = useState<string>(data?.applicationName);
  const submitMapping = (values: any) => {
    setKeyValues(values);
    setConfirmation(true);
  };

  const navigate = useNavigate()

  const submitValues = (resetForm: (nextState?: Partial<FormikState<FormikValues>>) => void) => {
    setIsSubmitLoading(true);
    post(`/v1/application/adaptor/save/details?applicationId=${data.applicationId}`, { adaptorValues: keyValues })
      .then((res: any) => {
        if (res.status === "OK") {
          openNotification({
            title: "Success",
            message: "Application Mapping success",
            type: "success",
          });
          setIsSubmitLoading(false);
          refreshData();
          if (callBackApi?.completed === false) {
            const callBackApiEndPoints = callBackApi?.callBackApiEndPoint?.split(',').map((url: string) => url?.trim());
            const adaptorTokenDt = {
              callbackAuthrize: callBackApiEndPoints && callBackApiEndPoints[0],
              callbackAccessToken: callBackApiEndPoints && callBackApiEndPoints[1],
              appId: data.applicationId,
            };  
            localStorage.setItem("adaptorTokenDt", JSON.stringify(adaptorTokenDt));
            navigate("/adaptor/authorize")
          }
        }
        resetForm();
        setOpenApplicationModal(false);
        setConfirmation(false);
        setIsSubmitLoading(false);
      })
      .catch((err) => {
        setErrorModal(true);
        setIsSubmitLoading(false);
        setConfirmation(false);
      });
     
  };


  useEffect(() => {
    const currentUrl = window.location.href;
    const urlSearchParams = new URLSearchParams(currentUrl);
    const codeParam = urlSearchParams.get('code');
    codeParam && get(`/v1/application/adaptor/keys?applicationId=${data.applicationId}`).then((res:any) => {
      const callBackApiEndPoints = res.response.data?.callBackApiEndPoint?.split(',').map((url: string) => url?.trim());
      const firstEndPoint = callBackApiEndPoints && callBackApiEndPoints[1];  
      if(codeParam && firstEndPoint){
        get(
          `${firstEndPoint}?appId=${data.applicationId}&code=${codeParam}`
        ).then((res:any) => {
          setAccessToken(res.response.data)
        });
      }      
      
    })
  },[])

  useEffect(() => {
    if (openApplicationModal) {
    }
  }, [openApplicationModal]);

  const defaultValue = adaptorFields?.reduce((acc: any, cur: any) => {
    acc[cur?.key] = "";
    return acc;
  }, {});

  function generateValidationSchema(adaptorFields: any) {
    const validationSchemaObject: any = {};

    adaptorFields.forEach((field: any) => {
      const { key, type, required, label } = field;
      let schema: any = yup.string();
      if (type === "Number") {
        schema = yup.number().typeError(`${label} must be a number`);
      }
      if (type === "Email") {
        schema = yup.string().email(`${label} must be a valid email address`);
      }
      if (required === "true") {
        schema = schema.required(`${label} is required`);
      }

      validationSchemaObject[key] = schema;
    });
    return yup.object().shape(validationSchemaObject);
  }

  const validationSchema = generateValidationSchema(adaptorFields);

  const getApplicationDetails = () => {
    setIsLoading(true);
    get(`/v1/application/adaptor/keys?applicationId=${data.applicationId}`)
      .then((res: any) => {
        setcallBackApi(res.response.data)
        if (res?.response?.data?.keyValues) {
          setAppName(res?.response?.data?.appName);
          setAdaptorFields(res?.response?.data?.keyValues);
          setOpenApplicationModal(true);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setErrorModal(true);
      });
  };

  const onAuthorizePage = () => {
    localStorage.setItem("appId",data.applicationId)
    setIsLoading(true);
    get(`/v1/application/adaptor/keys?applicationId=${data.applicationId}`)
      .then((res: any) => {
        localStorage.setItem("callBackApi",JSON.stringify(res.response.data))
        if (res?.response?.data?.keyValues) {
          setAppName(res?.response?.data?.appName);
          setAdaptorFields(res?.response?.data?.keyValues);
          setOpenApplicationModal(true);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setErrorModal(true);
      });

    navigate("/adaptor/authorize")
  }


  return (
    <>
      <Formik
        initialValues={defaultValue}
        onSubmit={submitMapping}
        validationSchema={validationSchema}
      >
        {({ submitForm, resetForm, setFieldValue, touched, errors, isValid, dirty, values }) => (
          <div>
            <Modal
              className={styles.ModalForm}
              open={openApplicationModal}
              title={
                <div className={styles.Title}>
                  <Image
                    src={`${data.applicationLogo}${imageKey}`}
                    className={styles.ImageStyle}
                    preview={false}
                  />
                  <Title level={5}>Connect with {data.applicationName}</Title>
                </div>
              }
              okText={"Submit"}
              width={400}
              closeIcon={true}
              maskClosable={false}
              onCancel={() => {
                setOpenApplicationModal(false);
                resetForm();
              }}
              onOk={() => submitForm()}
              okButtonProps={{
                disabled: !(isValid && dirty && Object.values(values).every((value: any) => value.trim() !== "")),
              }}
            >
              <Form
                onFinish={submitForm}
                layout="vertical"
              >
                {adaptorFields.map((item: any, index) => (
                  <Row>
                    <Field name={item?.key}>
                      {({ field, meta }: FieldProps) => {
                        return (
                          <Form.Item
                            className={styles.InputStyle}
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
              </Form>
            </Modal>
            <Modal
              open={confirmation}
              okText={"Yes"}
              className={styles.ModalConfirmation}
              width={500}
              centered
              closeIcon={true}
              maskClosable={false}
              title={
                <div className={styles.ModalTitle}>
                  <Image
                    src={Connection}
                    preview={false}
                  />
                </div>
              }
              onCancel={() => {
                setConfirmation(false);
              }}
              onOk={() => {
                submitValues(resetForm);
              }}
              confirmLoading={isSubmitLoading}
            >
              <div>
                <p>
                  Thanks for providing your Details. Do you want to proceed and connect with
                  <Title
                    className={styles.ModalContent}
                    level={5}
                  >
                    {appName}
                  </Title>{" "}
                  ?
                </p>
              </div>
            </Modal>
            <Modal
              style={{ zIndex: 3 }}
              open={errorModal}
              width={500}
              centered
              closeIcon={false}
              maskClosable={false}
              footer={false}
              title={
                <div className={styles.ModalTitle}>
                  <Image
                    src={Close}
                    preview={false}
                  />
                </div>
              }
              onCancel={() => {
                setErrorModal(false);
              }}
            >
              <div>
                <p>
                  Something happened. We got error while connecting SaaSpe with
                  <Title
                    className={styles.ModalContent}
                    level={5}
                  >
                    {appName}
                  </Title>{" "}
                  ?
                </p>
              </div>
            </Modal>
          </div>
        )}
      </Formik>
      {!data.isAdaptorConnected ? (
        <Button
          type="default"
          onClick={() => onAuthorizePage()}
          loading={isloading}
        >
          Connect with {data.applicationName}
          <Image
            src={`${data.applicationLogo}${imageKey}`}
            className={styles.ButtonImage}
            preview={false}
          />
        </Button>
      ) : (
        <Tag
          color="green"
          className={styles.ButtonSuccess}
        >
          Connected with {data.applicationName}
          <Image
            src={`${data.applicationLogo}${imageKey}`}
            className={styles.ButtonImage}
            preview={false}
          />
        </Tag>
      )}
    </>
  );
};
