import { Button, Col, Form, Input, Modal, Row, Select } from "antd";
import { get, put } from "~/Services";
import  { useEffect, useState } from "react";

import { useFormik } from "formik";
import { useNotification } from "~/Hooks/useNotification";
import { useParams } from "react-router-dom";

interface Props {
  openModal: boolean;
  refreshData: ()=>void;
  setOpenModal: (value: boolean) => void;
}
const { Item } = Form;
export const EditApplication = (props: Props) => {
  
  const { id } = useParams();
  const [data, setData] = useState<{ [key in string]: any }>({});
  const defaultValue: { [key in string]: any } = {
    applicationCategory: "",
    applicationOwnerDepartment: "",
    applicationOwnerEmail: "",
    autoRenewal: false,
    paymentMethod: "",
    cardholderName: "",
    cardNumber: "",
    validThrough: "",
    walletName: "",
    applicationLink: "",
  };

  const { openNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const { values, handleSubmit, setFieldValue, setValues, isSubmitting } =
    useFormik({
      initialValues: defaultValue,
      onSubmit: (values, { setSubmitting }) => {
        setSubmitting(true);
        const payload = {
          applicationCetegory: values.applicationCategory,
          applicationOwnerDepartment: data?.applicationDepartment,
          applicationOwnerEmail: data?.applicationOwnerEmail,
          applicationLink: values.applicationLink,
        };
        put(
          `v1/application/update-by-applicationid?applicationId=${id}`,
          payload
        )
          .then((res: any) => {
            if (res) {
              props.refreshData()
              openNotification({
                title: "Success",
                message: "Application Updated",
                type: "success",
              });
              props.setOpenModal(false);
            }
            setSubmitting(false);
          })
          .catch(() => setSubmitting(false));
      },
    });
  const getApplicationInfo = () => {
    get(`v1/application/overview?applicationId=${id}`).then(
      (res: any) => {
        if (res?.response?.data) {
          setData(res.response.data);

          setValues({
            applicationCategory: res.response.data.applicationCategory,
            applicationLink: res.response.data.applicationLink,
          });
        }
      }
    );
    get("v1/application/categories").then((res: any) => {
      if (res.status === "OK") {
        setCategories(res.response.data);
      }
    });
  };

  useEffect(() => {
    if (props.openModal) {
      getApplicationInfo();
    }
  }, [props.openModal]);

  return (
    <Modal
      maskClosable={false}
      open={props.openModal}
      title="Edit Application"
      onCancel={() => props.setOpenModal(false)}
      footer={false}
    >
      <Form onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Item label="Category">
              <Select
                showSearch
                size="large"
                style={{ width: "100%" }}
                value={values.applicationCategory}
                onChange={(e) => setFieldValue("applicationCategory", e)}
              >
                {
                  categories?.map((category: { categoryName: string }) => (
                    <Select.Option
                      key={category.categoryName}
                      value={category.categoryName}
                    >
                      {category.categoryName}
                    </Select.Option>
                  ))}
              </Select>
            </Item>
          </Col>

          <Col span={24}>
            <Item label="Application Link">
              <Input
                size="large"
                value={values.applicationLink}
                onChange={(e) =>
                  setFieldValue("applicationLink", e.target.value)
                }
              />
            </Item>
          </Col>
        </Row>
        <Row justify={"end"}>
          <Col span={24} style={{ textAlign: "right" }}>
            <Button htmlType="submit" type="primary" loading={isSubmitting}>
              Submit
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
