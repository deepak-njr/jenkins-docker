import { Icon } from "@iconify/react";
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Space, Typography, UploadFile } from "antd";
import React, { useEffect, useState } from "react";
import { ContentWrapper } from "~/Components";

import styles from "@styles/variables.module.scss";
import { useNavigate } from "react-router-dom";
import { get, upload } from "~/Services";
import { useNotification } from "~/Hooks/useNotification";
import { ErrorMessage, Field, FieldProps, Formik } from "formik";
import { currencyData } from "~/Utils/CurrencyCodes";
import { isArray, isEmpty, keys, values } from "lodash";
import moment from "moment";
import Upload from "antd/lib/upload/Upload";
import { RcFile } from "antd/lib/upload";
import { currency } from "@utils/StringConstants";
import { currencyOptions } from "@utils/CurrenyOptions";
import * as yup from "yup";
import { useAuth } from "~/Hooks/useAuth";

export const AddNewInvoice = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openToast, openNotification } = useNotification();
  const [filelist, setFileList] = useState<UploadFile[]>([]);
  const [showFiles, setShowFiles] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    get("v1/application/subscription/lookup")
      .then((res: any) => {
        if (res.response.data) {
          let newData = res.response.data.filter(
            (item: any) => item.subscriptionNumber && item.subscriptionNumber !== "N/A"
          );
          setData(newData);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
  }, []);
  const filteredFileList = filelist.filter((file: any) => file.status !== "removed");

  const handleRemove = (file: any) => {
    // Remove the file from the file list
    const updatedList = [...filelist].filter((item: any) => item.uid !== file.uid);
    setFileList(updatedList);
  };

  return (
    <ContentWrapper
      loading={isLoading}
      customTitle={
        <Space style={{ alignItems: "center", lineHeight: 1 }}>
          <Icon
            onClick={() => {
              navigate("/invoices");
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
            Upload Invoice
          </Typography.Title>
        </Space>
      }
    >
      <Row>
        <Col
          xs={24}
          md={16}
        >
          <Formik
            initialValues={{
              dueDate: "",
              invoiceAmount: 0,
              currency: user.currency,
              invoiceNumber: "",
              subscriptionId: "",
              billPeriod: "",
            }}
            validationSchema={yup.object().shape({
              dueDate: yup
                .string()
                .required("Due date required")
                .test("dueDateCheck", "Due date should be within the billing period", function (value) {
                  const billPeriods = this.parent.billPeriod;
                  if (!isArray(billPeriods)) {
                    return true;
                  }

                  const startDate = moment(billPeriods[0], "DD/MM/YYYY");
                  const endDate = moment(billPeriods[1], "DD/MM/YYYY");
                  const dueDate = moment(value, "DD/MM/YYYY");

                  return dueDate.isBetween(startDate, endDate, null, "[]");
                }),
              billPeriod: yup
                .array()
                .of(yup.string().required("Billing period required"))
                .required("Billing period required"),
              invoiceAmount: yup
                .number()
                .typeError("Enter the correct invoice amount required")
                .min(1, "Invoice amount required and should be greater than 0")
                .required("Invoice amount required")
                .strict(true),
              invoiceNumber: yup
                .string()
                .required("Invoice number required")
                .trim("Invoice number cannot include leading and trailing spaces")
                .matches(new RegExp(/^[A-Za-z0-9_@./#&+-]*$/), "Please enter valid Invoice number")
                .strict(true),
              subscriptionId: yup.string().required("Subscription id required"),
            })}
            onSubmit={(values, { setSubmitting }) => {
              setSubmitting(true);
              const formData = new FormData();
              const { billPeriod }: { billPeriod: string[] } = values as any;
              formData.append("file", filelist[0] as RcFile, filelist[0].name);
              formData.append("dueDate", moment(values.dueDate, "DD/MM/YYYY").format("YYYY-MM-DD"));
              formData.append("invoiceAmount", values.invoiceAmount as any);
              formData.append("currency", values.currency);
              formData.append("invoiceNumber", values.invoiceNumber);
              formData.append("subscriptionId", values.subscriptionId);
              formData.append("billPeriod", billPeriod.join(" to "));

              upload("v1/invoice/upload", formData)
                .then((res: any) => {
                  if (res.status === "OK") {
                    navigate("/invoices");
                    openNotification({
                      title: "success!!",
                      message: "Invoice uploaded successfully",
                      type: "success",
                    });
                  } else if (res.status === "NOT_FOUND") {
                    openToast({ content: res.message, type: "error" });
                  }
                  setSubmitting(false);
                })
                .catch((err: any) => openToast({ content: err.message, type: "error" }));
            }}
          >
            {({ submitForm, setFieldValue, values, isSubmitting, setFieldTouched, touched, errors }) => {
              const disableInvoice =
                isEmpty(
                  values.billPeriod &&
                    values.currency &&
                    values.dueDate &&
                    values.invoiceAmount &&
                    values.invoiceNumber &&
                    values.subscriptionId
                ) || Object.keys(errors).length > 0;
              return (
                <Form
                  layout="vertical"
                  onFinish={submitForm}
                >
                  <Row gutter={[16, 16]}>
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Field name="invoiceNumber">
                        {({ field }: FieldProps) => (
                          <Form.Item label="Invoice Number">
                            <Input
                              {...field}
                              size="large"
                              status={(touched.invoiceNumber && errors.invoiceNumber && "error") || ""}
                            />
                            <Typography.Text type="danger">
                              <ErrorMessage name="invoiceNumber" />
                            </Typography.Text>
                          </Form.Item>
                        )}
                      </Field>
                    </Col>
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Field name="subscriptionId">
                        {({ field }: FieldProps) => (
                          <Form.Item label="Subscription Id">
                            <Select
                              value={field.value}
                              onChange={(e) => setFieldValue("subscriptionId", e)}
                              onBlur={() => setFieldTouched("subscriptionId", true)}
                              size="large"
                              showSearch
                              filterOption={(inputValue, option: any) =>
                                option.children &&
                                inputValue &&
                                option.children.toLowerCase().includes(inputValue.toLowerCase())
                              }
                              status={(touched.subscriptionId && errors.subscriptionId && "error") || ""}
                            >
                              {data.map((item: any, index: number) => (
                                <Select.Option
                                  value={item.subscriptionId}
                                  key={`${index}-${item.subscriptionId}`}
                                >
                                  {item.subscriptionNumber}
                                </Select.Option>
                              ))}
                            </Select>
                            <Typography.Text type="danger">
                              <ErrorMessage name="subscriptionId" />
                            </Typography.Text>
                          </Form.Item>
                        )}
                      </Field>
                    </Col>
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Field name="invoiceAmount">
                        {({ field }: FieldProps) => (
                          <Form.Item label="Invoice Amount">
                            <Input.Group compact>
                              <Select
                                showSearch
                                defaultValue={user.currency}
                                value={values.currency}
                                size="large"
                                style={{ width: "30%" }}
                                onChange={(e) => setFieldValue("currency", e)}
                              >
                                {currencyOptions(currencyData, currency)}
                              </Select>
                              <InputNumber
                                size="large"
                                onChange={(e) => setFieldValue("invoiceAmount", e)}
                                onBlur={() => setFieldTouched("invoiceAmount", true)}
                                style={{ width: "70%" }}
                                type="number"
                                min={0}
                                status={(touched.invoiceAmount && errors.invoiceAmount && "error") || ""}
                              />
                            </Input.Group>
                            <Typography.Text type="danger">
                              <ErrorMessage name="invoiceAmount" />
                            </Typography.Text>
                          </Form.Item>
                        )}
                      </Field>
                    </Col>
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Field name="billPeriod">
                        {({ field }: FieldProps) => (
                          <Form.Item label="Billing Period">
                            <DatePicker.RangePicker
                              size="large"
                              allowClear
                              onChange={(e) =>
                                setFieldValue(
                                  `billPeriod`,
                                  e ? [moment(e[0]).format("DD/MM/YYYY"), moment(e[1]).format("DD/MM/YYYY")] : ""
                                )
                              }
                              onBlur={() => setFieldTouched("billPeriod", true)}
                              format="DD/MM/YYYY"
                              {...(field.value && {
                                value: [moment(field.value[0], "DD/MM/YYYY"), moment(field.value[1], "DD/MM/YYYY")],
                              })}
                              style={{ width: "100%" }}
                              status={(touched.billPeriod && errors.billPeriod && "error") || ""}
                            />
                            <Typography.Text type="danger">
                              <ErrorMessage name="billPeriod" />
                            </Typography.Text>
                          </Form.Item>
                        )}
                      </Field>
                    </Col>
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Field name="dueDate">
                        {({ field }: FieldProps) => (
                          <Form.Item label="Due Date">
                            <DatePicker
                              size="large"
                              allowClear
                              onChange={(e) => setFieldValue(`dueDate`, e ? moment(e).format("DD/MM/YYYY") : "")}
                              onBlur={() => setFieldTouched("dueDate", true)}
                              format="DD/MM/YYYY"
                              disabled={!isArray(values.billPeriod)}
                              {...(field.value && {
                                value: moment(field.value, "DD/MM/YYYY"),
                              })}
                              style={{ width: "100%" }}
                              status={(touched.dueDate && errors.dueDate && "error") || ""}
                            />
                            <Typography.Text type="danger">
                              <ErrorMessage name="dueDate" />
                            </Typography.Text>
                          </Form.Item>
                        )}
                      </Field>
                    </Col>
                    <Col
                      xs={24}
                      md={12}
                    >
                      <Form.Item label="Invoice file">
                        <Upload
                          style={{
                            borderRadius: 10,
                            padding: 30,
                          }}
                          name="users"
                          fileList={filelist}
                          showUploadList={showFiles}
                          beforeUpload={() => false}
                          onChange={(e) => {
                            if (Number(e.file.size) / 1024 / 1024 > 5) {
                              openToast({
                                content: "Maximum file size should be 5MB",
                                type: "error",
                              });
                              return false;
                            }
                            setFileList([e.file]);
                            if (e.fileList.length === 0) {
                              setShowFiles(false);
                            } else {
                              setShowFiles(true);
                            }
                          }}
                          multiple={false}
                          accept=".pdf"
                          onRemove={handleRemove}
                        >
                          <Button
                            type="primary"
                            icon={<Icon icon="jam:attachment" />}
                          >
                            Choose File
                          </Button>
                        </Upload>
                        <div>
                          {filteredFileList.length === 0 && (
                            <Typography.Text
                              type="danger"
                              style={{ marginTop: 8 }}
                            >
                              (max file size should be 5MB)
                            </Typography.Text>
                          )}
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row justify={"end"}>
                    <Col style={{ textAlign: "right" }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        disabled={filteredFileList.length === 0 || disableInvoice}
                      >
                        Submit
                      </Button>
                    </Col>
                  </Row>
                </Form>
              );
            }}
          </Formik>
        </Col>
      </Row>
    </ContentWrapper>
  );
};
