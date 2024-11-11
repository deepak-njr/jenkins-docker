import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { useNotification } from "~/Hooks/useNotification";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { Button, Col, Form, Input, Modal, Row, Space, TableColumnsType, Typography } from "antd";

import styles from "@styles/variables.module.scss";
import { filter, isEmpty, map, omit } from "lodash";
import { Metric } from "./Widgets/OptimizeMetrics";
import { useQuery } from "~/Hooks/useQuery";
import { Icon } from "@iconify/react";
import { Field, FieldProps, Formik } from "formik";
import * as yup from "yup";
import { post } from "~/Services/api.service";
import { get } from "@services/api.service";
import { strings } from "@utils/Strings";
import { MultiCloud } from "../../CloudConstants";

interface Props {
  height: number;
}

export const AWS = ({ height }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const query = useQuery();
  const id = query.get("vendor");
  const [data, setData] = useState<{ [key in string]: any }>({});
  const { openToast } = useNotification();
  const [showaAert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<{ [key in string]: any }>({});

  useEffect(() => {
    if (id !== MultiCloud.AWS) return;
    setIsLoading(true);
    // getRecommendation()
    get(`/cloud/recommendation?category=${MultiCloud.AWS}`)
      .then((res: any) => {
        if (res) {
          setData({
            meta: {
              totalRecommendation: Number(res.Summary.TotalRecommendationCount),
              currency: res.Summary.SavingsCurrencyCode,
              monthlySavings: Number(res.Summary.EstimatedTotalMonthlySavingsAmount),
              savingsPercentage: Number(res.Summary.SavingsPercentage),
            },
            recommendation: map(res.RightsizingRecommendations, (rightSizing) => ({
              instanceId: rightSizing.CurrentInstance.ResourceId,
              accountID: rightSizing.AccountId,
              rightSizingType: rightSizing.RightsizingType,
              instanceType: rightSizing.CurrentInstance.ResourceDetails.EC2ResourceDetails.InstanceType,
              recommendedInstanceType:
                rightSizing.ModifyRecommendationDetail.TargetInstances[0].ResourceDetails.EC2ResourceDetails
                  .InstanceType,
              cpu: rightSizing.CurrentInstance.ResourceUtilization.EC2ResourceUtilization.MaxCpuUtilizationPercentage,
              monthlySavings: rightSizing.ModifyRecommendationDetail.TargetInstances[0].EstimatedMonthlySavings,
              anualSavings: rightSizing.ModifyRecommendationDetail.TargetInstances[0].EstimatedMonthlySavings * 12,
            })),
          });
          // setData({
          //   ...res,
          //   rightSizing: map(
          //     res.RightsizingRecommendations,
          //     (recommendation) => ({
          //       resourceId: recommendation.CurrentInstance.ResourceId,
          //       resourceName: recommendation.CurrentInstance.InstanceName,
          //       accountId: recommendation.AccountId,
          //       impact: "",
          //       action: recommendation.RightsizingType,
          //     })
          //   ),
          // });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
        setIsLoading(false);
      });
  }, [id]);

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
      title: "Instance ID",
      dataIndex: "instanceId",
      ellipsis: true,
      sorter: (a: any, b: any) => a.instanceId && b.instanceId && a.instanceId.localeCompare(b.instanceId),
      render: (value: any, record: any) => {
        return value ? (
          value
        ) : (
          <Typography.Text
            disabled
            style={{ fontSize: 14 }}
          >
            {strings.na}
          </Typography.Text>
        );
      },
      width: 160,
    },
    {
      title: "Account ID",
      dataIndex: "accountID",
      ellipsis: true,
      sorter: (a: any, b: any) => a.accountID && b.accountID && a.accountID.localeCompare(b.accountID),
      render: (value: any) => value,
      width: 150,
    },
    {
      title: "Type",
      dataIndex: "instanceType",
      ellipsis: true,
      sorter: (a: any, b: any) => a.instanceType && b.instanceType && a.instanceType.localeCompare(b.instanceType),
      width: 200,
    },

    {
      title: "Recommended Type",
      dataIndex: "recommendedInstanceType",
      ellipsis: true,
      sorter: (a: any, b: any) =>
        a.recommendedInstanceType &&
        b.recommendedInstanceType &&
        a.recommendedInstanceType.localeCompare(b.recommendedInstanceType),
      width: 200,
    },
    {
      title: "CPU %",
      dataIndex: "cpu",
      ellipsis: true,
      render: (value: any) => Number(value).toFixed(2),
      width: 80,
      sorter: (a: any, b: any) => a.cpu && b.cpu && Number(a.cpu) - Number(b.cpu),
    },
    {
      title: "Right Sizing Type",
      dataIndex: "rightSizingType",
      width: 150,
      sorter: (a: any, b: any) =>
        a.rightSizingType && b.rightSizingType && a.rightSizingType.localeCompare(b.rightSizingType),
    },
    {
      title: "Monthly Savings",
      dataIndex: "monthlySavings",
      className: "is-currency",
      ellipsis: true,
      sorter: (a: any, b: any) =>
        a.monthlySavings && b.monthlySavings && Number(a.monthlySavings) - Number(b.monthlySavings),
      render: (value: any) => currencyFormat(value, false, data.meta.currency),
      width: 150,
    },
    {
      title: "Annual Savings",
      dataIndex: "anualSavings",
      className: "is-currency",
      ellipsis: true,
      sorter: (a: any, b: any) => a.anualSavings && b.anualSavings && Number(a.anualSavings) - Number(b.anualSavings),
      defaultSortOrder: "descend",
      render: (value: any, record: any) => currencyFormat(value, false, data.meta.currency),
      width: 150,
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
              accountId: alertData.accountID,
              monthlySavings: alertData.monthlySavings,
              annualSavings: alertData.monthlySavings * 12,
              cpu: alertData.cpu,
              emailAddress: values.email,
              instanceId: alertData.instanceId,
              resourceType: alertData.instanceType,
              recommendationType: alertData.recommendedInstanceType,
            };
            post("cloud/optimize/aws/email", payload)
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
                  <Form.Item>
                    <label>Email Address</label>
                    <Input
                      type="email"
                      {...field}
                    />
                    {touched.email && errors.email && <Typography.Text type="danger">{errors.email}</Typography.Text>}
                  </Form.Item>
                )}
              </Field>
              <Row justify="end">
                <Col style={{ textAlign: "right" }}>
                  <Space>
                    <Button
                      onClick={() => {
                        resetForm();
                        setShowAlert(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        handleSubmit();
                        resetForm();
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
        columns={columns}
        tableData={!isEmpty(data) ? data.recommendation : []}
        tableActions={tableActions}
        height={height - 200}
        multiSelect={false}
        noDataText={"No Recommendations found"}
      />
    </>
  );
};
