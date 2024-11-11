import { Button, Col, Image, Input, Row, Space, Spin, Tooltip, Typography } from "antd";
import { ContentWrapper, DataTable } from "~/Components";
import { camelCase, startCase } from "lodash";
import { get, post } from "~/Services";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AskSaasGPT from "@assets/PNG/AskSaasGPT.png";
import { Feedback } from "./Feedback";
import { Icon } from "@iconify/react";
import chartLeft from "@assets/SVG/chartLeft.svg";
import chartRight from "@assets/SVG/chartRight.svg";
import styles from "./AskAmigo.module.scss";
import thumbDown from "@assets/SVG/thumbDown.svg";
import thumbDownFilled from "@assets/SVG/thumbDownFilled.svg";
import thumbUp from "@assets/SVG/thumbUp.svg";
import thumbUpFilled from "@assets/SVG/thumbUpFilled.svg";

interface ListData {
  title: string;
  subtitle: string;
}

export const AskAmigoChat = () => {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState<any>(undefined);
  const [history, setHistory] = useState<any>([]);
  const navigate = useNavigate();
  const [queryData, setQueryData] = useState<string>("");
  const [isConversationLoading, setIsConversationLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const handleInput = (e: any) => {
    setQueryData(e.target.value);
  };

  const getConversationHistory = () => {
    get(`v1/conversation/history/${id ?? "gpt"}`)
      .then((res: any) => {
        setIsConversationLoading(false);
        if (res && res.response && res.response.data) {
          formatHistory(res.response.data);
        }
      })
      .catch((err) => {
        setIsConversationLoading(false);
      });
  };

  const formatHistory = (data: any) => {
    if (data) {
      data.map((item: any) => {
        if (item.response && item.response.table && item.response.table.header) {
          let columns: any = [];
          item.response.table.header.map((header: any) => {
            let obj: any = {
              title: startCase(camelCase(header)),
              dataIndex: header,
              sorter: (a: any, b: any) => (a[header] || "").localeCompare(b[header] || ""),
            };
            columns.push(obj);
          });
          item.response.table.columns = [...columns];
          let records: any = [];
          item.response.table.data.map((record: any, index: number) => {
            let obj: any = {};
            obj.key = index;
            item.response.table.header.map((header: any, headerIndex: number) => {
              obj[header] = record[headerIndex];
            });
            records.push(obj);
          });
          item.response.table.records = records;
        }
        return item;
      });

      setHistory(data);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      const element: any = document.getElementById("askSaasGPT");
      element.scrollTop = element.scrollHeight;
    }, 100);
  };

  const submitQuery = () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    let tempHistory = [...history];
    let conversationId = id ?? "gpt";
    tempHistory.push({
      conversationId: conversationId,
      createdOn: "",
      id: tempHistory[tempHistory.length - 1] + 1,
      like: null,
      comments: null,
      query: queryData,
      response: null,
      isLoading: true,
    });
    setHistory(tempHistory);
    formatHistory(tempHistory);
    setQueryData("");
    scrollToBottom();
    post(`v1/conversation/findbyprompt`, {
      conversationId: conversationId,
      prompt: queryData,
    })
      .then((res: any) => {
        if (res && res.response && res.response.data) {
          let data = res.response.data;
          data.sort(function (a: any, b: any) {
            return a.id - b.id;
          });
          formatHistory(data);
        }
        setTimeout(() => {
          setIsSubmitting(false);
        }, 100);
      })
      .catch((err) => {
        setIsSubmitting(false);
      });
  };

  const onLike = (res: any) => {
    let payload = {
      conversationId: res.conversationId,
      like: true,
      id: res.id,
      comment: "",
    };
    post("v1/conversation/feedback", payload).then((res: any) => {
      getConversationHistory();
    });
  };

  const onDislike = (res: any) => {
    console.log("dislike ", res);
    setChatId(res.id);
    setOpen(true);
  };

  useEffect(() => {
    if (id) {
      setIsConversationLoading(true);
      getConversationHistory();
    }
  }, [id]);
  return (
    <>
      <Feedback
        open={open}
        chatId={chatId}
        conversationId={id ?? "gpt"}
        onCancel={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
          getConversationHistory();
        }}
      />
      <ContentWrapper
        customTitle={
          <Space style={{ alignItems: "center", lineHeight: 1 }}>
            <Icon
              onClick={() => navigate(-1)}
              icon="akar-icons:arrow-left"
              style={{
                fontSize: "1.8rem",
                cursor: "pointer",
                color: styles.primary,
                marginRight: styles.whitespace1,
              }}
            />
            <Typography.Title
              level={3}
              style={{ margin: 0 }}
            >
              Ask Amigo
            </Typography.Title>
          </Space>
        }
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <Row
            style={{
              height: "100%",
              overflowY: "auto",
            }}
            id="askSaasGPT"
          >
            <Col
              lg={2}
              xs={24}
            ></Col>
            <Col
              lg={20}
              md={24}
              xs={24}
              style={{
                textAlign: "center",
              }}
            >
              {isConversationLoading && (
                <div className="flex-center h-100">
                  <Spin />
                </div>
              )}
              {!isConversationLoading && history.length === 0 && (
                <Image
                  src={AskSaasGPT}
                  preview={false}
                  style={{
                    maxWidth: 450,
                    maxHeight: 300,
                  }}
                />
              )}

              <div
                className={styles.imageposition}
                style={{ margin: "20px" }}
              >
                {history &&
                  history.map((item: any, index: number) => (
                    <>
                      <div
                        key={`history-${index}`}
                        style={{
                          textAlign: "right",
                          display: "flex",
                          justifyContent: "end",
                        }}
                      >
                        <p
                          style={{
                            background: styles.primary,
                            color: "white",
                            padding: "10px 12px",
                            borderRadius: 9,
                            margin: "12px -22px 0px 0px",
                            maxWidth: "80%",
                            textAlign: "left",
                            minWidth: 200,
                            width: "fit-content",
                          }}
                        >
                          {item.query}
                        </p>
                        <Image
                          style={{ margin: -9 }}
                          src={chartRight}
                          preview={false}
                        ></Image>
                      </div>
                      <div
                        key={"answer-" + index}
                        style={{ textAlign: "left", margin: 9 }}
                      >
                        <Image
                          style={{
                            margin: -9,
                            position: "relative",
                            zIndex: 1,
                          }}
                          src={chartLeft}
                          preview={false}
                        ></Image>
                        <div>
                          <Row>
                            <Col
                              md={24}
                              sm={24}
                            >
                              <div style={{ display: "flex" }}>
                                <div
                                  style={{
                                    background: "#F0F5FF",
                                    padding: "10px 12px",
                                    margin: "-4px 2px 10px 10px",
                                    borderRadius: 9,
                                    minWidth: 200,
                                    maxWidth: "80%",
                                    width: "fit-content",
                                    textAlign: "left",
                                  }}
                                >
                                  {item.isLoading && (
                                    <Icon
                                      icon="eos-icons:three-dots-loading"
                                      color="#29256e"
                                      fontSize={24}
                                    />
                                  )}

                                  <div style={{ width: "100%" }}>
                                  <div className={styles.fontColor} dangerouslySetInnerHTML={{ __html: item?.response?.text }}></div>
                                    {item.response &&
                                      item.response.table &&
                                      item.response.table.columns &&
                                      item.response.is_table && (
                                        <DataTable
                                          columns={item.response.table.columns}
                                          className="table-clickable"
                                          tableData={item.response.table.records}
                                          showTopBar={false}
                                          multiSelect={false}
                                        />
                                      )}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    paddingTop: 4,
                                  }}
                                >
                                  {item.response && (
                                    <>
                                      {item.like && (
                                        <Image
                                          style={{
                                            height: 20,
                                            marginLeft: 10,
                                            width: 20,
                                          }}
                                          src={thumbUpFilled}
                                          preview={false}
                                        ></Image>
                                      )}
                                      {!item.like && (
                                        <Image
                                          style={{
                                            height: 20,
                                            marginLeft: 10,
                                            width: 20,
                                            cursor: "pointer",
                                            opacity: item.comments ? 0.5 : 1,
                                          }}
                                          src={thumbUp}
                                          preview={false}
                                          onClick={() => {
                                            if (!item.comments) {
                                              onLike(item);
                                            }
                                          }}
                                        ></Image>
                                      )}
                                      {item.like === false && (
                                        <Tooltip
                                          title={item.comments}
                                          overlayStyle={{ position: "fixed" }}
                                          destroyTooltipOnHide
                                        >
                                          <Image
                                            style={{
                                              height: 20,
                                              width: 20,
                                              marginLeft: 10,
                                            }}
                                            src={thumbDownFilled}
                                            preview={false}
                                          ></Image>
                                        </Tooltip>
                                      )}
                                      {!item.comments && (
                                        <Image
                                          style={{
                                            height: 20,
                                            width: 20,
                                            marginLeft: 10,
                                            cursor: "pointer",
                                            opacity: item.like || item.comments ? 0.5 : 1,
                                          }}
                                          src={thumbDown}
                                          preview={false}
                                          onClick={() => {
                                            if (item.like || !item.comments) {
                                              onDislike(item);
                                            }
                                          }}
                                        ></Image>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    </>
                  ))}
              </div>
            </Col>
            <Col
              lg={2}
              xs={24}
            ></Col>
          </Row>
          <Row
            style={{
              height: "60px !important",
            }}
          >
            <Col
              lg={2}
              xs={24}
            ></Col>
            <Col
              lg={20}
              md={24}
              xs={24}
              style={{
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "0 20px",
                  paddingTop: "20px",
                }}
              >
                <Input
                  style={{
                    marginRight: 20,
                    width: "100%",
                  }}
                  size="large"
                  value={queryData}
                  onChange={(e) => handleInput(e)}
                  onPressEnter={submitQuery}
                />
                <Button
                  // onClick={() => navigate(`/askamigo`)}
                  style={{
                    background: styles.primary,
                    color: styles.white,
                    borderRadius: "40px !important",
                    height: "40px",
                  }}
                  onClick={submitQuery}
                >
                  <Icon
                    icon="lucide:send"
                    inline
                    fontSize={20}
                  />
                </Button>
              </div>
            </Col>
            <Col
              lg={2}
              xs={24}
            ></Col>
          </Row>
        </div>
      </ContentWrapper>
    </>
  );
};
