import { Icon } from "@iconify/react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Space,
  Steps,
  Typography,
  Upload,
  UploadFile,
  UploadProps,
  Checkbox,
  Image,
  DatePicker,
  Modal,
  InputNumber,
  Divider,
  Switch,
  message,
} from "antd";
import { useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import * as yup from "yup";
import { ContentWrapper, DataTable, PDFViewer, WrapperCard } from "~/Components";
import styles from "../../Contract.module.scss";
import { ErrorMessage, Field, FieldProps, Formik } from "formik";
import { useAuth } from "~/Hooks/useAuth";
import { map } from "lodash";
import { useNotification } from "~/Hooks/useNotification";
import moment from "moment";
import upload from "@assets/SVG/upload.svg";
import { get, post, put } from "@services/api.service";
import SuccessModal from "~/Components/Modal/SuccessModal";
import CustomOptions from "../../SubModules/CustomOptions/CustomOptions";
import { numberToWord } from "../../../../Utils/CommonUtils";

interface FormItems {
  setSigningOrder: boolean;
  signers: {
    routingOrder: string;
    recipientType: string;
    name: string;
    email: string;
  }[];
  contracts: any;
  templateName: string;
  templateDescription: string;
  emailSubject: string;
  emailMessage: string;
  reminderEnabled: boolean;
  reminderFrequency: string;
  reminderDelay: string;
  expiryAfter: string;
  expiryWarn: string;
  // signerCanSignOnMobile: boolean;
  recipientLock: boolean;
  messageLock: boolean;
  allowComments: boolean;
}

const defaultValue = {
  signers: [
    {
      routingOrder: "",
      name: "",
      email: "",
      recipientType: "",
    },
  ],
  templateName: "",
  templateDescription: "",
  emailSubject: "",
  emailMessage: "",
  reminderEnabled: false,
  reminderFrequency: "0",
  reminderDelay: "0",
  expiryAfter: "120",
  expiryWarn: "0",
  // signerCanSignOnMobile: true,
  recipientLock: false,
  messageLock: false,
  allowComments: true,
} as FormItems;

const getItemText = (name: string, value: any, isBoolean?: any) => {
  return (
    <Space
      direction="vertical"
      style={{ marginBottom: styles.whitespace4 }}
    >
      <Typography.Text type="secondary">{name}</Typography.Text>
      <Typography.Text>{!isBoolean ? value : value ? "Enabled" : "Disabled"}</Typography.Text>
    </Space>
  );
};
const EqualCol = ({ children }: { children: ReactNode }) => (
  <Col
    xs={24}
    md={12}
  >
    {children}
  </Col>
);

var newDocId = 100;

export const AddNewTemplateDocument = () => {
  const [docsList, setDocsList] = useState<any>([]); // contains all files
  const { user } = useAuth();
  const { openToast, openNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [initialValue, setInitialValue] = useState<FormItems>(defaultValue);
  const [record, setRecord] = useState<any>({});
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>("");
  const { id } = useParams();
  const [loadingDocId, setLoadingDocId] = useState<string>("");
  const [deletedIds, setDeletedIds] = useState<any>([]);
  //2087
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      get(`v1/clm/template/${id}`)
        .then((res: any) => {
          res = res.response.data;
          setRecord(res);
          let signers = res.data.recipients.signers;
          signers.sort((a: any, b: any) => a.recipientId - b.recipientId);
          const values = {
            signers: signers.map((signer: any, index: number) => {
              return {
                name: signer.name,
                email: signer.email,
                recipientType: signer.recipientType,
                routingOrder: signer.routingOrder,
              };
            }),
            templateName: res.data.name,
            templateDescription: res.data.description,
            emailSubject: res.data.emailSubject,
            emailMessage: res.data.emailBlurb,
            reminderEnabled: res.data.notification.reminders.reminderEnabled === "true",
            reminderFrequency: res.data.notification.reminders.reminderFrequency,
            reminderDelay: res.data.notification.reminders.reminderDelay,
            expiryAfter: res.data.notification.expirations.expireAfter,
            expiryWarn: res.data.notification.expirations.expireWarn,
            // signerCanSignOnMobile: res.data.signerCanSignOnMobile === "true",
            recipientLock: res.data.recipientsLock === "true",
            messageLock: res.data.messageLock === "true",
            allowComments: res.data.allowComments === "true",
            setSigningOrder: false,
          } as FormItems;
          if (values.signers && values.signers[1] && values.signers[1].routingOrder === "2") {
            values.setSigningOrder = true;
          }
          setInitialValue(values);
          let tempDocsList: any = [];
          if (res.data && res.data.documents) {
            res.data.documents.map((doc: any, index: number) => {
              let obj: any = {};
              obj.name = doc.name;
              obj.fileExtension = "pdf";
              obj.documentId = doc.documentId;
              obj.documentBase64 = res.data.documents[index];
              obj.isNew = false;
              obj.file = null;
              tempDocsList.push(obj);
            });
          }
          setDocsList(tempDocsList);
          setIsLoading(false);
        })
        .catch(() => {
          openToast({
            content: "Getting data failed",
            type: "error",
          });
          setIsLoading(false);
        });
    }
  }, []);

  const convertToBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      if (file instanceof File) {
        const reader = new FileReader();
        reader.readAsDataURL(file as Blob);
        reader.onload = () => resolve(reader.result);
        ``;
        reader.onerror = (error) => reject(error);
      } else {
        resolve({});
      }
    });
  };

  const viewDocument = (envelope: any, index: number, isDownload = false) => {
    if (loadingDocId) return;
    setLoadingDocId(envelope.documentId);
    if (!envelope.isNew) {
      get(`v1/clm/getTemplateDocuments/${id}/${envelope.documentId}`).then((res: any) => {
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
      });
    } else {
      var byteCharacters = atob(envelope.documentBase64);
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
      setLoadingDocId("");
    }
  };

  const onSubmit = async (values: any) => {
    let signers = [...values.signers];
    signers.map((signer, sIndex: number) => {
      if (values.setSigningOrder) {
        signer.routingOrder = `${sIndex + 1}`;
      } else {
        signer.routingOrder = "1";
      }
    });
    const payload: any = {
      templateName: values.templateName,
      templateDescritpion: values.templateDescription,
      emailSubject: values.emailSubject,
      emailMessage: values.emailMessage,
      // signerCanSignONMobile: values.signerCanSignOnMobile,
      allowComments: values.allowComments,
      enforceSignerVisibility: true,
      recipientLock: values.recipientLock,
      messageLock: values.messageLock,
      signingOrder: signers.length > 1 ? values.setSigningOrder : false,
      reminders: {
        reminderFrequency: values.reminderFrequency,
        reminderDelay: values.reminderDelay,
        reminderEnabled: values.reminderEnabled,
      },
      expirations: {
        expiryWarn: values.expiryWarn,
        expiryAfter: values.expiryAfter,
        expiryEnabled: true,
      },
      signers: [...signers],
      status: "sent",
    };
    const formData = new FormData();
    if (deletedIds && deletedIds.length > 0) {
      formData.append("delete_id", deletedIds.join(","));
    }
    let createDocsList = [...docsList];
    createDocsList = createDocsList.filter((doc: any) => doc.file !== null);
    // add file/file_id if there is one
    createDocsList.map((fileInfo: any) => {
      formData.append("create-document-file", fileInfo.file);
    });
    if (createDocsList && createDocsList.length > 0) {
      formData.getAll("create-document-file");
    }
    formData.append("body", JSON.stringify(payload));
    setIsSubmitLoading(true);
    if (id) {
      formData.append("templateId", id);
      put(`v1/clm/update/template/${id}`, formData)
        .then((res: any) => {
          if (res) {
            openNotification({
              title: "Success",
              message: `Template updated successfully`,
              type: "success",
            });
            navigate(`/clm/templates`);
          }
          setIsSubmitLoading(false);
        })
        .catch((err) => {
          openNotification({
            title: err,
            message: "Template Updating failed",
            type: "error",
          });
          setIsSubmitLoading(false);
        });
    } else {
      post(`v1/clm/create/template`, formData)
        .then((res: any) => {
          if (res) {
            // openNotification({
            //   title: "Success",
            //   message: `Template created successfully`,
            //   type: "success",
            // });
            // navigate(`/clm/templates`);
            setShowSuccess(true);
            setName(values.templateName);
          }
          setIsSubmitLoading(false);
        })
        .catch((err) => {
          openNotification({
            title: err,
            message: "Template Creation failed",
            type: "error",
          });
          setIsSubmitLoading(false);
        });
    }
  };

  const handleRemove = (file: any) => {
    if (!file.isNew) {
      setDeletedIds([...deletedIds, file.documentId]);
    }
    const index = docsList.findIndex((doc: any) => doc.documentId === file.documentId);
    const newFileList = [...docsList];
    newFileList.splice(index, 1);
    setDocsList(newFileList);
  };

  const handleFileChange = async (info: any) => {
    const { file, documentId } = info;
    try {
      const base64String: any = await convertToBase64(file);
      const documentBase64 = base64String.toString().split(",")[1];
      const newFile = {
        documentBase64: documentBase64,
        documentId: `${documentId}`,
        fileExtension: file.type?.split("/")[1],
        name: file.name.split(".")[0],
        isNew: true,
        file: file,
      };
      setDocsList((prevList: any) => [...prevList, newFile]);
    } catch (error) {
      console.error("Error converting file to base64:", error);
    }
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => handleRemove(file),
    onChange: (info: any) => {
      newDocId++;
      info.documentId = newDocId;
      if (info.file.type === "application/pdf") {
        handleFileChange(info);
      } else {
        message.error("Incorrect format, only PDF files are allowed");
      }
    },
    beforeUpload: (file) => {
      // handleFileChange(file);
      return false;
    },
    // fileList,
  };

  const stepItems: any = [
    {
      key: 0,
      item: "Template Information",
      title: "Template Information",
      icon: <Icon icon={currentStep > 0 ? "charm:tick" : "mdi:form"} />,
    },
    {
      key: 1,
      item: "Contract Documents",
      title: "Contract Documents",
      icon: <Icon icon={currentStep > 0 ? "charm:tick" : "mdi:file-document-outline"} />,
    },
    {
      key: 2,
      item: "Signers",
      title: "Signers",
      icon: <Icon icon={currentStep > 1 ? "charm:tick" : "mdi:file-sign"} />,
    },
    {
      key: 3,
      item: "Review & Submit",
      title: "Review & Submit",
      icon: <Icon icon={currentStep > 3 ? "charm:tick" : "mdi:application-edit-outline"} />,
    },
  ];
  const validationSchema1 = yup.object().shape({
    templateName: yup
      .string()
      .trim("Template Name cannot include leading and trailing spaces")
      .strict(true)
      .required("Template Name required")
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9_\s]*[a-zA-Z0-9])?$/, "Invalid Template Name"),
    templateDescription: yup
      .string()
      .trim("Template Description cannot include leading and trailing spaces")
      .strict(true)
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9\s_]*[a-zA-Z0-9])?$/,"Only alphabets and numbers are allowed")
      .required("Template Description required"),
    emailSubject: yup
      .string()
      .trim("Email Subject cannot include leading and trailing spaces")
      .strict(true)
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9_\s]*[a-zA-Z0-9])?$/, "Invalid email subject")
      .required("Email Subject required"),
    emailMessage: yup
      .string()
      .trim("Email Message cannot include leading and trailing spaces")
      .strict(true)
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9_\s]*[a-zA-Z0-9])?$/, "Invalid email message")
      .required("Email Message required"),
  });

  const validationSchema2 = yup.object().shape({
    signers: yup
      .array()
      .of(
        yup.object().shape({
          name: yup
            .string()
            .trim("Name cannot include leading and trailing spaces")
            .strict(true)
            .required("Name required")
            .matches(/^[a-zA-Z\s]+$/, "Invalid Name"),
          // .matches(new RegExp(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/), "Invalid Name"),
          email: yup
            .string()
            .strict(true)
            .trim("Email address cannot include leading and trailing spaces")
            .lowercase("Email address must be a lowercase")
            .email("Email address must be a valid email")
            .test('no-leading-special-characters', 'Email address cannot start with special characters', value => {
              if (!value) return true;
              return /^[a-zA-Z0-9]/.test(value);
          })
            .required("Email address required"),
        })
      )
      .test({
        test: function (signers: any) {
          const emailMap = new Map();
          const duplicateEmails = new Set();

          for (const signer of signers) {
            const { email } = signer;

            if (emailMap.has(email)) {
              duplicateEmails.add(email);
            }

            emailMap.set(email, (emailMap.get(email) || 0) + 1);
          }

          if (duplicateEmails.size > 0) {
            const errors = [];

            for (let i = 0; i < signers.length; i++) {
              const signer = signers[i];
              const { email } = signer;

              if (emailMap.get(email) > 1) {
                errors.push(
                  this.createError({
                    message: "Duplicate email found",
                    path: `signers[${i}].email`,
                  })
                );
              }
            }

            if (errors.length > 0) {
              throw new yup.ValidationError(errors);
            }
          }

          return true;
        },
      }),
  });

  const validationSchema = useMemo(() => {
    if (currentStep === 0) {
      return validationSchema1;
    } else {
      return validationSchema2;
    }
  }, [currentStep]);

  return (
    <>
      <SuccessModal
        open={showSuccess}
        onClose={() => navigate("/clm/templates")}
        content={
          <Typography.Text style={{ textAlign: "center" }}>
            Template successfully {id ? "updated" : "created"} for
            <b> {name}</b>
          </Typography.Text>
        }
      />
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
                {id ? "Edit" : "Create"} Template
              </Typography.Title>
            </span>
          </Space>
        }
      >
        <Formik
          initialValues={initialValue}
          onSubmit={(values) => onSubmit(values)}
          validationSchema={validationSchema}
        >
          {(props) => {
            return (
              <>
                <CustomOptions
                  setOpen={setOpen}
                  open={open}
                  {...props}
                />{" "}
                <Form
                  layout="vertical"
                  onFinish={props.handleSubmit}
                >
                  <Steps
                    current={currentStep}
                    items={stepItems}
                    labelPlacement="vertical"
                    size="default"
                    responsive
                  />
                  <Row style={{ marginTop: 16 }}>
                    <Col
                      xs={24}
                      md={currentStep === 3 ? 24 : 16}
                    >
                      {currentStep === 0 && (
                        <>
                          <Row>
                            <Col span={12}>
                              <div style={{ textAlign: "left" }}>
                                <Typography.Title
                                  level={4}
                                  style={{ marginBottom: styles.whitesapce3 }}
                                >
                                  Template Details
                                </Typography.Title>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div style={{ textAlign: "right" }}>
                                <Button
                                  type="default"
                                  onClick={() => setOpen(true)}
                                >
                                  Custom Options
                                </Button>
                              </div>
                            </Col>
                          </Row>

                          <Row
                            align="top"
                            style={{ marginBottom: styles.whitespace3 }}
                          >
                            <Col span={24}>
                              <Form.Item label="Template Name">
                                <Field name={`templateName`}>
                                  {({ field }: FieldProps) => (
                                    <Input
                                      {...field}
                                      status={
                                        (props.touched.templateName && props.errors.templateName && "error") || ""
                                      }
                                    />
                                  )}
                                </Field>
                                <Typography.Text type="danger">
                                  <ErrorMessage name={`templateName`} />
                                </Typography.Text>
                              </Form.Item>
                              <Form.Item label="Template Description">
                                <Field name={`templateDescription`}>
                                  {({ field }: FieldProps) => (
                                    <Input.TextArea
                                      {...field}
                                      rows={8}
                                      showCount
                                      maxLength={240}
                                      style={{ height: "100px" }}
                                      size="large"
                                      status={
                                        (props.touched.templateDescription &&
                                          props.errors.templateDescription &&
                                          "error") ||
                                        ""
                                      }
                                    />
                                  )}
                                </Field>
                                <Typography.Text type="danger">
                                  <ErrorMessage name={`templateDescription`} />
                                </Typography.Text>
                              </Form.Item>
                              <Form.Item label="Email Subject">
                                <Field name={`emailSubject`}>
                                  {({ field }: FieldProps) => (
                                    <Input
                                      {...field}
                                      status={
                                        (props.touched.emailSubject && props.errors.emailSubject && "error") || ""
                                      }
                                    />
                                  )}
                                </Field>
                                <Typography.Text type="danger">
                                  <ErrorMessage name={`emailSubject`} />
                                </Typography.Text>
                              </Form.Item>
                              <Form.Item label="Email Message">
                                <Field name={`emailMessage`}>
                                  {({ field }: FieldProps) => (
                                    <Input.TextArea
                                      rows={8}
                                      showCount
                                      maxLength={240}
                                      style={{ height: "100px" }}
                                      size="large"
                                      {...field}
                                      status={
                                        (props.touched.emailMessage && props.errors.emailMessage && "error") || ""
                                      }
                                    />
                                  )}
                                </Field>
                                <Typography.Text type="danger">
                                  <ErrorMessage name={`emailMessage`} />
                                </Typography.Text>
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      )}
                      {currentStep === 1 && (
                        <Row style={{ marginBottom: 16 }}>
                          <Col
                            xs={24}
                            md={24}
                          >
                            <Typography.Title
                              level={4}
                              style={{ marginBottom: styles.whitesapce3 }}
                            >
                              Contract Documents
                            </Typography.Title>
                          </Col>

                          <Col
                            xs={24}
                            md={16}
                            style={{ marginBottom: 16 }}
                          >
                            <Typography.Text>
                              <span>
                                <Icon
                                  icon="arcticons:documents"
                                  fontSize={24}
                                  style={{ color: styles.strawberry }}
                                />
                              </span>
                              Please upload your files
                            </Typography.Text>
                          </Col>
                          <Row style={{ width: "100%" }}>
                            <Col
                              xs={24}
                              md={16}
                              style={{ marginTop: styles.whitesapce3 }}
                            >
                              <Form.Item label="">
                                <Upload.Dragger
                                  style={{
                                    borderRadius: 10,
                                    padding: 30,
                                  }}
                                  name="projects"
                                  showUploadList={false}
                                  {...uploadProps}
                                  multiple={true}
                                  // maxCount={10}
                                  accept=".pdf"
                                >
                                  <Image
                                    src={upload}
                                    preview={false}
                                  />
                                  <br />
                                  <Typography.Text>
                                    Only PDF files are allowed
                                    <br />
                                  </Typography.Text>
                                  <Typography.Text style={{ color: styles.strawberry }}>
                                    (Maximum file should be 3 MB)
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
                              {map(docsList, (item: any, index: number) => (
                                <div key={index}>
                                  <Space
                                    style={{
                                      marginBottom: styles.whitespace3,
                                    }}
                                  >
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
                                      style={{
                                        marginLeft: 16,
                                        marginRight: 8,
                                      }}
                                      onClick={() => viewDocument(item, index)}
                                    />
                                    <Icon
                                      icon="material-symbols:download"
                                      inline
                                      className="doc-icon"
                                      fontSize={24}
                                      style={{
                                        marginLeft: 8,
                                        marginRight: 8,
                                      }}
                                      cursor="pointer"
                                      onClick={() => viewDocument(item, index, true)}
                                    />
                                    <Icon
                                      icon="ic:outline-delete"
                                      inline
                                      className="doc-icon"
                                      fontSize={24}
                                      style={{
                                        marginLeft: 8,
                                        marginRight: 8,
                                      }}
                                      cursor="pointer"
                                      onClick={() => handleRemove(item)}
                                    />
                                    {loadingDocId === item.documentId && (
                                      <Icon
                                        icon="eos-icons:bubble-loading"
                                        inline
                                        className="doc-icon"
                                        fontSize={24}
                                        style={{
                                          marginLeft: 12,
                                          marginRight: 12,
                                        }}
                                      />
                                    )}
                                  </Space>
                                </div>
                              ))}
                            </Col>
                          </Row>
                        </Row>
                      )}
                      {currentStep === 2 && (
                        <div
                          style={{
                            width: "100%",
                            // maxHeight: 300,
                            // overflowY: "auto",
                            // overflowX: "hidden",
                            marginBottom: 16,
                          }}
                        >
                          <Typography.Title
                            level={4}
                            style={{ marginBottom: styles.whitesapce3 }}
                          >
                            Signers Details
                          </Typography.Title>
                          {props.values.signers.length > 1 && (
                            <Form.Item className="mb-0">
                              <Space>
                                <Checkbox
                                  name="setSigningOrder"
                                  checked={props.values.setSigningOrder}
                                  value={props.values.setSigningOrder}
                                  onChange={(e) => {
                                    props.setValues({
                                      ...props.values,
                                      setSigningOrder: e.target.checked,
                                    });
                                  }}
                                />
                                Set Signing Order
                              </Space>
                            </Form.Item>
                          )}

                          {props.values.signers.map((signer, i) => (
                            <Row
                              gutter={[16, 16]}
                              align="top"
                              key={i}
                            >
                              <Col span={11}>
                                <Form.Item label="Name">
                                  <Field name={`signers[${i}].name`}>
                                    {({ field }: FieldProps) => (
                                      <Input
                                        {...field}
                                        autoComplete="off"
                                      />
                                    )}
                                  </Field>
                                  <Typography.Text type="danger">
                                    <ErrorMessage name={`signers[${i}].name`} />
                                  </Typography.Text>
                                </Form.Item>
                              </Col>
                              <Col span={11}>
                                <Form.Item label="Email">
                                  <Field name={`signers[${i}].email`}>
                                    {({ field }: FieldProps) => (
                                      <Input
                                        {...field}
                                        autoComplete="off"
                                      />
                                    )}
                                  </Field>
                                  <Typography.Text type="danger">
                                    <ErrorMessage name={`signers[${i}].email`} />
                                  </Typography.Text>
                                </Form.Item>
                              </Col>
                              <Col span={2}>
                                <Form.Item label=" ">
                                  <Button
                                    type="link"
                                    danger
                                    disabled={[...props.values.signers].length === 1}
                                    onClick={() => {
                                      const signers = [...props.values.signers];
                                      signers.splice(i, 1);
                                      props.setValues({
                                        ...props.values,
                                        signers,
                                        setSigningOrder: signers.length === 1 ? false : props.values.setSigningOrder,
                                      });
                                    }}
                                  >
                                    {" "}
                                    <Icon
                                      icon="fluent:delete-16-regular"
                                      style={{
                                        color: styles.strawberry,
                                        cursor: "pointer",
                                        fontSize: 20,
                                      }}
                                    />
                                  </Button>
                                </Form.Item>
                              </Col>
                            </Row>
                          ))}
                          <Row gutter={16}>
                            <Col
                              span={24}
                              style={{ textAlign: "right", marginBottom: 16 }}
                            >
                              <Button
                                type="text"
                                icon={<Icon icon="akar-icons:plus" />}
                                disabled={props.values.signers.some((val) => val.name === "" || val.email === "")} //This change is related to SAAS-1815
                                onClick={() => {
                                  let signers = [
                                    ...props.values.signers,
                                    {
                                      name: "",
                                      email: "",
                                      routingOrder: "",
                                      recipientType: "",
                                    },
                                  ];
                                  props.setValues({
                                    ...props.values,
                                    signers: signers,
                                  });
                                  setTimeout(() => {
                                    let index = signers.length - 1;
                                    props.setFieldTouched(`signers[${index}].name`, false);
                                    props.setFieldTouched(`signers[${index}].email`, false);
                                  }, 0);
                                }}
                              >
                                Add signer
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      )}
                      {currentStep === 3 && (
                        <>
                          <Row style={{ marginBottom: styles.whitespace3 }}>
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
                                    onClick={() => setCurrentStep(0)}
                                  />
                                }
                              >
                                <Row>
                                  <Col
                                    xs={24}
                                    md={8}
                                  >
                                    {getItemText("Template Name", props.values.templateName)}
                                  </Col>
                                  <Col
                                    xs={24}
                                    md={8}
                                  >
                                    {getItemText("Template Description", props.values.templateDescription)}
                                  </Col>
                                  <Col
                                    xs={24}
                                    md={8}
                                  >
                                    {getItemText("Email Subject", props.values.emailSubject)}
                                  </Col>
                                  <Col
                                    xs={24}
                                    md={8}
                                  >
                                    {getItemText("Email Message", props.values.emailMessage)}
                                  </Col>
                                </Row>
                                <Row>
                                  <Col
                                    xs={24}
                                    md={24}
                                  >
                                    <Typography.Title
                                      level={5}
                                      style={{ margin: 4 }}
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
                                      reminders
                                    </Typography.Title>
                                  </Col>
                                  <Col
                                    xs={24}
                                    md={6}
                                  >
                                    {getItemText("Send Automatic Reminders", props.values.reminderEnabled, true)}
                                  </Col>
                                  <Col
                                    xs={24}
                                    md={6}
                                  >
                                    {getItemText(
                                      "Days until first reminder",
                                      props.values.reminderEnabled ? props.values.reminderFrequency + " day(s)" : "-"
                                    )}
                                  </Col>

                                  <Col
                                    xs={24}
                                    md={12}
                                  >
                                    {getItemText(
                                      "Days between reminders",
                                      props.values.reminderEnabled ? props.values.reminderDelay + " day(s)" : "-"
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
                                      style={{ margin: 4 }}
                                    >
                                      Expiration
                                    </Typography.Title>
                                  </Col>
                                  <Col
                                    xs={24}
                                    md={6}
                                  >
                                    {getItemText(
                                      "Document will expire on:",
                                      moment().add(Number(props.values.expiryAfter), "days").format("DD MMM YYYY")
                                    )}
                                  </Col>
                                  <Col
                                    xs={24}
                                    md={12}
                                  >
                                    {getItemText(
                                      "Days to warn signers before expiration:",
                                      props.values.expiryWarn + " day(s)"
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
                                      style={{ margin: 4 }}
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
                                      props.values.signerCanSignOnMobile,
                                      true
                                    )}
                                  </Col> */}
                                  <Col
                                    xs={24}
                                    md={12}
                                  >
                                    {getItemText("Comments", props.values.allowComments, true)}
                                  </Col>
                                </Row>
                                <Row>
                                  <Col
                                    xs={24}
                                    md={24}
                                  >
                                    <Typography.Title
                                      level={5}
                                      style={{ margin: 4 }}
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
                                      props.values.recipientLock,
                                      true
                                    )}
                                  </Col>
                                  <Col
                                    xs={24}
                                    md={12}
                                  >
                                    {getItemText(
                                      "Restrict sender from editing subject, email, or private message",
                                      props.values.messageLock,
                                      true
                                    )}
                                  </Col>
                                </Row>
                              </WrapperCard>
                            </Col>
                            <Col
                              span={24}
                              style={{ marginBottom: styles.whitespace3 }}
                            >
                              <Space size="large">
                                <Typography.Title
                                  level={4}
                                  style={{ marginBottom: styles.whitesapce3 }}
                                >
                                  Contract Documents
                                </Typography.Title>
                                <Icon
                                  icon="carbon:edit"
                                  style={{
                                    color: styles.strawberry,
                                    cursor: "pointer",
                                    fontSize: 20,
                                    verticalAlign: "middle",
                                  }}
                                  onClick={() => setCurrentStep(1)}
                                />
                              </Space>
                              {map(docsList, (file, fIndex: number) => (
                                <Col
                                  span={24}
                                  style={{ marginBottom: styles.whitespace1 }}
                                  key={fIndex}
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
                                    </Space>
                                  </Typography.Text>
                                </Col>
                              ))}
                            </Col>
                          </Row>
                          <Col
                            span={24}
                            style={{ marginBottom: styles.whitespace3 }}
                          >
                            <WrapperCard
                              title="Signers List"
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
                                  onClick={() => setCurrentStep(2)}
                                />
                              }
                            >
                              <Col span={24}>
                                <DataTable
                                  height={
                                    props.values.signers?.length * 40 + 100 < 400
                                      ? props.values.signers.length * 80 + 100
                                      : 400
                                  }
                                  multiSelect={false}
                                  tableData={map(props.values.signers, (signers) => ({
                                    ...signers,
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
                                    // {
                                    //   key: "role",
                                    //   dataIndex: "recipientType",
                                    //   title: "Role",
                                    //   render: (
                                    //     value: any,
                                    //     record: any,
                                    //     index: any
                                    //   ) =>
                                    //     index === 0 ? "Reviewer" : "Signer",
                                    //   ellipsis: true,
                                    //   sorter: (a: any, b: any) =>
                                    //     a.name.localeCompare(b.name),
                                    // },
                                    {
                                      key: "routingOrder",
                                      dataIndex: "routingOrder",
                                      title: "Signing Order",
                                      render: (value: any, record: any, index: any) =>
                                        props.values.setSigningOrder ? numberToWord(index) + " Signer" : "-",
                                      // ellipsis: true,
                                      // sorter: (a: any, b: any) =>
                                      //   a.name.localeCompare(b.name),
                                    },
                                  ]}
                                  showTopBar={false}
                                />
                              </Col>
                            </WrapperCard>
                          </Col>
                        </>
                      )}
                      <Row>
                        <Col
                          xs={24}
                          md={24}
                          style={{ textAlign: "right" }}
                        >
                          {currentStep === 3 && (
                            <Space>
                              <Button
                                type="default"
                                onClick={() => setCurrentStep((current) => current - 1)}
                              >
                                Back
                              </Button>
                              <Button
                                htmlType="submit"
                                type="primary"
                                loading={isSubmitLoading}
                                disabled={!props.isValid}
                              >
                                Submit
                              </Button>
                            </Space>
                          )}

                          {currentStep < 3 && (
                            <Space>
                              {currentStep > 0 && (
                                <Button
                                  type="default"
                                  disabled={currentStep === 0}
                                  onClick={() => setCurrentStep((current) => current - 1)}
                                >
                                  Back
                                </Button>
                              )}
                              <Button
                                type="primary"
                                disabled={
                                  currentStep !== 1
                                    ? id
                                      ? !props.isValid
                                      : !(props.isValid && props.dirty) || (currentStep == 2 && !props.touched.signers)
                                    : docsList.length === 0
                                }
                                onClick={() => setCurrentStep((current) => current + 1)}
                              >
                                Next
                              </Button>
                            </Space>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </>
            );
          }}
        </Formik>
      </ContentWrapper>
    </>
  );
};
