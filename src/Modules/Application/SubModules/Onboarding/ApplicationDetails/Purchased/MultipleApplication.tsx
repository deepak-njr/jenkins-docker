import { Icon } from "@iconify/react";
import {
  Button,
  Col,
  Divider,
  Form,
  Row,
  Space,
  Typography,
  Upload,
} from "antd";
import { RcFile } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApplicationOnboardingContext } from "../../Wrapper";

import styles from "./Purchased.module.scss";

export const MultipleApplication = () => {
  const navigate = useNavigate();
  const { state }: any = useLocation();
  const { formData, setFormData, onBoardingType } = useContext(
    ApplicationOnboardingContext
  );
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = () => {
    setFormData({
      ...formData,
      application: {
        ...formData.application,
        applicationExcel: fileList[0],
      },
    });
    if (state && state.from && state.edit) {
      navigate(state.from);
    } else {
      navigate("/applications/onboarding/supporting-docs");
    }
  };

  useEffect(() => {
    if (
      formData &&
      formData.application &&
      formData.application.applicationExcel
    ) {
      setFileList([formData.application.applicationExcel]);
    }
  }, [formData]);

  if (!formData || !formData.application || formData.application.isSingle)
    return null;

  return (
    <Row>
      <Col xs={24} md={16}>
        <Space
          direction="vertical"
          size={"large"}
          style={{ marginBottom: styles.whitespace3 }}
        >
          <Row>
            <Col span={24}>
              <Typography.Text>
                Download the template file and fill up the application details
                in the given format
              </Typography.Text>
            </Col>
          </Row>
          <Row justify="center">
            <Col>
              <Button
                type="primary"
                ghost
                href={`${window.location.origin}/template_files/application-onboarding.xlsx`}
              >
                <Space>
                  <Icon icon="bi:download" />
                  Download Excel
                </Space>
              </Button>
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={24}>
              <Form>
                <Form.Item>
                  <Upload.Dragger
                    fileList={fileList}
                    beforeUpload={(e: RcFile) => {
                      setFileList([e]);
                      return false;
                    }}
                    multiple={false}
                    accept=".xlsx"
                    onRemove={() => {
                      setFileList([]);
                    }}
                  >
                    <Typography.Text className="ant-upload-drag-icon">
                      <Icon
                        icon="bytesize:upload"
                        fontSize={48}
                        style={{ color: styles.strawberry }}
                      />
                    </Typography.Text>
                    <Typography.Text
                      className="ant-upload-text"
                      style={{
                        display: "flex",
                        marginBlock: styles.whitespace2,
                        justifyContent: "center",
                      }}
                    >
                      Click or drag file to this area to upload
                    </Typography.Text>
                  </Upload.Dragger>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row justify="end">
            <Col>
              <Button
                htmlType="submit"
                type="primary"
                disabled={fileList.length === 0}
                onClick={handleSubmit}
              >
                Next
              </Button>
            </Col>
          </Row>
        </Space>
      </Col>
    </Row>
  );
};
