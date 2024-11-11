import { Icon } from "@iconify/react";
import { Button, Col, Modal, Row, Space, Tag, Typography, Upload, message } from "antd";
import { isEmpty, map } from "lodash";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ApplicationOnboardingContext } from "./Wrapper";

import styles from "./ApplicationOnboarding.module.scss";
import { UploadFile, UploadProps } from "antd/lib/upload/interface";
import { DetailsMissing } from "./DetailsMissing";

export const SupportingDocuments = () => {
  const { setFormData, formData: contextFormData, onBoardingType } = useContext(ApplicationOnboardingContext);
  const navigate = useNavigate();
  const { state }: any = useLocation();
  const [openModal, setOpenModal] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [fileSize, setFileSize] = useState(0);

  const types = ["application/pdf", "application/x-zip-compressed", "image/png", "image/jpeg"];

  const props: UploadProps = {
    onRemove: (file) => handleRemove(file),
    onChange: (info) => {
      if (info.file) {
        if (!types.map((d: any) => d).includes(info.file.type)) {
          message.error("Please select a valid file");
          return;
        }
        setFileList(info.fileList);
        setOpenModal(false);
      }
    },
    fileList,
  };

  useEffect(() => {
    if (contextFormData && !isEmpty(contextFormData.supportingDocuments)) {
      setFileList(contextFormData.supportingDocuments);
    }
  }, []);

  useEffect(() => {
    let totalSize = 0;
    map(fileList, (file) => (totalSize += file.size / 1024 / 1024));
    setFileSize(totalSize);
  }, [fileList]);

  const handleRemove = (file: UploadFile) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const handleSubmit = () => {
    setFormData({
      ...contextFormData,
      supportingDocuments: fileList,
    });
    if (state && state.from) {
      navigate(state.from);
    } else {
      if (onBoardingType === "New") {
        navigate("/applications/onboarding/similar-apps");
      } else {
        navigate("/applications/onboarding/review");
      }
    }
  };
  if (
    !contextFormData ||
    !contextFormData.application ||
    !(contextFormData.application.application || contextFormData.application.applicationExcel)
  )
    return <DetailsMissing />;
  return (
    <Row>
      <Col
        xs={24}
        md={16}
      >
        <Row>
          <Col>
            <Typography.Title level={4}>Supporting Documents</Typography.Title>
            {/* <Typography.Text>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro
            laboriosam accusamus suscipit explicabo, rem earum doloremque
            tempore! Quas incidunt nam expedita placeat aperiam laudantium quasi
            temporibus totam nesciunt, culpa dolorem?
          </Typography.Text> */}
          </Col>
        </Row>
        <Row style={{ marginTop: styles.whitespace5 }}>
          <Col span={24}>
            {fileList.length > 0 && (
              <Typography.Text>
                <Icon
                  icon="akar-icons:file"
                  style={{ color: styles.strawberry, marginRight: 4 }}
                />
                Please upload your files
              </Typography.Text>
            )}
          </Col>
        </Row>
        <Row style={{ marginTop: styles.whitespace2 }}>
          {map(fileList, (file) => (
            <Col
              span={24}
              style={{ marginBottom: styles.whitespace1 }}
              key={file.name}
            >
              <Typography.Text key={file.name}>
                <Space>
                  <Icon
                    icon="clarity:success-standard-solid"
                    style={{
                      color: styles.secondaryGreen,
                      verticalAlign: "middle",
                    }}
                  />
                  {file.name}
                  <Icon
                    icon="fluent:delete-16-regular"
                    style={{
                      color: styles.strawberry,
                      cursor: "pointer",
                      verticalAlign: "middle",
                    }}
                    onClick={() => handleRemove(file)}
                  />
                </Space>
              </Typography.Text>
            </Col>
          ))}
        </Row>
        <Row>
          <Col>
            <Button
              type={fileList.length > 0 ? "text" : "primary"}
              onClick={() => setOpenModal(true)}
              style={{
                textAlign: "left",
                justifyContent: "left",
                ...(fileList.length > 0 && { padding: 0 }),
              }}
            >
              {fileList.length > 0 ? (
                <Typography.Text style={{ color: styles.primary }}>
                  <Space style={{ lineHeight: 1 }}>
                    <Icon icon="akar-icons:plus" />
                    Add another file
                  </Space>
                </Typography.Text>
              ) : (
                "Choose file"
              )}
            </Button>
            <br />
            {fileSize > 1 && <Typography.Text type="danger">(Maximum file size exceeded)</Typography.Text>}
          </Col>
        </Row>
        <Modal
          open={openModal}
          title="Upload Application List"
          okText="Upload"
          maskClosable={false}
          footer={false}
          onCancel={() => setOpenModal(false)}
        >
          <Upload.Dragger
            {...props}
            showUploadList={false}
            multiple
            accept=".zip,.pdf,.png,.jpeg,.jpg"
          >
            <Typography.Text className="ant-upload-drag-icon">
              <Icon
                icon="bytesize:upload"
                fontSize={48}
                style={{ color: styles.strawberry }}
              />
            </Typography.Text>
            <Typography.Title
              level={4}
              type="secondary"
            >
              Click (or) Drag and drop files here
            </Typography.Title>
            <Row>
              <Col span={24}>
                {["zip", "pdf", "png", "jpeg"].map((type) => (
                  <Tag
                    style={{ fontSize: 14 }}
                    key={type}
                  >
                    {type.toUpperCase()}
                  </Tag>
                ))}
              </Col>
            </Row>

            <Typography.Text type="danger">(Maximum size of file should be 1 MB)</Typography.Text>
          </Upload.Dragger>
        </Modal>
        <Row
          style={{ marginTop: styles.whitespace6 }}
          justify="end"
        >
          <Col>
            <Space
              direction="vertical"
              style={{ textAlign: "right" }}
            >
              <Space>
                <Button onClick={() => navigate("/applications/onboarding/application-details")}>Back</Button>
                <Button
                  onClick={handleSubmit}
                  type="primary"
                  disabled={fileList.length === 0 || fileSize > 1}
                >
                  Next
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
