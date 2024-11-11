import {
  Button,
  Col,
  List,
  Modal,
  Row,
  Space,
  Typography,
  Upload,
} from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Icon } from "@iconify/react";
import { RcFile } from "antd/lib/upload";
import SuccessModal from '~/Components/Modal/SuccessModal';
import { UploadFile } from "antd/lib/upload/interface";
import { isEmpty } from "lodash";
import { strings } from "~/Utils/Strings";
import styles from "../../Projects.module.scss";
import { upload } from "~/Services";
import { useNotification } from "~/Hooks/useNotification";
import { useState } from "react";

export const MultipleProject = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { id } = useParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setError] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }>({});
  const [reqId, setReqId] = useState("");
  const {  openToast } = useNotification();
  const [isloading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("projectFile", fileList[0] as RcFile, fileList[0].name);
    setIsLoading(true);
    upload(`v1/project/excel?departmentId=${id}`, formData)
      .then((res: any) => {
        if (res.status === "CREATED") {
          setShowSuccess(true);
          setReqId(res.response.data.requestId);
        } else {
          setError(true)
          setData(res)
          console.log(data.response?.data)
        }
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({
          content: err,
          type: "error",
        });
        setIsLoading(false)
      });
  };


  return (
    <>
      {!isEmpty(data) &&
        <Modal
          open={showError}
          footer={false}
          title={<span style={{ color: styles.secondaryRed }}>Excel Upload Failed</span>}
          centered
          onCancel={() => setError(false)}
          maskClosable={false}
          bodyStyle={{ paddingTop: 0 }}
        >
          {!isEmpty(data.response?.data) ?
            <List dataSource={data.response?.data}
              className={"modalList"}
              renderItem={(item: any) => (
                <List.Item>
                  {item}
                </List.Item>
              )}
            />
            : strings.someThingWentWrong
          }
        </Modal>
      }
      <Space
        direction="vertical"
        size={"large"}
        style={{ marginBottom: styles.whitespace3 }}
      >
        <Row>
          <Col span={24}>
            <Typography.Text>
              Download the template file and fill up the project details in the
              given format
            </Typography.Text>
          </Col>
        </Row>
        <Row justify="center">
          <Col>
            <Button
              type="primary"
              ghost
              href={`${window.location.origin}/template_files/project-onboarding.xlsx`}
            >
              <Space>
                <Icon icon="bi:download" />
                Download Excel
              </Space>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Upload.Dragger
              style={{
                borderRadius: 10,
                padding: 30,
              }}
              name="projects"
              fileList={fileList}
              beforeUpload={(e: RcFile) => {
                setFileList([e]);
                return false;
              }}
              listType="text"
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
          </Col>
        </Row>
        <Row justify="end">
          <Space
            direction="vertical"
            size={"large"}
            style={{ marginTop: styles.whitespace1 }}
          >
            {" "}
            <Col>
              <Button
                onClick={handleSubmit}
                type="primary"
                loading={isloading}
                disabled={fileList.length === 0}
              >
                Submit
              </Button>
            </Col>
          </Space>
        </Row>
        <SuccessModal
          open={showSuccess}
          onClose={() => navigate(`/departments/${id}?activeTab=projects`)}
          content={
            <Typography.Text style={{ textAlign: "center" }}>
              Your onboarding request is submitted successfully. To view the
              status of your request, use the  <br />  Request ID: &nbsp;
              <b>
                <Link to={`/track-requests?activeTab=project&id=${reqId}`}>
                  {reqId}
                </Link>
              </b>
            </Typography.Text>
          }
        />
      </Space>
    </>
  );
};
