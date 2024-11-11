import { Space, TableColumnsType, Typography } from "antd";
import { map, times } from "lodash";
import moment from "moment";
import { useState } from "react";
import { useQuery } from "~/Hooks/useQuery";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import { currencyFormat } from "~/Utils/CurrencyFormatter";
import { Progress } from "@ant-design/plots";
import { multiCloudCurrencyCode } from '@utils/Constants';

import styles from "@styles/variables.module.scss";
import { DataTable } from "~/Components";

interface Props {
  height: number;
  label: string;
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
    sorter: (a: any, b: any) => {
      const momentA = moment(a.creationDate);
      const momentB = moment(b.creationDate);         
  
      if (momentA.isBefore(momentB)) {
        return -1;
      } else if (momentA.isAfter(momentB)) {
        return 1;
      } else {
        return 0; 
      }
    },
  },
  {
    title: "Expiration Date",
    dataIndex: "expirationDate",
    ellipsis: true,
    render: (value: any) => moment(value).format("DD MMM YYYY"),
    sorter: (a: any, b: any) => {
      const momentA = moment(a.expirationDate);
      const momentB = moment(b.expirationDate);
  
      if (momentA.isBefore(momentB)) {
        return -1;
      } else if (momentA.isAfter(momentB)) {
        return 1;
      } else {
        return 0; 
      }
    },
  },

  {
    title: "Progress",
    dataIndex: "percentageConsumed",
    ellipsis: true,
    sorter: (a: any, b: any) => a.percentageConsumed - b.percentageConsumed,
    defaultSortOrder: "descend",
    render: (value: any) => (
      <Space
        size={0}
        direction="vertical"
      >
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
    className: "is-currency",
    ellipsis: true,
    sorter: (a: any, b: any) => a.budget - b.budget,
    render: (value: any, record: any) => {
      return currencyFormat(value, false, multiCloudCurrencyCode);
    },
  },
];

export const MockBudget = ({ height, label }: Props) => {
  const query = useQuery();
  const id = query.get("vendor") || "";
  const [isLoading, setIsLoading] = useState(true);

  const randomDate = (start: Date, end: Date) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const randomDataGeneration = (count: number) => {
    const pattern = ["Optimize", "Terminate"];
    const resetPeriod = ["Monthly", "Quaterly", "Yearly"];
    const scope = ["Production", "stagging", "dev"];

    const items = times(count, (i) => {
      const selectedPattern = pattern[Math.floor(Math.random() * pattern.length)];
      const name = `${scope[Math.floor(Math.random() * scope.length)]}-seer-http-index-${i}`;
      return {
        key: name,
        budgetName: name,
        scope: `${label} ${scope[Math.floor(Math.random() * scope.length)]}`,
        resetPeriod: resetPeriod[Math.floor(Math.random() * resetPeriod.length)],
        createdOn: moment(randomDate(new Date("2022/01/21"), new Date()), "DD/MM/YYYY").format("DD MMM YYYY"),
        expirationDate: moment(
          new Date(
            new Date("2021-01-01").getTime() + Math.random() * (new Date().getTime() - new Date("2021-01-01").getTime())
          )
        ),
        budget: getRandomNumber(10000),
        forecasted: selectedPattern,
        evaluatedSpend: selectedPattern,
        percentageConsumed: getRandomNumber(100),
      };
    });

    if (items.length === count) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }

    return items;
  };

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      tableData={map(randomDataGeneration(20), (d: any) => ({
        ...d,
        key: d.budgetName,
      }))}
      showTopBar={false}
      height={height}
      multiSelect={false}
    />
  );
};
