import { Icon } from "@iconify/react";
import {
  Button,
  Col,
  List,
  Modal,
  Result,
  Row,
  Space,
  Typography,
  Upload,
} from "antd";
import { RcFile } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotification } from "~/Hooks/useNotification";
import { upload } from "~/Services";
import { isEmpty } from "lodash";


import styles from "../../Departments.module.scss";
import { strings } from "~/Utils/Strings";
import SuccessModal from '~/Components/Modal/SuccessModal';

export const MultipleOnboarding = (department:any) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setError] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }>({});
  const [reqId, setReqId] = useState("");
  const { openToast, openNotification } = useNotification();
  const navigate = useNavigate();
  const [isloading, setIsLoading] = useState(false);


  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("departmentFile", fileList[0] as RcFile, fileList[0].name);
    setIsLoading(true);
    upload("v1/department/excel", formData)
      .then((res: any) => {
        if (res.status === "CREATED") {
          setShowSuccess(true);
          setReqId(res.response.data.requestId);
        } else {
          setError(true)
          setData(res)
        }
        setIsLoading(false)
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
              Download the template file and fill up the {department === "multipleDepartment" ? "user": "department"} details in the given
              format
            </Typography.Text>
          </Col>
        </Row>
        <Row justify="center">
          <Col>
            <Button
              type="primary"
              ghost
              href={`${window.location.origin}/template_files/department-onboarding.xlsx`}
            >
              <Space>
                <Icon icon="bi:download" />
                Download Excel
              </Space>
            </Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: styles.whitespace2 }}>
          <Col span={24}>
            <Upload.Dragger
              beforeUpload={(e: RcFile) => {
                setFileList([e]);
                return false;
              }}
              multiple={false}
              accept=".xlsx"
              onRemove={() => {
                setFileList([]);
              }}
              style={{
                borderRadius: 10,
                padding: 30,
              }}
              name="users"
              listType="text"
              fileList={fileList}
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
        </Row>
        <SuccessModal
          open={showSuccess}
          onClose={() => navigate("/departments")}
          content={
            <Typography.Text style={{ textAlign: "center" }}>
              Your onboarding request is submitted successfully. To view the
              status of your request, use the  <br />  Request ID: &nbsp;
              <b>
                <Link to={`/track-requests?activeTab=department&id=${reqId}`}>
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
