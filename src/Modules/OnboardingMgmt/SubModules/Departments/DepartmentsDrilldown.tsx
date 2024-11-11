import { Button, Col, Divider, Form, Row, Space, Typography } from "antd";
import { ContentWrapper, WrapperCard } from "@components/index";
import { ReactNode, useEffect, useRef, useState } from "react";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";
import { get, post } from "@services/api.service";
import { useNavigate, useParams } from "react-router-dom";

import { Icon } from "@iconify/react";
import { currencyFormat } from "~/Utils";
import { isEmpty } from "lodash";
import moment from "moment";
import styles from "./Departments.module.scss";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "@hooks/useQuery";
import PageNotExist from "~/Components/PageNotExist/PageNotExist";

export const DepartmentDrilldown = () => {
  const [data, setData] = useState<any>({});
  const { id } = useParams();
  const { openNotification, openToast } = useNotification();
  const query = useQuery();
  const childId = query.get("childRequestId");
  const [comments, setComments] = useState("");

  const getDepartInfo = () => {
    get(`v1/department/request/detail-view?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`)
      .then((res: any) => {
        if (res.status === "OK") {
          let newData = res.response.data;
          if (newData.departmentDetailsInfo && newData.departmentDetailsInfo.ownerDetails) {
            let ownerDetails = newData.departmentDetailsInfo.ownerDetails[0];
            let secondaryOwnerDetails = newData.departmentDetailsInfo.ownerDetails[1];
            if (ownerDetails) {
              newData.departmentDetailsInfo.departmentOwnerName = ownerDetails.departmentOwnerName;
              newData.departmentDetailsInfo.departmentOwnerEmailAddress = ownerDetails.departmentOwnerEmailAddress;
            }
            if (secondaryOwnerDetails) {
              newData.departmentDetailsInfo.secondaryOwnerName = secondaryOwnerDetails.departmentOwnerName;
              newData.departmentDetailsInfo.secondaryOwnerEmailAddress =
                secondaryOwnerDetails.departmentOwnerEmailAddress;
            }
          }
          setData(newData);
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
          localStorage.setItem("pageNotExist", "/onboarding-management/departments");
        }
      });
  };

  const submitRequest = (value: string) => {
    if (isEmpty(comments)) {
      openToast({ content: "Please enter valid comment", type: "warning" });
      ref.current?.focus();
      return;
    }
    post(`v1/department/review?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`, {
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
          navigate("/onboarding-management/departments");
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getDepartInfo();
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
  const ref = useRef<TextAreaRef>(null);
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
                onClick={() => navigate("/onboarding-management/departments")}
                icon="akar-icons:arrow-left"
                style={{
                  fontSize: "1.8rem",
                  cursor: "pointer",
                  color: styles.primary,
                  marginRight: styles.whitespace1,
                }}
              />
              {!isEmpty(data) && data.departmentDetailsInfo && (
                <Typography.Title
                  level={5}
                  style={{ marginBottom: 0 }}
                >
                  {data.departmentDetailsInfo.departmentName}
                </Typography.Title>
              )}
            </Space>
          </Col>
        </Row>
      }
    >
      {data && data.departmentDetailsInfo ? (
        <Row>
          <Col
            xs={24}
            md={16}
          >
            <Row style={{ marginBottom: styles.whitespace2 }}>
              <Col span={24}>
                <WrapperCard
                  title="Department Details"
                  smallHeader
                >
                  <Row>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Department Name", data.departmentDetailsInfo.departmentName)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Owner Name", data.departmentDetailsInfo.departmentOwnerName)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Email Address", data.departmentDetailsInfo.departmentOwnerEmailAddress)}
                    </Col>
                    {data.departmentDetailsInfo.secondaryOwnerName && (
                      <Col
                        xs={24}
                        md={8}
                      >
                        {getItemText("Secondary Owner Name", data.departmentDetailsInfo.secondaryOwnerName)}
                      </Col>
                    )}
                    {data.departmentDetailsInfo.secondaryOwnerEmailAddress && (
                      <Col
                        xs={24}
                        md={8}
                      >
                        {getItemText(
                          "Secondary Owner Email Address",
                          data.departmentDetailsInfo.secondaryOwnerEmailAddress
                        )}
                      </Col>
                    )}
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText(
                        "Budget",
                        currencyFormat(
                          data.departmentDetailsInfo.departmentBudget,
                          false,
                          data.departmentDetailsInfo.currencyCode
                        )
                      )}
                    </Col>
                  </Row>
                </WrapperCard>
              </Col>
            </Row>
            {data.reviewerDetails && !isEmpty(data.reviewerDetails) && (
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
                        {getItemText(
                          "Approved On",
                          moment(data.reviewerDetails.approvalTimestamp).format("DD MMM YYYY")
                        )}
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
      ) : (
        <></>
      )}
    </ContentWrapper>
  );
};
