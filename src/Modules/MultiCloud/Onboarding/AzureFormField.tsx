import { Typography, Form, Col, Input } from "antd";
import { ErrorMessage, Field, FieldProps } from "formik";
import React from "react";

export const AzureFormField = () => {
  return (
    <>
      <Col xs={24} md={12}>
        <Field name="clientId">
          {({ field }: FieldProps) => (
            <Form.Item label="Client Id">
              <Input {...field} />
              <Typography.Text type="danger">
                <ErrorMessage name="clientId" />
              </Typography.Text>
            </Form.Item>
          )}
        </Field>
      </Col>
      <Col xs={24} md={12}>
        <Field name="clientSecret">
          {({ field }: FieldProps) => (
            <Form.Item label="Client Secret">
              <Input {...field} />
              <Typography.Text type="danger">
                <ErrorMessage name="clientSecret" />
              </Typography.Text>
            </Form.Item>
          )}
        </Field>
      </Col>
      <Col xs={24} md={12}>
        <Field name="tenantId">
          {({ field }: FieldProps) => (
            <Form.Item label="Tenant Id">
              <Input {...field} />
              <Typography.Text type="danger">
                <ErrorMessage name="tenantId" />
              </Typography.Text>
            </Form.Item>
          )}
        </Field>
      </Col>
    </>
  );
};
