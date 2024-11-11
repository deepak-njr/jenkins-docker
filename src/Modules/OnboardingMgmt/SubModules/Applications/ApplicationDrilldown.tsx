import { Avatar, Button, Col, Divider, Form, List, Row, Space, Typography } from "antd";
import { ContentWrapper, DataTable, ExpansionPanel, WrapperCard } from "@components/index";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";
import { filter, has, isEmpty, map } from "lodash";
import { get, post } from "@services/api.service";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ContractTable } from "~/Modules/Contracts/SubModules/Drilldown/OverView/Components/ContractTable";
import { ContractWrapper } from "~/Components/ContractWrapper/ContractWrapper";
import { Icon } from "@iconify/react";
import { imageKey } from "@utils/Constants";
import moment from "moment";
import styles from "./Application.module.scss";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "~/Hooks/useQuery";

export const ApplicationDrilldown = () => {
  const [data, setData] = useState<any>({});
  const [comments, setComments] = useState("");
  const { id } = useParams();
  const ref = useRef<TextAreaRef>(null);
  const { openNotification, openToast } = useNotification();
  const query = useQuery();
  const childId = query.get("childRequestId");

  const getApplicationInfo = () => {
    get(`v1/application/request/detail-view?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`)
      .then((res: any) => {
        if (res.response.data) {
          let appInfo = { ...res.response.data.applicationInfo };
          if (appInfo.ownerDetails) {
            if (appInfo.ownerDetails[0]) {
              appInfo.applicationOwnerEmail = appInfo.ownerDetails[0].applicationOwnerEmail;
              appInfo.applicaitonOwnerName = appInfo.ownerDetails[0].applicaitonOwnerName;
            }
            if (appInfo.ownerDetails[1]) {
              appInfo.secondaryContactEmail = appInfo.ownerDetails[1].applicationOwnerEmail;
              appInfo.secondaryContactName = appInfo.ownerDetails[1].applicaitonOwnerName;
            }
          }
          setData({
            applicationInfo: appInfo,
            ...(has(res.response.data, "contractInfo") && {
              contracts: getContractInfo(res.response.data.contractInfo, res.response.data.products),
            }),
            ...(res.response.data.products &&
              !has(res.response.data, "contractInfo") && {
                products: res.response.data.products,
              }),
            ...(has(res.response.data, "supportingDocsInfo") && {
              supportingDocs: res.response.data.supportingDocsInfo[0].fileUrl,
            }),
            ...(res.response.data.reviewerDetails && {
              reviewerDetails: res.response.data.reviewerDetails,
            }),
          });
        }
      })
      .catch((err) => {
        if (err) {
          openToast({
            content: err,
            type: "error",
          });
        } else {
          navigate("/page-notexist");
          localStorage.setItem("pageNotExist", "/onboarding-management/applications");
        }
      });
  };

  useEffect(() => {
    getApplicationInfo();
  }, []);

  const submitRequest = (value: string) => {
    if (isEmpty(comments)) {
      openToast({ content: "Please enter valid comment", type: "warning" });
      ref.current?.focus();
      return;
    }
    post(`v1/application/review?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`, {
      action: value,
      comments,
    })
      .then((res: any) => {
        if (res.status === "OK") {
          openNotification({
            title: "Success",
            type: "success",
            message: `${childId ?? id}  ${value === "Approve" ? "Approved" : "Rejected"} successfully`,
          });
          navigate("/onboarding-management/applications");
        }
      })
      .catch((err) => {});
  };

  const getContractInfo = (contractInfo: any[], licenses: any[]) => {
    const getLicenseInfo = (contractName: string) => {
      return filter(licenses, (license) => license.contractName === contractName);
    };
    return map(contractInfo, (contract) => ({
      contractName: contract.contractName,
      contractType: contract.contractType,
      contractStartDate: contract.contractStartDate,
      contractEndDate: contract.contractEndDate,
      renewalTerm: contract.renewalTerm,
      upcomingRenewalDate: contract.upcomingRenewalDate,
      billingFrequency: contract.billingFrequency,
      contractTenure: contract.contractTenure,
      autoRenewal: contract.autoRenewal,
      currencyCode: contract.currencyCode,
      ...(contract.autoRenewal && {
        autoRenewalCancellation: contract.autoRenewalCancellation,
        paymentMethod: contract.paymentMethod,
        walletName: contract.walletName,
        cardHolderName: contract.cardHolderName,
        cardNumber: contract.cardNumber,
        validThrough: contract.validThrough,
      }),
      products: getLicenseInfo(contract.contractName),
    }));
  };

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
  const navigate = useNavigate();
  if (!data || !data.applicationInfo) return null;

  return (
    <ContentWrapper
      bodyStyle={{
        paddingTop: 0,
      }}
      customTitle={
        <Row>
          <Col>
            <Space style={{ alignItems: "center" }}>
              <Icon
                onClick={() => navigate("/onboarding-management/applications")}
                icon="akar-icons:arrow-left"
                style={{
                  fontSize: "1.8rem",
                  cursor: "pointer",
                  color: styles.primary,
                  marginRight: styles.whitespace1,
                }}
              />

              {!isEmpty(data) && (
                <>
                  <Avatar
                    shape="square"
                    size={48}
                    src={`${data.applicationInfo.applicationLogoUrl}${imageKey}`}
                  />
                  <Space
                    size={0}
                    direction="vertical"
                  >
                    <Typography.Title
                      level={5}
                      style={{ marginBottom: 0 }}
                    >
                      {data.applicationInfo.applicationName}
                    </Typography.Title>
                    {data.applicationInfo.applicationProviderName && (
                      <Typography.Text className={styles.companyName}>
                        {data.applicationInfo.applicationProviderName}
                      </Typography.Text>
                    )}
                  </Space>
                </>
              )}
            </Space>
          </Col>
        </Row>
      }
    >
      <Row>
        <Col
          xs={24}
          md={16}
        >
          <Row style={{ marginBottom: styles.whitespace2 }}>
            <Col span={24}>
              <WrapperCard
                title="Application Details"
                smallHeader
              >
                <Row>
                  <Row>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Application Name", data.applicationInfo.applicationName)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {data.applicationInfo.applicationJustification
                        ? getItemText("Provider Name", data.applicationInfo.applicationProviderName)
                        : getItemText("Subscription Name", data.applicationInfo.subscriptionName)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Category", data.applicationInfo.applicationCategory)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Owner Email Address", data.applicationInfo.applicationOwnerEmail)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Owner Name", data.applicationInfo.applicaitonOwnerName)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Owner's Department", data.applicationInfo.applicationOwnerDepartment)}
                    </Col>
                    {data.applicationInfo.secondaryContactEmail && (
                      <Col
                        xs={24}
                        md={8}
                      >
                        {getItemText("Secondary Contact Email", data.applicationInfo.secondaryContactEmail)}
                      </Col>
                    )}
                    {data.applicationInfo.secondaryContactName && (
                      <Col
                        xs={24}
                        md={8}
                      >
                        {getItemText("Secondary Contact Name", data.applicationInfo.secondaryContactName)}
                      </Col>
                    )}
                    {data.applicationInfo.projectName && (
                      <Col
                        xs={24}
                        md={8}
                      >
                        {getItemText("Project Name", data.applicationInfo.projectName)}
                      </Col>
                    )}

                    <Col
                      xs={24}
                      md={data.applicationInfo.applicationJustification ? 24 : 8}
                    >
                      {data.applicationInfo.applicationJustification
                        ? getItemText("Reason for onboarding", data.applicationInfo.applicationJustification)
                        : getItemText("Provider Name", data.applicationInfo.applicationProviderName)}
                    </Col>
                  </Row>
                </Row>
              </WrapperCard>
            </Col>
          </Row>
          {!isEmpty(data.contracts) && (
            <Row>
              <Col span={24}>
                {data.contracts.length > 1 && (
                  <Typography.Title
                    level={4}
                    style={{ marginBottom: styles.whitesapce3 }}
                  >
                    Contract Details
                  </Typography.Title>
                )}
                {data.contracts.map((contract: any) => (
                  <div
                    style={{ marginBottom: styles.whitespace2 }}
                    key={contract.contractName}
                  >
                    <ContractWrapper
                      styles={styles}
                      isExpanstionPanel={data.contracts.length === 1}
                      contractTitle={contract.contractName}
                      showEdit={false}
                      title={"Contract Details"}
                    >
                      <ContractTable
                        contract={contract}
                        withoutWrapper
                      />
                    </ContractWrapper>
                  </div>
                ))}
              </Col>
            </Row>
          )}
          {!isEmpty(data.products) && (
            <Row style={{ marginBottom: styles.whitespace2 }}>
              <Col span={24}>
                <Typography.Title
                  level={4}
                  style={{ display: "flex" }}
                >
                  Product Details
                </Typography.Title>
              </Col>
              <Col span={24}>
                <ContractTable
                  contract={{
                    products: data.products,
                  }}
                  showLicenceOnly
                  withoutWrapper
                />
              </Col>
            </Row>
          )}
          {!isEmpty(data.supportingDocs) && (
            <Row style={{ marginBottom: styles.whitespace2 }}>
              <Col span={24}>
                <Typography.Title
                  level={4}
                  style={{ marginBottom: styles.whitesapce3 }}
                >
                  Supporting Documents
                </Typography.Title>
              </Col>
              <Col span={24}>
                <List
                  split={false}
                  size="small"
                  dataSource={data.supportingDocs}
                  renderItem={(item: string) => (
                    <List.Item style={{ padding: "4px 0" }}>
                      <Button
                        type="link"
                        style={{ padding: 0 }}
                        href={`${item}${imageKey}`}
                      >
                        <Space style={{ lineHeight: 1 }}>
                          <Icon
                            icon="bi:download"
                            style={{
                              color: styles.strawberry,
                              cursor: "pointer",
                              fontSize: 16,
                              verticalAlign: "middle",
                            }}
                            // onClick={() =>
                            //   navigate("/applications/onboarding/supporting-docs", {
                            //     state: {
                            //       from: "/applications/onboarding/review",
                            //       edit: true,
                            //     },
                            //   })
                            // }
                          />
                          {decodeURIComponent(item.split("/")[item.split("/").length - 1])}
                        </Space>
                      </Button>
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          )}

          {data.reviewerDetails && !isEmpty(data.reviewerDetails) && (
            <Row style={{ marginBottom: styles.whitespace2 }}>
              <Divider />
              <Col span={24}>
                <WrapperCard
                  title="Reviewer Details"
                  smallHeader
                >
                  <Row>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Work Group", data.reviewerDetails.workGroupName)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Reviewed by", data.reviewerDetails.approvedByEmail)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Approved On", moment(data.reviewerDetails.approvalTimestamp).format("DD MMM YYYY"))}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>{getItemText("Comments", data.reviewerDetails.comments)}</Col>
                  </Row>
                </WrapperCard>
              </Col>
            </Row>
          )}

          <Divider />
          <Row>
            <Col span={24}>
              {/* <Typography.Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam
                ut sit ullamcorper tortor, quisque posuere. A, nulla amet,
                fermentum elit vel, duis ornare.
              </Typography.Text> */}
              <Form.Item style={{ marginTop: styles.whitespace2 }}>
                <label>
                  <Typography.Title level={5}>Comments</Typography.Title>
                </label>
                <TextArea
                  ref={ref}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                ></TextArea>
              </Form.Item>
            </Col>
          </Row>
          <Row
            style={{ marginTop: styles.whitespace6 }}
            justify="end"
          >
            <Col>
              <Space size={"large"}>
                <Button
                  type="ghost"
                  danger
                  onClick={() => submitRequest("Reject")}
                >
                  <Space style={{ lineHeight: 1 }}>
                    <Icon icon="akar-icons:cross" />
                    Reject
                  </Space>
                </Button>
                <Button
                  type="primary"
                  onClick={() => submitRequest("Approve")}
                >
                  Approve
                </Button>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>
    </ContentWrapper>
  );
};
