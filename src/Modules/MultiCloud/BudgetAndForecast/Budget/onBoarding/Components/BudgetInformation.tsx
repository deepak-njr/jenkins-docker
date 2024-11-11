import { ReactNode, useContext, useEffect, useState } from "react";
import { Col, Input, Row, Select, Typography, Form, DatePicker } from "antd";
import { FormikProps, FieldProps, FastField, Field } from "formik";
import { isArray, isEmpty, keys, values } from "lodash";

import { get } from "~/Services/api.service";
import { BudgetFormItems, BudgetsOnboardingContext } from "../Wrapper";
import { currencyOptions } from "~/Utils/CurrenyOptions";
import { currencyData } from "~/Utils/CurrencyCodes";
import { currency } from "~/Utils/StringConstants";
import moment from "moment";
const { Item } = Form;

export const BudgetInformation = (props: FormikProps<BudgetFormItems>) => {
  const {} = useContext(BudgetsOnboardingContext);
  const [disabled, setDisabled] = useState(true);
  const { setFieldValue, errors, touched, setFieldTouched, values } = props;
  useEffect(() => {
    get("/cloud/subscriptions").then((res: any) => {
      setFieldValue("budgetScope", res.response.data[0].subscriptionId);
      setFieldValue("currencyCode", res.response.data[0].defaultCurrency);
    });
  }, []);
  const resetPeriod = localStorage.getItem("resetPeriod");

  return (
    <>
      <Typography.Title level={3}>Budget Details</Typography.Title>
      <Row gutter={24}>
        <EqualCol>
          <FastField name={"budgetScope"}>
            {({ field }: FieldProps) => {
              return (
                <Item label="Budget Scope">
                  <Input
                    disabled
                    size="large"
                    {...field}
                    status={(touched.budgetScope && errors.budgetScope && "error") || ""}
                    onChange={(e) => setFieldValue("budgetScope", e.target.value)}
                  />
                  {touched.budgetScope && errors.budgetScope && (
                    <Typography.Text type="danger">{errors.budgetScope}</Typography.Text>
                  )}
                </Item>
              );
            }}
          </FastField>
        </EqualCol>

        <EqualCol>
          <FastField name={"budgetName"}>
            {({ field }: FieldProps) => {
              return (
                <Item label="Budget Name">
                  <Input
                    size="large"
                    {...field}
                    onChange={(e) => setFieldValue("budgetName", e.target.value)}
                    status={(touched.budgetName && errors.budgetName && "error") || ""}
                  />
                  {touched.budgetName && errors.budgetName && (
                    <Typography.Text type="danger">{errors.budgetName}</Typography.Text>
                  )}
                </Item>
              );
            }}
          </FastField>
        </EqualCol>
        <EqualCol>
          <Field name={`resetPeriod`}>
            {({ field }: FieldProps) => {
              return (
                <Item label="Reset Period">
                  <Select
                    showSearch
                    options={[
                      {
                        label: "Invoices",
                        options: [
                          { label: "Billing Month", value: "BillingMonth" },
                          { label: "Billing Quarter", value: "BillingQuarter" },
                          { label: "Billing Year", value: "BillingAnnual" },
                        ],
                      },
                      {
                        label: "Calendar Months",
                        options: [
                          { label: "Monthly", value: "Monthly" },
                          { label: "Quarterly", value: "Quarterly" },
                          { label: "Annually", value: "Annually" },
                        ],
                      },
                    ]}
                    onSelect={(e: string) => {
                      setFieldValue("resetPeriod", e);
                      localStorage.setItem("resetPeriod", e);
                      setFieldValue("creationDate", "");
                      setFieldValue("expirationDate", "");
                    }}
                    size="large"
                    onBlur={() => setFieldTouched(`resetPeriod`, true)}
                    value={field.value}
                    status={(touched?.resetPeriod && errors?.resetPeriod && "error") || ""}
                  ></Select>
                  {touched?.resetPeriod && errors?.resetPeriod && (
                    <Typography.Text type="danger">{errors?.resetPeriod}</Typography.Text>
                  )}
                </Item>
              );
            }}
          </Field>
        </EqualCol>
        <EqualCol>
          <FastField name={"creationDate"}>
            {({ field }: FieldProps) => {
              const handleCreationDateChange = (date: moment.Moment | null) => {
                setFieldValue(`creationDate`, date ? moment(date).format("DD/MM/YYYY") : "");
                if (resetPeriod && date) {
                  let endDate;
                  switch (resetPeriod) {
                    case "Monthly":
                      endDate = moment(date).add(1, "months").subtract(1, "days");
                      break;
                    case "Quarterly":
                      endDate = moment(date).add(3, "months").subtract(1, "days");
                      break;
                    case "Annually":
                      endDate = moment(date).add(1, "years").subtract(1, "days");
                      break;
                    default:
                      break;
                  }
                  setFieldValue(`expirationDate`, endDate ? endDate.format("DD/MM/YYYY") : "");
                }
              };

              return (
                <Item label="Creation Date">
                  <DatePicker
                    size="large"
                    allowClear
                    style={{ width: "100%" }}
                    onBlur={() => setFieldTouched("creationDate", true)}
                    {...(field.value && {
                      value: moment(field.value, "DD/MM/YYYY"),
                    })}
                    format={"DD/MM/YYYY"}
                    onChange={handleCreationDateChange}
                    status={(touched.creationDate && errors.creationDate && "error") || ""}
                  />
                  {touched.creationDate && errors.creationDate && (
                    <Typography.Text type="danger">{errors.creationDate}</Typography.Text>
                  )}
                </Item>
              );
            }}
          </FastField>
        </EqualCol>
        <EqualCol>
          <FastField name={`expirationDate`}>
            {({ field }: FieldProps) => {
              return (
                <Item label="Expiration Date">
                  <DatePicker
                  disabled={resetPeriod === "Monthly" || resetPeriod === "Quarterly" || resetPeriod === "Annually"}
                    size="large"
                    allowClear
                    style={{ width: "100%" }}
                    onBlur={() => setFieldTouched("expirationDate", true)}
                    onChange={(e) => {
                      setFieldValue(`expirationDate`, e ? moment(e).format("DD/MM/YYYY") : "");
                    }}
                    {...(field.value && {
                      value: moment(field.value, "DD/MM/YYYY"),
                    })}
                    format={"DD/MM/YYYY"}
                    status={(touched?.expirationDate && errors?.expirationDate && "error") || ""}
                  />
                  {touched?.expirationDate && errors?.expirationDate && (
                    <Typography.Text type="danger">{errors?.expirationDate}</Typography.Text>
                  )}
                </Item>
              );
            }}
          </FastField>
        </EqualCol>

        <EqualCol>
          <Field name={"budgetAmount"}>
            {({ field }: FieldProps) => {
              const inputStyle = touched.budgetAmount && errors.budgetAmount ? { borderColor: "red" } : {};

              return (
                <Form.Item label="Budget Amount">
                  <Input.Group compact>
                    <Select
                      disabled
                      showSearch
                      size="large"
                      style={{ width: "30%" }}
                      value={values.currencyCode}
                      onChange={(e) => setFieldValue("currencyCode", e)}
                      onBlur={() => setFieldTouched(`currencyCode`, true)}
                    >
                      {currencyOptions(currencyData, currency)}
                    </Select>
                    <Input
                      size="large"
                      {...field}
                      style={{ width: "70%", ...inputStyle }}
                      onChange={(e) => setFieldValue("budgetAmount", e.target.value)}
                      type="number"
                      min={0}
                    />
                  </Input.Group>

                  {touched.budgetAmount && errors.budgetAmount && (
                    <Typography.Text type="danger">{errors.budgetAmount}</Typography.Text>
                  )}
                  <br />
                  {touched.currencyCode && errors.currencyCode && (
                    <Typography.Text type="danger">{errors.currencyCode}</Typography.Text>
                  )}
                </Form.Item>
              );
            }}
          </Field>
        </EqualCol>
      </Row>
    </>
  );
};

const EqualCol = ({ children }: { children: ReactNode }) => (
  <Col
    xs={24}
    md={12}
  >
    {children}
  </Col>
);
