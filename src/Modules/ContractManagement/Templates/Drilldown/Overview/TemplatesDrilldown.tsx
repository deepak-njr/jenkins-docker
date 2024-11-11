import React, { useEffect, useState } from "react";
import { ContentWrapper, DataTable, WrapperCard, PDFViewer } from "@components/index";
import { useNavigate, useParams } from "react-router-dom";
import { Space, Typography, Tabs, Row, Col, Button } from "antd";

import styles from "../../../Contract.module.scss";
import { Icon } from "@iconify/react";
import { useNotification } from "@hooks/useNotification";
import { isEmpty, map } from "lodash";
import moment from "moment";
import { numberToWord } from "~/Utils/CommonUtils";
import { get } from "~/Services";

const getItemText = (name: string, value: any, isBoolean?: any) => {
  return (
    <Space
      direction="vertical"
      style={{ marginBottom: styles.whitespace4 }}
    >
      <Typography.Text type="secondary">{name}</Typography.Text>
      <Typography.Text>{!isBoolean ? value : value === "true" ? "Enabled" : "Disabled"}</Typography.Text>
    </Space>
  );
};

export const TemplatesDrilldown = (props: any) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { openToast } = useNotification();
  const [data, setData] = useState<{ [key in string]: any }>({});
  const [docsList, setDocsList] = useState<any>([]);
  const [loadingDocId, setLoadingDocId] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<string>("");

  const viewDocument = (envelope: any, index: number, isDownload = false) => {
    if (loadingDocId) return;
    setLoadingDocId(envelope.documentId);
    get(`v1/clm/getTemplateDocuments/${id}/${envelope.documentId}`)
      .then((res: any) => {
        if (res.status === "OK" && res.response) {
          var byteCharacters = atob(res.response.data);
          var byteNumbers = new Array(byteCharacters.length);
          for (var i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          var byteArray = new Uint8Array(byteNumbers);
          var file = new Blob([byteArray], { type: "application/pdf;base64" });
          var fileURL = URL.createObjectURL(file);
          if (isDownload) {
            // window.open(fileURL);
            const link = document.createElement("a");
            link.href = fileURL;
            link.download = envelope.name;
            link.click();
          } else {
            setSelectedDocument(fileURL);
          }
        }
        setLoadingDocId("");
      })
      .catch((err) => {
        setLoadingDocId("");
      });
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      //2087
      get(`v1/clm/template/${id}`)
        .then((res: any) => {
          if (res) {
            let tempData = res.response.data.data;
            let signers: any = tempData.recipients.signers;
            signers.sort((a: any, b: any) => a.recipientId - b.recipientId);
            let isSigningOrder = false;
            if (signers[1] && signers[1].routingOrder === "2") {
              isSigningOrder = true;
            }
            signers = signers.map((item: any, index: number) => {
              if (isSigningOrder) {
                item.signingOrder = numberToWord(index) + " Signer";
              } else {
                item.signingOrder = "-";
              }
              return item;
            });
            tempData.recipients.singers = [...signers];
            setData(tempData);
            console.log(tempData.documents);

            let tempDocsList: any = [];
            if (tempData.documents && res.response.data.data.documents) {
              tempData.documents.map((doc: any, index: number) => {
                let obj: any = {};
                obj.name = doc.name;
                obj.fileExtension = "pdf";
                obj.documentId = doc.documentId;
                obj.documentBase64 = res.response.data.data.documents[index];
                tempDocsList.push(obj);
              });
              setDocsList(tempDocsList);
            }
            console.log(tempDocsList);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          openToast({ content: err, type: "error" });
        });
    }
  }, []);

  if (isEmpty(data)) {
    return <ContentWrapper loading={isLoading}> </ContentWrapper>;
  }
  return (
    <>
      {selectedDocument && (
        <PDFViewer
          show={true}
          title={"View Document"}
          subTitle={""}
          setShow={() => setSelectedDocument("")}
          url={selectedDocument}
        />
      )}
      <ContentWrapper
        loading={isLoading}
        customTitle={
          <Space style={{ alignItems: "center", lineHeight: 1 }}>
            <Icon
              onClick={() => navigate("/clm/templates")}
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
              {data.name}
            </Typography.Title>
          </Space>
        }
      >
        <Row>
          <Col
            span={24}
            style={{ marginBottom: styles.whitespace3 }}
          >
            <WrapperCard
              title="Template Details"
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
                  onClick={() => navigate(`/clm/templates/edit/${id}`)}
                />
              }
            >
              <Row>
                <Col
                  xs={24}
                  md={8}
                >
                  {getItemText("Template Name", data.name)}
                </Col>
                <Col
                  xs={24}
                  md={8}
                >
                  {getItemText("Template Description", data.description)}
                </Col>
                <Col
                  xs={24}
                  md={8}
                >
                  {getItemText("Email Subject", data.emailSubject)}
                </Col>
                <Col
                  xs={24}
                  md={16}
                >
                  {getItemText("Email Message", data.emailBlurb)}
                </Col>
              </Row>
              <Row>
                <Col
                  xs={24}
                  md={24}
                >
                  <Typography.Title
                    level={4}
                    style={{ margin: 4, marginLeft: 0 }}
                  >
                    Custom Options
                  </Typography.Title>
                </Col>
                <Col
                  xs={24}
                  md={24}
                >
                  <Typography.Title
                    level={5}
                    style={{ margin: 2 }}
                  >
                    Reminders
                  </Typography.Title>
                </Col>
                <Col
                  xs={24}
                  md={6}
                >
                  {getItemText("Send Automatic Reminders", data.notification.reminders.reminderEnabled, true)}
                </Col>
                <Col
                  xs={24}
                  md={6}
                >
                  {getItemText(
                    "Days until first reminder",
                    data.notification.reminders.reminderEnabled
                      ? data.notification.reminders.reminderFrequency + " day(s)"
                      : "-"
                  )}
                </Col>
                <Col
                  xs={24}
                  md={12}
                >
                  {getItemText(
                    "Days between reminders",
                    data.notification.reminders.reminderEnabled
                      ? data.notification.reminders.reminderDelay + " day(s)"
                      : "-"
                  )}
                </Col>
              </Row>
              <Row>
                <Col
                  xs={24}
                  md={24}
                >
                  <Typography.Title
                    level={5}
                    style={{ margin: 4, marginLeft: 0 }}
                  >
                    Expiration
                  </Typography.Title>
                </Col>
                <Col
                  xs={24}
                  md={6}
                >
                  {getItemText(
                    "Document will expire on",
                    moment().add(Number(data.notification.expirations.expireAfter), "days").format("DD MMM YYYY")
                  )}
                </Col>
                <Col
                  xs={24}
                  md={12}
                >
                  {getItemText(
                    "Days to warn signers before expiration",
                    data.notification.expirations.expireWarn + " day(s)"
                  )}
                </Col>
              </Row>
              <Row>
                <Col
                  xs={24}
                  md={24}
                >
                  <Typography.Title
                    level={5}
                    style={{ margin: 4, marginLeft: 0 }}
                  >
                    Others
                  </Typography.Title>
                </Col>
                {/* <Col
                  xs={24}
                  md={12}
                >
                  {getItemText(
                    "Responsive Signing for mobile-friendly viewing",
                    data.signerCanSignOnMobile,
                    true
                  )}
                </Col> */}
                <Col
                  xs={24}
                  md={12}
                >
                  {getItemText("Comments", data.allowComments, true)}
                </Col>
              </Row>
              <Row>
                <Col
                  xs={24}
                  md={24}
                >
                  <Typography.Title
                    level={5}
                    style={{ margin: 4, marginLeft: 0 }}
                  >
                    Recipient Privileges
                  </Typography.Title>
                </Col>
                <Col
                  xs={24}
                  md={12}
                >
                  {getItemText(
                    "Restrict sender from editing, adding, or removing recipients",
                    data.recipientsLock,
                    true
                  )}
                </Col>
                <Col
                  xs={24}
                  md={12}
                >
                  {getItemText(
                    "Restrict sender from editing subject, email, or private message",
                    data.messageLock,
                    true
                  )}
                </Col>
                <Col
                  span={24}
                  style={{ marginBottom: styles.whitespace3 }}
                >
                  <Typography.Title
                    level={4}
                    style={{ marginBottom: styles.whitesapce5 }}
                  >
                    Contract Documents
                  </Typography.Title>
                  {id &&
                    map(docsList, (item: any, index: number) => (
                      <div key={index}>
                        <Space style={{ marginBottom: styles.whitespace3 }}>
                          <Icon
                            icon="ph:file-pdf"
                            inline
                            fontSize={24}
                            className="doc-icon"
                            cursor="pointer"
                            style={{ marginRight: 8 }}
                            onClick={() => viewDocument(item, index)}
                          />
                          <Typography.Title level={5}>{item.name}</Typography.Title>
                          <Icon
                            icon="ic:outline-remove-red-eye"
                            inline
                            fontSize={24}
                            className="doc-icon"
                            cursor="pointer"
                            style={{ marginLeft: 16, marginRight: 8 }}
                            onClick={() => viewDocument(item, index)}
                          />
                          <Icon
                            icon="material-symbols:download"
                            inline
                            className="doc-icon"
                            fontSize={24}
                            style={{ marginLeft: 8, marginRight: 8 }}
                            cursor="pointer"
                            onClick={() => viewDocument(item, index, true)}
                          />
                          {loadingDocId === item.documentId && (
                            <Icon
                              icon="eos-icons:bubble-loading"
                              inline
                              className="doc-icon"
                              fontSize={24}
                              style={{ marginLeft: 12, marginRight: 12 }}
                            />
                          )}
                        </Space>
                      </div>
                    ))}
                </Col>
              </Row>
              <Col span={24}>
                <WrapperCard
                  title="Signers List"
                  smallHeader
                >
                  <Col span={24}>
                    <DataTable
                      multiSelect={false}
                      tableData={map(data.recipients.signers, (signers, i) => ({
                        ...signers,
                        key: i,
                      }))}
                      columns={[
                        {
                          key: "name",
                          dataIndex: "name",
                          title: "Name",
                        },
                        {
                          key: "email",
                          dataIndex: "email",
                          title: "Email Address",
                        },
                        {
                          key: "signingOrder",
                          dataIndex: "signingOrder",
                          title: "Signing Order",
                        },
                      ]}
                      showTopBar={false}
                    />
                  </Col>
                </WrapperCard>
              </Col>
            </WrapperCard>
          </Col>
        </Row>
      </ContentWrapper>
    </>
  );
};
