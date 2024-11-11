import { Typography, Form, Col, Input } from "antd";
import { ErrorMessage, Field, FieldProps } from "formik";
import React from "react";

export const AWSFormField = () => {
  return (
    <>
      <Col xs={24} md={12}>
        <Field name="accessKeyId">
          {({ field }: FieldProps) => (
            <Form.Item label="Access Key">
              <Input {...field} />
              <Typography.Text type="danger">
                <ErrorMessage name="accessKeyId" />
              </Typography.Text>
            </Form.Item>
          )}
        </Field>
      </Col>
      <Col xs={24} md={12}>
        <Field name="secretAccessKey">
          {({ field }: FieldProps) => (
            <Form.Item label="Secret Access Key">
              <Input {...field} />
              <Typography.Text type="danger">
                <ErrorMessage name="accessKeyId" />
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
