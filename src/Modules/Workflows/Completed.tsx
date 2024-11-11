import React from "react";
import { Space, Typography, TableColumnsType, Row, Col } from "antd";
import styles from "./index.module.scss";
import { imageKey } from "~/Utils";
import { columnWidth } from "@components/DataTable/Properties";
import moment from "moment";
import { DataTable } from "@components/index";
import { useState, useEffect } from "react";
import { get } from "@services/api.service";

export const Completed = () => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    get("v1/user/details/workflow/status?category=completed")
      .then((res: any) => {
        if (res && res.status === "OK") {
          setData(res.response.data);
        }
      })
      .catch(() => {});
  }, []);

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "name",
      width: columnWidth.APPLICATION_CATEGORY,
      render: (value: any) =>
        value && Boolean(value.toString()) ? value : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      width: columnWidth.APPLICATION_NAME,
      fixed: true,
      render: (value: any, record: any, i: number) =>
        value ? <Typography.Text>{record.accountName}</Typography.Text> : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      sorter: (a: any, b: any) => a.accountName.localeCompare(b.accountName),
    },

    {
      title: "Created On",
      dataIndex: "createdOn",
      render: (value: any) =>
        value ? moment(value, "YYYY-MM-DD").format("DD MMM YYYY") : <Typography.Text disabled>-</Typography.Text>,
      sorter: (a: any, b: any) => a.createdOn.localeCompare(b.createdOn),
      width: columnWidth.COUNT,
      ellipsis: true,
    },
    // {
    //   title: "Responded Date",
    //   dataIndex: "respondedDate",
    //   render: (value: any) =>
    //     value ? moment(value, "YYYY-MM-DD").format("DD MMM YYYY") : <Typography.Text disabled>-</Typography.Text>,
    //   sorter: (a: any, b: any) => a.respondedDate - b.respondedDate,
    //   width: columnWidth.COUNT,
    //   ellipsis: true,
    // },
  ];
  return (
    <Col>
      <DataTable
        columns={columns}
        tableData={data}
        height={500}
        showTopBar={false}
      ></DataTable>
    </Col>
  );
};
