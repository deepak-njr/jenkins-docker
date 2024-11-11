import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { get, post } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { strings } from "@utils/Strings";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { Select, Space, Typography, Modal, Form, Input, Row, Col, Button, TableColumnsType } from "antd";

import styles from "@styles/variables.module.scss";
import { filter, map, omit } from "lodash";
import { Metric } from "./Widgets/OptimizeMetrics";
import { Icon } from "@iconify/react";
import { Field, FieldProps, Formik } from "formik";
import * as yup from "yup";
import { MultiCloud } from "../../CloudConstants";
import { useQuery } from "~/Hooks/useQuery";

interface Props {
  height: number;
}

export const Azure = ({ height }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionList, setSubscriptionList] = useState<{ subscriptionId: string; subscriptionName: string }[]>([]);
  const [filteredData, setFilteredData] = useState<{ [key in string]: any }[]>([]);
  const query = useQuery();
  const [data, setData] = useState<{ [key in string]: any }[]>([]);
  const { openToast } = useNotification();
  const [showaAert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<{ [key in string]: any }>({});

  useEffect(() => {
    if (query.get("vendor") !== MultiCloud.AZURE) return;
    setIsLoading(true);
    get("/cloud/subscriptions")
      .then((res: any) => {
        if (res.response.data) {
          setSubscriptionList(res.response.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
    get(`/cloud/recommendation?category=${MultiCloud.AZURE}`)
      .then((res: any) => {
        if (res.response.data) {
          setData(res.response.data);
          setFilteredData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
  }, [query]);

  const filterDataBysubscription = (subId: any) => {
    if (subId === "All") {
      setFilteredData(data);
    } else {
      setFilteredData(filter(data, (d: any) => d.subscriptionId === subId) || []);
    }
  };
  const getSubscriptionName = (value: string) => {
    const filteredList = filter(subscriptionList, (item) => item.subscriptionId === value);
    let subscriptionName;
    if (filteredList.length > 0) {
      subscriptionName = filteredList[0].subscriptionName;
    }
    return subscriptionName || value;
  };

  const getColoriezedValue = (value: string) => {
    return (
      <Typography
        style={{
          color: value === "High" ? "#E80038" : value === "Medium" ? "#FE8E0E" : "#1363DF",
        }}
      >
        {value}
      </Typography>
    );
  };

  const columns: TableColumnsType = [
    {
      title: "Resource ID",
      dataIndex: "resourceId",
      ellipsis: true,
      render: (value: any, record: any) =>
        value ? (
          value
        ) : (
          <Typography.Text
            disabled
            style={{ fontSize: 14 }}
          >
            {strings.na}
          </Typography.Text>
        ),
      width: 200,
      sorter: (a: any, b: any) => (a.resourceId || "").localeCompare(b.resourceId || ""),
    },
    {
      title: "Resource Name",
      dataIndex: "resourceName",
      ellipsis: true,
      width: 200,
      sorter: (a: any, b: any) => (a.resourceName || "").localeCompare(b.resourceName || ""),
    },
    {
      title: "Subscription",
      dataIndex: "subscriptionId",
      ellipsis: true,
      render: (value: any) => {
        return getSubscriptionName(value);
      },
      width: 250,
      sorter: (a: any, b: any) =>
        a.subscriptionId && b.subscriptionId && a.subscriptionId.localeCompare(b.subscriptionId),
    },
    {
      title: "Impact",
      dataIndex: "impact",
      ellipsis: true,
      render: (value: string) => getColoriezedValue(value),
      width: 100,
      sorter: (a: any, b: any) => a.impact && b.impact && a.impact.localeCompare(b.impact),
    },
    {
      title: "Category",
      dataIndex: "categroy",
      ellipsis: true,
      width: 100,
      sorter: (a: any, b: any) => a.categroy && b.categroy && a.categroy.localeCompare(b.categroy),
    },
    {
      title: "Actions",
      dataIndex: "action",
      width: 350,
      sorter: (a: any, b: any) => a.action && b.action && a.action.localeCompare(b.action),
    },
    {
      title: "Cost Savings",
      dataIndex: "savingsAmount",
      className: "is-currency",
      ellipsis: true,
      render: (value: any, record: any) => currencyFormat(value, false, record.currency),
      width: 150,
      sorter: (a: any, b: any) => a.savingsAmount - b.savingsAmount,
    },
    {
      title: "Annual Savings",
      dataIndex: "annualSavingsAmount",
      className: "is-currency",
      ellipsis: true,
      render: (value: any, record: any) => currencyFormat(value, false, record.currency),
      width: 150,
      sorter: (a: any, b: any) => a.annualSavingsAmount - b.annualSavingsAmount,
      defaultSortOrder: "descend",
    },
  ];

  const menuClick = (key: string, record: { [key in string]: any }) => {
    let alertEmail = "";
    if (key === "email") {
      setShowAlert(true);
      setAlertData(record);
    }
  };
  const tableActions = {
    callback: menuClick,
    items: [
      {
        label: (
          <Typography.Text>
            <Space>
              <Icon
                icon="clarity:email-line"
                style={{ color: styles.primary }}
                inline
                fontSize={16}
              />
              Send Email
            </Space>
          </Typography.Text>
        ),
        key: "email",
      },
    ],
  };

  return (
    <>
      <Metric data={data} />
      <Modal
        open={showaAert}
        footer={false}
        title="Send Alert"
        closable={false}
      >
        <Formik
          {...{
            initialValues: {
              email: "",
            },

            validationSchema: yup.object().shape({
              email: yup
                .string()
                .strict(true)
                .trim("Email address cannot include leading and trailing spaces")
                .lowercase("Email address must be a lowercase")
                .email("Invalid Email")
                .required("Email address required"),
            }),
          }}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            const payload = {
              ...omit(alertData, ["key", "currency", "subscriptionId"]),
              subscriptionName:
                filter(subscriptionList, (item) => item.subscriptionId === alertData.subscriptionId)[0]
                  .subscriptionName || alertData.subscriptionId,
              emailAddress: [values.email],
            };
            post("cloud/optimize/azure/email", payload)
              .then((res) => {
                if (res) {
                  openToast({ content: "Email sent!", type: "success" });
                }
                resetForm();
                setSubmitting(false);
                setShowAlert(false);
              })
              .catch(() => {
                openToast({ content: "Failed to send email!", type: "error" });
                setSubmitting(false);
                setShowAlert(false);
              });
          }}
        >
          {({ errors, touched, handleSubmit, resetForm, isSubmitting, isValid, dirty }) => (
            <>
              <Field name="email">
                {({ field }: FieldProps) => (
                  <Form.Item
                    validateStatus={touched.email && errors.email ? "error" : ""}
                    help={touched.email && errors.email}
                  >
                    <label>Email Address</label>
                    <Input
                      {...field}
                      style={{ borderColor: touched.email && errors.email ? "red" : "" }}
                    />
                  </Form.Item>
                )}
              </Field>
              <Row justify="end">
                <Col style={{ textAlign: "right" }}>
                  <Space>
                    <Button
                      onClick={() => {
                        resetForm();
                        setShowAlert(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        handleSubmit();
                      }}
                      type="primary"
                      loading={isSubmitting}
                      disabled={!(isValid && dirty)}
                    >
                      <Space>
                        <Icon
                          icon="clarity:email-line"
                          inline
                          fontSize={16}
                        />
                        Send Email
                      </Space>
                    </Button>
                  </Space>
                </Col>
              </Row>
            </>
          )}
        </Formik>
      </Modal>
      <DataTable
        isLoading={isLoading}
        additionalCTA={
          <Select
            showSearch
            placeholder="Subscriptions"
            defaultValue={["All"]}
            style={{ width: 200, marginRight: 16 }}
            dropdownMatchSelectWidth={false}
            onChange={(e) => filterDataBysubscription(e)}
          >
            <Select.Option value="All">All</Select.Option>
            {subscriptionList &&
              subscriptionList.map((item) => (
                <Select.Option
                  value={item.subscriptionId}
                  key={item.subscriptionId}
                >
                  {item.subscriptionName}
                </Select.Option>
              ))}
          </Select>
        }
        tableActions={tableActions}
        columns={columns}
        noDataText="No Recommendations found"
        tableData={map(filteredData, (d: any, index) => ({
          ...d,
          key: `${d.resourceId || d.subscriptionId}-${index}`,
        }))}
        height={height - 150}
        multiSelect={false}
        exportFileName={"Azure"}
      />
    </>
  );
};
