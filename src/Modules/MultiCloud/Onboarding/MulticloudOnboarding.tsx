import React, { useEffect, useState } from "react";
import { ContentWrapper } from "~/Components";
import { get, post } from "@services/index";
import { useNotification } from "~/Hooks/useNotification";
import { ErrorMessage, Formik, Field } from "formik";
import { Col, Form, Row, Select, Space, Typography, Image, Button } from "antd";
import { map } from "lodash";
import styles from "./MulticloudOnboarding.module.scss";
import { imageKey } from "~/Utils";
import * as yup from "yup";
import { MULTICLOUD_ONBOARDING_SCHEMA } from "~/Utils/formValidationSchemas";
import { MultiCloud } from "../CloudConstants";
import { AzureFormField } from "./AzureFormField";
import { withCloudConfigurator } from "../WithCloudConfigurator";
import { AWSFormField } from "./AWSFormFIelds";
import { useNavigate } from "react-router-dom";
interface CloudProvider {
  vendorName: string;
  vendorLogo: string;
  id: number;
}

interface FormItems {
  provider: string;
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
}

const initialValue: FormItems = {
  provider: "",
};

const allowedProvider: any = ["", MultiCloud.GCP];

export const MulticloudOnboarding = withCloudConfigurator(({ fetchMultiCloud, configuredCloudApps }) => {
  const { openNotification, openToast } = useNotification();
  const [cloudProvider, setCloudProvider] = useState<CloudProvider[]>([]);
  const [cloudProviderLoading, setCloudProviderLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCloudProviderLoading(true);
    get("/cloud/vendors")
      .then((res: any) => {
        if (res.status === "OK") {
          setCloudProvider(res.response.data);
        }
        setCloudProviderLoading(false);
      })
      .catch((err) => {
        setCloudProviderLoading(false);
        openToast({ content: err, type: "error" });
      });
  }, []);

  const getFormValues = (provider: string) => {
    switch (provider) {
      case MultiCloud.AZURE:
        return {
          provider,
          clientId: "",
          clientSecret: "",
          tenantId: "",
        };
      case MultiCloud.AWS:
        return {
          provider,
          accessKeyId: "",
          secretAccessKey: "",
          tenantId: "",
        };
      default:
        return {
          provider,
        };
    }
  };

  return (
    <ContentWrapper
      title="Add Cloud Provider"
      loading={cloudProviderLoading}
    >
      <Formik
        initialValues={initialValue}
        validationSchema={MULTICLOUD_ONBOARDING_SCHEMA}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(true);
          post("/cloud/onboard", { ...values })
            .then((res: any) => {
              setSubmitting(false);
              openNotification({
                message: "Onboarded successfully ",
                title: "Success",
                type: "success",
              });
              if (fetchMultiCloud) {
                fetchMultiCloud && fetchMultiCloud();
              }
              navigate("/administration/multicloud");
            })
            .catch((err) => {
              setSubmitting(false);
            });
        }}
      >
        {({ values, submitForm, setFieldTouched, setValues, isSubmitting, isValid, dirty }) => {
          return (
            <Form
              layout="vertical"
              onFinish={submitForm}
            >
              <Row>
                <Col
                  xs={24}
                  md={16}
                >
                  <Row gutter={[16, 16]}>
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Field name="provider">
                        {() => (
                          <Form.Item label="Cloud Provider">
                            <Select
                              value={values.provider}
                              onChange={(e) => {
                                setValues(getFormValues(e));
                              }}
                              onFocus={() => {
                                setFieldTouched("provider", true);
                              }}
                            >
                              {cloudProvider &&
                                map(cloudProvider, (cloud, index: number) => (
                                  <Select.Option
                                    value={cloud.vendorName}
                                    key={index}
                                  >
                                    <Space>
                                      <Image
                                        src={`${cloud.vendorLogo}${imageKey}`}
                                        style={{ width: 20 }}
                                      />
                                      {cloud.vendorName}
                                    </Space>
                                  </Select.Option>
                                ))}
                            </Select>
                            <Typography.Text type="danger">
                              <ErrorMessage name="provider" />
                            </Typography.Text>
                          </Form.Item>
                        )}
                      </Field>
                    </Col>
                    {values.provider === MultiCloud.AZURE && <AzureFormField />}
                    {values.provider === MultiCloud.AWS && <AWSFormField />}
                    <Col
                      md={allowedProvider.includes(values.provider) ? 12 : 24}
                      xs={24}
                      className={allowedProvider.includes(values.provider) ? styles.customSubmit : styles.defaultSubmit}
                    >
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        disabled={!(isValid && dirty)}
                      >
                        Submit
                      </Button>
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
});
