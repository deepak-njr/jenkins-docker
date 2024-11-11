import { ContentWrapper } from "@components/index";

import { Space, Typography, Avatar, TableColumnsType, Badge, Tag, Tooltip, Popover, List } from "antd";
import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { imageKey } from "@utils/Constants";
import { isNumber, sortBy } from "lodash";
import { currencyFormat } from "~/Utils";
import { get } from "@services/api.service";
import styles from "./Subscriptions.module.scss";
import { columnWidth } from "~/Components/DataTable/Properties";

export const Subscriptions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    setIsLoading(true);
    get("v1/application/subscription/list")
      .then((res: any) => {
        if (res.response.data) {
          setData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, []);

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "subscriptionName",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      sorter: (a: any, b: any) => (a.subscriptionName || "").localeCompare(b.subscriptionName || ""),
    },
    {
      title: "Subscription Id",
      dataIndex: "subscriptionNumber",
      width: columnWidth.GENERAL,
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      sorter: (a: any, b: any) => (a.subscriptionNumber || "").localeCompare(b.subscriptionNumber || ""),
    },
    {
      title: "Application Name",
      dataIndex: "applicationName",
      sorter: (a: any, b: any) => (a.applicationName || "").localeCompare(b.applicationName || ""),
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={record.applicationLogo && `${record.applicationLogo}${imageKey}`}
                shape="square"
                icon={!record.applicationLogo && record.applicationLogo && value.slice(0, 2).toUpperCase()}
              />
              {value}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
    },
    {
      title: "Contract",
      dataIndex: "contracts",
      width: columnWidth.APPLICATION_NAME,
      sorter: (a: any, b: any) => (a.contractName || "").localeCompare(b.contractName || ""),
      render: (value: any) => {
        // const sortedData = sortBy(value, "contractStatus");
        const sortedData = value;
        if (value && value.length > 0) {
          return (
            <Space>
              <Space>
                <Badge
                  color={sortedData[0].contractStatus === "Active" ? styles.secondaryGreen : styles.secondaryRed}
                />
                <Tooltip title={sortedData[0].contractName}>
                  <Typography.Text
                    style={{ width: 150 }}
                    ellipsis
                  >
                    {sortedData[0].contractName}
                  </Typography.Text>
                </Tooltip>
              </Space>

              {sortedData.length - 1 > 0 && (
                <Popover
                  placement="top"
                  overlayInnerStyle={{
                    maxHeight: 300,
                    overflow: "auto",
                  }}
                  content={
                    <List
                      dataSource={sortedData}
                      renderItem={(item: any, i: any) =>
                        i !== 0 && (
                          <List.Item>
                            <Space>
                              <Badge
                                color={item.contractStatus === "Active" ? styles.secondaryGreen : styles.secondaryRed}
                              />
                              <Tooltip title={item.contractName}>
                                <Typography.Text>{item.contractName}</Typography.Text>
                              </Tooltip>
                            </Space>
                          </List.Item>
                        )
                      }
                    ></List>
                  }
                >
                  <Tag>+{value.length - 1}</Tag>
                </Popover>
              )}
            </Space>
          );
        } else {
          <Typography.Text disabled>-</Typography.Text>;
        }
      },

      ellipsis: true,
    },
    {
      title: "Provider",
      dataIndex: "providerName",
      sorter: (a: any, b: any) => (a.providerName || "").localeCompare(b.providerName || ""),
      render: (value: any, record: any) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={record.providerLogo && `${record.providerLogo}${imageKey}`}
                shape="square"
                icon={!record.providerLogo && record.providerLogo && value.slice(0, 2).toUpperCase()}
              />
              {value}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
    },
    {
      title: "Cost",
      dataIndex: "adminCost",
      className: "is-currency",
      defaultSortOrder: "descend",
      sorter: (a: any, b: any) => a.adminCost - b.adminCost,
      render: (value: any, record: any) =>
        isNumber(value) ? currencyFormat(value, true) : <Typography.Text disabled>-</Typography.Text>,

      ellipsis: true,
    },
  ];

  return (
    <ContentWrapper
      loading={isLoading}
      title={"Subscriptions"}
    >
      <DataTable
        columns={columns}
        tableData={data.map((d: any) => {
          d.contracts = sortBy(d.contracts, "contractStatus");
          d.contractName = "";
          if (d.contracts) {
            d.contractName = [...d.contracts].map((item: any) => item.contractName).join(" ");
          }
          return { ...d, key: d.subscriptionId };
        })}
        isLoading={isLoading}
        exportFileName="Subscriptions"
        additionalSearchCols={["contractName"]}
      />
    </ContentWrapper>
  );
};
