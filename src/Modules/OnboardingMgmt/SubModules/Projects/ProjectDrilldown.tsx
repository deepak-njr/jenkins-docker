import { Button, Col, Divider, Form, Image, List, Row, Space, Typography } from "antd";
import { ContentWrapper, WrapperCard } from "@components/index";
import { ReactNode, useEffect, useRef, useState } from "react";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";
import { get as _get, isEmpty, stubArray } from "lodash";
import { get, post } from "@services/api.service";
import { useNavigate, useParams } from "react-router-dom";

import { Icon } from "@iconify/react";
import { currencyFormat } from "~/Utils";
import { imageKey } from "@utils/Constants";
import moment from "moment";
import { strings } from "@utils/Strings";
import styles from "./Project.module.scss";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "~/Hooks/useQuery";

export const ProjectDrilldown = () => {
  const [data, setData] = useState<any>({});
  const [reviewerDetails, setReviewerDetails] = useState<any>({});
  const [comments, setComments] = useState("");
  const { id } = useParams();
  const { openNotification, openToast } = useNotification();
  const query = useQuery();
  const ref = useRef<TextAreaRef>(null);
  const childId = query.get("childRequestId");

  const getProjectInfo = () => {
    get(`v1/project/request/detail-view?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`)
      .then((res: any) => {
        if (res.status === "OK") {
          setData(res.response.data.projectDetailsInfo);
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
          localStorage.setItem("pageNotExist", "/onboarding-management/projects");
        }
      });
  };

  const submitRequest = (value: string) => {
    if (isEmpty(comments)) {
      openToast({ content: "Please enter valid comment", type: "warning" });
      ref.current?.focus();
      return;
    }
    post(`v1/project/review?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`, {
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
          navigate("/onboarding-management/projects");
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getProjectInfo();
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
                onClick={() => navigate("/onboarding-management/projects")}
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
                  {data.projectName}
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
              <WrapperCard
                title="Project Details"
                smallHeader
              >
                <Row>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Project Code", data.projectCode)}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Project Name", data.projectName)}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Project Manager", _get(data, "projectManagerEmail[0]"))}
                  </Col>
                  {!isEmpty(_get(data, "projectManagerEmail[1]")) && (
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Secondary Contact", _get(data, "projectManagerEmail[1]"))}
                    </Col>
                  )}
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Department", data.projectDepartmentName || strings.na)}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText("Budget", currencyFormat(data.projectBudget, false, data.currency))}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText(
                      "Start Date",
                      moment(data.projectStartDate, "YYYY-MM-DD").format("DD MMM YYYY") || strings.na
                    )}
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                  >
                    {getItemText(
                      "End Date",
                      moment(data.projectEndDate, "YYYY-MM-DD").format("DD MMM YYYY") || strings.na
                    )}
                  </Col>
                  <Col xs={24}>
                    <Typography.Text type="secondary">Applications</Typography.Text>
                    <List
                      grid={{ gutter: 16, column: 3 }}
                      dataSource={data && data.applicationsInfo && data.applicationsInfo}
                      style={{ marginTop: styles.whitespace3 }}
                      renderItem={(item: any) => (
                        <List.Item>
                          <List.Item.Meta
                            style={{ alignItems: "center", width: "100%" }}
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
                              <Typography.Text
                                style={{ color: styles.primary }}
                                ellipsis
                                strong
                              >
                                {item.applicationName}
                              </Typography.Text>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Col>
                </Row>
              </WrapperCard>
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
