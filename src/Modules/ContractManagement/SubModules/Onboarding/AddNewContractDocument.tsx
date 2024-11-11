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
  InputNumber,
  Select,
  Modal,
  message,
} from "antd";
import { useState, ReactNode, useCallback, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import * as yup from "yup";
import { ContentWrapper, DataTable, WrapperCard, PDFViewer } from "~/Components";
import styles from "../../Contract.module.scss";
import { ErrorMessage, Field, FieldProps, Formik, FormikTouched, useFormik } from "formik";
import { useAuth } from "~/Hooks/useAuth";
import { filter, map, some } from "lodash";
import { useNotification } from "~/Hooks/useNotification";
import moment from "moment";
import upload from "@assets/SVG/upload.svg";
import CustomOptions from "../CustomOptions/CustomOptions";
import { get, post } from "@services/api.service";
import { numberToWord } from "~/Utils/CommonUtils";

interface FormItems {
  setSigningOrder: boolean;
  signers: {
    name: string;
    email: string;
    routingOrder: string;
    recipientType: string;
  }[];
  watchers: {
    name: string;
    email: string;
  }[];
  reviewerName: string;
  reviewerEmail: string;
  startDate: string;
  endDate: string;
  templateId: string;
  templateName: string;
  templateDescription: string;
  contractName: string;
  contractPeriod: string;
  emailSubject: string;
  emailMessage: string;
  renewalReminderNotification: string;
  reminderEnabled: boolean;
  reminderFrequency: string;
  reminderDelay: string;
  expiryAfter: string;
  expiryOn: string;
  expiryWarn: string;
  // signerCanSignOnMobile: boolean;
  recipientLock: boolean;
  messageLock: boolean;
  allowComments: boolean;
}

const defaultValue = {
  signers: [
    {
      routingOrder: "1",
      name: "",
      email: "",
      recipientType: "",
    },
  ],
  watchers: [
    {
      name: "",
      email: "",
    },
  ],
  expiryOn: "",
  templateId: "",
  templateName: "",
  templateDescription: "",
  contractName: "",
  startDate: "",
  endDate: "",
  contractPeriod: "",
  renewalReminderNotification: "",
  emailSubject: "",
  emailMessage: "",
  reminderEnabled: false,
  reminderFrequency: "0",
  reminderDelay: "0",
  expiryAfter: "120",
  expiryWarn: "0",
  // signerCanSignOnMobile: false,
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

export const AddNewContractDocument = () => {
  const [docsList, setDocsList] = useState<any>([]); // contains all files
  const [record, setRecord] = useState<any>({});
  const { user } = useAuth();
  const [isSubmitLoading, setSubmitLoading] = useState(false);
  const { openNotification } = useNotification();
  const [currentStep, setCurrentStep] = useState(0);
  const [isloading, setIsLoading] = useState(false);
  const [templateId, setTemplateId] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [initialValues, setInitialValues] = useState<FormItems>(defaultValue);
  const navigate = useNavigate();
  const { openToast } = useNotification();
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingDocId, setLoadingDocId] = useState<string>("");
  const [deletedIds, setDeletedIds] = useState<any>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>("");

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
  //2087
  const getRecords = useCallback(() => {
    get("v1/clm/get/templates")
      .then((res: any) => {
        if (res.status === "OK") {
          if (res && res.response.data && res.response.data) {
            setTemplateList(res.response.data);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({
          content: "Getting Templates failed",
          type: "error",
        });
        setIsLoading(false);
      });
  }, []);

  const getTemplateRecords = (values: any, e: any) => {
    if (e) {
      setIsLoading(true);
      get(`v1/clm/template/${e}`)
        .then((res: any) => {
          res = res.response.data;
          setRecord(res.data);
          let signers: any = [
            // {
            //   name: "",
            //   email: "",
            //   routingOrder: "",
            //   recipientType: "",
            // },
          ];
          let setSigningOrder = false;
          res.data.recipients.signers.map((signer: any, index: number) => {
            if (index === 1 && signer.routingOrder === "2") {
              setSigningOrder = true;
            }
            signers.push({
              name: signer.name,
              email: signer.email,
              recipientType: signer.recipientType,
              routingOrder: index,
            });
          });

          setInitialValues({
            ...values,
            templateId: e,
            emailSubject: res.data.emailSubject,
            templateName: res.data.name,
            templateDescription: res.data.templateDescription,
            emailMessage: res.data.emailBlurb,
            reminderEnabled: res.data.notification.reminders.reminderEnabled === "true",
            reminderFrequency: res.data.notification.reminders.reminderFrequency,
            reminderDelay: res.data.notification.reminders.reminderDelay,
            expiryAfter: res.data.notification.expirations.expireAfter,
            expiryOn: moment().add(res.data.notification.expirations.expireAfter, "days").format("DD MMM YYYY"),
            expiryWarn: res.data.notification.expirations.expireWarn,
            // signerCanSignOnMobile: res.data.signerCanSignOnMobile === "true",
            recipientLock: res.data.recipientsLock === "true",
            messageLock: res.data.messageLock === "true",
            allowComments: res.data.allowComments === "true",
            signers: signers,
            setSigningOrder: setSigningOrder,
            contractPeriod: res.data.contractPeriod,
          });
          setIsLoading(false);
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
        })
        .catch(() => {
          openToast({
            content: "Getting data failed",
            type: "error",
          });
          setIsLoading(false);
        });
    }
  };

  const viewDocument = (envelope: any, index: number, isDownload = false) => {
    if (loadingDocId) return;
    setLoadingDocId(envelope.documentId);
    if (!envelope.isNew) {
      get(`v1/clm/getTemplateDocuments/${templateId}/${envelope.documentId}`).then((res: any) => {
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
  useEffect(() => {
    getRecords();
    setIsLoading(true);
  }, [getRecords]);

  const onSubmit = async (values: any) => {
    let signers: any = [...values.signers];
    if (values.reviewerName && values.reviewerEmail) {
      signers.unshift({ name: values.reviewerName, email: values.reviewerEmail, routingOrder: "1", recipientType: "" });
    }
    signers.map((signer: any, sIndex: number) => {
      if (values.setSigningOrder) {
        signer.routingOrder = `${sIndex + 1}`;
      } else {
        if (values.reviewerName && values.reviewerEmail) {
          if (sIndex === 0) {
            signer.routingOrder = "1";
          } else {
            signer.routingOrder = "2";
          }
        } else {
          signer.routingOrder = "1";
        }
      }
    });
    const payload: any = {
      emailSubject: values.emailSubject,
      emailMessage: values.emailMessage,
      // signerCanSignONMobile: values.signerCanSignONMobile,
      allowComments: values.allowComments,
      enforceSignerVisibility: true,
      recipientLock: values.recipientLock || false,
      messageLock: values.messageLock || false,
      reminders: {
        reminderFrequency: values.reminderFrequency,
        reminderDelay: values.reminderDelay,
        reminderEnabled: values.reminderEnabled,
      },
      expirations: {
        expireWarn: values.expiryWarn,
        expireAfter: values.expiryAfter,
        expireEnabled: true,
      },
      contractEndDate: moment(values.endDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      contractName: values.contractName,
      contractPeriod: values.contractPeriod,
      contractStartDate: moment(values.startDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      renewalReminderNotification: values.renewalReminderNotification,
      // templateId: values.templateId,
      recipients: {
        signers: [...signers],
        cc: filter(values.watchers, (watcher) => watcher.name && watcher.email && watcher),
      },
      signingOrder: values.setSigningOrder,
      status: "sent",
    };
    const formData = new FormData();
    formData.append("templateId", values.templateId);
    if (deletedIds && deletedIds.length > 0) {
      formData.append("delete_id", deletedIds.join(","));
    }
    let allDocsList = [...docsList];
    let createDocsList = allDocsList.filter((doc: any) => doc.file !== null);
    let existingDocsList = allDocsList.filter((doc: any) => doc.file === null);
    if (existingDocsList && existingDocsList.length > 0) {
      let create_id = existingDocsList.map((item: any) => item.documentId).join(",");
      formData.append("create_id", create_id);
    }
    // add file/file_id if there is one
    createDocsList.map((fileInfo: any) => {
      formData.append("create-document-file", fileInfo.file);
    });
    if (createDocsList && createDocsList.length > 0) {
      formData.getAll("create-document-file");
    }
    formData.append("body", JSON.stringify(payload));
    setSubmitLoading(true);
    post("v1/clm/addcontract", formData)
      .then((res: any) => {
        if (res) {
          openNotification({
            title: "Success",
            message: `${values.contractName} is Onboarded successfully`,
            type: "success",
          });
          navigate(`/clm/contracts`);
        }
        setSubmitLoading(false);
      })
      .catch((err) => {
        openNotification({
          title: err,
          message: "",
          type: "error",
        });
        setSubmitLoading(false);
      });
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
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
      const isPdf = file.type === "application/pdf";
      return false;
    },
    // fileList,
  };

  const dayChange = (props: any, startDate: any, endDate: any) => {
    if (startDate && endDate) {
      const contractDays = moment(endDate, "DD/MM/YYYY").diff(moment(startDate, "DD/MM/YYYY"), "days");
      props.setFieldValue("contractPeriod", contractDays);
    }
  };

  const stepItems: any = [
    {
      key: 0,
      item: "Contract Information",
      title: "Contract Information",
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
      title: "Reviewer & Signers",
      icon: <Icon icon={currentStep > 1 ? "charm:tick" : "mdi:file-sign"} />,
    },
    {
      key: 3,
      item: "Watchers",
      title: "Watchers",
      icon: <Icon icon={currentStep > 2 ? "charm:tick" : "akar-icons:eye-open"} />,
    },
    {
      key: 4,
      item: "Review & Submit",
      title: "Review & Submit",
      icon: <Icon icon={currentStep > 3 ? "charm:tick" : "mdi:application-edit-outline"} />,
    },
  ];
  const validationSchema1 = yup.object().shape({
    templateId: yup.string().required("Template name is required"),
    emailSubject: yup
      .string()
      .trim("Email Subject cannot include leading and trailing spaces")
      .strict(true)
      .required("Email Subject is required"),
    contractName: yup
      .string()
      .trim("Contract Name cannot include leading and trailing spaces")
      .strict(true)
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9\s_]*[a-zA-Z0-9])?$/, "Only alphabets and numbers are allowed for contract name ")
      .required("Contract Name is required"),
    startDate: yup.string().required("Start date required"),
    endDate: yup
      .string()
      .required("End date required")
      .test("end-date", "End date should not be earlier than the start date", function (endDate: any) {
        const startDate = this.resolve(yup.ref("startDate"));
        if (startDate && endDate) {
          const start = moment(startDate, "DD/MM/YYYY");
          const end = moment(endDate, "DD/MM/YYYY");
          return end.isAfter(start);
        }
        return true;
      }),
    emailMessage: yup
      .string()
      .trim("Email Message cannot include leading and trailing spaces")
      .strict(true)
      .required("Email Message is required"),
    renewalReminderNotification: yup
      .string()
      .strict(true)
      .required("Reminder Notification required")
      .min(0, "Reminder Notification should be greater than or equal to 0")
      .matches(new RegExp(/^[1-9]\d*$/), "Number should not be decimal Value or negative value")
      .when("contractPeriod", (contractPeriod, schema) => {
        return schema.test({
          test: (value: any) => {
            if (!contractPeriod || value < 0) {
              return false;
            }
            if (contractPeriod && value) {
              const renewalReminder = parseInt(value, 10);
              const tenure = parseInt(contractPeriod, 10);
              return renewalReminder <= tenure;
            }
            return true;
          },
          message: "Reminder Notification should not be greater than Contract Tenure",
        });
      }),
  });

  const validationSchema2 = yup.object().shape({
    reviewerName: yup
      .string()
      .trim("Name cannot include leading and trailing spaces")
      .strict(true)
      .test("name-and-email", "Name is required when Email is provided", function (value) {
        const reviewerEmail = this.parent.reviewerEmail;
        if (reviewerEmail && !value) {
          return false;
        }
        return true;
      })
      .matches(/^[a-zA-Z\s]+$/, "Invalid Name"),
    // .matches(new RegExp(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/), "Invalid Name"),
    reviewerEmail: yup
      .string()
      .lowercase("Email address must be a lowercase")
      .strict(true)
      .email("Email address must be a valid email")
      .test('no-leading-special-characters', 'Email address cannot start with special characters', value => {
        if (!value) return true;
        return /^[a-zA-Z0-9]/.test(value);
    })
      .test("name-and-email", "Email is required when Name is provided", function (value) {
        const reviewerName = this.parent.reviewerName;
        if (reviewerName && !value) {
          return false;
        }
        return true;
      })
      .test("duplicate-email", "Duplicate email found in signers or watchers", function (value) {
        if (value) {
          const signersEmails = this.parent.signers.map((signer: any) => signer.email);
          const watchersEmails = this.parent.watchers.map((watcher: any) => watcher.email);

          const duplicateEmails = [...signersEmails, ...watchersEmails].filter((email) => email === value);

          return duplicateEmails.length === 0;
        } else {
          return true;
        }
      }),
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
            .lowercase("Email address must be a lowercase")
            .email("Email address must be a valid email")
            .strict(true)
            .test('no-leading-special-characters', 'Email address cannot start with special characters', value => {
              if (!value) return true;
              return /^[a-zA-Z0-9]/.test(value);
          })
            .required("Email required"),
        })
      )
      .test({
        test: function (signers: any) {
          const emailMap = new Map();
          const duplicateEmails = new Set();
          const watchers = this.parent.watchers || []; // Access the `signers` array
          const reviewerEmail = this.parent.reviewerEmail; // Access the `signers` array

          for (const signer of watchers) {
            const { email } = signer;
            emailMap.set(email, (emailMap.get(email) || 0) + 1);
          }

          for (const watcher of signers) {
            const { email } = watcher;

            if (emailMap.has(email)) {
              duplicateEmails.add(email);
            }

            emailMap.set(email, (emailMap.get(email) || 0) + 1);
          }
          if (reviewerEmail && emailMap.has(reviewerEmail)) {
            duplicateEmails.add(reviewerEmail);
            emailMap.set(reviewerEmail, (emailMap.get(reviewerEmail) || 0) + 1);
          }

          if (duplicateEmails.size > 0) {
            const errors = [];

            for (let i = 0; i < signers.length; i++) {
              const watcher = signers[i];
              const { email } = watcher;

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

  const validationSchema3 = yup.object().shape({
    watchers: yup
      .array()
      .of(
        yup.object().shape({
          name: yup
            .string()
            .trim("Name cannot include leading and trailing spaces")
            .strict(true)
            .required("Name required")
            // .matches(new RegExp(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/), "Invalid Name"),
            .matches(/^[a-zA-Z\s]+$/, "Invalid Name"),

          email: yup
            .string()
            .lowercase("Email address must be a lowercase")
            .email("Email address must be a valid email")
            .strict(true)
            .test('no-leading-special-characters', 'Email address cannot start with special characters', value => {
              if (!value) return true;
              return /^[a-zA-Z0-9]/.test(value);
          })
            .required("Email required"),
        })
      )
      .test({
        test: function (watchers: any) {
          const emailMap = new Map();
          const duplicateEmails = new Set();
          const signers = this.parent.signers || []; // Access the `signers` array
          const reviewerEmail = this.parent.reviewerEmail; // Access the `signers` array

          for (const signer of signers) {
            const { email } = signer;
            emailMap.set(email, (emailMap.get(email) || 0) + 1);
          }

          for (const watcher of watchers) {
            const { email } = watcher;

            if (emailMap.has(email)) {
              duplicateEmails.add(email);
            }

            emailMap.set(email, (emailMap.get(email) || 0) + 1);
          }

          if (reviewerEmail && emailMap.has(reviewerEmail)) {
            duplicateEmails.add(reviewerEmail);
            emailMap.set(reviewerEmail, (emailMap.get(reviewerEmail) || 0) + 1);
          }
          if (duplicateEmails.size > 0) {
            const errors = [];

            for (let i = 0; i < watchers.length; i++) {
              const watcher = watchers[i];
              const { email } = watcher;

              if (emailMap.get(email) > 1) {
                errors.push(
                  this.createError({
                    message: "Duplicate email found",
                    path: `watchers[${i}].email`,
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
        loading={isloading}
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
                Add Contract Document
              </Typography.Title>
            </span>
          </Space>
        }
      >
        <Formik
          initialValues={initialValues}
          onSubmit={(values) => onSubmit(values)}
          validationSchema={
            (currentStep === 0 && validationSchema1) ||
            (currentStep === 2 && validationSchema2) ||
            (currentStep === 3 && validationSchema3)
          }
        >
          {(props) => {
            let tableData = [...props.values.signers];
            if (props.values.reviewerName && props.values.reviewerEmail) {
              tableData.unshift({
                name: props.values.reviewerName,
                email: props.values.reviewerEmail,
                routingOrder: "1",
                recipientType: "",
              });
            }
            useEffect(() => {
              if (currentStep === 2) {
                props.values.signers.map((signer, index) => {
                  props.setFieldTouched(`signers[${index}].name`, true);
                  props.setFieldTouched(`signers[${index}].email`, true);
                });
              }
            }, [currentStep]);
            const { startDate, endDate } = props.values;
            const disabledEndDate = (current: any) => {
              if (!startDate) return false; // No start date selected yet
              let minEndDate = moment(startDate, "DD/MM/YYYY").add(1, "days");
              return current && current < moment(minEndDate, "DD/MM/YYYY");
            };
            return (
              <Form
                layout="vertical"
                onFinish={props.handleSubmit}
              >
                <CustomOptions
                  contract={true}
                  setOpen={setOpen}
                  open={open}
                  {...props}
                />
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
                    md={currentStep === 4 ? 24 : 16}
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
                                Contract Details
                              </Typography.Title>
                            </div>
                          </Col>
                          <Col span={12}>
                            <div style={{ textAlign: "right" }}>
                              <Button
                                type="default"
                                disabled={props.values.templateId ? false : true}
                                onClick={() => setOpen(true)}
                              >
                                Custom Options
                              </Button>
                            </div>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <EqualCol>
                            <Form.Item label={"Select Template"}>
                              <Field name={`templateId`}>
                                {({ field }: FieldProps) => (
                                  <Select
                                    showSearch
                                    value={field.value}
                                    filterOption={(input, option: any) =>
                                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    onBlur={() => props.setFieldTouched("templateId", true)}
                                    onChange={(e) => {
                                      props.setFieldValue("templateId", e);
                                      setTemplateId(e);

                                      getTemplateRecords(props.values, e);
                                    }}
                                    status={(props.touched.templateId && props.errors.templateId && "error") || ""}
                                  >
                                    {templateList &&
                                      templateList.map((appItem: { templateName: string; templateId: string }) => (
                                        <Select.Option
                                          value={appItem.templateName && appItem.templateId}
                                          key={appItem.templateId}
                                        >
                                          {appItem.templateName && appItem.templateName}
                                        </Select.Option>
                                      ))}
                                  </Select>
                                )}
                              </Field>
                              <Typography.Text type="danger">
                                <ErrorMessage name={`templateId`} />
                              </Typography.Text>
                            </Form.Item>
                          </EqualCol>
                          {props.values.templateId && (
                            <>
                              <EqualCol>
                                <Form.Item label="Email Subject">
                                  <Field name={`emailSubject`}>
                                    {({ field }: FieldProps) => (
                                      <Input
                                        {...field}
                                        style={{
                                          cursor: props.values.messageLock ? "not-allowed" : "auto",
                                        }}
                                        readOnly={props.values.messageLock}
                                      />
                                    )}
                                  </Field>
                                  <Typography.Text type="danger">
                                    <ErrorMessage name={`emailSubject`} />
                                  </Typography.Text>
                                </Form.Item>
                              </EqualCol>
                              <Col md={24}>
                                <Form.Item label="Email Message">
                                  <Field name={`emailMessage`}>
                                    {({ field }: FieldProps) => (
                                      <Input.TextArea
                                        {...field}
                                        style={{
                                          height: "60px",
                                          cursor: props.values.messageLock ? "not-allowed" : "auto",
                                        }}
                                        rows={8}
                                        maxLength={240}
                                        readOnly={props.values.messageLock}
                                      />
                                    )}
                                  </Field>
                                  <Typography.Text type="danger">
                                    <ErrorMessage name={`emailMessage`} />
                                  </Typography.Text>
                                </Form.Item>
                              </Col>
                            </>
                          )}
                          <EqualCol>
                            <Form.Item label="Contract Name">
                              <Field name={`contractName`}>
                                {({ field }: FieldProps) => (
                                  <Input
                                    {...field}
                                    {...(field.value && {
                                      value: field.value,
                                    })}
                                    status={(props.touched.contractName && props.errors.contractName && "error") || ""}
                                  />
                                )}
                              </Field>
                              <Typography.Text type="danger">
                                <ErrorMessage name={`contractName`} />
                              </Typography.Text>
                            </Form.Item>
                          </EqualCol>
                          <EqualCol>
                            <Field name="startDate">
                              {({ field }: FieldProps) => {
                                return (
                                  <Form.Item label="Contract Start Date">
                                    <DatePicker
                                      allowClear
                                      onBlur={() => props.setFieldTouched("startDate", true)}
                                      onChange={(e) => {
                                        props.setFieldValue(`startDate`, e ? moment(e).format("DD/MM/YYYY") : "");
                                        if (!e) {
                                          props.setFieldValue("endDate", "");
                                          props.setFieldValue("contractPeriod", "");
                                        }
                                        dayChange(props, e, props.values.endDate);
                                      }}
                                      status={(props.touched.startDate && props.errors.startDate && "error") || ""}
                                      format="DD/MM/YYYY"
                                      {...(field.value && {
                                        value: moment(field.value, "DD/MM/YYYY"),
                                      })}
                                      style={{ width: "100%" }}
                                    />
                                    {props.touched.startDate && props.errors.startDate && (
                                      <Typography.Text type="danger">{props.errors.startDate}</Typography.Text>
                                    )}
                                  </Form.Item>
                                );
                              }}
                            </Field>
                          </EqualCol>
                          <EqualCol>
                            <Field name="endDate">
                              {({ field }: FieldProps) => {
                                return (
                                  <Form.Item label="Contract End Date">
                                    <DatePicker
                                      allowClear
                                      onBlur={() => props.setFieldTouched("endDate", true)}
                                      onChange={(e) => {
                                        props.setFieldValue(`endDate`, e ? moment(e).format("DD/MM/YYYY") : "");
                                        dayChange(props, props.values.startDate, e);
                                      }}
                                      disabled={!props.values.startDate}
                                      disabledDate={disabledEndDate}
                                      status={(props.touched.endDate && props.errors.endDate && "error") || ""}
                                      format="DD/MM/YYYY"
                                      {...(field.value && {
                                        value: moment(field.value, "DD/MM/YYYY"),
                                      })}
                                      style={{ width: "100%" }}
                                    />
                                    {props.touched.endDate && props.errors.endDate && (
                                      <Typography.Text type="danger">{props.errors.endDate}</Typography.Text>
                                    )}
                                  </Form.Item>
                                );
                              }}
                            </Field>
                          </EqualCol>
                          <EqualCol>
                            <Field name="contractPeriod">
                              {({ field }: FieldProps) => {
                                return (
                                  <Form.Item label="Contract Tenure">
                                    <Input
                                      {...field}
                                      type="number"
                                      readOnly
                                      style={{ width: "100%" }}
                                      {...(field.value && {
                                        value: field.value,
                                      })}
                                      status={
                                        (props.touched.contractPeriod && props.errors.contractPeriod && "error") || ""
                                      }
                                      suffix={"Days"}
                                      min="0"
                                    />
                                    {props.touched.contractPeriod && props.errors.contractPeriod && (
                                      <Typography.Text type="danger">
                                        <ErrorMessage name={`contractPeriod`} />
                                      </Typography.Text>
                                    )}
                                  </Form.Item>
                                );
                              }}
                            </Field>
                          </EqualCol>
                          <EqualCol>
                            <Field name="renewalReminderNotification">
                              {({ field }: FieldProps) => {
                                return (
                                  <Form.Item label="Renewal Reminder Notification">
                                    <Input
                                      {...field}
                                      type="number"
                                      style={{ width: "100%" }}
                                      {...(field.value && {
                                        value: field.value,
                                      })}
                                      onChange={(e) =>
                                        props.setFieldValue("renewalReminderNotification", e.target.value.toString())
                                      }
                                      status={
                                        (props.touched.renewalReminderNotification &&
                                          props.errors.renewalReminderNotification &&
                                          "error") ||
                                        ""
                                      }
                                      suffix={"Days"}
                                      min="0"
                                      max={props.values.contractPeriod}
                                    />
                                    {props.touched.renewalReminderNotification &&
                                      props.errors.renewalReminderNotification && (
                                        <Typography.Text type="danger">
                                          <ErrorMessage name={`renewalReminderNotification`} />
                                        </Typography.Text>
                                      )}
                                  </Form.Item>
                                );
                              }}
                            </Field>
                          </EqualCol>
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
                          Reviewer Details
                        </Typography.Title>
                        <Row gutter={16}>
                          <Col span={11}>
                            <Form.Item label="Name">
                              <Field name={`reviewerName`}>
                                {({ field }: FieldProps) => (
                                  <Input
                                    {...field}
                                    {...(field.value && {
                                      value: field.value,
                                    })}
                                  />
                                )}
                              </Field>
                              <Typography.Text type="danger">
                                <ErrorMessage name={`reviewerName`} />
                              </Typography.Text>
                            </Form.Item>
                          </Col>
                          <Col span={11}>
                            <Form.Item label="Email">
                              <Field name={`reviewerEmail`}>
                                {({ field }: FieldProps) => (
                                  <Input
                                    {...field}
                                    {...(field.value && {
                                      value: field.value,
                                    })}
                                  />
                                )}
                              </Field>
                              <Typography.Text type="danger">
                                <ErrorMessage name={`reviewerEmail`} />
                              </Typography.Text>
                            </Form.Item>
                          </Col>
                        </Row>
                        <div>
                          <Typography.Title
                            level={4}
                            style={{
                              marginBottom: styles.whitesapce3,
                            }}
                          >
                            Signers Details
                          </Typography.Title>
                          {props.values.signers.length > 1 && (
                            <div>
                              <Form.Item className="mb-0">
                                <Space>
                                  <Checkbox
                                    name="setSigningOrder"
                                    checked={props.values.setSigningOrder}
                                    value={props.values.setSigningOrder}
                                    disabled={props.values.recipientLock}
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
                            </div>
                          )}
                          {props.values.signers.map((signer, i) => (
                            <Row
                              gutter={[16, 16]}
                              align="top"
                              key={`singer${i}`}
                            >
                              <Col span={11}>
                                <Form.Item label="Name">
                                  <Field name={`signers[${i}].name`}>
                                    {({ field }: FieldProps) => (
                                      <Input
                                        {...field}
                                        style={{
                                          cursor: props.values.recipientLock ? "not-allowed" : "auto",
                                        }}
                                        autoComplete="off"
                                        readOnly={props.values.recipientLock}
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
                                        style={{
                                          cursor: props.values.recipientLock ? "not-allowed" : "auto",
                                        }}
                                        readOnly={props.values.recipientLock}
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
                                    disabled={props.values.signers.length === 1 || props.values.recipientLock}
                                    onClick={() => {
                                      const signers = [...props.values.signers];
                                      signers.splice(i, 1);
                                      props.setValues({
                                        ...props.values,
                                        signers,
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
                        </div>
                        <Row gutter={16}>
                          <Col
                            span={24}
                            style={{ textAlign: "right", marginBottom: 16 }}
                          >
                            <Button
                              type="text"
                              icon={<Icon icon="akar-icons:plus" />}
                              style={{
                                cursor: props.values.recipientLock ? "not-allowed" : "auto",
                              }}
                              disabled={
                                props.values.recipientLock ||
                                props.values.signers.some((val) => val.name === "" || val.email === "")
                              }
                              onClick={() =>
                                props.setValues({
                                  ...props.values,
                                  signers: [
                                    ...props.values.signers,
                                    {
                                      name: "",
                                      email: "",
                                      routingOrder: "1",
                                      recipientType: "",
                                    },
                                  ],
                                })
                              }
                            >
                              Add signer
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    )}
                    {currentStep === 3 && (
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
                          Watchers Details
                        </Typography.Title>
                        {props.values.watchers.map((signer, i) => (
                          <Row
                            gutter={[16, 16]}
                            align="top"
                            key={`watcher${i}`}
                          >
                            <Col span={11}>
                              <Form.Item label="Name">
                                <Field name={`watchers[${i}].name`}>
                                  {({ field }: FieldProps) => (
                                    <Input
                                      {...field}
                                      autoComplete="off"
                                    />
                                  )}
                                </Field>
                                <Typography.Text type="danger">
                                  <ErrorMessage name={`watchers[${i}].name`} />
                                </Typography.Text>
                              </Form.Item>
                            </Col>
                            <Col span={11}>
                              <Form.Item label="Email">
                                <Field name={`watchers[${i}].email`}>
                                  {({ field }: FieldProps) => <Input {...field} />}
                                </Field>
                                <Typography.Text type="danger">
                                  <ErrorMessage name={`watchers[${i}].email`} />
                                </Typography.Text>
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Form.Item label=" ">
                                <Button
                                  type="link"
                                  danger
                                  disabled={props.values.watchers.length === 1}
                                  onClick={() => {
                                    const watchers = [...props.values.watchers];
                                    watchers.splice(i, 1);
                                    props.setValues({
                                      ...props.values,
                                      watchers: watchers ? watchers : [],
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
                        <Row>
                          <Col
                            span={24}
                            style={{ textAlign: "right", marginBottom: 16 }}
                          >
                            <Button
                              type="text"
                              icon={<Icon icon="akar-icons:plus" />}
                              disabled={
                                props.values.recipientLock ||
                                props.values.watchers.some((val) => val.name === "" || val.email === "")
                              }
                              onClick={() => {
                                let watchers = [
                                  ...props.values.watchers,
                                  {
                                    name: "",
                                    email: "",
                                  },
                                ];
                                props.setValues({
                                  ...props.values,
                                  watchers: watchers,
                                });
                                setTimeout(() => {
                                  let index = watchers.length - 1;
                                  props.setFieldTouched(`watchers[${index}].name`, false);
                                  props.setFieldTouched(`watchers[${index}].email`, false);
                                }, 0);
                              }}
                            >
                              Add Watcher
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    )}
                    {currentStep === 4 && (
                      <>
                        <Row style={{ marginBottom: styles.whitespace3 }}>
                          <Col
                            span={24}
                            style={{ marginBottom: styles.whitespace3 }}
                          >
                            <WrapperCard
                              title="Contract Details"
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
                                  {getItemText("Email Subject", props.values.emailSubject)}
                                </Col>
                                <Col
                                  xs={24}
                                  md={8}
                                >
                                  {getItemText("Email Message", props.values.emailMessage)}
                                </Col>
                                <Col
                                  xs={24}
                                  md={8}
                                >
                                  {getItemText("Contract Name", props.values.contractName)}
                                </Col>
                                <Col
                                  xs={24}
                                  md={8}
                                >
                                  {getItemText("Start Date", props.values.startDate)}
                                </Col>
                                <Col
                                  xs={24}
                                  md={8}
                                >
                                  {getItemText("End Date", props.values.endDate)}
                                </Col>
                                <Col
                                  xs={24}
                                  md={8}
                                >
                                  {getItemText("Contract Tenure", props.values.contractPeriod)}
                                </Col>
                                <Col
                                  xs={24}
                                  md={8}
                                >
                                  {getItemText(
                                    "Renewal Reminder Notification ",
                                    props.values.renewalReminderNotification
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
                                    Custom Options
                                  </Typography.Title>
                                </Col>
                                <Col
                                  xs={24}
                                  md={24}
                                >
                                  <Typography.Title
                                    level={5}
                                    style={{ margin: 2, marginLeft: 0 }}
                                  >
                                    reminders
                                  </Typography.Title>
                                </Col>
                                <Col
                                  xs={24}
                                  md={6}
                                >
                                  {getItemText("Send Automatic Reminders", props.values.reminderFrequency)}
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
                                    "Document will expire on:",
                                    moment().add(props.values.expiryAfter, "days").format("DD MMM YYYY")
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
                            {map(docsList, (file, index) => (
                              <Col
                                span={24}
                                style={{ marginBottom: styles.whitespace1 }}
                                key={`${index}${file.name}`}
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
                            title="Reviewer & Signer"
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
                                tableData={tableData}
                                // map(props.values.signers, (signers) => ({
                                //   ...signers,
                                // }))
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
                                    key: "role",
                                    dataIndex: "recipientType",
                                    title: "Role",
                                    render: (value: any, record: any, index: any) =>
                                      index === 0 && props.values.reviewerName && props.values.reviewerEmail
                                        ? "Reviewer"
                                        : "Signer",
                                    ellipsis: true,
                                  },
                                  {
                                    key: "routingOrder",
                                    dataIndex: "routingOrder",
                                    title: "Signing Order",
                                    render: (value: any, record: any, index: any) =>
                                      props.values.setSigningOrder ? numberToWord(index) + " Signer" : "-",
                                    ellipsis: true,
                                  },
                                ]}
                                showTopBar={false}
                              />
                            </Col>
                          </WrapperCard>
                        </Col>
                        <Col
                          span={24}
                          style={{ marginBottom: styles.whitespace3 }}
                        >
                          <WrapperCard
                            title="Watchers List"
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
                                onClick={() => setCurrentStep(3)}
                              />
                            }
                          >
                            <Col span={24}>
                              <DataTable
                                height={
                                  props.values.watchers?.length * 40 + 100 < 400
                                    ? props.values.watchers.length * 80 + 100
                                    : 400
                                }
                                multiSelect={false}
                                tableData={map(props.values.watchers, (watchers) => ({
                                  ...watchers,
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
                        {currentStep === 4 && (
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
                              disabled={
                                currentStep === 4 &&
                                some(
                                  props.values.watchers,
                                  (signers) =>
                                    signers.email === "" || signers.name === "" || !validateEmail(signers.email)
                                )
                              }
                            >
                              Submit
                            </Button>
                          </Space>
                        )}
                        {currentStep < 4 && (
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
                                  ? !(props.isValid && props.dirty) || (currentStep == 3 && !props.touched.watchers)
                                  : docsList.length === 0
                              }
                              onClick={() => {
                                setCurrentStep((current) => current + 1);
                              }}
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
            );
          }}
        </Formik>
      </ContentWrapper>
    </>
  );
};
