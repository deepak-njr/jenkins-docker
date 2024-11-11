import { Button, Col, DatePicker, Form, Input, Modal, Row, Select, Typography } from "antd";
import { get, put } from "~/Services";
import { useEffect, useState } from "react";
import moment, { Moment } from "moment";
import { useNotification } from "~/Hooks/useNotification";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

const { Item } = Form;

const validationSchema = Yup.object().shape({
  userReportingManager: Yup.string().strict().required("Reporting Manager is required").nullable(),
  userType: Yup.string().strict().required("Please select an option").nullable(),
  userDesignation: Yup.string().strict().required("Please selct an option").nullable(),
});

interface FormValues {
  userDepartment: string;
  userDesignation: string;
  userType: string;
  userReportingManager: string;
  userJoiningDate: Moment | null;
}

const initialValues: FormValues = {
  userDepartment: "",
  userDesignation: "",
  userType: "",
  userReportingManager: "",
  userJoiningDate: null,
};

export const EditUser = (props: any) => {
  const { id } = useParams();
  const { openNotification } = useNotification();

  const { values, handleSubmit, setValues, handleChange, errors, touched, setFieldTouched, setFieldValue, isValid } =
    useFormik<FormValues>({
      initialValues,
      validationSchema,
      onSubmit: () => submitForm(),
    });

  const getUserInfo = () => {
    get(`v1/user/details/user-details-overview?userId=${id}`)
      .then((res: any) => {
        res = res.response.data;
        if (res) {
          setValues({
            userDepartment: res.getUserDetailsOverview.userDepartmentName,
            userDesignation: res.getUserDetailsOverview.userDesignation,
            userType: res.getUserDetailsOverview.userType,
            userReportingManager: res.getUserDetailsOverview.userReportingManager,
            userJoiningDate: moment(res.getUserDetailsOverview.userOnboardedDate),
          });
        }
      })
      .catch((err: any) => {
        openNotification({ message: err, type: "error" });
      });
  };

  useEffect(() => {
    if (props.openModal) {
      getUserInfo();
    }
  }, [props.openModal]);

  const submitForm = () => {
    const payload = {
      userDepartment: values.userDepartment,
      userDesignation: values.userDesignation,
      userType: values.userType,
      userReportingManager: values.userReportingManager,
      userOnboardedDate: values.userJoiningDate,
    };

    put(`v1/user/details/modify-user?userId=${id}`, payload).then((res: any) => {
      if (res && res.status === "OK") {
        props.fetchUser();
        openNotification({
          title: "Success",
          message: "User   Updated",
          type: "success",
        });
        props.setOpenModal(false);
      }
    });
  };

  return (
    <Modal
      visible={props.openModal}
      title="Edit User"
      footer={null}
      closable={false}
      onCancel={() => props.setOpenModal(false)}
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Item label="User Department">
              <Select
                size="large"
                showSearch
                value={values.userDepartment}
                onChange={(e) => setFieldValue("userDepartment", e)}
                disabled
              >
                {/* {dept &&
                  dept.map((d: { departmentName: string }) => (
                    <Select.Option
                      value={d.departmentName}
                      key={d.departmentName}
                    >
                      {d.departmentName}
                    </Select.Option>
                  ))} */}
              </Select>
            </Item>
          </Col>
          <Col span={24}>
            <Item label="User Designation">
              <Select
                size="large"
                showSearch
                value={values.userDesignation}
                onChange={(e) => {
                  setFieldValue("userDesignation", e);
                }}
                onBlur={() => setFieldTouched("userDesignation", true)}
                status={(touched.userDesignation && errors.userDesignation && "error") || ""}
              >
                {[
                  "Software Engineer",
                  "Technical Lead",
                  "Software Architect",
                  // ... other options ...
                ].map((type) => (
                  <Select.Option
                    value={type}
                    key={type}
                  >
                    {type}
                  </Select.Option>
                ))}
              </Select>
              {touched.userDesignation && errors.userDesignation && (
                <Typography.Text type="danger">{errors.userDesignation}</Typography.Text>
              )}
            </Item>
          </Col>
          <Col span={24}>
            <Item label="Type of Employment">
              <Select
                size="large"
                showSearch
                value={values.userType}
                onChange={(e) => {
                  setFieldValue("userType", e);
                }}
                onBlur={() => setFieldTouched("userType", true)}
                status={(touched.userType && errors.userType && "error") || ""}
              >
                {["Permanent", "Contract"].map((type) => (
                  <Select.Option
                    value={type}
                    key={type}
                  >
                    {type}
                  </Select.Option>
                ))}
              </Select>
              {touched.userType && errors.userType && (
                <Typography.Text type="danger">{errors.userType}</Typography.Text>
              )}
            </Item>
          </Col>
          <Col span={24}>
            <Item label="Joining Date">
              <DatePicker
                size="large"
                onChange={(e) => {
                  setValues({
                    ...values,
                    userJoiningDate: e,
                  });
                }}
                value={values.userJoiningDate}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                onBlur={() => setFieldTouched("userJoiningDate", true)}
                status={(touched.userJoiningDate && errors.userJoiningDate && "error") || ""}
              />
            </Item>
          </Col>
          <Col span={24}>
            <Item
              label="Reporting Manager"
              required
            >
              <Input
                size="large"
                value={values.userReportingManager}
                onChange={(e) => {
                  handleChange("userReportingManager")(e);
                }}
                onBlur={() => setFieldTouched("userReportingManager", true)}
                status={(touched.userReportingManager && errors.userReportingManager && "error") || ""}
              />
              {touched.userReportingManager && errors.userReportingManager && (
                <Typography.Text type="danger">{errors.userReportingManager}</Typography.Text>
              )}
            </Item>
          </Col>
        </Row>
        <Row style={{ display: "flex", justifyContent: "end" }}>
          <Button
            style={{ marginRight: "20px" }}
            onClick={() => props.setOpenModal(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!isValid} //#880 In User Listview Modifying the Existing User In EditUser Pop Up Fields Are Empty Submit Button Is Enabled.
            onClick={() => handleSubmit()}
            type="primary"
          >
            Submiit
          </Button>
        </Row>
      </Form>
    </Modal>
  );
};
