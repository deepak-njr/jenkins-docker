import { Form, Input, Modal, Button, Col, Row, Space, Typography, Checkbox, InputNumber, Divider, Switch } from "antd";
import { FormikProps } from "formik";
import styles from "../../Contract.module.scss";
import moment from "moment";
import { useEffect, useState } from "react";
interface Props extends FormikProps<any> {
  contract?: boolean;
  setOpen: any;
  open?: boolean;
}
// const initialValues = {
//   reminderEnabled: false,
//   reminderFrequency: "",
//   reminderDelay: "",
//   expiryAfter: "",
//   expiryOn: "",
//   expiryWarn: "",
//   recipientLock: false,
//   messageLock: false,
//   signerCanSignOnMobile: false,
//   allowComments: true,
//   lastName: "",
//   email: "",
// };

const CustomOptions: React.FC<FormikProps<any> & Props> = (props) => {
  const [validationError, setValidationError] = useState<any>({});
  const { values, contract, open, setOpen } = props;
  const [error, setError] = useState<any>("" || null);
  const [modalValues, setModalValues] = useState({
    reminderEnabled: props.values.reminderEnabled,
    reminderFrequency: props.values.reminderFrequency,
    reminderDelay: props.values.reminderDelay,
    expiryAfter: props.values.expiryAfter,
    expiryOn: props.values.expiryOn,
    expiryWarn: props.values.expiryWarn,
    recipientLock: props.values.recipientLock,
    messageLock: props.values.messageLock,
    // signerCanSignOnMobile: props.values.signerCanSignOnMobile,
    allowComments: props.values.allowComments,
  });

  const handleSave = () => {
    props.setValues({
      ...props.values,
      ...modalValues,
    });
  };

  useEffect(() => {
    if (Number(modalValues.expiryAfter) < Number(modalValues.expiryWarn)) {
      setError("Warning to signers should be less than expiration days");
    } else {
      setError("");
    }
  }, [modalValues]);

  useEffect(() => {
    if (!modalValues.reminderEnabled) {
      setModalValues((prev) => ({ ...prev, reminderFrequency: 0, reminderDelay: 0 }));
      setValidationError((prev: any) => ({ ...prev, reminderFrequency: null, reminderDelay: null }));
    }
  }, [modalValues.reminderEnabled, setModalValues, setValidationError]);

  const onHandleCancel = () => {
    setOpen(false);
    setModalValues({ ...props.values });
    setValidationError({});
  };

  return (
    <Modal
      title="Custom Options"
      open={open}
      maskClosable={false}
      okText={"Save"}
      okButtonProps={{
        disabled: error || Object.values(validationError).some((value) => value !== null) ? true : false,
      }}
      onOk={() => {
        setOpen(false);
        handleSave();
      }}
      onCancel={() => onHandleCancel()}
    >
      <div
        style={{
          maxHeight: "500px",
          overflow: "auto",
          paddingLeft: styles.whitespace2,
          paddingRight: styles.whitespace3,
        }}
      >
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%" }}
        >
          <Typography.Title
            level={5}
            style={{ margin: 0 }}
          >
            Reminders
          </Typography.Title>
          <Form.Item>
            <Space>
              <Checkbox
                name="reminderEnabled"
                checked={modalValues.reminderEnabled}
                value={modalValues.reminderEnabled}
                onChange={(e) => {
                  // props.setFieldValue("reminderEnabled", e.target.checked);
                  setModalValues({ ...modalValues, reminderEnabled: e.target.checked });
                }}
              />
              Send Automatic Reminders
            </Space>
          </Form.Item>
        </Space>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%" }}
        >
          <Col md={24}>
            <Typography>Days until first reminder:</Typography>
          </Col>
          <Col md={24}>
            <InputNumber
              disabled={!modalValues.reminderEnabled}
              value={modalValues.reminderFrequency}
              onBlur={() => {
                setValidationError({
                  ...validationError,
                  reminderFrequency: modalValues.reminderFrequency === null ? "reminderFrequency required" : null,
                });
              }}
              onChange={(e) =>
                //  props.setFieldValue("reminderFrequency", e)
                setModalValues({ ...modalValues, reminderFrequency: e })
              }
              status={validationError.reminderFrequency && "error"}
              min="0"
              max="999"
              controls={false}
            />
            <Typography.Text type="danger">
              <div>{validationError.reminderFrequency && validationError.reminderFrequency}</div>
            </Typography.Text>
          </Col>
        </Space>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginTop: 10 }}
        >
          <Col md={12}>Days between reminders:</Col>
          <Col md={12}>
            <InputNumber
              defaultValue={120}
              value={modalValues.reminderDelay}
              disabled={!modalValues.reminderEnabled}
              onBlur={() => {
                setValidationError({
                  ...validationError,
                  reminderDelay: modalValues.reminderDelay === null ? "reminderDelay required" : null,
                });
              }}
              status={validationError.reminderDelay && "error"}
              onChange={(e) =>
                // props.setFieldValue("reminderDelay", e)
                setModalValues({ ...modalValues, reminderDelay: e })
              }
              controls={false}
              min="0"
              max="999"
            />
            <Typography.Text type="danger">
              <div>{validationError.reminderDelay && validationError.reminderDelay}</div>
            </Typography.Text>
          </Col>
        </Space>
        <Divider></Divider>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginTop: 10 }}
        >
          <Typography.Title level={5}>Expiration</Typography.Title>

          <Col md={24}>
            <InputNumber
              value={modalValues.expiryAfter}
              onChange={(e) => {
                setModalValues({ ...modalValues, expiryAfter: e, expiryOn: e });
              }}
              onBlur={() => {
                setValidationError({
                  ...validationError,
                  expiryAfter: modalValues.expiryAfter === null ? "expiry field required" : null,
                });
              }}
              status={validationError.expiryAfter && "error"}
              defaultValue={modalValues.expiryAfter}
              controls={false}
              min="0"
              max="999"
            />
            <Typography.Text type="danger">
              <div>{validationError.expiryAfter && validationError.expiryAfter}</div>
            </Typography.Text>
          </Col>
        </Space>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginTop: 10 }}
        >
          <Row
            style={{
              alignItems: "center",
              marginBottom: styles.whitespace1,
              marginTop: styles.whitespace1,
            }}
          >
            <Col>Document will expire on:</Col>
            <Col>
              <Typography
                style={{
                  paddingLeft: styles.whitespace2,
                  color: styles.primary,
                }}
              >
                {moment().add(modalValues.expiryAfter, "days").format("DD MMM YYYY")}
              </Typography>
            </Col>
          </Row>
        </Space>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginTop: 10 }}
        >
          <Col md={24}>Days to warn signers before expiration:</Col>
          <Col md={12}>
            <InputNumber
              value={modalValues.expiryWarn}
              onBlur={() => {
                setError(modalValues.expiryWarn === null ? "expiry field required" : null);
              }}
              onChange={(e) =>
                //  props.setFieldValue("expiryWarn", e)
                setModalValues({ ...modalValues, expiryWarn: e && e.toString() })
              }
              status={error && "error"}
              max="999"
              controls={false}
              min="0"
            />
            <Typography.Text type="danger">
              <div>{error && error}</div>
            </Typography.Text>
          </Col>
        </Space>
        <Divider />
        <Row
          style={{
            alignItems: "center",
            marginBottom: styles.whitespace1,
          }}
        >
          <Form.Item>
            <Typography.Title
              level={5}
              style={{ marginBottom: styles.whitesapce3 }}
            >
              Template Editing
            </Typography.Title>
            <Space align="start">
              <Checkbox
                style={{ paddingTop: 2 }}
                name="recipientLock"
                disabled={contract}
                checked={modalValues.recipientLock}
                value={modalValues.recipientLock}
                onChange={(e) => {
                  // props.setFieldValue("recipientLock", e.target.checked);
                  setModalValues({ ...modalValues, recipientLock: e.target.checked });
                }}
              />
              <Typography.Text disabled={contract}>
                Restrict sender from editing, adding, or removing recipients
              </Typography.Text>
            </Space>
          </Form.Item>
          <Form.Item>
            <Space align="start">
              <Checkbox
                style={{ paddingTop: 2 }}
                name="messageLock"
                disabled={contract}
                checked={modalValues.messageLock}
                value={modalValues.messageLock}
                onChange={(e) => {
                  // props.setFieldValue("messageLock", e.target.checked);
                  setModalValues({ ...modalValues, messageLock: e.target.checked });
                }}
              />
              <Typography.Text disabled={contract}>
                Restrict sender from editing subject, email, or private message
              </Typography.Text>
            </Space>
          </Form.Item>
          <Divider />
          <Space direction="vertical">
            <Typography.Title
              level={5}
              style={{ marginBottom: styles.whitesapce3 }}
            >
              Comments
            </Typography.Title>

            <Switch
              style={{ margin: 0 }}
              defaultChecked={false}
              checked={modalValues.allowComments}
              checkedChildren="Enable"
              unCheckedChildren="Disable"
              onChange={(e) => {
                // props.setFieldValue("allowComments", e);
                setModalValues({ ...modalValues, allowComments: e });
              }}
            />
          </Space>
        </Row>
      </div>
    </Modal>
  );
};

export default CustomOptions;
