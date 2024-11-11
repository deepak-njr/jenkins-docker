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

import { useParams } from "react-router-dom";
import { DataTable } from "@components/index";
import moment from "moment";
interface Props {
  data: any;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}
const { Item } = Form;
export const EnvelopActivity = (props: Props) => {

  const getColor = (value: string) => {
    switch (value) {
      case "sent":
        return <Typography.Text style={{ backgroundColor: "#EFEEFB", padding: "6px 19px", borderRadius: 9, color: "#373295" }} >{value}</Typography.Text>;
      case "created":
        return <Typography.Text style={{ backgroundColor: "#FCEDFB", padding: "6px 19px", borderRadius: 9, color: "#A72F9C" }} >{value}</Typography.Text>;
      case "delivered":
        return <Typography.Text style={{ backgroundColor: "#EBF8FE", padding: "6px 19px", borderRadius: 9, color: "#299CDB" }} >{value}</Typography.Text>;
      default:
        return <Typography.Text style={{ backgroundColor: "#EBFFF5", padding: "6px 19px", borderRadius: 9, color: "#30CB83" }} >{value}</Typography.Text>;
    }
  };

  const { data } = props;
  const { id } = useParams();
  const { openToast, openNotification } = useNotification();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns: TableColumnsType = [
    {
      title: "Date & Time",
      dataIndex: "logTime",
      render: (value: any) =>
      moment(value).format('YYYY-MM-DD HH:mm:ss') || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
    {
      title: "User",
      dataIndex: "UserName",
      render: (value: any) =>
        value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
    {
      title: "Action",
      dataIndex: "Action",
      render: (value: any) =>
        <Typography.Text style={{ fontSize: 14, color: "#373295" }}> {value}</Typography.Text> || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
    {
      title: "Activity",
      dataIndex: "Message",
      render: (value: any) =>
        value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "EnvelopeStatus",
      render: (value: any) =>
        getColor(value) || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
  ];
  return (
    <Modal
      maskClosable={false}
      open={props.openModal}
      centered
      width={990}
      title="E-Signature History"
      onCancel={() => props.setOpenModal(false)}
      footer={null}
    >
      <DataTable
        columns={columns}
        tableData={data}
        isLoading={isLoading}
        multiSelect={false}
        showTopBar={false}
      />
    </Modal>
  );
};
