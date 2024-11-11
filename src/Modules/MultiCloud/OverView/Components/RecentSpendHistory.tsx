import { Space, Table, Tooltip, Typography } from "antd";

import { currencyFormat } from "@utils/CurrencyFormatter";
import { WrapperCard } from "@components/index";

import styles from "../OverView.module.scss";
import { multiCloudCurrencyCode } from "@utils/Constants";
import { useEffect, useState } from "react";
import { get } from "@services/api.service";
import { imageKey } from "@utils/Constants";
import { map } from "lodash";
import { columnWidth } from "~/Components/DataTable/Properties";

export const RecentSpendHistory = () => {
  const [data, setData] = useState<any>([]);
  //   const [loading, setLoading] = useState(false);
  useEffect(() => {
    get("cloud/top/spend/history").then((res: any) => {
      if (res.response) {
        setData(
          map(res.response.data, (data) => ({
            serviceName: data.serviceName,
            accountName: data.vendorName,
            logoUrl: data.logo,
            resourceId: data.resourceId,
            cost: data.amountSpent,
          }))
        );
      }
    });
  }, []);

  return (
    <WrapperCard
      title={"Recent Spend History"}
      //   loading={loading}
    >
      <Table
        pagination={false}
        className={styles.expenseTable}
        size="middle"
        dataSource={map(data, (d: any) => ({ ...d, key: d.serviceName }))}
        columns={[
          {
            title: "Service Name",
            dataIndex: "serviceName",
            render: (value: string, record: any) => {
              return (
                <Space direction="vertical" size={2}>
                <Tooltip title={value}>
                  <Typography.Text>{value}</Typography.Text>
                  </Tooltip>
                  {record.timeframe && (
                    <Typography.Text style={{ fontSize: 12 }} ellipsis>
                      {record.timeframe}
                    </Typography.Text>
                  )}
                </Space>
              );
            },
            ellipsis: true,
          },
          {
            title: "Account Name",
            dataIndex: "accountName",
            width: columnWidth.DEPARTMENT_NAME,
            render: (undefined, record: any) => {
              return (
                <Space>
                  <span
                    style={{
                      background: `url(${record.logoUrl}${imageKey})`,
                    }}
                    className={styles.logo}
                  ></span>
                <Tooltip title={record.accountName}>
                  <Typography.Text ellipsis>
                    {record.accountName}
                  </Typography.Text>
                  </Tooltip>
                </Space>
              );
            },
            ellipsis: true,
          },
          {
            title: "Resource ID",
            dataIndex: "resourceId",
            ellipsis: true,
            render: (value) => (
              <Tooltip title={value}>
              <Typography.Text ellipsis>
                {value}
              </Typography.Text>
              </Tooltip>
            )
          },
          {
            title: "Cost",
            dataIndex: "cost",
            className:"is-currency",
            key: "spend",
            width: columnWidth.COUNTLESS,
            render: (value) => (
              <Typography.Text strong style={{ color: styles.primary }}>
                <Tooltip title={currencyFormat(value, false, multiCloudCurrencyCode)}>
                  {currencyFormat(value, false, multiCloudCurrencyCode)}
                </Tooltip>
              </Typography.Text>
            ),
          },
        ]}
      />
    </WrapperCard>
  );
};
