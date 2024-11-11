import { Space, TableColumnsType, Typography } from "antd";
import { get as _get, isNumber } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { ContractTooltip } from "~/Components/ContractTooltip/ContractTooltip";
import { DataTable } from "@components/index";
import { columnWidth } from "@components/DataTable/Properties";
import { currencyFormat } from "~/Utils";
import { get } from "@services/api.service";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@hooks/useNotification";
import { useQuery } from "@hooks/useQuery";
import styles from "../../../Departments.module.scss"

export const Projects = ({ id }: { id: string }) => {
  const [data, setData] = useState<any>([]);
  const { openToast, openNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const query = useQuery();


  const getRecords = useCallback(() => {
    get(`v1/department/overview?departmentId=${id}&category=project`)
      .then((res: any) => {
        if (res && res.response.data) {
          setData(res.response.data.projectDepartmentResponse);
        }
        setIsLoading(false);
      })
      .catch(() => {
        openToast({
          content: "Getting Projects failed",
          type: "error",
        });
        setIsLoading(false);
      });
  }, []);
  useEffect(() => {
    if (query.get("activeTab") === "projects") {
      getRecords();
      setIsLoading(true);
    }
  }, [query]);

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "projectName",
      render: (value: any, record: any, i: number) =>
        value ? (
          <Typography.Text >
            <Space className={styles.styleWrap}>{value}</Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      fixed: true,
      ellipsis: true,
      width: columnWidth.PROJECT_NAME,
      sorter: (a: any, b: any) => a.projectName.localeCompare(b.projectName),
    },
    {
      title: "Project Manager",
      dataIndex: "projectManager",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.EMAIL,
      sorter: (a: any, b: any) => a.projectManager.localeCompare(b.projectManager),
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
      width: columnWidth.DATE,
      sorter: (a: any, b: any) => (moment(a.projectStartDate).isBefore(moment(b.projectStartDate)) ? -1 : 1),
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
      width: columnWidth.DATE,
      sorter: (a: any, b: any) => (moment(a.projectEndDate).isBefore(moment(b.projectEndDate)) ? -1 : 1),
    },
    {
      title: "Budget",
      dataIndex: "projctBudget",
      className: "is-currency",
      render: (value: any) =>
        isNumber(value) ? currencyFormat(value, true) : <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.COST,
      sorter: (a: any, b: any) => a.projctBudget && b.projctBudget && a.projctBudget - b.projctBudget,
    },
    {
      title: "Cost",
      className: "is-currency",
      dataIndex: "projectCost",
      render: (value: any, record: any) =>
        isNumber(value) ? (
          <>
            {currencyFormat(record.adminCost, true)} {"  "}
            <ContractTooltip children={currencyFormat(record.projectCost, false, record.currency)} />
          </>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      width: columnWidth.COST,
      sorter: (a: any, b: any) => a.projectCost && b.projectCost && a.projectCost - b.projectCost,
      defaultSortOrder: "descend",
    },
  ];

  return (
    <DataTable
      columns={columns}
      tableData={data.map((d: any) => ({
        ...d,
        key: d.projectId,
        projectManager: _get(d, "projectManagerEmail[0]", ""),
        secondaryContact: _get(d, "projectManagerEmail[1]", ""),
      }))}
      isLoading={isLoading}
      onClick={(record) => navigate(`/departments/projects/${record.projectId}`)}
      exportOverrideColumns={[{ dataIndex: "projectCost", newDataIndex: "adminCost", isAdmin: true }]}
      exportFileName={"dept-projects"}
    />
  );
};
