import * as yup from "yup";

import { Button, Input, Modal, Typography } from "antd";
import { Field, Form, Formik } from "formik";
import { get, post } from "~/Services";
import { useEffect, useState } from "react";

import styles from "./AskAmigo.module.scss";
import { useNotification } from "~/Hooks/useNotification";

interface Props {
  open: boolean;
  chatId: string;
  conversationId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const Feedback = ({ open, conversationId, chatId, onCancel, onSuccess }: Props) => {
  const { openNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  useEffect(() => {}, []);

  const initialValues = {
    comment: "",
  };

  const validationSchema = yup.object().shape({
    comment: yup.string().required("Comments required"),
  });
  const handleOk = (values: any, resetForm: any) => {
    setIsSubmitting(true);
    const payload = {
      conversationId: conversationId,
      id: chatId,
      like: false,
      comment: values.comment,
    };
    post("v1/conversation/feedback", payload)
      .then((res: any) => {
        if (res) {
          openNotification({
            title: "",
            message: "Thanks for your valuable feedback",
            type: "success",
          });
          setIsSubmitting(false);
          onSuccess();
          resetForm();
        }
      })
      .catch((err) => {
        setIsSubmitting(false);
      });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      key="submit"
      onSubmit={handleOk}
    >
      {({ errors, values, touched, resetForm, isValid, dirty }) => {
        return (
          <Modal
            className="amigo-feedback"
            open={open}
            style={{ maxWidth: 700, textAlign: "left" }}
            bodyStyle={{
              overflowY: "auto",
            }}
            destroyOnClose={true}
            centered
            footer={[
              <Button
                key="back"
                onClick={() => {
                  resetForm();
                  onCancel();
                }}
                style={{ marginBottom: 16 }}
              >
                Cancel
              </Button>,
              <Button
                style={{ marginBottom: 16, marginLeft: 24, marginRight: 8 }}
                type="primary"
                htmlType="submit"
                disabled={!isValid || !dirty}
                loading={isSubmitting}
                onClick={() => handleOk(values, resetForm)}
              >
                Submit
              </Button>,
            ]}
            maskClosable={false}
            onCancel={() => {
              onCancel();
              resetForm();
            }}
          >
            <Typography.Title
              level={5}
              style={{
                marginBottom: styles.whitespace2,
                // fontSize: 18,
              }}
            >
              Submit Feedback
            </Typography.Title>
            <Typography.Text>
              We would really like to hear any feedback that you might provide for us. This will help us to improve our
              feature and make it a better experience for you
            </Typography.Text>
            <Form style={{ marginTop: 20 }}>
              <div className="form-group">
                {/* <label htmlFor="comment"></label> */}
                <Field
                  name="comment"
                  as={Input.TextArea}
                  placeholder="Please enter your feedback"
                />
                {errors.comment && touched.comment && <Typography.Text type="danger">{errors.comment}</Typography.Text>}
              </div>
            </Form>
          </Modal>
        );
      }}
    </Formik>
  );
};
