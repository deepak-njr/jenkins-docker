import { Button, Col, Divider, Form, List, Row, Space, Typography, message } from "antd";
import { ContentWrapper, WrapperCard } from "@components/index";
import { ReactNode, useEffect, useRef, useState } from "react";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";
import { get, post } from "@services/api.service";
import { useNavigate, useParams } from "react-router-dom";

import { ContractTable } from "@modules/Contracts/SubModules/Drilldown/OverView/Components/ContractTable";
import { Icon } from "@iconify/react";
import { imageKey } from "@utils/Constants";
import { isEmpty } from "lodash";
import moment from "moment";
import styles from "./index.module.scss";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "~/Hooks/useQuery";

export const ContractsDrilldown = () => {
  const [data, setData] = useState<any>({});
  const [reviewerDetails, setReviewerDetails] = useState<any>({});
  const [comments, setComments] = useState("");
  const { id } = useParams();
  const { openNotification, openToast } = useNotification();
  const query = useQuery();
  const ref = useRef<TextAreaRef>(null);
  const childId = query.get("childRequestId");

  const getContractInfo = () => {
    get(`v1/application/contract/request/detail-view?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`)
      .then((res: any) => {
        if (res.status === "OK") {
          const { data } = res.response;
          setData(data);
          setReviewerDetails(res.response.data.reviewerDetails);
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
          localStorage.setItem("pageNotExist", "/onboarding-management/contracts");
        }
      });
  };

  const submitRequest = (value: string) => {
    if (isEmpty(comments)) {
      openToast({ content: "Please enter valid comment", type: "warning" });
      ref.current?.focus();
      return;
    }
    post(`v1/application/contract/review?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`, {
      action: value,
      comments,
    })
      .then((res: any) => {
        if (res.status === "OK") {
          openNotification({
            title: "Success",
            type: "success",
            message: `${childId || id}  ${value === "Approve" ? "Approved" : "Rejected"} successfully`,
          });
          navigate("/onboarding-management/contracts");
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getContractInfo();
  }, []);

  const getItemText = (name: string, value: string | ReactNode) => {
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
  if (!data) return null;

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
                onClick={() => navigate("/onboarding-management/contracts")}
                icon="akar-icons:arrow-left"
                style={{
                  fontSize: "1.8rem",
                  cursor: "pointer",
                  color: styles.primary,
                  marginRight: styles.whitespace1,
                }}
              />
              {!isEmpty(data) && (
                <Typography.Title
                  level={5}
                  style={{ marginBottom: 0 }}
                >
                  {data.contractName}
                </Typography.Title>
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
              <ContractTable
                contract={data}
                // withoutWrapper
                showContractType
                isLicenseMapping
              />
            </Col>
          </Row>
          {reviewerDetails && !isEmpty(reviewerDetails) && (
            <Row style={{ marginBottom: styles.whitespace2 }}>
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
                      {getItemText("Work Group", reviewerDetails.workGroupName)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Reviewed by", reviewerDetails.approvedByEmail)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Approved On", moment(reviewerDetails.approvalTimestamp).format("DD MMM YYYY"))}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>{getItemText("Comments", reviewerDetails.comments)}</Col>
                  </Row>
                </WrapperCard>
              </Col>
            </Row>
          )}
          {!isEmpty(data.supportingDocsInfo) && (
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
                  dataSource={data.supportingDocsInfo[0].fileUrl}
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
                            onClick={() =>
                              navigate("/contracts/onboarding/supporting-docs", {
                                state: {
                                  from: "/contracts/onboarding/review",
                                  edit: true,
                                },
                              })
                            }
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
