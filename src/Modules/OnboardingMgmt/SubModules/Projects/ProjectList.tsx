import { TableColumnsType, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";

import { DataTable } from "@components/index";
import { Roles } from "@utils/Roles";
import { get } from "@services/api.service";
import { useAuth } from "@hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useNotification } from "~/Hooks/useNotification";

export const ProjectList = ({ height }: { height: number }) => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const { openToast } = useNotification();

  useEffect(() => {
    get("v1/project/request/list-view")
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
      title: "Project Code",
      dataIndex: "projectCode",
      render: (value: any) =>
        value ? <Typography.Text>{value}</Typography.Text> : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      sorter: (a: any, b: any) => a.projectCode - b.projectCode,
    },
    {
      title: "Request ID",
      dataIndex: "displayRequestId",
      sorter: (a: any, b: any) => (a.displayRequestId || "").localeCompare(b.displayRequestId || ""),
    },
    {
      title: "Project Name",
      dataIndex: "projectName",
      sorter: (a: any, b: any) => (a.projectName || "").localeCompare(b.projectName || ""),
    },

    {
      title: "Project Manager",
      dataIndex: "projectManagerEmail",
      sorter: (a: any, b: any) => (a.projectManagerEmail[0] || "").localeCompare(b.projectManagerEmail[0] || ""),
      render: (value: string[], record: any) => (
        <Typography.Text>
          {value.join(", ")}
          {value[1] && (
            <Tooltip                                   
              title={value[1]}
              placement="topLeft"
            >
              <span style={{ marginLeft: 4 }}>...</span>
            </Tooltip>
          )}
        </Typography.Text>
      ),
    },
    {
      title: "Onboarded By",
      dataIndex: "onboardedByEmail",
      sorter: (a: any, b: any) => (a.onboardedByEmail || "").localeCompare(b.onboardedByEmail || ""),
    },
  ];

  const getDrilldown = (record: { [key in string]: string }) => {
    const basepath = "/onboarding-management/projects";
    if (record.childRequestId) {
      return `${basepath}/${record.requestId}?childRequestId=${record.childRequestId}`;
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
          ? data.map((tableRow: any, index: number) => ({
              ...tableRow,
              key: index,
              displayRequestId: tableRow.childRequestId ? tableRow.childRequestId : tableRow.requestId,
            }))
          : []
      }
      height={height}
      onClick={(record) => navigate(getDrilldown(record))}
      exportFileName="project-onboarding"
    />
  );
};
