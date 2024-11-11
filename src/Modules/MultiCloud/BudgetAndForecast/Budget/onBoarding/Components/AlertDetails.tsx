import { Icon } from "@iconify/react";
import { Button, Col, Input, Row, Select, Tooltip, Typography, Form } from "antd";
import { Field, FieldProps, FormikProps, ErrorMessage } from "formik";
import { map, some } from "lodash";
import { DataTable } from "~/Components";
import styles from "../BudgetsOnboarding.module.scss";
import { currencyFormat } from "~/Utils";
import { columnWidth } from "~/Components/DataTable/Properties";
import { BudgetFormItems } from "~/Modules/MultiCloud/BudgetAndForecast/Budget/onBoarding/Wrapper";
import { ReactNode } from "react";
import { alertTypes } from "~/Utils/StringConstants";

export const AlertDetails = ({
  values,
  setValues,
  errors,
  getFieldProps,
  setFieldTouched,
  setFieldValue,
  touched,
  resetForm,
}: FormikProps<BudgetFormItems>) => {
  const handleProductRemove = ({ key }: any) => {
    const alerts = [...values.alerts];
    if (key > -1 && alerts.length > 1) {
      alerts.splice(key, 1);
    }
    setValues({
      ...values,
      alerts: alerts,
    });
  };
  const alert = values.alerts;
  const { Item } = Form;

  const addProductRow = () => {
    setValues({
      ...values,
      alerts: [
        ...values.alerts,
        {
          alertType: "",
          threshold: "",
          amount: "",
        },
      ],
    });
  };
  if (!alert) return null;
  const calcHeight = () => {
    return alert.length * 40 + 130 > 300 ? 300 : alert.length * 40 + 130;
  };
  const getStatus = (lIndex: number, name: any) => {
    if (errors && errors.alerts && touched && touched.alerts) {
      const alertsError = errors.alerts[0] as any;
      const alertsTouched = touched.alerts[0] as any;
      const AlertsError = alertsError && alertsError.alerts && alertsError.alerts[lIndex];
      const AlertsTouched = alertsTouched && alertsTouched.alerts && alertsTouched.alerts[lIndex];
      if (AlertsError && AlertsError[name] && AlertsTouched && AlertsTouched[name]) {
        return {
          type: "error",
          error: AlertsError[name],
        };
      } else {
        return {
          type: "",
          error: "",
        };
      }
    } else {
      return {
        type: "",
        error: "",
      };
    }
  };
  const errorAlerts = errors.alerts as any[];

  const suffixIcon = (title: string) => (
    <Tooltip
      title={title}
      color={styles.white}
      arrowPointAtCenter
      overlayInnerStyle={{
        color: styles.secondaryRed,
      }}
    >
      <Icon
        icon="clarity:error-solid"
        style={{
          color: styles.secondaryRed,
          fontSize: 16,
        }}
      />
    </Tooltip>
  );

  return (
    <>
      <Row justify="space-between">
        <Col>
          <Typography.Title level={3}>Alert Details</Typography.Title>
        </Col>
      </Row>
      <Col
        span={24}
        md={24}
        className="budget-forcast-details"
      >
        <DataTable
          height={calcHeight()}
          multiSelect={false}
          tableData={map(alert, (Product, i) => ({
            ...Product,
            key: i,
          }))}
          columns={[
            {
              key: "alertType",
              dataIndex: "alertType",
              title: "Alert Type",
              render: (val: any, record: any, lIndex: number) => {
                return (
                  <Field name={`alerts[${lIndex}].alertType`}>
                    {({ field, meta }: FieldProps) => {
                      const isError = meta.touched && meta.error;

                      return (
                        <>
                          <Select
                            showSearch
                            size="middle"
                            style={{
                              width: "100%",
                              border: isError ? "1px solid red" : undefined,
                              borderRadius: isError ? "5px" : "",
                            }}
                            onBlur={() => {
                              setFieldTouched(`alerts[${lIndex}].alertType`, true);
                            }}
                            onChange={(e) => {
                              setFieldValue(`alerts[${lIndex}].alertType`, e);
                            }}
                            value={field.value}
                          >
                            {alertTypes.map((item) => (
                              <Select.Option
                                value={item.key}
                                key={item.key}
                              >
                                {item.key}
                              </Select.Option>
                            ))}
                          </Select>
                          <Typography.Text type="danger">
                            <ErrorMessage name={`alerts[${lIndex}].alertType`} />
                          </Typography.Text>
                        </>
                      );
                    }}
                  </Field>
                );
              },
            },
            {
              key: "threshold",
              dataIndex: "threshold",
              title: "Threshold % (Budget)",
              render: (val: any, record: any, lIndex: number) => {
                return (
                  <Field name={`alerts[${lIndex}].threshold`}>
                    {({ field, meta }: FieldProps) => {
                      const isError = meta.touched && meta.error;

                      return (
                        <>
                          <Input
                            style={{
                              width: "100%",
                              border: isError ? "1px solid red" : undefined,
                              borderRadius: isError ? "5px" : "",
                            }}
                            status={getStatus(lIndex, "threshold")?.type as any}
                            suffix={
                              getStatus(lIndex, "threshold")?.type === "error" ? (
                                suffixIcon(getStatus(lIndex, "threshold")?.error || "")
                              ) : (
                                <></>
                              )
                            }
                            min={1}
                            max={100}
                            {...field}
                            value={field.value}
                            onKeyDown={(e) => {
                              if (e.key === ".") {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              setFieldValue(`alerts[${lIndex}].threshold`, e.target.value);
                              setFieldValue(
                                `alerts[${lIndex}].amount`,
                                (Number(e.target.value) * Number(values.budgetAmount)) / 100
                              );
                            }}
                            type="number"
                            onBlur={() => {
                              setFieldTouched(`alerts[${lIndex}].threshold`, true);
                            }}
                          />
                          <Typography.Text type="danger">
                            <ErrorMessage name={`alerts[${lIndex}].threshold`} />
                          </Typography.Text>
                        </>
                      );
                    }}
                  </Field>
                );
              },
            },
            {
              key: "amount",
              dataIndex: "amount",
              title: "Amount",
              width: columnWidth.GENERAL,
              render: (val: any, record: any, lIndex: number) => {
                return (
                  <Field name={`alerts[${lIndex}].amount`}>
                    {({ field }: FieldProps) => {
                      return (
                        <Row>
                          <Typography.Text>
                            {currencyFormat(Number(val), false, getFieldProps(`currencyCode`).value)}
                          </Typography.Text>
                        </Row>
                      );
                    }}
                  </Field>
                );
              },
            },
            {
              key: "action",
              dataIndex: "",
              width: "5%",
              render: (value: any, record: any) => {
                return (
                  <>
                    {alert.length > 1 && (
                      <Icon
                        icon="fluent:delete-16-regular"
                        style={{
                          color: styles.strawberry,
                          cursor: "pointer",
                          fontSize: 20,
                        }}
                        onClick={() => handleProductRemove(record)}
                      />
                    )}
                  </>
                );
              },
            },
          ]}
          showTopBar={false}
        />
      </Col>
      <Row gutter={16}>
        <Col
          span={24}
          style={{ textAlign: "right", marginBottom: 16 }}
        >
          <Button
            type="text"
            onClick={addProductRow}
            icon={<Icon icon="akar-icons:plus" />}
            disabled={some(alert[alert.length - 1], (licenceVal) => !licenceVal)}
          >
            Add another Alert
          </Button>
        </Col>
      </Row>
      <EqualCol>
        <Field name={"emailAddress"}>
          {({ field }: FieldProps) => {
            return (
              <Item label="Recipient Email">
                <Input
                  size="large"
                  {...field}
                  onBlur={() => setFieldTouched(`emailAddress`, true)}
                  onChange={(e) => setFieldValue("emailAddress", e.target.value)}
                  status={(touched.emailAddress && errors.emailAddress && "error") || ""}
                />
                {touched.emailAddress && errors.emailAddress && (
                  <Typography.Text type="danger">{errors.emailAddress}</Typography.Text>
                )}
              </Item>
            );
          }}
        </Field>
      </EqualCol>
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
