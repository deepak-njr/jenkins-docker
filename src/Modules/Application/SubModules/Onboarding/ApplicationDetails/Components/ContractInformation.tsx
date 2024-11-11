import {
  Button,
  Col,
  Input,
  Form,
  Row,
  Typography,
  DatePicker,
  Space,
  Select,
  Image,
  Switch,
  Tooltip,
  InputNumber,
} from "antd";

import { FastField, Field, FieldProps, FormikProps, getIn } from "formik";
import { cloneDeep, has, isArray, isBoolean, map, omit, some, keys } from "lodash";
import moment from "moment";
import { ReactNode, useRef, useState } from "react";
import { BankCard, DataTable, ExpansionPanel } from "@components/index";
import { ApplicationFormItems } from "../../Wrapper";
import { Icon } from "@iconify/react";
import styles from "./index.module.scss";
import { imageKey, currencyCode } from "@utils/Constants";
import { currencyData } from "@utils/CurrencyCodes";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { columnWidth } from "~/Components/DataTable/Properties";
import { currency } from "@utils/StringConstants";
import { currencyOptions } from "@utils/CurrenyOptions";
import { contractBillingFrequency, contractType, productType, unitPriceType } from "@utils/StringConstants";

const defaultContract = {
  name: "",
  startDate: "",
  endDate: "",
  renewalTerm: 0,
  contractTenure: "",
  contractType: "",
  upcomingRenewalDate: "",
  autoRenewalCancellation: "",
  currencyCode: currencyCode,
  autoRenewal: false,
  products: [
    {
      productName: "",
      productType: "",
      unitPrice: 0,
      quantity: 0,
      unitPriceType: "per month",
      totalCost: 0,
    },
  ],
};

const { Item } = Form;

interface Props extends FormikProps<ApplicationFormItems> {
  singleContract?: boolean;
  showContractTitle?: boolean;
}

export const ContractInformation = (props: Props) => {
  const { values, setValues, singleContract, showContractTitle = true } = props;

  const handleAddContract = () => {
    const contractValues = [...values.contracts];
    contractValues.push(defaultContract);
    setValues({
      ...values,
      contracts: contractValues,
    });
  };
  const handleDeleteContract = () => {
    const contracts = [...values.contracts];
    if (contracts.length > 1) {
      contracts.splice(contracts.length - 1, 1);
    }
    setValues({
      ...values,
      contracts: contracts,
    });
  };
  return (
    <Row>
      <Col span={24}>
        {showContractTitle && <Typography.Title level={3}>Contract Details</Typography.Title>}
        {map(values.contracts, (contract, i) => (
          <ContractItem
            contract={contract}
            index={i}
            editable={values.contracts.length - 1 === i}
            {...props}
            key={`contractItem${i}`}
          />
        ))}
        {!singleContract && (
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Button
              type="link"
              onClick={handleAddContract}
              disabled={
                values.contracts &&
                some(values.contracts[values.contracts.length - 1], (contractval) => {
                  if (isBoolean(contractval)) {
                    return false;
                  } else if (isArray(contractval)) {
                    return some(contractval[contractval.length - 1], (licenceVal) => !licenceVal);
                  } else {
                    return !contractval;
                  }
                }) &&
                !values.contracts[values.contracts.length - 1].billingFrequency &&
                !values.contracts[values.contracts.length - 1].name
              }
            >
              <Icon
                icon="ant-design:plus-circle-filled"
                fontSize={20}
                style={{ marginRight: 4 }}
              />
              Add another Contract
            </Button>
            {values.contracts.length > 1 && (
              <Button
                type="link"
                danger
                onClick={handleDeleteContract}
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
                Delete Contract
              </Button>
            )}
          </Space>
        )}
      </Col>
    </Row>
  );
};

