import { Avatar, Button, Col, Divider, Form, Row, Space, Typography } from "antd";
import { ContentWrapper, WrapperCard } from "@components/index";
import { ReactNode, useEffect, useRef, useState } from "react";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";
import { get, post } from "@services/api.service";
import { isValidNumber, parsePhoneNumber } from "libphonenumber-js";
import { useNavigate, useParams } from "react-router-dom";

import { Icon } from "@iconify/react";
import getUnifiCodeFlagIcon from "country-flag-icons/unicode";
import { imageKey } from "@utils/Constants";
import { isEmpty } from "lodash";
import moment from "moment";
import { strings } from "@utils/Strings";
import styles from "./Users.module.scss";
import { useNotification } from "~/Hooks/useNotification";
import { useQuery } from "~/Hooks/useQuery";

export const UserDrilldown = () => {
  const [data, setData] = useState<any>({});
  const [comments, setComments] = useState("");
  const { id } = useParams();
  const { openNotification, openToast } = useNotification();
  const query = useQuery();
  const ref = useRef<TextAreaRef>(null);
  const childId = query.get("childRequestId");

  const getUserInfo = () => {
    get(`v1/user/onboarding/request/detail-view?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`)
      .then((res: any) => {
        if (res.status === "OK") {
          setData(res.response.data);
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
          localStorage.setItem("pageNotExist", "/onboarding-management/users");
        }
      });
  };

  const formatNumber = (phone: string) => {
    const parsedPhoneNumber = isValidNumber(phone) && parsePhoneNumber(phone);
    return parsedPhoneNumber ? (
      <Space>
        {parsedPhoneNumber && parsedPhoneNumber.country && getUnifiCodeFlagIcon(parsedPhoneNumber.country)}

        {phone}
      </Space>
    ) : (
      phone
    );
  };

  const submitRequest = (value: string) => {
    if (isEmpty(comments)) {
      openToast({ content: "Please enter valid comment", type: "warning" });
      ref.current?.focus();
      return;
    }
    post(`v1/user/onboarding/review?${childId ? `childRequestId=${childId}` : `requestId=${id}`}`, {
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
          navigate("/onboarding-management/users");
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getUserInfo();
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
  if (!data || !data.userInfo) return null;

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
                onClick={() => navigate("/onboarding-management/users")}
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
                    size={48}
                    src={`${data.userInfo.logoUrl}${imageKey}`}
                  />
                  <Typography.Title
                    level={5}
                    style={{ marginBottom: 0 }}
                  >
                    {data.userInfo.userFirstName}&nbsp;
                    {data.userInfo.userLastName}
                  </Typography.Title>
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
                title="User Details"
                smallHeader
              >
                <Row>
                  <Row>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("First Name", data.userInfo.userFirstName)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Last Name", data.userInfo.userLastName)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Email Address", data.userInfo.userEmailAddress)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Department", data.userInfo.userDepartmentName || strings.na)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Reporting Manager", data.userInfo.userReportingManager || strings.na)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText(
                        "Joining Date",
                        data.userInfo.userJoiningDate
                          ? moment(new Date(data.userInfo.userJoiningDate)).format("DD MMM YYYY")
                          : strings.na
                      )}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Type of Employment", data.userInfo.userType || strings.na)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Designation", data.userInfo.userDesignation || strings.na)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Gender", data.userInfo.userGender || strings.na)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText(
                        "Contact Number",
                        data.userInfo.userMobileNumber ? formatNumber(data.userInfo.userMobileNumber) : strings.na
                      )}
                    </Col>
                  </Row>
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
                      {getItemText("Reviewed By", data.reviewerDetails.approvedByEmail)}
                    </Col>
                    <Col
                      xs={24}
                      md={8}
                    >
                      {getItemText("Approved On", moment(data.reviewerDetails.approvalTimeStamp).format("DD MMM YYYY"))}
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
