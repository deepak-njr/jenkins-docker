import {TableColumnsType, Typography} from "antd";
import { get as _get, isNumber } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { ContentWrapper } from "@components/index";
import { DataTable } from "@components/index";
import { currencyFormat } from "~/Utils/CurrencyFormatter";
import { get } from "@services/api.service";
import moment from "moment";
import { useNavigate } from "react-router-dom";


export const Projects = () => {
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getRecords = useCallback(() => {
    get("v1/project/list")
      .then((res: any) => {
        if (res.response.data) {
          setData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);
  useEffect(() => {
    getRecords();
    setIsLoading(true);
  }, [getRecords]);

  const columns: TableColumnsType = [
    {
      title: "Project Code",
      dataIndex: "projectCode",
      render: (value: any) =>
        value ? <Typography.Text>{value}</Typography.Text> : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      sorter: (a: any, b: any) => a.projectCode.localeCompare(b.projectCode),
    },
    {
      title: "Name",
      dataIndex: "projectName",
      render:  (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      sorter: (a: any, b: any) => (a.projectName || "").localeCompare(b.projectName || ""),
    },
    {
      title: "Project Manager",
      dataIndex: "projectManagerPrimaryEmail",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      sorter: (a: any, b: any) =>
        (a.projectManagerPrimaryEmail || "").localeCompare(b.projectManagerPrimaryEmail || ""),
    },

    {
      title: "Start Date",
      dataIndex: "projectStartDate",
      render: (value: any) =>
        value ? (
          <Typography.Text>{moment(value).format("DD MMM YYYY")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) => Number(new Date(a.projectStartDate)) - Number(new Date(b.projectStartDate)),
    },
    {
      title: "End Date",
      dataIndex: "projectEndDate",
      render: (value: any) =>
        value ? (
          <Typography.Text>{moment(value).format("DD MMM YYYY")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) => Number(new Date(a.projectEndDate)) - Number(new Date(b.projectEndDate)),
    },
    {
      title: "Budget",
      dataIndex: "projectBudget",
      className: "is-currency",
      render: (value: any, record: any) =>
        isNumber(value) ? (
          currencyFormat(value, false, record.projectBudgetCurrency)
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) => a.projectBudget - b.projectBudget,
    },
    {
      title: "Cost",
      dataIndex: "projectAdminCost",
      className: "is-currency",
      render: (value: any, record: any) =>
        isNumber(value) ? currencyFormat(record.projectAdminCost, true) : <Typography.Text disabled>-</Typography.Text>,
      sorter: (a: any, b: any) => a.projectAdminCost - b.projectAdminCost,
      ellipsis: true,
      defaultSortOrder: "descend",
    },
  ];

  return (
    <ContentWrapper
      loading={isLoading}
      title={"Projects"}
    >
      <DataTable
        className="table-clickable"
        columns={columns}
        tableData={data.map((d: any) => {
          return {
            ...d,
            key: d.projectId,
            projectCode: d.projectCode ? d.projectCode.trim() : "",
            projectManagerPrimaryEmail: _get(d, "projectManagerEmail[0]", ""),
          };
        })}
        exportFileName="Projects"
        onClick={(record) => navigate(`/projects/${record.key}`)}
      />
    </ContentWrapper>
  );
};
