import { useEffect, useState, ReactNode, useCallback } from "react";
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
  Divider,
} from "antd";
import { Icon } from "@iconify/react";
import styles from "./index.module.scss";
import { CountryCode, parsePhoneNumber } from "libphonenumber-js";

// import styles from "./index.module.scss";
import { useNavigate, Link } from "react-router-dom";
import { imageKey } from "~/Utils";
import { isEmpty, map, omit } from "lodash";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { columnWidth } from "@components/DataTable/Properties";
import moment from "moment";
import { FieldProps, Formik } from "formik";
import * as yup from "yup";
import { NumberInput } from "@components/index";
import { Field } from "formik";
import { getPermissions, permissions } from "~/Utils/Roles";
import "yup-phone";
import { strings } from "~/Utils/Strings";
import { CheckCountryCode } from "~/Utils/CountryCode";

const { confirm } = Modal;

const phoneSchema = yup.string().phone().required();

export const CreateUser = () => {
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { Title, Text } = Typography;
  const [data, setData] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    let pouptimeout: any = null;
    if (showSuccess) {
      pouptimeout = setTimeout(() => {
        setShowSuccess(false);
        navigate("/administration/user-management");
      }, 5000);
    }
    return () => {
      clearTimeout(pouptimeout);
    };
  }, [showSuccess]);

  const roles = [
    { key: "CONTRIBUTOR", value: "Contributor" },
    { key: "REVIEWER", value: "Reviewer" },
    { key: "APPROVER", value: "Approver" },
    { key: "SUPER_ADMIN", value: "Super admin" },
    { key: "SUPPORT", value: "Support" },
  ];

  const mockData = [
    {
      name: "Departments",
      permission: "DEPARTMENT",
    },
    {
      name: "Users",
      permission: "USER",
    },
    {
      name: "Projects",
      permission: "DEPARTMENT",
    },
    {
      name: "Applications",
      permission: "APPLICATION",
    },
    {
      name: "Onboarding Mangment",
      permission: "ONBOARDINGMGMT",
    },
    {
      name: "Track Request",
      permission: "REQUESTMGMT",
    },
  ];

  const getIcon = (permission: any) => {
    if (role && permission) {
      return (
        <Icon
          icon={"mdi:tick-circle"}
          style={{
            color: role && getPermissions[role].includes(permission) ? styles.secondaryGreen : styles.gray30,
          }}
          inline
          fontSize={25}
        />
      );
    }
    return (
      <Icon
        icon={"mdi:tick-circle"}
        style={{
          color: styles.gray30,
        }}
        inline
        fontSize={25}
      />
    );
  };

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>
            <Space>{record.name}</Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      width: columnWidth.DEPARTMENT_NAME,
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Add",
      render: (value: any, record: any) =>
        value ? getIcon(`ADD_${record.permission}`) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.COUNTLESS,
    },
    {
      title: "View",
      render: (value: any, record: any) =>
        value ? getIcon(`VIEW_${record.permission}`) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.COUNTLESS,
    },
    {
      title: "Delete",
      render: (value: any, record: any) =>
        value ? getIcon(`DELETE_${record.permission}`) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.COUNTLESS,
    },
    {
      title: "Edit",
      render: (value: any, record: any) =>
        value ? getIcon(`EDIT_${record.permission}`) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.COUNTLESS,
    },
    {
      title: "Review",
      render: (value: any, record: any) => {
        return(
          value ? getIcon(`REVIEW_${record.permission}`) : <Typography.Text disabled>-</Typography.Text>
        )
      },
    
      ellipsis: true,
      width: columnWidth.COUNTLESS,
    },
    {
      title: "Approve",
      render: (value: any, record: any) =>
        value ? getIcon(`APPROVE_${record.permission}`) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.COUNTLESS,
    },
  ];

  return (
    <ContentWrapper
      customTitle={
        <Space style={{ alignItems: "center", lineHeight: 1 }}>
          <Icon
            onClick={() => {
              confirm({
                // className: styles.confirmModal,
                title: "",
                icon: "",
                okText: "Go Back",
                onOk: () => navigate("/administration/user-management"),
                content: (
                  <Row
                    gutter={16}
                    style={{ textAlign: "center" }}
                  >
                    <Col span={24}>
                      <Typography.Text>By going back you will loose all filled user details</Typography.Text>
                    </Col>
                  </Row>
                ),
              });
            }}
            icon="akar-icons:arrow-left"
            style={{
              fontSize: "1.8rem",
              cursor: "pointer",
              //   color: styles.primary,
              //   marginRight: styles.whitespace1,
            }}
          />
          <Typography.Title
            level={3}
            style={{ margin: 0 }}
          >
            Create User
          </Typography.Title>
        </Space>
      }
    >
      <Col
        xs={24}
        md={16}
      >
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            userEmail: "",
            userMobileNumber: {
              value: "",
              countryCode: "IN",
            },
            role: "",
          }}
          validationSchema={yup.object().shape({
            firstName: yup
              .string()
              .trim("First Name cannot include leading and trailing spaces")
              .strict(true)
              .required("First Name required")
              // .matches(
              //   new RegExp(
              //     /^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/
              //   ),
              //   "Invalid First Name"
              // ),
              .matches(/^[a-zA-Z\s]+$/, "Invalid First Name"),
            lastName: yup
              .string()
              .trim("Last Name cannot include leading and trailing spaces")
              .strict(true)
              .required("Last Name required")
              // .matches(
              //   new RegExp(
              //     /^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/
              //   ),
              //   "Invalid Last Name"
              // ),
              .matches(/^[a-zA-Z\s]+$/, "Invalid Last Name"),

            role: yup.string().required("Role is required"),

            userMobileNumber: yup.object().when("role", {
              is: strings.contributor,
              then: yup.object().shape({
                code: yup.string(),
                value: yup
                  .string()
                  .required("Mobile number required")
                  .test("is-valid-phone", "Invalid mobile number", function (value: any, context: any) {
                    const countryCode = context.parent.countryCode;
                    const checkvalue = CheckCountryCode(value, countryCode, context);
                    return checkvalue;
                  }),
                countryCode: yup.string(),
              }),
              otherwise: yup.object().nullable(),
            }),
            userEmail: yup
              .string()
              .lowercase("Email address must be a lowercase")
              .strict(true)
              .email("Please enter valid email address")
              .test('no-leading-special-characters', 'Email address cannot start with special characters', value => {
                if (!value) return true;
                return /^[a-zA-Z0-9]/.test(value);
            })
              .required("Email address required"),
          })}
          onSubmit={(values, { setFieldError }) => {
            setIsLoading(true);
            post("v1/user/details/create/admin", {
              ...values,
              userMobileNumber: omit,
              ...(values.role === "CONTRIBUTOR" && {
                userMobileNumber: parsePhoneNumber(
                  values.userMobileNumber.value as string,
                  values.userMobileNumber.countryCode as CountryCode
                ).formatInternational(),
              }),
            })
              .then((res: any) => {
                if (res.status === "OK") {
                  setShowSuccess(true);
                }
                setIsLoading(false);
              })
              .catch(() => setIsLoading(false));
          }}
        >
          {({ errors, values, touched, handleChange, handleBlur, setFieldValue, handleSubmit,setFieldTouched, isValid, dirty }) => {
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
                        <Typography.Text style={{ textAlign: "center" }}>Sent Email successfully</Typography.Text>

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
                <Form
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Typography.Title level={5}>Profile Details</Typography.Title>
                  <Row gutter={16}>
                    <EqualCol>
                      <Form.Item label="First Name">
                        <Input
                          name="firstName"
                          size="large"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {errors.firstName && touched.firstName && <Text type="danger">{errors.firstName}</Text>}
                      </Form.Item>
                    </EqualCol>
                    <EqualCol>
                      <Form.Item label="Last Name">
                        <Input
                          name="lastName"
                          size="large"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {errors.lastName && touched.lastName && <Text type="danger">{errors.lastName}</Text>}
                      </Form.Item>
                    </EqualCol>
                  </Row>
                  <Row gutter={16}>
                    <EqualCol>
                      <Form.Item label="Email Address">
                        <Input
                          name="userEmail"
                          size="large"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {errors.userEmail && touched.userEmail && <Text type="danger">{errors.userEmail}</Text>}
                      </Form.Item>
                    </EqualCol>
                    <EqualCol>
                      <Form.Item label="User Role">
                        <Select
                          size="large"
                          onChange={(value) => {
                            setFieldValue("role", value);
                            setRole(value);
                          }}
                          onBlur={(e) => {
                            handleBlur(e);
                            setFieldTouched("role", true); // Explicitly set the touched property for the role field
                          }}
                          value={values.role}
                          status={(touched.role && errors.role && "error") || ""}
                        >
                          {roles &&
                            map(roles, (owner) => (
                              <Select.Option
                                key={owner.key}
                                value={owner.key}
                              >
                                {owner.value}
                              </Select.Option>
                            ))}
                        </Select>
                        {errors.role && touched.role && <Typography.Text type="danger">{errors.role}</Typography.Text>}
                      </Form.Item>
                    </EqualCol>
                  </Row>
                  <Row gutter={16}>
                    {role === strings.contributor ? (
                      <EqualCol>
                        <Field name="userMobileNumber">
                          {({ field }: FieldProps) => {
                            return (
                              <Form.Item label="Mobile Number">
                                <NumberInput
                                  {...field}
                                  onChange={(value: { value: string; countryCode: CountryCode; code: string }) =>
                                    setFieldValue("userMobileNumber", value)
                                  }
                                />
                                {touched.userMobileNumber && errors.userMobileNumber?.value && (
                                  <Typography.Text type="danger">{errors.userMobileNumber.value}</Typography.Text>
                                )}
                              </Form.Item>
                            );
                          }}
                        </Field>
                      </EqualCol>
                    ) : (
                      ""
                    )}
                  </Row>
                  <Row>
                    <Col>
                      <Typography.Title
                        level={5}
                        style={{ marginBottom: 0, marginTop: 20 }}
                      >
                        Permissions
                      </Typography.Title>
                      <DataTable
                        multiSelect={false}
                        columns={columns}
                        tableData={mockData.map((d: any) => ({
                          ...d,
                          key: d.name,
                        }))}
                        height={500}
                        showTopBar={false}
                      ></DataTable>
                    </Col>
                  </Row>
                  <Row
                    justify="end"
                    style={{ marginTop: styles.whitespace3 }}
                  >
                    <Col>
                      <Space>
                        <Form.Item>
                          <Button onClick={() => navigate("/administration/user-management")}>Back</Button>
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
              </>
            );
          }}
        </Formik>
      </Col>
    </ContentWrapper>
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
