import { Space, Table, Tooltip, Typography } from "antd";

import { currencyFormat } from "@utils/CurrencyFormatter";
import { WrapperCard } from "@components/index";

import styles from "../OverView.module.scss";
import { useEffect, useState } from "react";
import { get } from "@services/api.service";
import { imageKey } from "@utils/Constants";
import { map } from "lodash";
import { useNotification } from "~/Hooks/useNotification";
import { getRedirectLink } from "./getRedirect";
import { Link } from "react-router-dom";

export const TopExpensiveService = () => {
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openToast } = useNotification();

  useEffect(() => {
    setIsLoading(true);
    get("cloud/top/expensive/services")
      .then((res: any) => {
        if (res.response) {
          setData(
            map(res.response.data, (data) => ({
              serviceName: data.serviceName,
              accountName: data.vendorName,
              logoUrl: data.logo,
              resourceId: data.resourceId,
              cost: data.totalAmountSpent,
              currency: data.currency,
            }))
          );
          setIsLoading(false);
        }
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
        setIsLoading(false);
      });
  }, []);

  return (
    <WrapperCard title={"Top Expensive Services"} subTitle={"Last 30 days"}>
      <Table
        loading={isLoading}
        pagination={false}
        className={styles.expenseTable}
        size="middle"
        dataSource={map(data, (d: any) => ({ ...d, key: d.serviceName }))}
        columns={[
          {
            title: "Service Name",
            dataIndex: "serviceName",
            ellipsis: true,
          },
          {
            title: "Account Name",
            dataIndex: "accountName",
            render: (undefined, record: any) => {
              return (
                <Link to={getRedirectLink(record.accountName)}>
                  <Space>
                    <span
                      style={{
                        background: `url(${record.logoUrl}${imageKey})`,
                      }}
                      className={styles.logo}
                    ></span>
                    {record.accountName}
                  </Space>
                </Link>
              );
            },
            ellipsis: true,
          },
          {
            title: "Cost",
            dataIndex: "cost",
            className:"is-currency",
            key: "spend",
            render: (value, record: any) => (
              <Typography.Text strong style={{ color: styles.primary }}>
                {
                  currencyFormat(
                    value,
                    false,
                    record.currency,
                    "standard")}
              </Typography.Text>
            ),
          },
        ]}
      />
    </WrapperCard>
  );
};
