import { Icon } from "@iconify/react";
import { Button, Col, List, Modal, Result, Row, Space, Typography, Upload } from "antd";
import { RcFile } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import { isEmpty } from "lodash";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useNotification } from "~/Hooks/useNotification";
import { upload } from "~/Services";
import { strings } from "~/Utils/Strings";
import * as XLSX from "xlsx";

import styles from "../../Users.module.scss";
import SuccessModal from "~/Components/Modal/SuccessModal";
import { CheckCountryCode } from "~/Utils/CountryCode";

export const MultipleUsers = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setError] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }>({});
  const [reqId, setReqId] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const { openNotification, openToast } = useNotification();
  const navigate = useNavigate();
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("usersFile", fileList[0] as RcFile, fileList[0].name);

    // Read Excel file
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const errors: string[] = [];
      XLSX.utils.sheet_to_json(worksheet).forEach((row: any, index: number) => {
        const firstName = row["First Name"];
        const lastName = row["Last Name"];
        const email = row["Email Address"];
        const contactNumber = row["Contact Number"];
        const countryCode = row["Country Code"];

        if (/[^a-zA-Z\s]/.test(firstName) || /[^a-zA-Z\s]/.test(lastName)) {
          errors.push(`Row ${index + 2}: First name or last name contains special characters.`);
        }

        if (!/@.*\.com$/.test(email.toLowerCase())) {
          errors.push(`Row ${index + 2}: Invalid email address format.`);
        }

        const validationResult = CheckCountryCode(contactNumber, countryCode, {
          createError: ({ message }:any) => message
        });
        if (validationResult !== true) {
          errors.push(`Row ${index + 2}: ${validationResult}`);
        }
      });

      if (errors.length > 0) {
        setError(true);
        setData({ response: { data: errors } });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      upload("v1/user/onboarding/excel", formData)
        .then((res: any) => {
          if (res.status === "CREATED") {
            setShowSuccess(true);
            setReqId(res.response.data.requestId);
          } else {
            setError(true);
            setData(res);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          openToast({
            content: err,
            type: "error",
          });
          setIsLoading(false);
        });
    };

    reader.readAsArrayBuffer(fileList[0] as RcFile);
  };

  return (
    <>
      {!isEmpty(data) && (
        <Modal
          open={showError}
          footer={false}
          title={<span style={{ color: styles.secondaryRed }}>Excel Upload Failed</span>}
          centered
          onCancel={() => setError(false)}
          maskClosable={false}
          bodyStyle={{ paddingTop: 0 }}
        >
          {!isEmpty(data.response?.data) ? (
            <List
              dataSource={data.response?.data}
              className={"modalList"}
              renderItem={(item: any) => <List.Item>{item}</List.Item>}
            />
          ) : (
            strings.someThingWentWrong
          )}
        </Modal>
      )}
      <Space
        direction="vertical"
        size={"large"}
        style={{ marginBottom: styles.whitespace3 }}
      >
        <Row>
          <Col span={24}>
            <Typography.Text>
              Download the template file and fill up the user details in the given format
            </Typography.Text>
          </Col>
        </Row>
        <Row justify="center">
          <Col>
            <Button
              type="primary"
              ghost
              href={`${window.location.origin}/template_files/user-onboarding.xlsx`}
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
              name="users"
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
          onClose={() => navigate(`/users`)}
          content={
            <Typography.Text style={{ textAlign: "center" }}>
              Your onboarding request is submitted successfully. To view the status of your request, use the <br />{" "}
              Request ID: &nbsp;
              <b>
                <Link to={`/track-requests?activeTab=user&id=${reqId}`}>{reqId}</Link>
              </b>
            </Typography.Text>
          }
        />
      </Space>
    </>
  );
};
