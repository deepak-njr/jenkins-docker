import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { get } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import moment from "moment";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { Space, TableColumnsType, Typography } from "antd";
import { Progress } from "@ant-design/plots";

import styles from "@styles/variables.module.scss";
import { map } from "lodash";
import { useQuery } from "~/Hooks/useQuery";
import { useParams } from "react-router-dom";
import { MultiCloud } from "../../CloudConstants";

interface Props {
  height: number;
}

const columns: TableColumnsType = [
  {
    title: "Budget Name",
    dataIndex: "budgetName",
    ellipsis: true,
    sorter: (a: any, b: any) => a.budgetName.localeCompare(b.budgetName),
  },
  {
    title: "Scope",
    dataIndex: "scope",
    ellipsis: true,
    sorter: (a: any, b: any) => a.scope.localeCompare(b.scope),
  },
  {
    title: "Reset Period",
    dataIndex: "resetPeriod",
    ellipsis: true,
    sorter: (a: any, b: any) => a.resetPeriod.localeCompare(b.resetPeriod),
  },
  {
    title: "Creation Date",
    dataIndex: "creationDate",
    ellipsis: true,
    render: (value: any) => moment(value).format("DD MMM YYYY"),
    sorter: (a: any, b: any) => a.creationDate.localeCompare(b.creationDate),
  },
  {
    title: "Expiration Date",
    dataIndex: "expirationDate",
    ellipsis: true,
    render: (value: any) => moment(value).format("DD MMM YYYY"),
    sorter: (a: any, b: any) =>
      a.expirationDate.localeCompare(b.expirationDate),
  },
  {
    title: "Progress",
    dataIndex: "percentageConsumed",
    ellipsis: true,
    sorter: (a: any, b: any) => a.percentageConsumed - b.percentageConsumed,
    defaultSortOrder: "descend",
    render: (value: any) => (
      <Space size={0} direction="vertical">
        <Progress
          {...{
            height: 10,
            width: 100,
            autoFit: true,
            percent: value / 100,
            padding: 0,
            barWidthRatio: 0.3,
            color: [styles.strawberry, styles.secondaryGreen],
          }}
        />
        <Typography.Text style={{ fontSize: 12 }}>
          {Math.floor(value > 100 ? 100 : value).toFixed(2)}% Consumed
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: "Budget",
    dataIndex: "budget",
    className:"is-currency",
    ellipsis: true,
    sorter: (a: any, b: any) => a.budget - b.budget,
    render: (value: any, record: any) => {
      return currencyFormat(value, false, record.currency);
    },
  },
];

export const Azure = ({ height }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const { openToast } = useNotification();
  const query = useQuery();
  const { id } = useParams();
  useEffect(() => {
    if (query.get("vendor") === MultiCloud.AZURE && id === "Budgets") {
      setIsLoading(true);
      get(`/cloud/budget?category=${MultiCloud.AZURE}`)
        .then((res: any) => {
          if (res.status === "OK") {
            setData(res.response.data);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          openToast({ content: err, type: "error" });
        });
    }
  }, [query]);

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      tableData={map(data, (d: any) => ({ ...d, key: d.budgetName }))}
      showTopBar={false}
      height={height}
      multiSelect={false}
    />
  );
};
