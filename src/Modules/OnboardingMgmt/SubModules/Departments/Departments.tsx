import { TableColumnsType, Typography } from "antd";
import { useEffect, useState } from "react";

import { DataTable } from "@components/index";
import { Roles } from "@utils/Roles";
import { get } from "@services/api.service";
import { has } from "lodash";
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useNotification } from "~/Hooks/useNotification";

export const DepartmentList = ({ height }: { height: number }) => {
  const [data, setData] = useState([]);
  const { openToast } = useNotification();
  const navigate = useNavigate();
  const {
    user: { role },
  } = useAuth();

  useEffect(() => {
    get("v1/department/request/list-view")
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
      title: "Department Name",
      dataIndex: "departmentName",
      sorter: (a: any, b: any) =>
        (a.departmentName || "").localeCompare(b.departmentName || ""),
    },
    {
      title: "Onboarded By",
      dataIndex: "onBoardedByEmail",
      sorter: (a: any, b: any) =>
        (a.onBoardedByEmail || "").localeCompare(b.onBoardedByEmail || ""),
    },
  ];

  const getDrilldown = (record: { [key in string]: string }) => {
    const basepath = "/onboarding-management/departments";
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
      height={height + 32}
      onClick={(record) => navigate(getDrilldown(record))}
      exportFileName="departments-onboarding"
    />
  );
};
