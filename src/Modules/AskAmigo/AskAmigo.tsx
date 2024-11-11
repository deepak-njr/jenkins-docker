import * as yup from "yup";

import {
  Button,
  Card,
  Col,
  Image,
  Input,
  Modal,
  Result,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import { Field, Form, Formik } from "formik";
import { debounce, includes, toLower } from "lodash";
import { get, post, remove } from "~/Services";
import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@iconify/react";
import bot from "@assets/SVG/bot.svg";
import gpt from "~/Assets/SVG/gpt.svg";
import iconDelete from "@assets/SVG/delete.svg";
import iconDeleteConfirmation from "@assets/SVG/deleteConfirmation.svg";
import moment from "moment";
import styles from "./AskAmigo.module.scss";
import { useNavigate } from "react-router-dom";
import { useNotification } from "~/Hooks/useNotification";

interface CardData {
  conversationName: string;
  createdOn: string;
  conversationId: string;
}
export const AskAmigo = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<CardData[]>([]);
  const [filteredData, setFilteredData] = useState<CardData[]>([]);
  const [deleteId, setDeleteId] = useState<string>("");
  const { openToast } = useNotification();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const ref = useRef<any>(null);
  useEffect(() => {
    getRecords();
  }, []);
  const getRecords = useCallback(() => {
    setIsLoading(true);
    get("v1/conversation/fetch/byuser")
      .then((res: any) => {
        if (res.response.data) {
          setData(res.response.data);
          setFilteredData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        openToast({
          content: "Getting Conversation List failed",
          type: "error",
        });
        setIsLoading(false);
      });
  }, []);

  const handleSearchInputChange = debounce((value: string) => {
    setSearchQuery(value);
    let tempData = [...data];
    const newData = tempData.filter(
      (item) =>
        includes(toLower(item.conversationName), toLower(value)) ||
        includes(toLower(item.createdOn), toLower(value))
    );
    setFilteredData(newData);
  }, 100);

  const initialValues = {
    title: "",
  };

  const validationSchema = yup.object().shape({
    title: yup.string() .trim("Title cannot include leading and trailing spaces")
    .strict(true).required("Title is required"),
  });
  const handleOk = (values: any, resetForm: any) => {
    const payload = {
      conversationTitle: values.title,
    };
    post("v1/conversation/create", payload).then((res: any) => {
      setOpen(false);
      // resetForm();
      navigate(`/askamigo/${res.response.data.conversationId ?? "gpt"}`);
    });
  };

  const deleteConversation = () => {
    setIsDeleting(true);
    const payload = {
      conversationIds: [deleteId],
    };
    remove("v1/conversation/remove", payload).then((res: any) => {
      if (res.response) {
        setDeleteId("");
        getRecords();
      }
      setIsDeleting(false);
      setDeleteConfirmation(false);
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      key="submit"
      onSubmit={handleOk}
    >
      {({ errors, values, touched, resetForm, isValid, dirty }) => {
        return (
          <>
            <Modal
              open={open}
              // width={window.innerWidth * 0.6}
              style={{ maxWidth: 500, textAlign: "left" }}
              bodyStyle={{
                overflowY: "auto",
              }}
              destroyOnClose={true}
              centered
              footer={[
                <Button
                  key="back"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  style={{ marginBottom: 16 }}
                >
                  Cancel
                </Button>,
                <Button
                  style={{ marginBottom: 16, marginLeft: 24 }}
                  type="primary"
                  htmlType="submit"
                  disabled={!dirty || !isValid}
                  onClick={() => handleOk(values, resetForm)}
                >
                  Create
                </Button>,
              ]}
              maskClosable={false}
              onCancel={() => {
                setOpen(false);
                resetForm();
              }}
            >
              <Typography.Title
                level={5}
                style={{
                  marginBottom: styles.whitespace2,
                  // fontSize: 18,
                }}
              >
                Create a title for your conversation
              </Typography.Title>
              <Form>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <Field name="title" as={Input} placeholder="Enter title" />
                  {errors.title && touched.title && (
                    <Typography.Text type="danger">
                      {errors.title}
                    </Typography.Text>
                  )}
                </div>
              </Form>
            </Modal>
            <Modal
              open={deleteConfirmation}
              className="amigo-delete-conversation"
              style={{ maxWidth: 450, textAlign: "left" }}
              destroyOnClose={true}
              centered
              footer={[
                <Button
                  key="back"
                  onClick={() => setDeleteConfirmation(false)}
                  style={{ marginBottom: 16 }}
                >
                  Cancel
                </Button>,
                <Button
                  style={{
                    marginBottom: 16,
                    marginLeft: 24,
                    background: styles.neon,
                    borderColor: styles.neon,
                  }}
                  type="primary"
                  onClick={deleteConversation}
                  disabled={isDeleting}
                >
                  Delete
                </Button>,
              ]}
              maskClosable={false}
              onCancel={() => {
                setDeleteConfirmation(false);
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div>
                  <Image
                    style={{ height: 120 }}
                    src={iconDeleteConfirmation}
                    preview={false}
                  ></Image>
                </div>
                <Typography.Title
                  level={3}
                  style={{
                    marginBottom: styles.whitespace2,
                    color: "#FF3333",
                    // fontSize: 18,
                  }}
                >
                  Delete?
                </Typography.Title>
                <Typography.Text>
                  Are you sure to delete this conversation? This process cannot
                  be undone
                </Typography.Text>
              </div>
            </Modal>
            <Card className={styles.ContentWrapper}>
              <Row gutter={16} className="saasgpt">
                <Col
                  lg={isLoading || data.length > 0 ? 17 : 24}
                  md={isLoading || data.length > 0 ? 17 : 24}
                  xs={24}
                  style={{
                    textAlign: "center",
                    marginTop: 80,
                  }}
                >
                  <Typography.Title level={3}>
                    Your AI Enabled SaaS Advisor
                  </Typography.Title>
                  <p>
                    Gain insights on your SaaS landscape in a simplified way
                    using our AI Assistant.
                  </p>
                  <Image
                    src={gpt}
                    preview={false}
                    style={{
                      width: 300,
                      height: 290,
                    }}
                  />
                  <br />
                  <Button
                    onClick={() => setOpen(true)}
                    style={{
                      background: styles.primary,
                      color: styles.white,
                      borderRadius: "40px !important",
                      marginTop: styles.whitespace3,
                    }}
                  >
                    <Space className="saasgpt-new-conversation">
                      <Icon icon="akar-icons:plus" inline fontSize={16} />
                      New Conversation
                    </Space>
                  </Button>
                </Col>
                {(isLoading || data.length > 0) && (
                  <Col
                    lg={7}
                    md={7}
                    xs={24}
                    className={styles.conversationList}
                    style={{ paddingLeft: 16, paddingRight: 16 }}
                  >
                    <Typography.Title level={4} style={{ margin: "20px 0" }}>
                      Conversation List
                    </Typography.Title>
                    <Input
                      placeholder="Search Conversation"
                      inputMode="search"
                      style={{ marginBottom: styles.whitespace2, height: 40 }}
                      // value={searchQuery}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      suffix={
                        <Icon
                          icon="eva:search-outline"
                          height="20"
                          style={{
                            margin: "auto",
                            color: styles.strawberry,
                          }}
                        />
                      }
                    ></Input>
                    {isLoading && (
                      <div className="flex-center">
                        <Spin />
                      </div>
                    )}
                    {searchQuery &&
                      searchQuery.length > 0 &&
                      filteredData.length === 0 && (
                        <p style={{ paddingTop: 0 }}>Conversations not found</p>
                      )}
                    <div className={styles.conversationListView} ref={ref}>
                      {filteredData.map((data) => (
                        <>
                          <div
                            className={styles.listItem}
                            onClick={(e: any) => {
                              navigate(
                                `/askamigo/${data.conversationId}`
                              );
                            }}
                          >
                            <div style={{ width: 48, margin: "auto" }}>
                              <Image src={bot} preview={false}></Image>
                            </div>
                            <div
                              style={{
                                marginLeft: 10,
                                width: "calc(100% - 48px)",
                              }}
                            >
                              <Typography.Title
                                level={4}
                                ellipsis
                                style={{ fontSize: 16 }}
                              >
                                {data.conversationName}
                              </Typography.Title>
                              <Typography.Text>
                                {moment(
                                  data.createdOn,
                                  "YYYY-MM-DD,HH:mm:ss"
                                ).format("DD MMM YYYY")}
                              </Typography.Text>
                            </div>
                            <div className={styles.iconDelete}>
                              <Button
                                type="default"
                                shape="circle"
                                className={styles.btnDelete}
                                style={{ borderRadius: "50% !important" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(data.conversationId);
                                  setDeleteConfirmation(true);
                                }}
                              >
                                <Image src={iconDelete} preview={false}></Image>
                              </Button>
                            </div>
                          </div>
                          {/* <div style={{ marginBottom: 10 }}>
                            <Card
                              key={data.conversationId}
                              className={styles.contentCard}
                              style={{ cursor: "pointer" }}
                              onClick={(e: any) => {
                                navigate(
                                  `/askamigo/${mask(data.conversationId, "gpt")}`
                                );
                              }}
                            >
                              <div className="c-pointer">
                                <p
                                  onClick={() =>
                                    deleteConversation(data.conversationId)
                                  }
                                >
                                  delete conversation
                                </p>
                                <Card.Meta
                                  title={data.conversationName}
                                  description={moment(
                                    data.createdOn,
                                    "YYYY-MM-DD,HH:mm:ss"
                                  ).format("DD MMM YYYY")}
                                  style={{
                                    alignItems: "center",
                                    marginBottom: 0,
                                  }}
                                  avatar={
                                    <Image src={bot} preview={false}></Image>
                                  }
                                />
                              </div>
                            </Card>
                          </div> */}
                        </>
                      ))}
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          </>
        );
      }}
    </Formik>
  );
};
