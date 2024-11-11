import { Icon } from "@iconify/react";
import { WrapperCard, PDFViewer, DataTable } from "~/Components";
import { useNavigate } from "react-router-dom";
import {
  Col,
  Row,
  Typography,
  Space,
  Image,
  Steps,
  Card,
  Comment,
  Avatar,
} from "antd";
import styles from "../../../../Contract.module.scss";
import moment from "moment";
import { ReactNode, useEffect, useState } from "react";
import { get } from "~/Services";

const productList = [
  {
    productName: "Figma Pro",
    productType: "Licenses",
    unitPrice: "$12",
    quantity: "10",
    totalCost: "$120",
  },
  {
    productName: "Windows",
    productType: "Platform",
    unitPrice: "$14",
    quantity: "2",
    totalCost: "$28",
  },
];

export const ContractTable = ({ documents, data ,id}: { documents: any, data: any,id:any }) => {
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [loadingDocId, setLoadingDocId] = useState<string>("");

  const getItemText = (
    name: string,
    value: any,
    className = "",
    style = {}
  ) => {
    if (value === "Invalid date") value = "-";
    return (
      <Space
        direction="vertical"
        style={{ marginBottom: styles.whitespace4 }}
        className={className}
      >
        <Typography.Text type="secondary">{name}</Typography.Text>
        <Typography.Text style={{ color: styles.primary, ...style }}>
          {value}
        </Typography.Text>
      </Space>
    );
  };

  const viewDocument = (envelope: any, isDownload = false) => {
    if (loadingDocId) return;
    setLoadingDocId(envelope.documentId);
    //2087
    get(
        `v1/clm/getEnvelopeDocuments/${id}/${envelope.documentId}`
      )
      .then((res: any ) => {
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

  const Item = (
    <>
      <WrapperCard title={"Contract Details"} bodyClass="h-inherit" smallHeader>
        <Row>
          {selectedDocument && (
            <PDFViewer
              show={true}
              title={"View Document"}
              subTitle={""}
              setShow={() => setSelectedDocument("")}
              url={selectedDocument}
            />
          )}
          <Col xs={24} md={6}>
            {getItemText("Contract Name", data.contractName)}
          </Col>
          <Col xs={24} md={6}>
            {getItemText("Contract Start Date", moment(data.contractStartDate).format("DD MMM YYYY"))}
          </Col>
          <Col xs={24} md={6}>
            {getItemText("Contract End Date", moment(data.contractEndDate).format("DD MMM YYYY"))}
          </Col>
          <Col xs={24} md={6}>
            {getItemText("Renewal Reminder Notification", data.renewalReminderNotification)}
          </Col>
        </Row>
        <Row>
        </Row>
      </WrapperCard>
      <Row>
        <Col span={24} style={{ paddingTop: 24, paddingBottom: 0 }}>
          <Typography.Title level={4} style={{ marginBottom: 24 }}>
            Contract Documents
          </Typography.Title>
          {documents.envelopeDocuments &&
            documents.envelopeDocuments.map((item: any, index: number) => {
              return (
                <div key={index}>
                  <Space style={{ marginBottom: styles.whitespace3 }}>
                    <Icon
                      icon="ph:file-pdf"
                      inline
                      fontSize={24}
                      className="doc-icon"
                      cursor="pointer"
                      style={{ marginRight: 8 }}
                      onClick={() => viewDocument(item)}
                    />
                    <Typography.Title level={5}>{item.name}</Typography.Title>
                    <Icon
                      icon="ic:outline-remove-red-eye"
                      inline
                      fontSize={24}
                      className="doc-icon"
                      cursor="pointer"
                      style={{ marginLeft: 16, marginRight: 8 }}
                      onClick={() => viewDocument(item)}
                    />
                    <Icon
                      icon="material-symbols:download"
                      inline
                      className="doc-icon"
                      fontSize={24}
                      style={{ marginLeft: 8, marginRight: 8 }}
                      cursor="pointer"
                      onClick={() => viewDocument(item, true)}
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
              );
            })}
        </Col>
      </Row>
    </>
  );
  return Item;
};
