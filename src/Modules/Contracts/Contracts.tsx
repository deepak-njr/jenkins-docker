import { Avatar, Space, TableColumnsType, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";

import { ContentWrapper } from "@components/index";
import { ContractTooltip } from "~/Components/ContractTooltip/ContractTooltip";
import { DataTable } from "@components/index";
import { currencyFormat } from "~/Utils";
import { get } from "@services/api.service";
import { imageKey } from "@utils/Constants";
import { isNumber } from "lodash";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@hooks/useNotification";

export const Contracts = () => {
  const [data, setData] = useState<any>([]);
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getRecords = useCallback(() => {
    get("v1/application/contract/list-view")
      .then((res: any) => {
        if (res && res.response.data) {
          setData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        openToast({
          content: "Getting Contracts failed",
          type: "error",
        });
        setIsLoading(false);
      });
  }, []);
  useEffect(() => {
    getRecords();
    setIsLoading(true);
  }, [getRecords]);

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "contractName",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      sorter: (a: any, b: any) => (a.contractName || "").localeCompare(b.contractName || ""),
    },
    {
      title: "Applications Name",
      dataIndex: "applicationName",
      sorter: (a: any, b: any) => (a.applicationName || "").localeCompare(b.applicationName || ""),
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={record.applicationLogo && `${record.applicationLogo}${imageKey}`}
                icon={!record.applicationLogo && record.applicationLogo && value.slice(0, 2).toUpperCase()}
                shape="square"
              />
              {value}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
    },
    {
      title: "Vendor Name",
      dataIndex: "providerName",
      sorter: (a: any, b: any) => (a.providerName || "").localeCompare(b.providerName || ""),
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={record.providerLogo && `${record.providerLogo}${imageKey}`}
                icon={!record.providerLogo && record.providerName && value.slice(0, 2).toUpperCase()}
                shape="square"
              />
              {value}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      sorter: (a: any, b: any) => (a.departmentName || "").localeCompare(b.departmentName || ""),
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
    {
      title: "Start Date",
      dataIndex: "contractStartDate",
      render: (value: any) =>
        value ? (
          <Typography.Text>{moment(value).format("DD MMM YYYY")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) => Number(new Date(a.contractStartDate)) - Number(new Date(b.contractStartDate)),
    },
    {
      title: "End Date",
      dataIndex: "contractEndDate",
      render: (value: any) =>
        value ? (
          <Typography.Text>{moment(value).format("DD MMM YYYY")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) => Number(new Date(a.contractEndDate)) - Number(new Date(b.contractEndDate)),
    },
    {
      title: "Total Cost",
      dataIndex: "totalCost",
      defaultSortOrder: "descend",
      className: "is-currency",
      sorter: (a: any, b: any) => a.adminCost - b.adminCost,
      render: (value: any, record: any) =>
        isNumber(value) ? (
          <>
            {currencyFormat(record.adminCost, true)} {"  "}
            <ContractTooltip children={currencyFormat(record.totalCost, false, record.currencyCode)} />
          </>
        ) : (
          <Typography.Text disabled> -</Typography.Text>
        ),
      ellipsis: true,
    },
  ];

  return (
    <ContentWrapper
      loading={isLoading}
      title={"Contracts"}
    >
      <DataTable
        columns={columns}
        className="table-clickable"
        tableData={data.map((d: any) => ({ ...d, key: d.contractId }))}
        isLoading={isLoading}
        exportFileName="Contracts"
        exportOverrideColumns={[{ dataIndex: "totalCost", newDataIndex: "adminCost", isAdmin: true }]}
        additionalSearchCols={["applicationId"]}
        onClick={(record) => navigate(`/contracts/${record.key}?activeTab=overview`)}
      />
    </ContentWrapper>
  );
};
