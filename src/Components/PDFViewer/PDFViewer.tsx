import { Modal, Space, Typography } from "antd";
import { times } from "lodash";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf/dist/esm/entry.webpack5";

interface Props {
  title?: string;
  subTitle?: string;
  show: boolean;
  setShow: (value: boolean) => void;
  url: string;
}

export const PDFViewer = ({ title, show, setShow, url, subTitle }: Props) => {
  const [numPages, setNumPages] = useState<number>(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Modal
      title={
        <Space size={0} direction="vertical">
          <Typography.Title level={4} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {subTitle && (
            <Typography.Text type="secondary">{subTitle}</Typography.Text>
          )}
        </Space>
      }
      open={show}
      maskClosable={false}
      cancelText={"Close"}
      onCancel={() => setShow(false)}
      okButtonProps={{
        hidden: true,
      }}
      width={
        window.innerWidth <= 1000
          ? window.innerWidth
          : window.innerWidth - window.innerWidth * 0.1
      }
      bodyStyle={{ height: window.innerHeight - 200, overflowY: "scroll" }}
      centered
    >
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={console.error}
        renderMode="canvas"
      >
        <Space
          size="small"
          align="center"
          style={{
            width: "100%",
            justifyContent: "center",
          }}
          direction="vertical"
        >
          {times(numPages, (page) => (
            <div
              style={{
                border: "1px solid rgba(0,0,0,.2)",
                padding: 10,
              }}
            >
              <Page
                pageNumber={page + 1}
                width={window.innerWidth - window.innerWidth * 0.3}
                scale={1.2}
              />
            </div>
          ))}
        </Space>
      </Document>
    </Modal>
  );
};
