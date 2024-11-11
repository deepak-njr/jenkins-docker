import { Icon } from "@iconify/react";
import { Button, Col, Row, Space, Typography, Modal, Result, List } from "antd";
import { useContext, useEffect, useState } from "react";
import { DataTable, ExpansionPanel, WrapperCard } from "~/Components";
import { ApplicationOnboardingContext } from "./Wrapper";
import styles from "./ApplicationOnboarding.module.scss";
import { flatten, isEmpty, map } from "lodash";
import { currencyFormat } from "~/Utils";
import { Link, useNavigate } from "react-router-dom";
import { post, upload } from "~/Services";
import { DetailsMissing } from "./DetailsMissing";
import { ReactNode } from "react";

import { useAuth } from "~/Hooks/useAuth";

import FormData from "form-data";
import moment from "moment";
import { useNotification } from "~/Hooks/useNotification";
import { ContractWrapper } from "~/Components/ContractWrapper/ContractWrapper";
import { ContractTable } from "~/Modules/Contracts/SubModules/Drilldown/OverView/Components/ContractTable";
import { contractType } from "@utils/StringConstants";
import { currencyCode } from "@utils/Constants";
import { strings } from "~/Utils/Strings";
import SuccessModal from "~/Components/Modal/SuccessModal";

export const ReviewApplication = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [reqId, setReqId] = useState("");
  const navigate = useNavigate();
  const { openNotification, openToast } = useNotification();
  const { formData, onBoardingType } = useContext(ApplicationOnboardingContext);
  const [showError, setError] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }>({});
  const [isloading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reqId) {
      uploadSupportinDocs();
    }
  }, [reqId]);

  if (
    !formData ||
    !formData.application ||
    !(formData.application.application || formData.application.applicationExcel)
  )
    return <DetailsMissing />;

  const {
    application: { application, applicationExcel, contracts },
  } = formData;

  const getItemText = (name: string, value: string) => {
    return (
      <Space
        direction="vertical"
        style={{ marginBottom: styles.whitespace4 }}
      >
        <Typography.Text type="secondary">{name}</Typography.Text>
        <Typography.Text>{value}</Typography.Text>
      </Space>
    );
  };

  const buildPayloadAndEndPoint = (): {
    url: string;
    payload: any;
    multipart?: boolean;
  } | null => {
    switch (onBoardingType) {
      case "Purchased": {
        if (formData.application.isSingle) {
          let ownerDetails: any = [
            {
              applicaitonOwnerName: application.ownerName,
              applicationOwnerEmail: application.ownerEmail,
            },
          ];
          if (application.secondaryContactEmail) {
            ownerDetails.push({
              applicaitonOwnerName: application.secondaryContactName,
              applicationOwnerEmail: application.secondaryContactEmail,
            });
          }
          return {
            url: "v1/application/purchase/onboard",
            payload: {
              createApplicationRequest: [
                {
                  applicationInfo: {
                    applicationName: application.applicationName,
                    applicationJustification: "",
                    subscriptionName: application.subscriptionName,
                    subscriptionId: application.subscriptionId,
                    applicationCategory: application.applictionCategory,
                    ownerDetails: ownerDetails,
                    applicationOwnerDepartment: application.ownerDepartment,
                    projectName: application.projectName,
                    applicationProviderName: application.providerName,
                  },
                  contractInfo: map(contracts, (contract) => ({
                    contractName: contract.name,
                    contractEndDate: moment(contract.endDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                    contractStartDate: moment(contract.startDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                    upcomingRenewalDate: contract.autoRenewal
                      ? moment(contract.upcomingRenewalDate, "DD/MM/YYYY").format("YYYY-MM-DD")
                      : "",
                    contractType: contract.contractType,
                    autoRenewalCancellation: contract.autoRenewalCancellation || "",
                    billingFrequency: contract.billingFrequency,
                    contractTenure: String(contract.contractTenure),
                    autoRenewal: String(contract.autoRenewal),
                    paymentMethod: contract.paymentMethod?.type || "",
                    cardHolderName: contract.paymentMethod?.cardHolderName || "",
                    cardNumber: contract.paymentMethod?.cardNumber?.replaceAll(/\s/g, "") || "",
                    validThrough: contract.paymentMethod?.validThrough || "",
                    walletName: contract.paymentMethod?.walletName || "",
                    currencyCode: contract.currencyCode || "",
                  })),
                  products: flatten(
                    map(contracts, (contract) =>
                      map(contract.products, (license) => ({
                        contractName: contract.name,
                        currencyCode: contract.currencyCode,
                        productType: license.productType,
                        productName: license.productName,
                        unitPriceType: license.unitPriceType,
                        unitPrice: String(license.unitPrice),
                        quantity: String(license.quantity),
                        totalCost: String(license.totalCost),
                      }))
                    )
                  ),
                },
              ],
              isSingle: String(formData.application.isSingle),
            },
          };
        } else {
          const PayloadData = new FormData();
          const { applicationExcel } = formData.application as any;

          PayloadData.append("applicationFile", applicationExcel, applicationExcel.name);

          return {
            url: "v1/application/file",
            payload: PayloadData,
            multipart: true,
          };
        }
      }

      case "New": {
        let ownerDetails: any = [
          {
            applicaitonOwnerName: application.ownerName,
            applicationOwnerEmail: application.ownerEmail,
          },
        ];
        if (application.secondaryContactEmail) {
          ownerDetails.push({
            applicaitonOwnerName: application.secondaryContactName,
            applicationOwnerEmail: application.secondaryContactEmail,
          });
        }
        return {
          url: "v1/application/new/onboard",
          payload: {
            createApplicationRequestNew: [
              {
                applicationInfo: {
                  applicationName: application.applicationName,
                  subscriptionName: "",
                  subscriptionId: "",
                  applicationJustification: application.reason,
                  applicationCategory: application.applictionCategory,
                  ownerDetails: ownerDetails,
                  applicationOwnerDepartment: application.ownerDepartment,
                  projectName: application.projectName,
                  applicationProviderName: application.providerName,
                },
                products: map(contracts[0].products, (license) => ({
                  contractName: "",
                  currencyCode: contracts[0].currencyCode,
                  productType: license.productType,
                  productName: license.productName,
                  unitPrice: license.unitPrice,
                  unitPriceType: license.unitPriceType,
                  quantity: license.quantity,
                  totalCost: license.totalCost,
                })),
              },
            ],
            isSingle: String(formData.application.isSingle),
          },
        };
      }
      default: {
        return null;
      }
    }
  };

  const uploadSupportinDocs = () => {
    const supportingDocumentsPayload = new FormData();
    const { supportingDocuments } = formData;

    supportingDocuments.map((doc) =>
      supportingDocumentsPayload.append("multipartFiles", doc.originFileObj, doc.originFileObj?.name)
    );
    supportingDocumentsPayload.append("fileName", reqId);
    upload("v1/application/file", supportingDocumentsPayload)
      .then((res: any) => {
        if (res.status === "OK") {
          setShowSuccess(true);
        } else {
          openNotification({
            title: "Failed",
            message: res.message,
            type: "error",
          });
        }
      })
      .catch(() => {
        setShowSuccess(true);
      });
  };

  const handleSubmit = () => {
    const apiData = buildPayloadAndEndPoint();
    setIsLoading(true);
    if (apiData) {
      const { url, payload, multipart } = apiData;
      if (multipart) {
        upload("v1/application/excel", payload).then((res: any) => {
          if (res.status === "CREATED") {
            if (res && res.response.data) {
              setReqId(res.response.data.requestId);
            }
          } else {
            setError(true);
            setData(res);
            openNotification({
              title: "Failed",
              message: res.message,
              type: "error",
            });
          }
        });
      } else {
        post(url, payload).then((res: any) => {
          if (res.status === "OK" || res.status === "CREATED") {
            setReqId(res.response.data.requestId);
          } else {
            openNotification({
              title: "Failed",
              message: res.message,
              type: "error",
            });
          }
          setIsLoading(false);
        });
      }
    }
  };

  return (
    <Row>
      {!isEmpty(data) && (
        <Modal
          open={showError}
          footer={false}
          title={<span style={{ color: styles.secondaryRed }}>Excel Upload Failed</span>}
          centered
          maskClosable={false}
          onCancel={() => setError(false)}
          bodyStyle={{ paddingTop: 0 }}
        >
          {!isEmpty(data.response?.data) ? (
            <List
              dataSource={data.response?.data}
              className={"modalList"}
              renderItem={(item: any) => <List.Item>{item}</List.Item>}
            />
          ) : (
            strings.someThingWentWrong
          )}
        </Modal>
      )}

      <Col
        xs={24}
        md={16}
      >
        <SuccessModal
          open={showSuccess}
          onClose={() => navigate("/applications")}
          content={
            <Typography.Text style={{ textAlign: "center" }}>
              Your onboarding request is submitted successfully. To view the status of your request, use the <br />{" "}
              Request ID: &nbsp;
              <b>
                <Link to={`/track-requests?activeTab=application&id=${reqId}`}>{reqId}</Link>
              </b>
            </Typography.Text>
          }
        />

        {application && (
          <Row>
            <Col span={24}>
              <WrapperCard
                title="Application Details"
                smallHeader
                action={
                  <Icon
                    icon="carbon:edit"
                    style={{
                      color: styles.strawberry,
                      cursor: "pointer",
                      fontSize: 20,
                      verticalAlign: "middle",
                    }}
                    onClick={() =>
                      navigate("/applications/onboarding/application-details", {
                        state: {
                          from: "/applications/onboarding/review",
                          edit: true,
                          application: true,
                        },
                      })
                    }
                  />
                }
              >
                <Row>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Application Name", application.applicationName)}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {onBoardingType === "New" ? "" : getItemText("Subscription Id", application.subscriptionId)}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {onBoardingType === "New"
                      ? getItemText("Provider Name", application.providerName)
                      : getItemText("Subscription Name", application.subscriptionName)}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Category", application.applictionCategory)}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Owner Email Address", application.ownerEmail)}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Owner Name", application.ownerName)}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Owner's Department", application.ownerDepartment)}
                  </Col>
                  {application.secondaryContactEmail && (
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Secondary Contact Email Address", application.secondaryContactEmail)}
                    </Col>
                  )}
                  {application.secondaryContactName && (
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Secondary Contact Name", application.secondaryContactName)}
                    </Col>
                  )}
                  <Col
                    xs={24}
                    md={onBoardingType === "New" ? 24 : 8}
                  >
                    {onBoardingType === "New"
                      ? getItemText("Reason for onboarding", application.reason || "")
                      : getItemText("Provider Name", application.providerName)}
                  </Col>
                </Row>
              </WrapperCard>
            </Col>
          </Row>
        )}
        {applicationExcel && (
          <Row>
            <Col
              span={24}
              style={{ marginTop: styles.whitespace3 }}
            >
              <Space size="large">
                <Typography.Title
                  level={4}
                  style={{ marginBottom: styles.whitesapce3 }}
                >
                  Application Details
                </Typography.Title>
                <Icon
                  icon="carbon:edit"
                  style={{
                    color: styles.strawberry,
                    cursor: "pointer",
                    fontSize: 20,
                    verticalAlign: "middle",
                  }}
                  onClick={() =>
                    navigate("/applications/onboarding/application-details", {
                      state: {
                        from: "/applications/onboarding/review",
                        edit: true,
                      },
                    })
                  }
                />
              </Space>

              <Col
                span={24}
                style={{ marginBottom: styles.whitespace1 }}
              >
                <Typography.Text>
                  <Space>
                    <Icon
                      icon="clarity:success-standard-solid"
                      style={{
                        color: styles.secondaryGreen,
                        verticalAlign: "middle",
                      }}
                    />
                    {applicationExcel.name}
                  </Space>
                </Typography.Text>
              </Col>
            </Col>
          </Row>
        )}
        {onBoardingType === "Purchased" && contracts && contracts && (
          <Row style={{ marginTop: styles.whitespace3 }}>
            <Col span={24}>
              <>
                {contracts.length > 1 && (
                  <Space size="large">
                    <Typography.Title
                      level={4}
                      style={{ marginBottom: styles.whitesapce3 }}
                    >
                      Contracts
                    </Typography.Title>
                    <Icon
                      icon="carbon:edit"
                      style={{
                        color: styles.strawberry,
                        cursor: "pointer",
                        fontSize: 20,
                        verticalAlign: "middle",
                      }}
                      onClick={() =>
                        navigate("/applications/onboarding/application-details", {
                          state: {
                            from: "/applications/onboarding/review",
                            edit: true,
                          },
                        })
                      }
                    />
                  </Space>
                )}

                {contracts.map((contract) => (
                  <div
                    style={{ marginBottom: styles.whitespace2 }}
                    key={contract.name}
                  >
                    {/* <ExpansionPanel title={contract.name}> */}

                    <ContractWrapper
                      styles={styles}
                      isExpanstionPanel={contracts.length === 1}
                      contractTitle={contract.name}
                      showEdit={true}
                      title={"Contract"}
                    >
                      <ContractTable
                        contract={{
                          contractName: contract.name,
                          contractEndDate: moment(contract.endDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                          contractStartDate: moment(contract.startDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
                          upcomingRenewalDate: contract.autoRenewal
                            ? moment(contract.upcomingRenewalDate, "DD/MM/YYYY").format("YYYY-MM-DD")
                            : "",
                          contractTenure: contract.contractTenure,
                          contractType: contract.contractType,
                          autoRenewalCancellation: contract.autoRenewalCancellation,
                          billingFrequency: contract.billingFrequency,
                          autoRenewal: contract.autoRenewal,
                          paymentMethod: contract.paymentMethod?.type || "",
                          cardHolderName: contract.paymentMethod?.cardHolderName || "",
                          cardNumber: contract.paymentMethod?.cardNumber?.replaceAll(/\s/g, "") || "",
                          validThrough: contract.paymentMethod?.validThrough || "",
                          walletName: contract.paymentMethod?.walletName || "",
                          currencyCode: contract.currencyCode || "",
                          products: flatten(
                            map(contract.products, (license) => ({
                              contractName: contract.name,
                              productType: license.productType,
                              productName: license.productName,
                              unitPriceType: String(license.unitPriceType),
                              unitPrice: String(license.unitPrice),
                              quantity: String(license.quantity),
                              totalCost: String(license.totalCost),
                            }))
                          ),
                        }}
                        withoutWrapper
                        showContractType
                      />
                      {/* <Row>
                        <Col xs={24} md={8}>
                          {getItemText("Contract Name", contract.name)}
                        </Col>
                        <Col xs={24} md={8}>
                          {getItemText("Start Date", contract.startDate)}
                        </Col>
                        <Col xs={24} md={8}>
                          {getItemText("End Date", contract.endDate)}
                        </Col>
                        <Col xs={24} md={8}>
                          {getItemText(
                            "Renewal Term",
                            `${contract.renewalTerm} month${
                              contract.renewalTerm > 1 ? "s" : ""
                            }`
                          )}
                        </Col>
                        <Col xs={24} md={8}>
                          {getItemText(
                            "Next Renewal Date",
                            contract.upcomingRenewalDate
                          )}
                        </Col>
                        {contract.billingFrequency && (
                          <Col xs={24} md={8}>
                            {getItemText(
                              "Billing Frequency",
                              contract.billingFrequency
                            )}
                          </Col>
                        )}
                        {contract.contractType && (
                          <Col xs={24} md={8}>
                            {getItemText(
                              "Contract Type",
                              contract.contractType
                            )}
                          </Col>
                        )}
                        {contract.paymentMethod?.autoRenewalCancellation && (
                          <Col xs={24} md={8}>
                            {getItemText(
                              "Cancellation Notice",
                              contract.paymentMethod?.autoRenewalCancellation
                            )}
                          </Col>
                        )}
                        <Col xs={24} md={8}>
                          {getItemText(
                            "Auto Renewal",
                            contract.autoRenewal ? "Enabled" : "Disabled"
                          )}
                        </Col>
                        {contract.autoRenewal &&
                          (contract.paymentMethod &&
                          contract.paymentMethod.type ==
                            "Credit / Debit Card" ? (
                            <>
                              <Col xs={24} md={8}>
                                {getItemText(
                                  "Cardholder Name",
                                  contract.paymentMethod.cardHolderName || ""
                                )}
                              </Col>
                              <Col xs={24} md={8}>
                                {getItemText(
                                  "Cardholder Number",
                                  `**** **** **** ${
                                    contract.paymentMethod.cardNumber &&
                                    contract.paymentMethod.cardNumber.split(
                                      " "
                                    )[3]
                                  }` || ""
                                )}
                              </Col>
                              <Col xs={24} md={8}>
                                {getItemText(
                                  "Valid Through",
                                  contract.paymentMethod.validThrough || ""
                                )}
                              </Col>
                            </>
                          ) : (
                            <></>
                          ))}
                        {contract.autoRenewal &&
                          (contract.paymentMethod &&
                          contract.paymentMethod.type == "wallet" ? (
                            <Col xs={24} md={8}>
                              {getItemText(
                                "Wallet",
                                contract.paymentMethod.walletName || ""
                              )}
                            </Col>
                          ) : (
                            <></>
                          ))}
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Typography.Title
                            level={5}
                            style={{ display: "flex" }}
                          >
                            Product Details
                          </Typography.Title>
                        </Col>
                        <Col span={24} style={{ height: 150 }}>
                          <DataTable
                            height={210}
                            multiSelect={false}
                            tableData={map(contract.products, (license, i) => ({
                              ...license,
                              key: i,
                            }))}
                            columns={[
                              {
                                key: "productType",
                                dataIndex: "productType",
                                title: "Product Type",
                              },
                              {
                                key: "productName",
                                dataIndex: "productName",
                                title: "Product Name",
                              },
                              {
                                key: "unitPrice",
                                dataIndex: "unitPrice",
                                title: "Unit price",
                                render: (val: any) => {
                                  return `${currencyFormat(
                                    val,
                                    currencyCode,
                                    "standard"
                                  )} Per term`;
                                },
                              },
                              {
                                key: "quantity",
                                dataIndex: "quantity",
                                title: "Quantity",
                              },
                              {
                                key: "totalCost",
                                dataIndex: "totalCost",
                                title: "Total cost",
                                render: (val: any) => {
                                  return `${currencyFormat(
                                    val,
                                    currencyCode,
                                    "standard"
                                  )} `;
                                },
                              },
                            ]}
                            showTopBar={false}
                          />
                        </Col>
                      </Row> */}
                      {/* </ExpansionPanel> */}
                    </ContractWrapper>
                  </div>
                ))}
              </>
            </Col>
          </Row>
        )}
        {onBoardingType === "New" && (
          <Row style={{ marginTop: styles.whitespace3 }}>
            <Col span={24}>
              <>
                <Space size="large">
                  <Typography.Title
                    level={4}
                    style={{ marginBottom: styles.whitesapce3 }}
                  >
                    Product Details
                  </Typography.Title>
                  <Icon
                    icon="carbon:edit"
                    style={{
                      color: styles.strawberry,
                      cursor: "pointer",
                      fontSize: 20,
                      verticalAlign: "middle",
                    }}
                    onClick={() =>
                      navigate("/applications/onboarding/application-details", {
                        state: {
                          from: "/applications/onboarding/review",
                          edit: true,
                        },
                      })
                    }
                  />
                </Space>

                <DataTable
                  height={contracts[0].products.length * 60 + 100 > 400 ? 200 : contracts[0].products.length * 60 + 100}
                  multiSelect={false}
                  tableData={map(contracts[0].products, (license, i) => ({
                    ...license,
                    key: i,
                  }))}
                  columns={[
                    {
                      key: "name",
                      dataIndex: "productName",
                      title: "Product Name",
                    },
                    {
                      key: "type",
                      dataIndex: "productType",
                      title: "Product Type",
                    },

                    {
                      key: "unitPrice",
                      dataIndex: "unitPrice",
                      title: "Unit Price",
                      render: (val: any, record: any) => {
                        return `${currencyFormat(val, false, contracts[0].currencyCode) + " " + record.unitPriceType} 
                        `;
                      },
                    },
                    {
                      key: "quantity",
                      dataIndex: "quantity",
                      title: "Quantity",
                    },
                    {
                      key: "totalCost",
                      dataIndex: "totalCost",
                      title: "Total Cost",
                      render: (val: any) => {
                        return `${currencyFormat(val, false, contracts[0].currencyCode)} `;
                      },
                    },
                  ]}
                  showTopBar={false}
                />
              </>
            </Col>
          </Row>
        )}
        <Row>
          <Col
            span={24}
            style={{ marginTop: styles.whitespace3 }}
          >
            <Space size="large">
              <Typography.Title
                level={4}
                style={{ marginBottom: styles.whitesapce3 }}
              >
                Supporting Documents
              </Typography.Title>
              <Icon
                icon="carbon:edit"
                style={{
                  color: styles.strawberry,
                  cursor: "pointer",
                  fontSize: 20,
                  verticalAlign: "middle",
                }}
                onClick={() =>
                  navigate("/applications/onboarding/supporting-docs", {
                    state: {
                      from: "/applications/onboarding/review",
                      edit: true,
                    },
                  })
                }
              />
            </Space>
            {map(formData.supportingDocuments, (file) => (
              <Col
                span={24}
                style={{ marginBottom: styles.whitespace1 }}
                key={file.name}
              >
                <Typography.Text key={file.name}>
                  <Space>
                    <Icon
                      icon="clarity:success-standard-solid"
                      style={{
                        color: styles.secondaryGreen,
                        verticalAlign: "middle",
                      }}
                    />
                    {file.name}
                  </Space>
                </Typography.Text>
              </Col>
            ))}
          </Col>
        </Row>
        <Row
          style={{ marginTop: styles.whitespace6 }}
          justify="end"
        >
          <Col>
            <Space>
              <Button
                onClick={() =>
                  onBoardingType === "Purchased"
                    ? navigate("/applications/onboarding/supporting-docs")
                    : navigate("/applications/onboarding/similar-apps")
                }
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                type="primary"
                loading={isloading}
                disabled={!formData}
              >
                Submit
              </Button>
            </Space>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
