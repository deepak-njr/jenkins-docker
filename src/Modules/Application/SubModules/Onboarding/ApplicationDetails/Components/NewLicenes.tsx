import { Icon } from "@iconify/react";
import { Button, Col, Input, InputNumber, Row, Select, Space, Tooltip, Typography } from "antd";
import { FastField, Field, FieldProps, FormikProps, getIn } from "formik";
import { keys, map, some } from "lodash";
import React from "react";
import { DataTable } from "~/Components";
import { ApplicationFormItems } from "../../Wrapper";

import styles from "./index.module.scss";
import { currencyData } from "~/Utils/CurrencyCodes";
import { currencyFormat } from "~/Utils";
import { columnWidth } from "~/Components/DataTable/Properties";
import { productType, unitPriceType } from "~/Utils/StringConstants";
import { currency } from "@utils/StringConstants";
import { currencyOptions } from "@utils/CurrenyOptions";
import { Contracts } from "../../../DrillDown";

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

export const NewLicenes = ({
  values,
  setValues,
  errors,
  getFieldProps,
  setFieldTouched,
  setFieldValue,
  touched,
}: FormikProps<ApplicationFormItems>) => {
  const handleProductRemove = ({ key }: any) => {
    const contracts = [...values.contracts];
    if (key > -1 && contracts[0].products.length > 1) {
      contracts[0].products.splice(key, 1);
    }
    setValues({
      ...values,
      contracts: contracts,
    });
  };
  const contract = values.contracts[0];

  const addProductRow = () => {
    const contracts = [...values.contracts];
    contracts[0].products.push({
      productType: "",
      productName: "",
      unitPrice: 0,
      quantity: 0,
      totalCost: 0,
      unitPriceType: "per month",
    });
    setValues({
      ...values,
      contracts: contracts,
    });
  };
  if (!contract.products) return null;
  const calcHeight = () => {
    return contract.products.length * 40 + 130 > 300 ? 300 : contract.products.length * 40 + 130;
  };

  const getStatus = (lIndex: number, name: any) => {
    if (errors && errors.contracts && touched && touched.contracts) {
      const contractsError = errors.contracts[0] as any;
      const contractsTouched = touched.contracts[0] as any;
      const ProductsError = contractsError?.products && contractsError?.products[lIndex];
      const ProductsTouched = contractsTouched?.products && contractsTouched?.products[lIndex];

      if (ProductsError && ProductsError[name] && ProductsTouched && ProductsTouched[name]) {
        return {
          type: "error",
          error: ProductsError[name],
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

    // const ProductError = errors && errors[lIndex];
    // const ProductTouched = touched && touched[lIndex];
    // if (
    //   ProductError &&
    //   ProductError[name] &&
    //   ProductTouched &&
    //   ProductTouched[name]
    // ) {
    //   return "error";
    // }
    return undefined;
  };

  return (
    <>
      <Row justify="space-between">
        <Col>
          <Typography.Title level={5}>Product Details</Typography.Title>
        </Col>
        <Col>
          <Space>
            <Typography.Title level={5}>Currency</Typography.Title>
            <Select
              showSearch
              size="large"
              className={styles.unitWidth}
              value={getFieldProps(`contracts[${0}].currencyCode`).value}
              onChange={(e) => {
                setFieldValue(`contracts[${0}].currencyCode`, e);
              }}
            >
              {currencyOptions(currencyData, currency)}
            </Select>
          </Space>
        </Col>
      </Row>
      <Col
        span={24}
        md={24}
      >
        <DataTable
          height={calcHeight()}
          multiSelect={false}
          tableData={map(contract.products, (Product, i) => ({
            ...Product,
            key: i,
          }))}
          columns={[
            {
              key: "productName",
              dataIndex: "productName",
              title: "Product Name",
              render: (val: any, record: any, lIndex: number) => {
                return (
                  <Field name={`contracts[0].products[${lIndex}].productName`}>
                    {({ field }: FieldProps) => {
                      return (
                        <Input
                          {...field}
                          status={getStatus(lIndex, "productName")?.type as any}
                          suffix={
                            getStatus(lIndex, "productName")?.type === "error" ? (
                              suffixIcon(getStatus(lIndex, "productName")?.error || "")
                            ) : (
                              <></>
                            )
                          }
                        />
                      );
                    }}
                  </Field>
                );
              },
            },
            {
              key: "productType",
              dataIndex: "productType",
              title: "Product Type",
              render: (val: any, record: any, lIndex: number) => {
                return (
                  <Field name={`contracts[0].products[${lIndex}].productType`}>
                    {({ field }: FieldProps) => {
                      return (
                        <Select
                          showSearch
                          size="middle"
                          style={{ width: "100%" }}
                          onBlur={() => setFieldTouched(`contracts[0].products[${lIndex}].productType`, true)}
                          onChange={(e) => {
                            setFieldValue(`contracts[0].products[${lIndex}].productType`, e);
                            setFieldValue(`contracts[0].products[${lIndex}].quantity`, e !== "Licenses" ? 1 : 0);
                            setFieldValue(`contracts[0].products[${lIndex}].unitPrice`, 0);
                            setFieldValue(`contracts[0].products[${lIndex}].totalCost`, 0);
                          }}
                          value={field.value}
                          status={getStatus(lIndex, "productType")?.type as any}
                        >
                          {productType.map((item) => (
                            <Select.Option
                              value={item.key}
                              key={item.key}
                            >
                              {item.key}
                            </Select.Option>
                          ))}
                        </Select>
                      );
                    }}
                  </Field>
                );
              },
            },
            {
              key: "unitPrice",
              dataIndex: "unitPrice",
              title: "Unit Price",
              width: columnWidth.EMAIL,
              render: (val: any, record: any, lIndex: number) => {
                return (
                  <Row>
                    <Field name={`contracts[0].products[${lIndex}].unitPrice`}>
                      {({ field, form }: FieldProps) => {
                        const fieldName = `contracts[0].products[${lIndex}].unitPrice`;
                        const error = getIn(form.errors, fieldName);
                        const touched = getIn(form.touched, fieldName);
                        return (
                          <Space direction="vertical">
                            <Input
                              addonAfter={
                                <Select
                                  size="middle"
                                  className={styles.unitTypeWidth}
                                  value={getFieldProps(`contracts[0].products[${lIndex}].unitPriceType`).value}
                                  onChange={(e) => {
                                    setFieldValue(`contracts[0].products[${lIndex}].unitPriceType`, e);
                                  }}
                                >
                                  {unitPriceType.map((item) => (
                                    <Select.Option
                                      value={item.key}
                                      key={item.key}
                                    >
                                      {item.key}
                                    </Select.Option>
                                  ))}
                                </Select>
                              }
                              status={getStatus(lIndex, "unitPrice")?.type as any}
                              onBlur={() => setFieldTouched(`contracts[0].products[${lIndex}].unitPrice`, true)}
                              min={0}
                              value={field.value}
                              onChange={(e) => {
                                const newUnitPrice = e.target.value;
                                const isValidInput = /^\d*\.?\d*$/.test(newUnitPrice);
                                if (isValidInput) {
                                  form.setFieldValue(fieldName, newUnitPrice);
                                  const quantity = getFieldProps(`contracts[0].products[${lIndex}].quantity`).value;
                                  form.setFieldValue(
                                    `contracts[0].products[${record.key}].totalCost`,
                                    Number(quantity) * Number(newUnitPrice)
                                  );
                                }
                              }}
                            />
                            {touched && error && <Typography.Text type="danger">{error}</Typography.Text>}
                          </Space>
                        );
                      }}
                    </Field>
                  </Row>
                );
              },
            },
            {
              key: "quantity",
              dataIndex: "quantity",
              title: "Quantity",
              render: (val: any, record: any, lIndex: number) => {
                return (
                  <Field name={`contracts[0].products[${lIndex}].quantity`}>
                    {({ field }: FieldProps) => {
                      return (
                        <Input
                          status={getStatus(lIndex, "quantity")?.type as any}
                          suffix={
                            getStatus(lIndex, "quantity")?.type === "error" ? (
                              suffixIcon(getStatus(lIndex, "quantity")?.error || "")
                            ) : (
                              <></>
                            )
                          }
                          min={1}
                          {...(getFieldProps(`contracts[0].products[${lIndex}].productType`).value !== "Licenses" && {
                            max: 1,
                            readOnly: true,
                          })}
                          {...field}
                          value={field.value}
                          onKeyDown={(e) => {
                            if (e.key === ".") {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const newQuantity = e.target.value;
                            setFieldValue(`contracts[0].products[${record.key}].quantity`, newQuantity);
                            setFieldValue(
                              `contracts[0].products[${record.key}].totalCost`,
                              values.contracts[0].products[record.key].unitPrice * Number(newQuantity)
                            );
                          }}
                          type="number"
                        />
                      );
                    }}
                  </Field>
                );
              },
            },
            {
              key: "totalCost",
              dataIndex: "totalCost",
              title: "Total Cost",
              width: columnWidth.GENERAL,
              render: (val: any, record: any, lIndex: number) => {
                return (
                  <Field name={`contracts[0].products[${lIndex}].totalCost`}>
                    {({ field }: FieldProps) => {
                      return (
                        <Row>
                          <Typography.Text>
                            {currencyFormat(field.value, false, getFieldProps(`contracts[0].currencyCode`).value)}
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
                    {contract.products.length > 1 && (
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
          style={{ textAlign: "right" }}
        >
          <Button
            type="text"
            onClick={addProductRow}
            icon={<Icon icon="akar-icons:plus" />}
            disabled={some(contract.products[contract.products.length - 1], (licenceVal) => !licenceVal)}
          >
            Add another Product
          </Button>
        </Col>
      </Row>
    </>
  );
};
