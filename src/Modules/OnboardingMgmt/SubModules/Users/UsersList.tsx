import { Avatar, Space, TableColumnsType, Typography } from "antd";
import { useEffect, useState } from "react";

import { DataTable } from "@components/index";
import { Roles } from "@utils/Roles";
import { get } from "@services/api.service";
import { has } from "lodash";
import { imageKey } from "@utils/Constants";
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useNotification } from "~/Hooks/useNotification";

export const UsersList = ({ height }: { height: number }) => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const { openToast } = useNotification();

  useEffect(() => {
    get("v1/user/onboarding/request/list-view")
      .then((res: any) => {
        if (res.status == "OK") {
          if (res.response.data) {
            setData(res.response.data);
          }
        }
      })
      .catch((err) => openToast({ content: err, type: "error" }));
  }, []);
  const {
    user: { role },
  } = useAuth();
  const columns: TableColumnsType = [
    {
      title: "Request ID",
      dataIndex: "requestId",
      sorter: (a: any, b: any) =>
        (a.requestId || "").localeCompare(b.requestId || ""),
      render: (value: any, record: any, i: number) =>
        has(record, "childRequestId") ? (
          <Typography.Text>{record.childRequestId}</Typography.Text>
        ) : (
          <Typography.Text>{value}</Typography.Text>
        ),
    },
    {
      title: "User Name",
      dataIndex: "userName",
      sorter: (a: any, b: any) =>
        (a.userName || "").localeCompare(b.userName || ""),
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
    },
    {
      title: "Onboarded By",
      dataIndex: "onboardedByEmail",
      sorter: (a: any, b: any) =>
        (a.onboardedByEmail || "").localeCompare(b.onboardedByEmail || ""),
    },
  ];

  const getDrilldown = (record: { [key in string]: string }) => {
    const basepath = "/onboarding-management/users";
    if (record.childRequestId) {
      return `${basepath}/${record.key}?childRequestId=${record.childRequestId}`;
    }
    return `${basepath}/${record.key}`;
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
                sorter: (a: any, b: any) =>
                  (a.reviewedByEmail || "").localeCompare(
                    b.reviewedByEmail || ""
                  ),
              },
            ]
          : []),
        ...(role === Roles.SUPER_ADMIN
          ? [
              {
                title: "Status",
                dataIndex: "onboardingStatus",
                sorter: (a: any, b: any) =>
                  (a.onboardingStatus || "").localeCompare(
                    b.onboardingStatus || ""
                  ),
              },
            ]
          : []),
      ]}
      tableData={
        data
          ? data.map((tableRow: any) => ({
              ...tableRow,
              key: tableRow.childRequestId
                ? tableRow.childRequestId
                : tableRow.requestId,
            }))
          : []
      }
      height={height}
      // tableActions={tableActions}
      // bulkDelete={(e) => handleDelete(e)}
      onClick={(record) => navigate(getDrilldown(record))}
      exportFileName="user-onboarding"
    />
  );
};
