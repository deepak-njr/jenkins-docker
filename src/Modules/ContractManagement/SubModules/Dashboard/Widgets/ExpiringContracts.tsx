import { DataTable, SkeletonChart, WrapperCard } from "@components/index";
import { Link, useNavigate } from "react-router-dom";
import { TableColumnsType, Typography } from "antd";
import { useEffect, useState } from "react";

import { getColoriezedValue } from "~/Utils/getColorizedValue";
import moment from "moment";
import styles from "./Widgets.module.scss";

interface Props {
  data: any;
  isLoading: boolean;
}

export const ExpiringContracts = ({ data, isLoading }: Props) => {
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState<any>([]);

  useEffect(() => {
    if (data) {
      setFilteredData(data);
    }
  }, [data]);

  const columns: TableColumnsType = [
    {
      title: "Contract Name",
      dataIndex: "contractName",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      sorter: (a: any, b: any) => (a.contractName || "").localeCompare(b.contractName || ""),
    },
    {
      title: "Expiry Date",
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
      title: "Status",
      dataIndex: "status",
      render: (value: any) => getColoriezedValue(value),
      sorter: (a: any, b: any) => (a.status || "").localeCompare(b.status || ""),
    },
  ];

  return (
    <WrapperCard
      title={<Link to="/clm/contracts">Expiring Contracts</Link>}
      // action={<Link to="/clm/contracts">View All</Link>}
      {...(isLoading && { bodyClass: styles.ActiveLoadingCard })}
    >
      {isLoading ? (
        <SkeletonChart
          chartType="table"
          chartHeight={300}
        />
      ) : (
        <DataTable
          className="table-clickable"
          multiSelect={false}
          size="middle"
          showTopBar={false}
          height={data && data.length * 120}
          onClick={(record) => navigate(`/clm/contracts/view/${record.envelopeId}`)}
          tableData={filteredData}
          columns={columns}
        />
      )}
    </WrapperCard>
  );
};
