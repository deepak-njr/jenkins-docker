import * as yup from "yup";

import { Button, Col, DatePicker, Form, Image, Input, Row, Select, Space, Tooltip, Typography } from "antd";
import { Field, FieldProps, Formik, FormikProps } from "formik";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { currencyCode, imageKey } from "~/Utils/Constants";
import { filter, isEmpty, map } from "lodash";
import { get, post } from "~/Services/api.service";

import { Icon } from "@iconify/react";
import SuccessModal from "~/Components/Modal/SuccessModal";
import { currency } from "@utils/StringConstants";
import { currencyData } from "~/Utils/CurrencyCodes";
import { currencyOptions } from "@utils/CurrenyOptions";
import moment from "moment";
import { strings } from "~/Utils/Strings";
import styles from "../../Projects.module.scss";
import { useNotification } from "~/Hooks/useNotification";

interface Project {
  projectName: string;
  projectManager: string;
  projectDescription: string;
  secondaryContact: string;
  budget: number;
  projectCode: string;
  startDate: string;
  endDate: string;
  applications: {
    name: string;
    type: string;
    isAvailable: boolean;
  }[];
  currencyCode: string;
}

const defaultValue = {
  projectName: "",
  projectManager: "",
  secondaryContact: "",
  projectDescription: "",
  budget: 0,
  projectCode: "",
  startDate: "",
  endDate: "",
  applications: [
    {
      name: "",
      type: "",
      isAvailable: false,
    },
  ],
  currencyCode: currencyCode,
};
const EqualCol = ({ children }: { children: ReactNode }) => (
  <Col
    xs={24}
    md={12}
  >
    {children}
  </Col>
);

