import { Image, Col, List, Row, Typography, Drawer, Button, Space, Form, Input, Select, Card } from 'antd';
import { imageKey } from "@utils/Constants";

import styles from "../../../Projects.module.scss";
import { Link, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useState, useEffect, useRef } from 'react';
import { post, get } from '~/Services/api.service';
import { Field, FormikProps, Formik, ErrorMessage } from 'formik';
import { map, values } from 'lodash';
import * as yup from 'yup';
import { useNotification } from '~/Hooks/useNotification';
import { permissions } from '~/Utils/Roles';
import { useHasAccess } from '~/Hooks/useHasAccess';
import { currencyCode } from "@utils/Constants";
import cs from "classnames";

const { Title } = Typography;
interface Props {
  data?: any;
  fetchUser: () => any;
}
interface ApplicationProps extends FormikProps<Project> {
  applications: any[];
  departmentId: string;
  closeModal:boolean
}

interface ProjectProps {
  data?: any;
}
interface Project {
  projectName: string;
  projectManager: string;
  projectDescription: string;
  departmentId: string;
  budget: number;
  startDate: string;
  endDate: string;
  applications: {
    name: string;
    type: string;
  }[];
  currencyCode: string;
}
const defaultValue = {
  projectName: "",
  projectManager: "",
  projectDescription: "",
  departmentId: "",
  budget: 0,
  startDate: "",
  endDate: "",
  applications: [
    {
      name: "",
      type: "",
    },
  ],
  currencyCode: currencyCode,
};

