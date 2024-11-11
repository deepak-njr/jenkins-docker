import { Space, TableColumnsType, Typography } from "antd";
import { useEffect, useState } from "react";

import { DataTable } from "@components/index";
import { Roles } from "~/Utils/Roles";
import { get } from "@services/api.service";
import { has } from "lodash";
import { imageKey } from "@utils/Constants";
import styles from "./Application.module.scss";
import { useAuth } from "~/Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useNotification } from "~/Hooks/useNotification";

export const ApplicationList = ({ height }: { height: number }) => {
  const {
    user: { role },
  } = useAuth();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const { openToast } = useNotification();

  useEffect(() => {
    get("v1/application/request/list-view")
      .then((res: any) => {
        if (res.status == "OK") {
          if (res.response.data) {
            setData(res.response.data);
          }
        }
      })
      .catch((err) => openToast({ content: err, type: "error" }));
  }, []);

  const columns: TableColumnsType = [
    {
      title: "Request ID",
      dataIndex: "requestId",
      sorter: (a: any, b: any) => (a.requestId || "").localeCompare(b.requestId || ""),
      render: (value: any, record: any, i: number) =>
        has(record, "childRequestId") ? (
          <Typography.Text>{record.childRequestId}</Typography.Text>
        ) : (
          <Typography.Text>{value}</Typography.Text>
        ),
    },
    {
      title: "Application",
      dataIndex: "applicationName",
      sorter: (a: any, b: any) => (a.applicationName || "").localeCompare(b.applicationName || ""),
      render: (value: any, record: any, i: number) =>
        value ? (
          <Typography.Text>
            <Space>
              <span
                className={styles.logo}
                style={{
                  background: `url(${record.applicationLogo}${imageKey})`,
                }}
              ></span>
              {record.applicationName}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
    },
    {
      title: "Onboarded By",
      dataIndex: "onboardedByEmail",
      sorter: (a: any, b: any) => (a.onboardedByEmail || "").localeCompare(b.onboardedByEmail || ""),
    },
  ];

  const getDrilldown = (record: { [key in string]: string }) => {
    const basepath = "/onboarding-management/applications";
    if (record.childRequestId) {
      return `${basepath}/${record.childRequestId}?childRequestId=${record.childRequestId}`;
    }
    return `${basepath}/${record.requestId}`;
  };

  return (
    <DataTable
      className="table-clickable"
      columns={[
        ...columns,
        ...(role === Roles.APPROVER
          ? [
              {
                title: "Reviewed By",
                dataIndex: "reviewedByEmail",
                sorter: (a: any, b: any) => (a.reviewedByEmail || "").localeCompare(b.reviewedByEmail || ""),
              },
            ]
          : []),
        ...(role === Roles.SUPER_ADMIN
          ? [
              {
                title: "Status",
                dataIndex: "onboardingStatus",
                sorter: (a: any, b: any) => (a.onboardingStatus || "").localeCompare(b.onboardingStatus || ""),
              },
            ]
          : []),
      ]}
      tableData={
        data
          ? data.map((tableRow: any, tIndex: number) => ({
              ...tableRow,
              key: `${tIndex}`,
            }))
          : []
      }
      height={height + 32}
      // tableActions={tableActions}
      // bulkDelete={(e) => handleDelete(e)}
      onClick={(record) => navigate(getDrilldown(record))}
      exportFileName="application-onboarding"
    />
  );
};
