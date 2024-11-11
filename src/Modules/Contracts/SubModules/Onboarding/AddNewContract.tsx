import * as yup from "yup";

import {
  Avatar,
  Button,
  Col,
  Form,
  Modal,
  Result,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { get, post, upload } from "~/Services/api.service";
import { isEmpty, map, values } from "lodash";
import { useEffect, useState } from "react";

import { defaultValue as ApplicationDefaultValues } from "@modules/Application/SubModules/Onboarding/ApplicationDetails/Purchased/SingleApplication";
import { ApplicationFormItems } from "@modules/Application/SubModules/Onboarding/Wrapper";
import { CONTRACT_VALIDATION_SCHEMA } from "@utils/formValidationSchemas";
import { ContentWrapper } from "~/Components";
import { ContractInformation } from "@modules/Application/SubModules/Onboarding/ApplicationDetails/Components/ContractInformation";
import { Formik } from "formik";
import { Icon } from "@iconify/react";
import SuccessModal from "~/Components/Modal/SuccessModal";
import { imageKey } from "~/Utils";
import moment from "moment";
import styles from "../../Contract.module.scss";
import { useNotification } from "~/Hooks/useNotification";

export const AddNewContract = () => {
  const [fileList, setFileList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reqId, setReqId] = useState("");

  const { openToast, openNotification } = useNotification();
  const { id } = useParams() as { id: string };
  const { state } = useLocation() as any as {
    state: {
      department: string;
      applicationLogo: string;
      applicationName: string;
    };
  };

  const navigate = useNavigate();

  const uploadSupportinDocs = () => {
    // setShowSuccess(true);
    const supportingDocumentsPayload = new FormData();

    fileList.map((doc: any) =>
      supportingDocumentsPayload.append("multipartFiles", doc.originFileObj, doc.originFileObj?.name)
    );
    supportingDocumentsPayload.append("fileName", reqId);
    setIsLoading(true);
    upload("v1/application/file", supportingDocumentsPayload)
      .then((res: any) => {
        if (res.status === "OK") {
          setShowSuccess(true);
        } else {
          openNotification({
            title: "Failed",
            message: res.message,
            type: "error",
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
        setIsLoading(false);
      });
  };
  const handleRemove = (file: UploadFile) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => handleRemove(file),
    onChange: (info) => {
      setFileList(info.fileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  useEffect(() => {
    if (reqId) {
      uploadSupportinDocs();
    }
  }, [reqId]);

  const onSubmit = (value: ApplicationFormItems) => {
    const { contracts } = value;

    const payload = {
      contractName: contracts[0].name,
      contractType: contracts[0].contractType,
      contractEndDate: moment(contracts[0].endDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      contractStartDate: moment(contracts[0].startDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      ...(contracts[0].autoRenewal && {
        upcomingRenewalDate: moment(contracts[0].upcomingRenewalDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      }),
      autoRenewal: contracts[0].autoRenewal,
      paymentMethod: contracts[0].paymentMethod?.type,
      cardHolderName: contracts[0].paymentMethod?.cardHolderName,
      cardNumber: contracts[0].paymentMethod?.cardNumber,
      validThrough: contracts[0].paymentMethod?.validThrough,
      walletName: contracts[0].paymentMethod?.walletName,
      billingFrequency: contracts[0].billingFrequency,
      contractTenure: contracts[0].contractTenure,
      currencyCode: contracts[0].currencyCode,
      autoRenewalCancellation: contracts[0].autoRenewalCancellation,
      products: map(contracts[0].products, (license) => ({
        contractName: contracts[0].name,
        productName: license.productName,
        productType: license.productType,
        unitPrice: Number(license.unitPrice),
        unitPriceType: license.unitPriceType,
        quantity: license.quantity,
        totalCost: Number(license.totalCost),
      })),
    };

    post(`v1/application/contract/${id}/addcontract`, payload)
      .then((res: any) => {
        if (res) {
          setReqId(res.response.data.requestId);
        } else {
          openNotification({
            title: "Failed",
            message: res.message,
            type: "error",
          });
        }
      })
      .catch((err) =>
        openNotification({
          title: "Failed",
          message: err,
          type: "error",
        })
      );
  };

  return (
    <ContentWrapper
      loading={isLoading}
      customTitle={
        <Space align="start">
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
          <span>
            <Typography.Title
              level={5}
              style={{ margin: 0 }}
            >
              Add Contract
            </Typography.Title>

            <Typography.Text
              type="secondary"
              style={{ fontSize: 14 }}
            >
              <Avatar
                size={16}
                style={{ marginRight: 4 }}
                src={`${state.applicationLogo}${imageKey}`}
              />
              {state.applicationName}({state.department} Department)
            </Typography.Text>
          </span>
        </Space>
      }
    >
      <SuccessModal
        open={showSuccess}
        onClose={() => navigate(`/applications/${id}?activeTab=contracts`)}
        content={
          <Typography.Text style={{ textAlign: "center" }}>
            Your onboarding request is submitted successfully. To view the status of your request, use the <br />{" "}
            Request ID: &nbsp;
            <b>
              <Link to={`/track-requests?activeTab=contract&id=${reqId}`}>{reqId}</Link>
            </b>
          </Typography.Text>
        }
      />
      <Formik
        initialValues={ApplicationDefaultValues}
        onSubmit={(values) => onSubmit(values)}
        validationSchema={yup.object().shape({
          contracts: CONTRACT_VALIDATION_SCHEMA,
        })}
      >
        {(props) => {
          return (
            <Form
              layout="vertical"
              onFinish={props.handleSubmit}
            >
              <ContractInformation
                {...props}
                singleContract
              />
              {props.values.contracts[0].contractType && (
                <>
                  <Row>
                    <Col>
                      <Form.Item label="Supporting Documents">
                        <Upload.Dragger
                          style={{
                            borderRadius: 10,
                            padding: 30,
                          }}
                          name="projects"
                          {...uploadProps}
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
                          <Typography.Text style={{ color: styles.strawberry }}>
                            (Maximum file should be 3 MB)
                          </Typography.Text>
                        </Upload.Dragger>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col
                      xs={24}
                      md={20}
                      style={{ textAlign: "right" }}
                    >
                      <Button
                        htmlType="submit"
                        type="primary"
                        loading={isLoading}
                        disabled={!props.isValid || !props.dirty || fileList.length === 0}
                      >
                        Submit
                      </Button>
                    </Col>
                  </Row>
                </>
              )}
            </Form>
          );
        }}
      </Formik>
    </ContentWrapper>
  );
};