const AddApplications = (props: ApplicationProps) => {
  const { values, setValues, errors, applications, departmentId, setFieldError, isValid, setFieldValue } = props;

  const filteredApplications = applications.filter((obj) => {
    const match = values.applications.find((o) => (o as { name: string }).name === obj.applicationName);
    return !match;
  });

  const errorApplication = errors.applications as any;
  const [value, setValue] = useState("");
  const [type, setType] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    onValueChange();
  }, [value, type]);
  var hasDuplicates = values.applications.some(function (currentObject) {
    let seen = new Set();
    return seen.size === seen.add(currentObject.name).size;
  });
  async function onValueChange() {
    if (values.applications[index].name) {
      if (values.applications[index].type === "Existing") {
        post("v1/application/license/unmapped/count", {
          applicationName: values.applications[index].name,
          departmentId: departmentId,
        })
          .then((res: any) => {
            if (res.response.data) {
              if (res.response.data.licenseCount <= 0) {
                setFieldError(`applications[${index}].name`, "Not enough license, Please select new application");
              }
            } else {
              setFieldError(`applications[${index}].name`, "Not enough license, Please select new application");
            }
          })
          .catch(() => {
            setFieldError(`applications[${index}].name`, "Not enough license, Please select new application");
          });
      }
    }
  };

  const addone = () => {
    if (!hasDuplicates) {
      setValues({
        ...values,
        applications: [
          ...values.applications,
          {
            name: "",
            type: "",
          },
        ],
      });
    }
  };

  const deleteOne = (i: number) => {
    const applicationsValues = [...values.applications];
    if (applicationsValues.length > 1) {
      applicationsValues.splice(i, 1);
    }
    setValues({
      ...values,
      applications: applicationsValues,
    });
  };
  return (
    <Col>
      {values.applications.map((app, i) => (
        <>
          <Field name="">
            {() => (
              <Form.Item label="Application Name">
                <Input.Group size="large">
                  <Row gutter={8}>
                    <Col span={16}>
                      <Select
                        showSearch
                        size="large"
                        style={{ width: "100%" }}
                        value={values.applications[i].name}
                        onChange={(e) => {
                          setFieldValue(`applications[${i}].name`, e);
                          setValue(e)
                          setIndex(i)
                        }}
                      >
                        {filteredApplications &&
                          filteredApplications.map(
                            (appItem: {
                              applicationName: string;
                              logoURL: string;
                            }) => (
                              <Select.Option
                                value={appItem.applicationName}
                                key={appItem.applicationName}
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
                    </Col>
                    <Col span={7}>
                      <Select
                        size="large"
                        style={{ width: "100%" }}
                        value={values.applications[i].type}
                        onChange={(e) => {
                          setFieldValue(`applications[${i}].type`, e);
                          setType(e);
                          setIndex(i);
                        }}
                      >
                        <Select.Option value={"New"}>New</Select.Option>
                        <Select.Option value={"Existing"}>
                          Existing
                        </Select.Option>
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
                {errorApplication &&
                  errorApplication[i] &&
                  errorApplication[i].name &&
                  values.applications[i].type === "Existing" && (
                    <Typography.Text type="danger">
                      {errorApplication[i].name}
                    </Typography.Text>
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
                !isValid ||
                hasDuplicates ||
                !values.applications[values.applications.length - 1].name ||
                !values.applications[values.applications.length - 1].type
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
        </>
      ))}
    </Col>
  );
};

export const ProjectAppplications = (appProps: Props) => {
  const formRef = useRef<any>(null);;
  const [openModal, setOpenModal] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  useEffect(() => {
    get("v1/application/get-logos")
      .then((res: any) => {
        if (res.response.data) {
          setApplications(res.response.data);
        }
      })
      .catch((err) => {
      });

  }, []);
  const saveInput = () => {
    if (formRef.current) {
      if (formRef.current.isValid) {
        formRef.current.handleSubmit();
      }
    }
  };

  const { openToast } = useNotification();
  const { hasPermissions } = useHasAccess();

  const { id } = useParams();
  const [height, setHeight] = useState(window.innerHeight - 300);
  const [titleHeight, setTitleHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const customTitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, [ref]);

  useEffect(() => {
    if (height) {
      if (customTitleRef.current) {
        setTitleHeight(
          customTitleRef.current.getBoundingClientRect().height + 32 // height + paddings
        );
      } else {
        setTitleHeight(32 + 32); // Title height + paddings
      }
    }
  }, [height, customTitleRef]);

  const onCloseModal = (values:any) => {
    setOpenModal(false) 
    if (formRef.current && formRef.current.resetForm) {
      formRef.current.resetForm();
    }
  }

  return (
    <Card
      ref={ref}
      className={cs(styles.cardStyle, styles.ContentWrapper)}
      title={<Title level={4}>Applications</Title>}
      bodyStyle={{
        height: height - titleHeight,
        overflow: "auto",
      }}
      style={{ overflow: "hidden", boxSizing: "border-box" }}
      extra={
        <>
          {hasPermissions([permissions.ADD_APPLICATION]) && (
            <Button type="link" style={{ padding: 0 }}
              onClick={() => {
                setOpenModal(true)
              }}  ><Icon icon="akar-icons:circle-plus" />
              <Typography.Text style={{ paddingLeft: "5px" }}>
                Add more
              </Typography.Text>
            </Button>
          )}
        </>
      }
    >
      <Col span={32}>
        <Formik
          initialValues={defaultValue}
          validationSchema={yup.object().shape({
            applications: yup.array().of(
              yup.object().shape({
                name: yup
                  .string()
                  .when('type', {
                    is: (type:any) => type === 'Existing' || type === 'New',
                    then: yup.string().required("Application name required"),
                    otherwise: yup.string(), // No validation if type is not "Existing" or "New"
                  }),
                type: yup
                  .string()
                  .strict(true)
                  .required("Application category required"),
              })
            ),
          })}
          onSubmit={(values, { setSubmitting }) => {
            const payload = {
              applicationsInfo: map(values.applications, (app) => ({
                applicationStatus: app.type,
                applicationName: app.name,
              })),
              departmentId: appProps.data.departmentId,
              projectName: appProps.data.projectName
            };

            post("v1/project/update", payload)
              .then((res: any) => {
                if (res && res.status === "OK") {
                  setOpenModal(false);
                  appProps.fetchUser();
                }
                setSubmitting(false);
              })
              .catch((err) => {
                setSubmitting(false);
              });
          }}
          innerRef={formRef}
        >
          {(props) => {
            const {
              values,
              submitForm,
              setFieldValue,
              isSubmitting,
              touched,
              errors,
              dirty,
              isValid,
              setFieldTouched,
              ...res
            } = props;
            let seen = new Set();
            var hasDuplicates = values.applications.some(function (currentObject) {
              return seen.size === seen.add(currentObject.name).size;
            });
            return (
              <Drawer
                title="Add More Applications"
                placement="right"
                width={600}
                closable={false}
                open={openModal}
                footer={
                  <Space align="end" style={{ float: "right" }}>
                    <Button onClick={() => onCloseModal(props) }>Cancel</Button>
                    <Button
                      disabled={hasDuplicates || !(isValid && dirty)}
                      htmlType="submit" type="primary"
                      onClick={(e) => {
                        submitForm()

                      }}
                      loading={isSubmitting}
                    >
                      Submit
                    </Button>
                  </Space>
                }
                onClose={() => {
                  setOpenModal(false);
                }}
              >
                <Form onFinish={submitForm} layout="vertical">
                  <Field name="applications">
                    {() => (
                      <AddApplications
                        {...props}
                        closeModal={openModal}
                        applications={applications}
                        departmentId={appProps.data.departmentId}
                      />
                    )}
                  </Field>
                </Form>
              </Drawer>
            );
          }}
        </Formik>
      </Col>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={appProps.data.applicationsInfo}
        renderItem={(item: any) => (
          <List.Item>
            <List.Item.Meta
              style={{ alignItems: "center" , marginBottom: 35}}
              avatar={
                <div style={{ width: 40 }}>
                  <Image
                    src={`${item.applicationLogo}${imageKey}`}
                    preview={false}
                    style={{ maxHeight: 40 }}
                  />
                </div>
              }
              description={
                <Row
                  gutter={16}
                  style={{ alignItems: "center" }}
                >
                  <Col span={16}>
                    <Typography.Text
                      style={{ color: styles.primary }}
                      ellipsis
                      strong
                    >
                      {item.applicationName}
                    </Typography.Text>
                  </Col>
                </Row>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};


