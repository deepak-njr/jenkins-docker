import { useEffect, useState, ReactNode } from "react";
import { get, post } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { ContentWrapper, DataTable } from "@components/index";
import {
  Space,
  Typography,
  Modal,
  Row,
  Col,
  Select,
  Form,
  Image,
  Radio,
  TableColumnsType,
  Input,
  Button,
  Avatar,
  Result,
} from "antd";
import { Icon } from "@iconify/react";

import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import { imageKey } from "~/Utils";
import { isEmpty, map, omit } from "lodash";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { columnWidth } from "@components/DataTable/Properties";
import moment from "moment";
import { Formik } from "formik";
import * as yup from "yup";
const { confirm } = Modal;
export const CreateWorkflow = () => {
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<any>([]);
  const navigate = useNavigate();
  const [selectedApplication, setSelectedApplication] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const { Title, Text } = Typography;
  const [data, setData] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let pouptimeout: any = null;
    if (showSuccess) {
      pouptimeout = setTimeout(() => {
        setShowSuccess(false);
        navigate("/workflows");
      }, 5000);
    }
    return () => {
      clearTimeout(pouptimeout);
    };
  }, [showSuccess]);

  useEffect(() => {
    get("v1/application/list-view").then((res: any) => {
      if (res && res.status === "OK") {
        setApplications(res.response.data);
      }
    });
  }, []);

  const getRecords = (applicationId: string, dateRange: string, setFieldValue: any) => {
    let obj: any = applications.find((o: any) => {
      return o.applicationId === applicationId;
    });

    setFieldValue("ownerName", obj.owners[0].applicaitonOwnerName);
    setFieldValue("ownerEmail", obj.owners[0].applicationOwnerEmail);

    if (applicationId && dateRange) {
      setIsLoading(true);
      get(`v1/user/details/lastlogin?applicationId=${applicationId}&dateRange=${dateRange}`)
        .then((res: any) => {
          if (res.status !== 'OK') {
            setData([]);
          } else if (res.response && Array.isArray(res.response.data)) {
            setData(res.response.data);
          } else {
            setData([]);
          }
          setIsLoading(false);
        })
        .catch((error: any) => {
          console.error("Error occurred while fetching data:", error);
          setData([]);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedApplication && timeframe) {
    }
  }, [timeframe, selectedApplication]);

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "userName",
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={record.userAvatar && `${record.userAvatar}${imageKey}`}
                icon={!record.userAvatar && record.userName && record.userName.slice(0, 2).toUpperCase()}
              />
              {record.userName}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      width: columnWidth.USER_NAME,
      sorter: (a: any, b: any) => a.userName.localeCompare(b.userName),
    },
    {
      title: "Email",
      dataIndex: "userEmail",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.EMAIL,
      sorter: (a: any, b: any) => a.userEmail.localeCompare(b.userEmail),
    },
    {
      title: "Designation",
      dataIndex: "userDesignation",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.EMAIL,
      sorter: (a: any, b: any) => a.userDesignation.localeCompare(b.userDesignation),
    },

    {
      title: "Last Login",
      dataIndex: "userLastLogin",
      render: (value: any) =>
        moment(value, "YYYY-MM-DD").format("DD MMM YYYY") || <Typography.Text disabled>-</Typography.Text>,

      sorter: (a: any, b: any) => a.userLastLogin.localeCompare(b.userLastLogin),
      width: columnWidth.COUNT,
      ellipsis: true,
    },
  ];

  return (
    <>
      <Modal
        open={showSuccess}
        footer={false}
        style={{ maxWidth: 400, textAlign: "center" }}
        centered
        closable={false}
      >
        <Result
          status="success"
          subTitle={
            <Space
              direction="vertical"
              size={"large"}
            >
              <Typography.Text style={{ textAlign: "center" }}>Email sent successfully</Typography.Text>

              <Typography.Text
                style={{
                  textAlign: "center",
                  marginTop: styles.whitesapce3,
                  display: "block",
                }}
              >
                popup will automatically closes in 5 seconds
              </Typography.Text>
            </Space>
          }
        />
      </Modal>
      <ContentWrapper
        customTitle={
          <Space style={{ alignItems: "center", lineHeight: 1 }}>
            <Icon
              onClick={() => {
                confirm({
                  className: styles.confirmModal,
                  title: "",
                  icon: "",
                  okText: "Go Back",
                  onOk: () => navigate("/workflows"),
                  content: (
                    <Row
                      gutter={16}
                      style={{ textAlign: "center" }}
                    >
                      <Col span={24}>
                        <Typography.Text>By going back you will loose all filled workflow details</Typography.Text>
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
              Create Workflow
            </Typography.Title>
          </Space>
        }
      >
        <Formik
          initialValues={{
            dateRange: "0-30",
            applicationId: "",
            ownerName: "",
            ownerEmail: "",
            subject: "",
            message: "",
          }}
          validationSchema={yup.object().shape({
            ownerName: yup
              .string()

              .trim("Name cannot include leading and trailing spaces")
              .required("Owner name required")
              .matches(new RegExp(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/), "Invalid owner name"),
            ownerEmail: yup
              .string()
              .strict(true)
              .lowercase("Email address must be a lowercase")
              .email("Please enter valid email address")
              .required("Email address required"),
            subject: yup
              .string()
              .strict(true)
              .min(4, "Subject must be at least 4 characters")
              .trim("Subject cannot include leading and trailing spaces")
              .required("Subject required"),
            message: yup
              .string()
              .strict(true)
              .min(4, "Message must be at least 4 characters")
              .trim("Message cannot include leading and trailing spaces")
              .required("Message required"),
            applicationId: yup.string().required("Please select an Application"),
          })}
          onSubmit={(values, { setFieldError }) => {
            setIsLoading(true);
            post("/v1/user/details/login/excel", values).then((res: any) => {
              if (res) {
                setShowSuccess(true);
              }
              setIsLoading(false);
            });
          }}
        >
          {({
            errors,
            touched,
            values,
            setFieldValue,
            handleChange,
            getFieldProps,
            handleSubmit,
            handleBlur,
            isValid,
            dirty,
          }) => {
            return (
              <Form
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Row gutter={16}>
                  <EqualCol>
                    <Form.Item label="Application">
                      <Select
                        style={{ width: "300px" }}
                        showSearch
                        onChange={(e) => {
                          setFieldValue("applicationId", e),
                            getRecords(e, getFieldProps(`dateRange`).value, setFieldValue);
                        }}
                        filterOption={(input, option: any) => {
                          return option.children?.props?.children[1]?.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                        }}
                        onBlur={handleBlur}
                        value={values.applicationId}
                        status={(touched.applicationId && errors.applicationId && "error") || ""}
                      >
                        {applications.map((app: any, index: number) => (
                          <Select.Option
                            key={app.applicationName + index}
                            value={app.applicationId}
                          >
                            <Space>
                              <Image
                                src={`${app.applicationLogo}${imageKey}`}
                                style={{ width: 20 }}
                              />
                              {`${app.applicationName} (${app.departmentName})`}
                            </Space>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {errors.applicationId && <Typography.Text type="danger">{errors.applicationId}</Typography.Text>}
                  </EqualCol>

                  <EqualCol>
                    <Form.Item label="Choose last activity of user">
                      <Radio.Group
                        name="activity"
                        onChange={(e) => {
                          setFieldValue("dateRange", e.target.value);
                          getRecords(getFieldProps(`applicationId`).value, e.target.value, setFieldValue);
                        }}
                        value={values.dateRange}
                        disabled={isEmpty(values.applicationId)}
                      >
                        <Radio value={"0-30"}>0-30 Days</Radio>
                        <Radio value="31-60">31-60 Days</Radio>
                        <Radio value="61-90">61-90 Days</Radio>
                        <Radio value="91">91+ Days</Radio>
                        <Radio value="no_activity">No activity</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </EqualCol>
                </Row>
                <Row justify="end">
                  <Col>
                    <Space>
                      <Typography.Text>Total:</Typography.Text>
                      <Typography.Text
                        strong
                        style={{ color: styles.primary }}
                      >
                        {data.length} users
                      </Typography.Text>
                    </Space>
                  </Col>
                </Row>
                {/* </Row> */}
                <Row>
                  <Col>
                    <DataTable
                      multiSelect={false}
                      columns={columns}
                      tableData={data.map((d: any) => ({
                        ...d,
                        key: d.name,
                      }))}
                      height={250}
                      isLoading={isLoading}
                      showTopBar={false}
                    ></DataTable>
                  </Col>
                </Row>
                <Row style={{ marginTop: styles.whitespace6 }}>
                  <Typography.Title level={5}>Send Email</Typography.Title>
                </Row>
                <Row gutter={16}>
                  <EqualCol>
                    <Col>
                      <Form.Item label="Owner Name">
                        <Input
                          name="ownerName"
                          value={values.ownerName}
                          size="large"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled
                        />
                        {errors.ownerName && touched.ownerName && <Text type="danger">{errors.ownerName}</Text>}
                      </Form.Item>
                    </Col>

                    <Col>
                      <Form.Item label="Owner Email Address">
                        <Input
                          name="ownerEmail"
                          value={values.ownerEmail}
                          size="large"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled
                        />
                        {errors.ownerEmail && touched.ownerEmail && <Text type="danger">{errors.ownerEmail}</Text>}
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        label="Subject"
                        validateStatus={errors.subject && touched.subject ? "error" : ""}
                      >
                        <Input
                          name="subject"
                          size="large"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {errors.subject && touched.subject && <Text type="danger">{errors.subject}</Text>}
                      </Form.Item>
                    </Col>
                  </EqualCol>
                  <EqualCol>
                    <Col>
                      <Form.Item label="Message">
                        <Input.TextArea
                          name="message"
                          rows={4}
                          style={{ height: "210px" }}
                          size="large"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {errors.message && touched.message && <Text type="danger">{errors.message}</Text>}
                      </Form.Item>
                    </Col>
                  </EqualCol>
                </Row>

                <Row
                  style={{ marginTop: styles.whitespace6 }}
                  justify="end"
                >
                  <Col>
                    <Space>
                      <Form.Item>
                        <Button onClick={() => navigate("/workflows")}>Back</Button>
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={isLoading}
                          disabled={!(isValid && dirty)}
                        >
                          Submit
                        </Button>
                      </Form.Item>
                    </Space>
                  </Col>
                </Row>
              </Form>
            );
          }}
        </Formik>
      </ContentWrapper>
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