interface ContractProps extends FormikProps<ApplicationFormItems> {
  contract: ApplicationFormItems["contracts"][0];
  editable: boolean;
  index: number;
}
const ContractItemWrapper = ({
  children,
  isExpanstionPanel,
  title = "",
  deleteContract,
}: {
  children: ReactNode;
  title: string;
  isExpanstionPanel: boolean;
  deleteContract: () => void;
}) => {
  if (isExpanstionPanel) {
    return (
      <ExpansionPanel title={title}>
        <>{children}</>
        <Row>
          <Col>
            <Button
              type="link"
              danger
              onClick={deleteContract}
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
              Delete Contract
            </Button>
          </Col>
        </Row>
      </ExpansionPanel>
    );
  } else {
    return <>{children}</>;
  }
};
const ContractItem = ({
  contract,
  editable,
  index,
  setFieldValue,
  getFieldProps,
  values,
  setValues,
  touched,
  errors,
  setFieldTouched,
  ...props
}: ContractProps) => {
  const contractsTouched = touched.contracts && (touched.contracts[index] as any);
  const contractsError = errors.contracts && (errors.contracts[index] as any);

  const handleHideShowPayment = (value: boolean) => {
    setFieldValue(`contracts[${index}].upcomingRenewalDate`, "");
    const clonedContracts = cloneDeep(values.contracts);
    const contractwithpayment = clonedContracts.map((contractInfo, i) => {
      if (i === index) {
        if (value) {
          return {
            ...contractInfo,
            autoRenewal: true,
            autoRenewalCancellation: "",
            paymentMethod: {
              type: "",
              cardHolderName: "",
              cardNumber: "",
              validThrough: "",
            },
          };
        } else {
          setFieldTouched(`contracts[${index}].paymentMethod`, false);
          setFieldTouched(`contracts[${index}].autoRenewalCancellation`, false);
          if (has(contractInfo, "paymentMethod")) {
            return {
              ...omit(contractInfo, "paymentMethod"),
              autoRenewal: false,
              upcomingRenewalDate: "",
            };
          }
        }
      }
      return {
        ...contractInfo,
        upcomingRenewalDate: "",
      };
    });

    setValues({
      ...values,
      contracts: contractwithpayment,
    });
  };

  const handleDateChange = (date: any, tenure: any) => {
    if (date) {
      const startDate = moment(date, "DD/MM/YYYY");
      const daysInMonth = startDate.daysInMonth();
      let endDate;

      if (getFieldProps(`contracts[${index}].contractType`).value === contractType[0]) {
        endDate = startDate.clone().add(daysInMonth - 1, "days");
      } else {
        endDate = startDate.add(tenure, "years").subtract(1, "days");
      }

      setFieldValue(`contracts[${index}].endDate`, moment(endDate).format("DD/MM/YYYY"));
      setFieldTouched(`contracts[${index}].startDate`, false);
    } else {
      setFieldValue(`contracts[${index}].endDate`, "");
    }

    if (tenure !== getFieldProps(`contracts[${index}].contractTenure`).value) {
      setFieldValue(`contracts[${index}].startDate`, "");
      setFieldValue(`contracts[${index}].endDate`, "");
    }
  };

  const handleDelete = () => {
    const contracts = [...values.contracts];
    if (index > -1 && contracts.length > 1) {
      contracts.splice(index, 1);
    }
    setValues({
      application: { ...values.application },
      contracts: contracts,
    });
  };

  return (
    <ContractItemWrapper
      key={index}
      isExpanstionPanel={!editable}
      title={contract.name}
      deleteContract={handleDelete}
    >
      <>
        <Col
          xs={24}
          md={16}
        >
          <Row gutter={24}>
            <EqualCol>
              <Field name={`contracts[${index}].contractType`}>
                {({ field }: FieldProps) => {
                  return (
                    <Item label="Contract Type">
                      <Select
                        showSearch
                        size="large"
                        onBlur={() => setFieldTouched(`contracts[${index}].contractType`, true)}
                        value={field.value}
                        onSelect={(e) => {
                          const tempContracts = values.contracts;
                          tempContracts[index] = {
                            ...defaultContract,
                          };
                          setValues({
                            ...values,
                            contracts: tempContracts,
                          });
                          keys(defaultContract).map((key) => {
                            setFieldTouched(`contracts[${index}][${key}]`, false);
                            setFieldValue(`contracts[${index}].contractType`, e);
                          });
                        }}
                        status={(contractsTouched?.contractType && contractsError?.contractType && "error") || ""}
                      >
                        {contractType.map((item) => (
                          <Select.Option
                            value={item}
                            key={item}
                          >
                            {item}
                          </Select.Option>
                        ))}
                      </Select>
                      {contractsTouched?.contractType && contractsError?.contractType && (
                        <Typography.Text type="danger">{contractsError?.contractType}</Typography.Text>
                      )}
                    </Item>
                  );
                }}
              </Field>
            </EqualCol>

            {contract.contractType && (
              <>
                <EqualCol>
                  <FastField name={`contracts[${index}].name`}>
                    {({ field }: FieldProps) => {
                      return (
                        <Item label="Contract Name">
                          <Input
                            size="large"
                            {...field}
                            status={(contractsTouched?.name && contractsError?.name && "error") || ""}
                          />
                          {contractsTouched?.name && contractsError?.name && (
                            <Typography.Text type="danger">{contractsError?.name}</Typography.Text>
                          )}
                        </Item>
                      );
                    }}
                  </FastField>
                </EqualCol>
                {contract.contractType === contractType[1] && (
                  <EqualCol>
                    <Field name={`contracts[${index}].contractTenure`}>
                      {({ field }: FieldProps) => {
                        return (
                          <Item label="Contract Tenure">
                            <Row>
                              <Input
                                size="large"
                                {...field}
                                type="number"
                                suffix={
                                  <Typography.Text className={styles.prefixText}>
                                    {contract.contractType === contractType[1] ? "Years" : "Months"}
                                  </Typography.Text>
                                }
                                onBlur={() => setFieldTouched(`contracts[${index}].contractTenure`, true)}
                                onChange={(e) => {
                                  if (e) {
                                    setFieldValue(`contracts[${index}].contractTenure`, e.target.value),
                                      setFieldTouched(`contracts[${index}].contractTenure`, false);
                                    e.target.value && handleDateChange(contract.startDate, e.target.value);
                                  }
                                }}
                                max={5}
                                min={1}
                                status={
                                  (contractsTouched?.contractTenure && contractsError?.contractTenure && "error") || ""
                                }
                              />
                            </Row>
                            <Row>
                              {contractsTouched?.contractTenure && contractsError?.contractTenure && (
                                <Typography.Text type="danger">{contractsError?.contractTenure}</Typography.Text>
                              )}
                            </Row>
                          </Item>
                        );
                      }}
                    </Field>
                  </EqualCol>
                )}
                {contract.contractType === contractType[1] && !contract.contractTenure ? null : (
                  <>
                    <EqualCol>
                      <FastField name={`contracts[${index}].startDate`}>
                        {({ field }: FieldProps) => {
                          return (
                            <Item label="Start Date">
                              <DatePicker
                                size="large"
                                allowClear
                                style={{ width: "100%" }}
                                onChange={(e) => {
                                  setFieldValue(
                                    `contracts[${index}].startDate`,
                                    e ? moment(e).format("DD/MM/YYYY") : ""
                                  ),
                                    handleDateChange(e, contract.contractTenure);
                                }}
                                onBlur={() => setFieldTouched(`contracts[${index}].startDate`, true)}
                                {...(field.value && {
                                  value: moment(field.value, "DD/MM/YYYY"),
                                })}
                                format={"DD/MM/YYYY"}
                                status={(contractsTouched?.startDate && contractsError?.startDate && "error") || ""}
                              />
                              {contractsTouched?.startDate && contractsError?.startDate && (
                                <Typography.Text type="danger">{contractsError?.startDate}</Typography.Text>
                              )}
                            </Item>
                          );
                        }}
                      </FastField>
                    </EqualCol>
                    <EqualCol>
                      <FastField name={`contracts[${index}].endDate`}>
                        {({ field }: FieldProps) => {
                          return (
                            <Item label="End Date">
                              <DatePicker
                                size="large"
                                disabled
                                allowClear
                                style={{ width: "100%" }}
                                onChange={(e) =>
                                  setFieldValue(`contracts[${index}].endDate`, e ? moment(e).format("DD/MM/YYYY") : "")
                                }
                                onBlur={() => setFieldTouched(`contracts[${index}].endDate`, true)}
                                format={"DD/MM/YYYY"}
                                {...(field.value && {
                                  value: moment(field.value, "DD/MM/YYYY"),
                                })}
                                status={(contractsTouched?.endDate && contractsError?.endDate && "error") || ""}
                              />
                              {contractsTouched?.endDate && contractsError?.endDate && (
                                <Typography.Text type="danger">{contractsError?.endDate}</Typography.Text>
                              )}
                            </Item>
                          );
                        }}
                      </FastField>
                    </EqualCol>

                    <EqualCol>
                      <Row gutter={16}>
                        <Col
                          xs={24}
                          md={8}
                        >
                          <Field name={`contracts[${index}].autoRenewal`}>
                            {({ field: { value } }: FieldProps) => {
                              return (
                                <Item label="Auto Renewal">
                                  <Switch
                                    checked={value}
                                    onChange={handleHideShowPayment}
                                  />
                                </Item>
                              );
                            }}
                          </Field>
                        </Col>
                        {contract.paymentMethod && contract.contractType === contractType[1] && (
                          <Col
                            xs={24}
                            md={16}
                          >
                            <FastField name={`contracts[${index}].autoRenewalCancellation`}>
                              {({ field }: FieldProps) => {
                                return (
                                  <Item label="Cancellation Notice">
                                    {/* <Space> */}
                                    <Input
                                      size="large"
                                      {...field}
                                      type="number"
                                      suffix={
                                        <Typography.Text className={styles.prefixText}>
                                          Duration in days
                                        </Typography.Text>
                                      }
                                      max={60}
                                      min={1}
                                      status={
                                        (contractsTouched?.autoRenewalCancellation &&
                                          contractsError?.autoRenewalCancellation &&
                                          "error") ||
                                        ""
                                      }
                                    />

                                    <Row>
                                      {contractsTouched?.autoRenewalCancellation &&
                                        contractsError?.autoRenewalCancellation && (
                                          <Typography.Text type="danger">
                                            {contractsError?.autoRenewalCancellation}
                                          </Typography.Text>
                                        )}
                                    </Row>
                                  </Item>
                                );
                              }}
                            </FastField>
                          </Col>
                        )}
                      </Row>
                    </EqualCol>
                    {contract.paymentMethod && (
                      <EqualCol>
                        <FastField name={`contracts[${index}].upcomingRenewalDate`}>
                          {({ field }: FieldProps) => {
                            return (
                              <Item label="Next Renewal Date">
                                <DatePicker
                                  size="large"
                                  allowClear
                                  style={{ width: "100%" }}
                                  format={"DD/MM/YYYY"}
                                  onBlur={() => setFieldTouched(`contracts[${index}].upcomingRenewalDate`, true)}
                                  onChange={(e) => {
                                    setFieldValue(
                                      `contracts[${index}].upcomingRenewalDate`,
                                      e ? moment(e).format("DD/MM/YYYY") : ""
                                    );
                                  }}
                                  {...(field.value && {
                                    value: moment(field.value, "DD/MM/YYYY"),
                                  })}
                                  status={
                                    (contractsTouched?.upcomingRenewalDate &&
                                      contractsError?.upcomingRenewalDate &&
                                      "error") ||
                                    ""
                                  }
                                />
                                {contractsTouched?.upcomingRenewalDate && contractsError?.upcomingRenewalDate && (
                                  <Typography.Text type="danger">{contractsError?.upcomingRenewalDate}</Typography.Text>
                                )}
                              </Item>
                            );
                          }}
                        </FastField>
                      </EqualCol>
                    )}

                    {contract.contractType === contractType[1] && (
                      <EqualCol>
                        <FastField name={`contracts[${index}].billingFrequency`}>
                          {({ field: { value } }: FieldProps) => {
                            return (
                              <Item label="Billing Frequency">
                                <Select
                                  showSearch
                                  size="large"
                                  onBlur={() => setFieldTouched(`contracts[${index}].billingFrequency`, true)}
                                  value={value}
                                  onChange={(e) => setFieldValue(`contracts[${index}].billingFrequency`, e)}
                                  status={
                                    (contractsTouched?.billingFrequency &&
                                      contractsError?.billingFrequency &&
                                      "error") ||
                                    ""
                                  }
                                >
                                  {contractBillingFrequency.map((item) => (
                                    <Select.Option
                                      value={item}
                                      key={item}
                                    >
                                      {item}
                                    </Select.Option>
                                  ))}
                                </Select>
                                {contractsTouched?.billingFrequency && contractsError?.billingFrequency && (
                                  <Typography.Text type="danger">{contractsError?.billingFrequency}</Typography.Text>
                                )}
                              </Item>
                            );
                          }}
                        </FastField>
                      </EqualCol>
                    )}
                    {contract.paymentMethod && (
                      <>
                        <EqualCol>
                          <FastField name={`contracts[${index}].paymentMethod.type`}>
                            {({ field }: FieldProps) => {
                              return (
                                <Item label="Payment Method">
                                  <Select
                                    size="large"
                                    value={field.value}
                                    onBlur={() => setFieldTouched(`contracts[${index}].paymentMethod.type`, true)}
                                    onChange={(e) => {
                                      setFieldValue(`contracts[${index}].paymentMethod.cardHolderName`, "");
                                      setFieldValue(`contracts[${index}].paymentMethod.cardNumber`, "");
                                      setFieldValue(`contracts[${index}].paymentMethod.validThrough`, "");
                                      setFieldValue(`contracts[${index}].paymentMethod.walletName`, "");
                                      setFieldValue(`contracts[${index}].paymentMethod.type`, e);
                                    }}
                                  >
                                    <Select.Option value="Credit / Debit Card">Credit / Debit Card</Select.Option>
                                    <Select.Option value="wallet">Wallet</Select.Option>
                                  </Select>
                                  {contractsTouched?.paymentMethod?.type && contractsError?.paymentMethod?.type && (
                                    <Typography.Text type="danger">
                                      {contractsError?.paymentMethod.type}
                                    </Typography.Text>
                                  )}
                                </Item>
                              );
                            }}
                          </FastField>
                        </EqualCol>
                        {contract.paymentMethod.type === "wallet" && (
                          <EqualCol>
                            <FastField name={`contracts[${index}].paymentMethod.walletName`}>
                              {({ field }: FieldProps) => {
                                return (
                                  <Item label="Wallet Name">
                                    <Select
                                      size="large"
                                      value={field.value}
                                      onBlur={() =>
                                        setFieldTouched(`contracts[${index}].paymentMethod.walletName`, true)
                                      }
                                      onChange={(e) => {
                                        setFieldValue(`contracts[${index}].paymentMethod.walletName`, e);
                                      }}
                                    >
                                      <Select.Option
                                        value="Apple Pay"
                                        style={{
                                          display: "flex",
                                        }}
                                      >
                                        <Typography.Text>
                                          <Space
                                            style={{ display: "flex" }}
                                            align="center"
                                          >
                                            <Icon icon="logos:apple-pay" />
                                            Apple Pay
                                          </Space>
                                        </Typography.Text>
                                      </Select.Option>

                                      <Select.Option value="Google Pay">
                                        <Space style={{ lineHeight: 1 }}>
                                          <Icon
                                            icon="logos:google-pay-icon"
                                            style={{ display: "flex" }}
                                          />
                                          Google Pay
                                        </Space>
                                      </Select.Option>
                                      <Select.Option value="Grab Pay">
                                        <Space>
                                          <Image
                                            style={{ width: 30 }}
                                            src={`https://saaspemedia.blob.core.windows.net/images/logos/png/grab-pay-logo.png${imageKey}`}
                                          />
                                          Grab Pay
                                        </Space>
                                      </Select.Option>
                                    </Select>
                                    {contractsTouched?.paymentMethod?.walletName &&
                                      contractsError?.paymentMethod?.walletName && (
                                        <Typography.Text type="danger">
                                          {contractsError?.paymentMethod.walletName}
                                        </Typography.Text>
                                      )}
                                  </Item>
                                );
                              }}
                            </FastField>
                          </EqualCol>
                        )}
                        {contract.paymentMethod && contract.paymentMethod.type === "Credit / Debit Card" && (
                          <EqualCol>
                            <FastField name={`contracts[${index}].paymentMethod.cardHolderName`}>
                              {({ field }: FieldProps) => {
                                return (
                                  <Item label="Card Holder Name">
                                    <Input
                                      {...field}
                                      size="large"
                                    />
                                    {contractsTouched?.paymentMethod?.cardHolderName &&
                                      contractsError?.paymentMethod?.cardHolderName && (
                                        <Typography.Text type="danger">
                                          {contractsError?.paymentMethod.cardHolderName}
                                        </Typography.Text>
                                      )}
                                  </Item>
                                );
                              }}
                            </FastField>
                          </EqualCol>
                        )}
                      </>
                    )}
                    {contract.paymentMethod && (
                      <>
                        {contract.paymentMethod.type === "Credit / Debit Card" && (
                          <>
                            <EqualCol>
                              <FastField name={`contracts[${index}].paymentMethod.cardNumber`}>
                                {({ field }: FieldProps) => {
                                  return (
                                    <Item label="Card Number">
                                      <BankCard {...field} />
                                      {contractsTouched?.paymentMethod?.cardNumber &&
                                        contractsError?.paymentMethod?.cardNumber && (
                                          <Typography.Text type="danger">
                                            {contractsError?.paymentMethod.cardNumber}
                                          </Typography.Text>
                                        )}
                                    </Item>
                                  );
                                }}
                              </FastField>
                            </EqualCol>
                            <EqualCol>
                              <FastField name={`contracts[${index}].paymentMethod.validThrough`}>
                                {({ field }: FieldProps) => {
                                  return (
                                    <Item label="Valid Through">
                                      <DatePicker
                                        size="large"
                                        picker="month"
                                        disabledDate={(current) => current.isBefore(moment().subtract(1, "day"))}
                                        allowClear
                                        onBlur={() =>
                                          setFieldTouched(`contracts[${index}].paymentMethod.validThrough`, true)
                                        }
                                        onChange={(e) =>
                                          setFieldValue(
                                            `contracts[${index}].paymentMethod.validThrough`,
                                            e ? moment(e).format("MM/YY") : ""
                                          )
                                        }
                                        format="MM/YY"
                                        {...(field.value && {
                                          value: moment(field.value, "MM/YY"),
                                        })}
                                        style={{ width: "100%" }}
                                      />
                                      {contractsTouched?.paymentMethod?.validThrough &&
                                        contractsError?.paymentMethod?.validThrough && (
                                          <Typography.Text type="danger">
                                            {contractsError?.paymentMethod.validThrough}
                                          </Typography.Text>
                                        )}
                                    </Item>
                                  );
                                }}
                              </FastField>
                            </EqualCol>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Row>
        </Col>

        <Row>
          <Col span={24}>
            <LicenseInformation
              contract={contract}
              index={index}
              getFieldProps={getFieldProps}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
              values={values}
              setValues={setValues}
              errors={contractsError?.products}
              touched={contractsTouched?.products}
              {...props}
            />
          </Col>
        </Row>
      </>
    </ContractItemWrapper>
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

interface LicenseProps {
  contract: ApplicationFormItems["contracts"][0];
  index: number;
  setFieldValue: (name: string, value: any) => void;
  setFieldTouched: (name: string, value: any) => void;
  values: ApplicationFormItems;
  setValues: (values: ApplicationFormItems) => void;
  errors: { [key in string]: string };
  touched: { [key in string]: string };
  getFieldProps: (name: string) => any;
}

const LicenseInformation = ({
  contract,
  index,
  setFieldValue,
  setFieldTouched,
  values,
  setValues,
  errors,
  touched,
  getFieldProps,
}: LicenseProps) => {
  const handleLicenseRemove = ({ key }: any) => {
    const contracts = [...values.contracts];
    if (key > -1 && contracts[index].products.length > 1) {
      contracts[index].products.splice(key, 1);
    }
    setValues({
      ...values,
      contracts: contracts,
    });
  };

  const addLicenseRow = () => {
    const contracts = [...values.contracts];
    contracts[index].products.push({
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
    return contract.products.length * 48 + 130;
  };

  const getStatus = (lIndex: number, name: any) => {
    const licenseError = errors && errors[lIndex];
    const licenseTouched = touched && touched[lIndex];
    if (licenseError && licenseError[name] && licenseTouched && licenseTouched[name]) {
      return {
        type: "error",
        error: licenseError[name],
      };
    }
    return {
      type: undefined,
    };
  };

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

  return (
    <>
      {contract.contractType && (
        <>
          <Row justify="space-between">
            <Col>
              <Typography.Title level={3}>Product Details</Typography.Title>
            </Col>
            <Col>
              <Space>
                <Typography.Title level={5}>Currency</Typography.Title>
                <Select
                  showSearch
                  size="large"
                  className={styles.unitWidth}
                  value={getFieldProps(`contracts[${index}].currencyCode`).value}
                  onChange={(e) => {
                    setFieldValue(`contracts[${index}].currencyCode`, e);
                  }}
                >
                  {currencyOptions(currencyData, currency)}
                </Select>
              </Space>
            </Col>
          </Row>
          <DataTable
            height={calcHeight() + 100 > 300 ? 300 : calcHeight() + 100}
            multiSelect={false}
            tableData={map(contract.products, (product, i) => ({
              ...product,
              key: i,
            }))}
            columns={[
              {
                key: "productName",
                dataIndex: "productName",
                title: "Product Name",
                render: (val: any, record: any, lIndex: number) => {
                  return (
                    <Field name={`contracts[${index}].products[${lIndex}].productName`}>
                      {({ field }: FieldProps) => {
                        return (
                          <Input
                            suffix={
                              getStatus(lIndex, "productName").type === "error" ? (
                                suffixIcon(getStatus(lIndex, "productName").error || "")
                              ) : (
                                <></>
                              )
                            }
                            {...field}
                            status={getStatus(lIndex, "productName").type as any}
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
                    <Field name={`contracts[${index}].products[${lIndex}].productType`}>
                      {({ field }: FieldProps) => {
                        return (
                          <Select
                            showSearch
                            size="middle"
                            style={{ width: "100%" }}
                            onBlur={() => setFieldTouched(`contracts[${index}].products[${lIndex}].productType`, true)}
                            onChange={(e) => {
                              setFieldValue(`contracts[${index}].products[${lIndex}].productType`, e);
                              setFieldValue(
                                `contracts[${index}].products[${lIndex}].quantity`,
                                e !== "Licenses" ? 1 : 0
                              );
                              setFieldTouched(`contracts[${index}].products[${lIndex}].quantity`, false);
                              setFieldValue(`contracts[${index}].products[${lIndex}].unitPrice`, 0);
                              setFieldValue(`contracts[${index}].products[${lIndex}].totalCost`, 0);
                            }}
                            value={field.value}
                            status={getStatus(lIndex, "productType").type as any}
                            {...(getStatus(lIndex, "productType").type === "error" && {
                              suffix: suffixIcon(getStatus(lIndex, "productType").error || ""),
                            })}
                          >
                            {productType.map((item) => (
                              <Select.Option
                                value={item.key}
                                key={item.key}
                              >
                                {item.displayName}
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
                      <Field name={`contracts[${index}].products[${lIndex}].unitPrice`}>
                        {({ field, form }: FieldProps) => {
                          const fieldName = `contracts[${index}].products[${lIndex}].unitPrice`;
                          const error = getIn(form.errors, fieldName);
                          const touched = getIn(form.touched, fieldName);
                          return (
                            <Space direction="vertical">
                              <Input
                                addonAfter={
                                  <Select
                                    size="middle"
                                    className={styles.unitTypeWidth}
                                    value={getFieldProps(`contracts[${index}].products[${lIndex}].unitPriceType`).value}
                                    onChange={(e) => {
                                      setFieldValue(`contracts[${index}].products[${lIndex}].unitPriceType`, e);
                                    }}
                                  >
                                    {unitPriceType
                                      .filter((name) =>
                                        contract.contractType === contractType[0] ? name.key !== "per year" : name.key
                                      )
                                      .map((item) => (
                                        <Select.Option
                                          value={item.key}
                                          key={item.key}
                                        >
                                          {item.key}
                                        </Select.Option>
                                      ))}
                                  </Select>
                                }
                                status={touched && error ? "error" : undefined}
                                onBlur={() => form.setFieldTouched(fieldName, true)}
                                value={field.value}
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  const isValidInput = /^\d*\.?\d*$/.test(inputValue);

                                  if (isValidInput) {
                                    form.setFieldValue(fieldName, inputValue);
                                    form.setFieldValue(
                                      `contracts[${index}].products[${record.key}].totalCost`,
                                      getFieldProps(`contracts[${index}].products[${lIndex}].quantity`).value *
                                        Number(inputValue)
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
                    <Field name={`contracts[${index}].products[${lIndex}].quantity`}>
                      {({ field }: FieldProps) => {
                        return (
                          <Input
                            suffix={
                              getStatus(lIndex, "quantity").type === "error" ? (
                                suffixIcon(getStatus(lIndex, "quantity").error || "")
                              ) : (
                                <></>
                              )
                            }
                            status={getStatus(lIndex, "quantity").type as any}
                            {...field}
                            value={field.value}
                            min={0}
                            {...(getFieldProps(`contracts[${index}].products[${lIndex}].productType`).value !==
                              "Licenses" && {
                              max: 1,
                              readOnly: true,
                            })}
                            step="1"
                            onKeyDown={(e) => {
                              if (e.key === ".") {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              setFieldValue(`contracts[${index}].products[${record.key}].quantity`, e.target.value);
                              setFieldValue(
                                `contracts[${index}].products[${record.key}].totalCost`,
                                getFieldProps(`contracts[${index}].products[${lIndex}].unitPrice`).value *
                                  Number(e.target.value)
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
                width: columnWidth.PROJECT_NAME,
                render: (val: any, record: any, lIndex: number) => {
                  return (
                    <Field name={`contracts[${index}].products[${lIndex}].totalCost`}>
                      {({ field }: FieldProps) => {
                        return (
                          <Row>
                            <Typography.Text>
                              {currencyFormat(
                                record.totalCost,
                                false,
                                getFieldProps(`contracts[${index}].currencyCode`).value
                              )}
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
                          onClick={() => handleLicenseRemove(record)}
                        />
                      )}
                    </>
                  );
                },
              },
            ]}
            showTopBar={false}
          />
          <Row gutter={16}>
            <Col
              span={24}
              style={{ textAlign: "right" }}
            >
              <Button
                type="text"
                onClick={addLicenseRow}
                icon={<Icon icon="akar-icons:plus" />}
                disabled={some(contract.products[contract.products.length - 1], (licenceVal) => !licenceVal)}
              >
                Add another product
              </Button>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};