export const SingleProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openToast } = useNotification();
  const [reqId, setReqId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [userList, setUserList] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  useEffect(() => {
    get("v1/application/get-logos")
      .then((res: any) => {
        if (res.status === "OK") {
          setApplications(res.response.data);
        }
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
      });

    get(`v1/department/overview?category=user&departmentId=${id}`)
      .then((res: any) => {
        if (res && res.response.data) {
          setUserList(res.response.data.departmentusersResponse);
        }
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
      });
  }, []);

  return (
    <>
      <SuccessModal
        open={showSuccess}
        onClose={() => navigate(`/departments/${id}?activeTab=projects`)}
        content={
          <Typography.Text style={{ textAlign: "center" }}>
            Your onboarding request is submitted successfully. To view the status of your request, use the <br />{" "}
            Request ID: &nbsp;
            <b>
              <Link to={`/track-requests?activeTab=project&id=${reqId}`}>{reqId}</Link>
            </b>
          </Typography.Text>
        }
      />
      <Formik
        initialValues={defaultValue}
        validationSchema={yup.object().shape({
          projectName: yup
            .string()
            .trim()
            .min(4, "Project name must be at least 4 characters")
            .trim("Project name cannot include leading and trailing spaces")
            .strict(true)
            .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9\s_]*[a-zA-Z0-9])?$/, "Only alphabets and numbers are allowed for project name ")
            .required("Project name required"),
          projectDescription: yup
            .string()
            .min(4, "Project description must be at least 4 characters")
            .trim("Project description cannot include leading and trailing spaces")
            .strict(true)
            .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9\s_-]*[a-zA-Z0-9]|[a-zA-Z0-9\s_-]*\.)?$/,"Only alphabets and numbers are allowed")
            .required("Project description required"),
          projectManager: yup
            .string()
            .strict(true)
            .lowercase("Email address must be a lowercase")
            .email("Email address must be a valid email")
            .required("Email address required"),
          secondaryContact: yup
            .string()
            .strict(true)
            .lowercase("Email address must be a lowercase")
            .email("Email address must be a valid email")
            .test("duplicate-email", "Duplicate email found in Email Address fields", function (value) {
              if (value) {
                if (value === this.parent.projectManager) {
                  return false;
                }
                return true;
              } else {
                return true;
              }
            }),
          budget: yup.number().min(1, "Budget should be more than 0").nullable(true).required("Budget is required"),
          projectCode: yup
            .string()
            .trim("Project code cannot include leading and trailing spaces")
            .strict(true)
            .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9\s_]*[a-zA-Z0-9])?$/, "Only alphabets and numbers are allowed for project name ")
            .required("Project code required"),
          startDate: yup.string().required("Start date required"),
          endDate: yup
            .string()
            .test(
              "invalid-enddate",
              "End date should be greater than start date",
              (value, context) =>
                moment(value, "DD/MM/YYY", true).diff(moment(context.parent.startDate, "DD/MM/YYY", true), "days") >= 1
            )
            .required("Project end date required"),
          applications: yup.array().of(
            yup.object().shape({
              name: yup.string().strict(true).required("Application name required"),
              type: yup.string().strict(true).required("Application category required"),
            })
          ),
        })}
        onSubmit={(values) => {
          const payload: any = {
            applicationCount: values.applications.length,
            applicationsInfo: map(values.applications, (app) => ({
              applicationCategory: app.type,
              applicationLogo: filter(applications, (item: any) => item.applicationName === app.name)[0]?.logoURL,
              applicationName: app.name,
            })),
            currency: values.currencyCode,
            departmentId: id,
            isSingle: true,
            projectBudget: values.budget,
            projectCode: values.projectCode,
            projectDescription: values.projectDescription,
            projectEndDate: moment(values.endDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
            projectManagerEmail: [values.projectManager],
            projectName: values.projectName,
            projectStartDate: moment(values.startDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
          };
          if (values.secondaryContact) {
            payload.projectManagerEmail.push(values.secondaryContact);
          }
          post("v1/project/single/onboard", payload).then((res: any) => {
            if (res && res.response.data) {
              setShowSuccess(true);
              setReqId(res.response.data.requestId);
            }
          });
        }}
      >
        {(props) => {
          const {
            submitForm,
            setFieldValue,
            touched,
            errors,
            values,
            isValid,
            getFieldProps,
            setFieldTouched,
            dirty,
            ...res
          } = props;
          let validApps = values.applications.filter((app: any) => app.isAvailable);
          return (
            <Form
              onFinish={submitForm}
              layout="vertical"
            >
              <Row gutter={16}>
                <EqualCol>
                  <Row>
                    <Col span={24}>
                      <Field name="projectCode">
                        {({ field }: FieldProps) => {
                          return (
                            <Form.Item label="Project Code">
                              <Input
                                size="large"
                                {...field}
                                status={(touched.projectCode && errors.projectCode && "error") || ""}
                              />
                              {touched.projectCode && errors.projectCode && (
                                <Typography.Text type="danger">{errors.projectCode}</Typography.Text>
                              )}
                            </Form.Item>
                          );
                        }}
                      </Field>
                    </Col>
                    <Col span={24}>
                      <Field name="projectName">
                        {({ field }: FieldProps) => {
                          return (
                            <Form.Item label="Project Name">
                              <Input
                                size="large"
                                {...field}
                                status={(touched.projectName && errors.projectName && "error") || ""}
                              />
                              {touched.projectName && errors.projectName && (
                                <Typography.Text type="danger">{errors.projectName}</Typography.Text>
                              )}
                            </Form.Item>
                          );
                        }}
                      </Field>
                    </Col>
                    <Col span={24}>
                      <Field name="projectManager">
                        {({ field }: FieldProps) => {
                          return (
                            <Form.Item label="Project Manager">
                              <Select
                                showSearch
                                size="large"
                                style={{ width: "100%" }}
                                value={props.values.projectManager}
                                onChange={(e) => {
                                  setFieldValue("projectManager", e);
                                }}
                                onBlur={() => {
                                  setFieldTouched("projectManager", true);
                                }}
                                status={(touched.projectManager && errors.projectManager && "error") || ""}
                              >
                                {map(userList, (user) => (
                                  <Select.Option
                                    value={user.userEmail}
                                    key={user.userEmail}
                                    disabled={props.values.secondaryContact === user.userEmail}
                                  >
                                    {user.userEmail}
                                  </Select.Option>
                                ))}
                              </Select>
                              {touched.projectManager && errors.projectManager && (
                                <Typography.Text type="danger">{errors.projectManager}</Typography.Text>
                              )}
                            </Form.Item>
                          );
                        }}
                      </Field>
                    </Col>
                  </Row>
                </EqualCol>
                <EqualCol>
                  {" "}
                  <Field name={"projectDescription"}>
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Project Description">
                          <Input.TextArea
                            rows={8}
                            style={{ height: "213px" }}
                            size="large"
                            {...field}
                            status={(touched.projectDescription && errors.projectDescription && "error") || ""}
                          />
                          {touched.projectDescription && (
                            <Typography.Text type="danger">{errors.projectDescription}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
              </Row>
              <Row gutter={16}>
                <EqualCol>
                  <Field name="secondaryContact">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Secondary Contact">
                          <Select
                            showSearch
                            size="large"
                            style={{ width: "100%" }}
                            value={props.values.secondaryContact}
                            onChange={(e) => {
                              setFieldValue("secondaryContact", e);
                            }}
                            onBlur={() => {
                              setFieldTouched("secondaryContact", true);
                            }}
                            status={(touched.secondaryContact && errors.secondaryContact && "error") || ""}
                          >
                            <Select.Option value={""}>-- Please Select --</Select.Option>
                            {map(userList, (user, uIndex) => (
                              <Select.Option
                                value={user.userEmail}
                                key={`${uIndex}`}
                                disabled={props.values.projectManager === user.userEmail} 
                              >
                                {user.userEmail}
                              </Select.Option>
                            ))}
                          </Select>
                          {touched.secondaryContact && errors.secondaryContact && (
                            <Typography.Text type="danger">{errors.secondaryContact}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="budget">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Budget">
                          <Input.Group compact>
                            <Select
                              showSearch
                              defaultValue={currencyCode}
                              size="large"
                              style={{ width: "30%" }}
                              value={props.values.currencyCode}
                              onChange={(e) => setFieldValue("currencyCode", e)}
                            >
                              {currencyOptions(currencyData, currency)}
                            </Select>
                            <Input
                              size="large"
                              {...field}
                              style={{ width: "70%" }}
                              min={0}
                              type="number"
                              step="any"
                            />
                          </Input.Group>

                          {touched.budget && errors.budget && (
                            <Typography.Text type="danger">{errors.budget}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="startDate">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Project Start Date">
                          <DatePicker
                            size="large"
                            allowClear
                            onBlur={() => setFieldTouched("startDate", true)}
                            onChange={(e) => setFieldValue(`startDate`, e ? moment(e).format("DD/MM/YYYY") : "")}
                            status={(touched.startDate && errors.startDate && "error") || ""}
                            format="DD/MM/YYYY"
                            {...(field.value && {
                              value: moment(field.value, "DD/MM/YYYY"),
                            })}
                            style={{ width: "100%" }}
                          />
                          {touched.startDate && errors.startDate && (
                            <Typography.Text type="danger">{errors.startDate}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <EqualCol>
                  <Field name="endDate">
                    {({ field }: FieldProps) => {
                      return (
                        <Form.Item label="Project End Date">
                          <DatePicker
                            size="large"
                            allowClear
                            onBlur={() => setFieldTouched("endDate", true)}
                            onChange={(e) => setFieldValue(`endDate`, e ? moment(e).format("DD/MM/YYYY") : "")}
                            status={(touched.endDate && errors.endDate && "error") || ""}
                            format="DD/MM/YYYY"
                            {...(field.value && {
                              value: moment(field.value, "DD/MM/YYYY"),
                            })}
                            style={{ width: "100%" }}
                          />
                          {touched.endDate && errors.endDate && (
                            <Typography.Text type="danger">{errors.endDate}</Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }}
                  </Field>
                </EqualCol>
                <Field name="applications">
                  {() => (
                    <AddApplications
                      {...props}
                      applications={applications}
                    />
                  )}
                </Field>
              </Row>

              <Row justify="end">
                <Col
                  span={24}
                  style={{ display: "flex", justifyContent: "end" }}
                >
                  <Button
                    htmlType="submit"
                    type="primary"
                    disabled={!(props.isValid && props.dirty) || validApps.length !== values.applications.length}
                  >
                    Submit
                  </Button>
                </Col>
              </Row>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

interface Props extends FormikProps<Project> {
  applications: any[];
}

const AddApplications = (props: Props) => {
  const { values, setValues, errors, applications, setFieldValue, getFieldProps } = props;

  const filteredApplications = applications.filter((obj) => {
    const match = values.applications.find((o) => (o as { name: string })?.name === obj.applicationName);
    return !match;
  });

  const errorApplication = errors.applications as any[];
  const [licenseCount, setLicenseCount] = useState<{ index: number; count: number; applicationName: string }[]>([]);

  const { id } = useParams();

  const onValueChange = (i: number, name?: any, type?: any) => {
    if (!isEmpty(name)) {
      if (type === "Existing") {
        return post("v1/application/license/unmapped/count", {
          applicationName: name,
          departmentId: id,
        })
          .then((res: any) => {
            if (res.response.data.licenseCount <= 0) {
              setFieldValue(`applications[${i}].isAvailable`, false);
            } else {
              setLicenseCount((licenses) => [
                ...licenses,
                {
                  index: i,
                  applicationName: name,
                  count: res.response.data.licenseCount,
                },
              ]);

              setFieldValue(`applications[${i}].isAvailable`, true);
            }
          })
          .catch(() => {
            setFieldValue(`applications[${i}].isAvailable`, false);
          });
      } else if (type === "New") {
        setFieldValue(`applications[${i}].isAvailable`, true);
        return Promise.resolve();
      }
    }
  };

  const addone = () => {
    setValues({
      ...values,
      applications: [
        ...values.applications,
        {
          name: "",
          type: "",
          isAvailable: true,
        },
      ],
    });
  };

  const deleteOne = (i: number) => {
    const applicationsValues = [...values.applications];
    if (applicationsValues.length > 1) {
      applicationsValues.splice(i, 1);
    }

    const updatedLicenses = [...licenseCount];

    if (updatedLicenses.length > 1) {
      updatedLicenses.splice(i, 1);
    }
    setLicenseCount(updatedLicenses);
    setValues({
      ...values,
      applications: applicationsValues,
    });
  };

  const [fieee, setFiee] = useState(false);

  return (
    <>
      {values.applications.map((app, i) => (
        <EqualCol key={`${app.name}-${i}`}>
          <Field name="">
            {() => (
              <Form.Item
                className={styles.LicenseFormItem}
                label={
                  <>
                    Application Name{" "}
                    {values.applications[i].name &&
                      values.applications[i].type === "Existing" &&
                      licenseCount &&
                      filter(licenseCount, (license) => license.applicationName === values.applications[i].name)[0] &&
                      filter(licenseCount, (license) => license.applicationName === values.applications[i].name)[0]
                        .count > 0 && (
                        <Tooltip
                          title={`${
                            filter(
                              licenseCount,
                              (license) => license.applicationName === values.applications[i].name
                            )[0].count
                          } license(s) available`}
                          placement="right"
                          color={styles.white}
                          arrowPointAtCenter
                          overlayInnerStyle={{
                            color: styles.primary,
                          }}
                        >
                          <Icon
                            icon="bi:info-circle-fill"
                            className={styles.LicensesInfo}
                          />
                        </Tooltip>
                      )}
                  </>
                }
                style={{ position: "relative" }}
              >
                <Input.Group size="large">
                  <Row gutter={8}>
                    <Col span={16}>
                      <Select
                        showSearch
                        size="large"
                        style={{
                          width: "100%",
                          border: !values.applications[i].name && fieee ? "1px solid red" : "",
                          borderRadius: !values.applications[i].name && fieee ? "5px" : "",   
                        }}
                        value={values.applications[i].name}
                        onChange={(e) => {
                          setFieldValue(`applications[${i}].name`, e);
                          onValueChange(i, e, getFieldProps(`applications[${i}].type`).value);
                        }}
                        onBlur={() => {
                          if(getFieldProps(`applications[${i}].type`).value == "Existing"){
                            onValueChange(i, values.applications[i].name, getFieldProps(`applications[${i}].type`).value);
                          }
                          setFiee(true);
                        }}
                      >
                        {filteredApplications &&
                          filteredApplications.map(
                            (appItem: { applicationName: string; logoURL: string }, appIndex: number) => (
                              <Select.Option
                                value={appItem.applicationName}
                                key={`${appIndex}-${appItem.applicationName}`}
                              >
                                <Space>
                                  <Image
                                    src={`${appItem.logoURL}${imageKey}`}
                                    style={{ width: 20 }}
                                  />
                                  {appItem.applicationName}
                                </Space>
                              </Select.Option>
                            )
                          )}
                      </Select>
                      <Typography.Text type="danger">
                        {" "}
                        {!values.applications[i].name && fieee && "Application Name required"}
                      </Typography.Text>
                    </Col>
                    <Col span={7}>
                      <Select
                        size="large"
                        style={{ width: "100%" }}
                        value={values.applications[i].type}
                        onChange={(e) => {
                          setFieldValue(`applications[${i}].type`, e);
                          onValueChange(i, getFieldProps(`applications[${i}].name`).value,e);
                        }}
                        onBlur={(e) => {
                          onValueChange(i, getFieldProps(`applications[${i}].name`).value, values.applications[i].type);
                        }}
                      >
                        <Select.Option value={"New"}>New</Select.Option>
                        <Select.Option value={"Existing"}>Existing</Select.Option>
                      </Select>
                    </Col>
                    {values.applications.length > 1 && (
                      <Col span={1}>
                        <Button
                          type="link"
                          danger
                          style={{ padding: 0 }}
                          onClick={() => deleteOne(i)}
                        >
                          <Icon
                            icon="fluent:delete-16-regular"
                            style={{
                              color: styles.strawberry,
                              cursor: "pointer",
                              fontSize: 20,
                              marginRight: 4,
                            }}
                          />
                        </Button>
                      </Col>
                    )}
                  </Row>
                </Input.Group>
                {values.applications[i].type === "Existing" &&
                  !values.applications[i].isAvailable &&
                  values.applications[i].name && (
                    <Typography.Text type="danger">{strings.notEnoughLicense}</Typography.Text> 
                  )}
              </Form.Item>
            )}
          </Field>
          {i === values.applications.length - 1 && (
            <Button
              type="link"
              onClick={addone}
              style={{ padding: 0 }}
              disabled={
                (errorApplication && errorApplication[i] && errorApplication[i].name) ||
                !values.applications[values.applications.length - 1].name ||
                !values.applications[values.applications.length - 1].type ||
                values.applications.some((field) => !field.isAvailable)
              }
            >
              <Icon
                icon="ant-design:plus-circle-filled"
                fontSize={20}
                style={{ marginRight: 4 }}
              />
              Add Another
            </Button>
          )}
        </EqualCol>
      ))}
    </>
  );
};
