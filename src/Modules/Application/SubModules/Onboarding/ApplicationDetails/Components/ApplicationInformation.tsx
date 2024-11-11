import { ReactNode, useContext, useEffect, useState } from "react";
import { Col, Input, Row, Select, Space, Typography, Form, Image } from "antd";
import { FormikProps, FieldProps, FastField, Field } from "formik";

import { filter, find, map } from "lodash";
import { ApplicationFormItems, ApplicationOnboardingContext } from "../../Wrapper";
import { imageKey } from "~/Utils";
const { Item } = Form;

export const ApplicationInformation = (props: FormikProps<ApplicationFormItems>) => {
  const { userData, applicationList, categories, onBoardingType, getRecords, projects, getContacts, contacts } =
    useContext(ApplicationOnboardingContext);
  const [disabled, setDisabled] = useState(true);
  const { setFieldValue, errors, touched, setFieldTouched } = props;
  const handleOwnerChange = (e: string) => {
    setFieldValue("application.ownerEmail", e);
    const { userName, departmentName, departmentId } = filter([...userData], (owner) => owner.userEmail === e)[0];
    getContacts(departmentId, e, [...userData]);
    getRecords(departmentId);
    setFieldValue("application.ownerName", userName);
    setFieldValue("application.ownerDepartment", departmentName);
    setFieldValue("application.projectName", "");
    setFieldValue("application.secondaryContactEmail", "");
    setFieldValue("application.secondaryContactName", "");
  };

  useEffect(() => {
    if (projects.length !== 0) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [projects, contacts]);

  useEffect(() => {
    setFieldValue("application.secondaryContactEmail", "");
    setFieldValue("application.secondaryContactName", "");
  }, [onBoardingType]);

  return (
    <>
      <Typography.Title level={3}>Application Details</Typography.Title>

      <Row gutter={24}>
        <EqualCol>
          <FastField name={"application.applicationName"}>
            {({ field }: FieldProps) => {
              return (
                <Item label={"Application Name"}>
                  <Select
                    size="large"
                    showSearch
                    value={field.value}
                    onBlur={() => setFieldTouched("application.applicationName", true)}
                    onChange={(e) => setFieldValue("application.applicationName", e)}
                    status={
                      (touched.application?.applicationName && errors.application?.applicationName && "error") || ""
                    }
                  >
                    {applicationList &&
                      applicationList.map((appItem: { applicationName: string; logoURL: string }) => (
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
                      ))}
                  </Select>
                  {touched.application?.applicationName && errors.application?.applicationName && (
                    <Typography.Text type="danger">{errors.application?.applicationName}</Typography.Text>
                  )}
                </Item>
              );
            }}
          </FastField>
        </EqualCol>

        {onBoardingType === "New" ? (
          " "
        ) : (
          <EqualCol>
            {" "}
            <FastField name={"application.subscriptionId"}>
              {({ field }: FieldProps) => {
                return (
                  <Item label="Subscription ID">
                    <Input
                      size="large"
                      {...field}
                      status={
                        (touched.application?.subscriptionId && errors.application?.subscriptionId && "error") || ""
                      }
                    />
                    {touched.application?.subscriptionId && errors.application?.subscriptionId && (
                      <Typography.Text type="danger">{errors.application?.subscriptionId}</Typography.Text>
                    )}
                  </Item>
                );
              }}
            </FastField>
          </EqualCol>
        )}
        <EqualCol>
          {onBoardingType === "New" ? (
            <FastField name={"application.providerName"}>
              {({ field }: FieldProps) => {
                return (
                  <Item label="Provider Name">
                    <Input
                      size="large"
                      {...field}
                      status={(touched.application?.providerName && errors.application?.providerName && "error") || ""}
                    />
                    {touched.application?.providerName && errors.application?.providerName && (
                      <Typography.Text type="danger">{errors.application?.providerName}</Typography.Text>
                    )}
                  </Item>
                );
              }}
            </FastField>
          ) : (
            <FastField name={"application.subscriptionName"}>
              {({ field }: FieldProps) => {
                return (
                  <Item label="Subscription Name">
                    <Input
                      size="large"
                      {...field}
                      status={
                        (touched.application?.subscriptionName && errors.application?.subscriptionName && "error") || ""
                      }
                    />
                    {touched.application?.subscriptionName && errors.application?.subscriptionName && (
                      <Typography.Text type="danger">{errors.application?.subscriptionName}</Typography.Text>
                    )}
                  </Item>
                );
              }}
            </FastField>
          )}
        </EqualCol>
        <EqualCol>
          <FastField name={"application.applictionCategory"}>
            {({ field: { value } }: FieldProps) => {
              return (
                <Item label="Category">
                  <Select
                    showSearch
                    size="large"
                    onBlur={() => setFieldTouched("application.applictionCategory", true)}
                    value={value}
                    onChange={(e) => setFieldValue("application.applictionCategory", e)}
                    status={
                      (touched.application?.applictionCategory && errors.application?.applictionCategory && "error") ||
                      ""
                    }
                  >
                    {categories &&
                      categories.map((category: { categoryName: string }) => (
                        <Select.Option
                          key={category.categoryName}
                          value={category.categoryName}
                        >
                          {category.categoryName}
                        </Select.Option>
                      ))}
                  </Select>
                  {touched.application?.applictionCategory && errors.application?.applictionCategory && (
                    <Typography.Text type="danger">{errors.application?.applictionCategory}</Typography.Text>
                  )}
                </Item>
              );
            }}
          </FastField>
        </EqualCol>
        <EqualCol>
          <FastField name={"application.ownerEmail"}>
            {({ field: { value } }: FieldProps) => {
              return (
                <Item label="Owner Email Address">
                  <Select
                    size="large"
                    showSearch
                    onChange={(e) => {
                      handleOwnerChange(e);
                    }}
                    onBlur={() => setFieldTouched("application.ownerEmail", true)}
                    value={value}
                    status={(touched.application?.ownerEmail && errors.application?.ownerEmail && "error") || ""}
                  >
                    {userData &&
                      map(userData, (owner: any, oIndex: number) => (
                        <Select.Option
                          value={owner.userEmail}
                          key={`owner-${oIndex}-${owner.userEmail}`}
                        >
                          {owner.userEmail}
                        </Select.Option>
                      ))}
                  </Select>
                  {touched.application?.ownerEmail && errors.application?.ownerEmail && (
                    <Typography.Text type="danger">{errors.application?.ownerEmail}</Typography.Text>
                  )}
                </Item>
              );
            }}
          </FastField>
        </EqualCol>
        <EqualCol>
          <FastField name={"application.ownerName"}>
            {({ field }: FieldProps) => {
              return (
                <Item label="Owner Name">
                  <Input
                    size="large"
                    readOnly
                    {...field}
                    disabled
                    status={(touched.application?.ownerName && errors.application?.ownerName && "error") || ""}
                  />
                </Item>
              );
            }}
          </FastField>
          {onBoardingType === "New" && (
            <>
              <FastField name={"application.ownerDepartment"}>
                {({ field }: FieldProps) => {
                  return (
                    <Item label="Owner Department">
                      <Input
                        size="large"
                        disabled
                        readOnly
                        {...field}
                        status={
                          (touched.application?.ownerDepartment && errors.application?.ownerDepartment && "error") || ""
                        }
                      />
                    </Item>
                  );
                }}
              </FastField>
              <Field name={"application.projectName"}>
                {({ field: { value } }: FieldProps) => {
                  return (
                    <Item label="Project Name">
                      <Select
                        showSearch
                        disabled={disabled}
                        size="large"
                        onBlur={() => setFieldTouched("application.projectName", true)}
                        value={value}
                        onChange={(e) => setFieldValue("application.projectName", e)}
                        status={(touched.application?.projectName && errors.application?.projectName && "error") || ""}
                      >
                        {projects &&
                          projects.map((category: { projectName: string }) => (
                            <Select.Option
                              key={category.projectName}
                              value={category.projectName}
                            >
                              {category.projectName}
                            </Select.Option>
                          ))}
                      </Select>
                      {disabled ? (
                        <Typography.Text type="danger">Project name is required</Typography.Text>
                      ) : touched.application?.projectName && errors.application?.projectName ? (
                        <Typography.Text type="danger">{errors.application?.projectName}</Typography.Text>
                      ) : (
                        ""
                      )}
                    </Item>
                  );
                }}
              </Field>
            </>
          )}
        </EqualCol>
        <EqualCol>
          {onBoardingType === "New" ? (
            <FastField name={"application.reason"}>
              {({ field }: FieldProps) => {
                return (
                  <Item label="Reason for onboarding">
                    <Input.TextArea
                      rows={4}
                      style={{ height: "210px" }}
                      size="large"
                      {...field}
                      status={(touched.application?.reason && errors.application?.reason && "error") || ""}
                    />
                    {touched.application?.reason && errors.application?.reason && (
                      <Typography.Text type="danger">{errors.application?.reason}</Typography.Text>
                    )}
                  </Item>
                );
              }}
            </FastField>
          ) : (
            <FastField name={"application.ownerDepartment"}>
              {({ field }: FieldProps) => {
                return (
                  <Item label="Owner Department">
                    <Input
                      size="large"
                      readOnly
                      disabled
                      {...field}
                      status={
                        (touched.application?.ownerDepartment && errors.application?.ownerDepartment && "error") || ""
                      }
                    />
                    {touched.application?.ownerDepartment && errors.application?.ownerDepartment && (
                      <Typography.Text type="danger">{errors.application?.ownerDepartment}</Typography.Text>
                    )}
                  </Item>
                );
              }}
            </FastField>
          )}
        </EqualCol>
        <EqualCol>
          <Field name={"application.secondaryContactEmail"}>
            {({ field: { value } }: FieldProps) => {
              return (
                <Item label="Secondary Contact">
                  <Select
                    size="large"
                    showSearch
                    onChange={(e) => {
                      setFieldValue("application.secondaryContactEmail", e);
                      const { userName } = find([...userData], (owner) => owner.userEmail === e);
                      setFieldValue("application.secondaryContactName", userName);
                    }}
                    onBlur={() => setFieldTouched("application.secondaryContactEmail", true)}
                    value={value}
                    status={
                      (touched.application?.secondaryContactEmail &&
                        errors.application?.secondaryContactEmail &&
                        "error") ||
                      ""
                    }
                  >
                    <Select.Option value={""}>-- Please Select --</Select.Option>
                    {map(contacts, (owner: any, oIndex: number) => (
                      <Select.Option
                        key={`${oIndex}-${owner.userEmail}`}
                        value={owner.userEmail}
                      >
                        {owner.userEmail}
                      </Select.Option>
                    ))}
                  </Select>
                  {touched.application?.secondaryContactEmail && errors.application?.secondaryContactEmail && (
                    <Typography.Text type="danger">{errors.application?.secondaryContactEmail}</Typography.Text>
                  )}
                </Item>
              );
            }}
          </Field>
        </EqualCol>
        {onBoardingType === "Purchased" && (
          <>
            <EqualCol>
              <FastField name={"application.providerName"}>
                {({ field }: FieldProps) => {
                  return (
                    <Item label="Provider Name">
                      <Input
                        size="large"
                        {...field}
                        status={
                          (touched.application?.providerName && errors.application?.providerName && "error") || ""
                        }
                      />
                      {touched.application?.providerName && errors.application?.providerName && (
                        <Typography.Text type="danger">{errors.application?.providerName}</Typography.Text>
                      )}
                    </Item>
                  );
                }}
              </FastField>
            </EqualCol>

            <EqualCol>
              <Field name={"application.projectName"}>
                {({ field: { value } }: FieldProps) => {
                  return (
                    <Item label="Project Name">
                      <Select
                        showSearch
                        disabled={disabled}
                        size="large"
                        onBlur={() => setFieldTouched("application.projectName", true)}
                        value={value}
                        onChange={(e) => setFieldValue("application.projectName", e)}
                        status={(touched.application?.projectName && errors.application?.projectName && "error") || ""}
                      >
                        {projects &&
                          projects.map((category: { projectName: string }) => (
                            <Select.Option
                              key={category.projectName}
                              value={category.projectName}
                            >
                              {category.projectName}
                            </Select.Option>
                          ))}
                      </Select>
                      {touched.application?.projectName && errors.application?.projectName && (
                        <Typography.Text type="danger">{errors.application?.projectName}</Typography.Text>
                      )}
                    </Item>
                  );
                }}
              </Field>
            </EqualCol>
          </>
        )}
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
