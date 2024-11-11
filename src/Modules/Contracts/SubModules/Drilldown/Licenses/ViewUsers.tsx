import {
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  Avatar,
  TableColumnsType,
} from "antd";

import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useNotification } from "~/Hooks/useNotification";
import { get, put } from "~/Services";
import { useParams } from "react-router-dom";
import { DataTable } from "@components/index";
import { imageKey } from "@utils/Constants";
import moment from "moment";
interface Props {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  licenceId: string;
}
const { Item } = Form;
export const ViewUsers = (props: Props) => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const { openToast, openNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [userData, setUserData] = useState([]);

  const getUsersInfo = () => {
    get(`v1/application/license/mapped/users?licenseId=${props.licenceId}`)
      .then((res: any) => {
        if (res && res.response.data) {
          setData(res.response.data);
          const { applicationdetailsOverviewResponse } = res.response.data;
        }
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
    get("v1/application/categories")
      .then((res: any) => {
        if (res.status === "OK") {
          setCategories(res.response.data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
  };

  useEffect(() => {
    if (props.openModal) {
      getUsersInfo();
    }
  }, [props.openModal]);

  const columns: TableColumnsType = [
    {
      title: "User",
      dataIndex: "userName",
      render: (value: any, record: any, i: number) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={record.userAvatar && `${record.userAvatar}${imageKey}`}
                icon={
                  !record.userAvatar &&
                  record.userName &&
                  record.userName.slice(0, 2).toUpperCase()
                }
              />
              {record.userName}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
    },

    {
      title: "Email",
      dataIndex: "userEmail",
      render: (value: any) =>
        value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
  ];
  return (
    <Modal
      maskClosable={false}
      open={props.openModal}
      title="License Assigned Users"
      onCancel={() => props.setOpenModal(false)}
      footer={null}
    >
      <DataTable
        columns={columns}
        tableData={data.map((d: any) => ({ ...d, key: d.userEmail }))}
        isLoading={isLoading}
        multiSelect={false}
        height={600}
        exportFileName="Contract Users"
      />
    </Modal>
  );
};
