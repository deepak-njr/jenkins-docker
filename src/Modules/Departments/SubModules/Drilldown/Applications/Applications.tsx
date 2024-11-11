import { Space, Typography, Avatar, Badge, TableColumnsType } from "antd";
import { useCallback, useEffect, useState } from "react";
import { get } from "@services/api.service";
import { DataTable } from "@components/index";
import { useNotification } from "@hooks/useNotification";
import { imageKey } from "@utils/Constants";
import { columnWidth } from "@components/DataTable/Properties";
import { currencyFormat } from "~/Utils";
import { isNumber } from "lodash";
import { useQuery } from "@hooks/useQuery";

export const Applications = ({ id }: { id: string }) => {
  const [data, setData] = useState<any>([]);
  const { openToast, openNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const query = useQuery();

  const getRecords = useCallback(() => {
    get(`v1/department/overview?category=application&departmentId=${id}`)
      .then((res: any) => {
        if (res && res.response.data) {
          setData(res.response.data.departmentapplicationsResponse);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({
          content: err,
          type: "error",
        });
        setIsLoading(false);
      });
  }, []);
  useEffect(() => {
    if (query.get("activeTab") === "applications") {
      getRecords();
      setIsLoading(true);
    }
  }, [query]);

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "applicationName",
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
      width: columnWidth.APPLICATION_NAME,
      fixed: true,
      sorter: (a: any, b: any) => a.applicationName.localeCompare(b.applicationName),
    },
    {
      title: "Status",
      dataIndex: "applicationStatus",
      render: (value: any) =>
        value ? (
          <Space>
            <Badge color={value === "Active" ? "green" : "red"} />
            <Typography.Text>{value}</Typography.Text>
          </Space>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      width: columnWidth.GENERAL,
      sorter: (a: any, b: any) => a.applicationStatus.localeCompare(b.applicationStatus),
    },
    {
      title: "No.of Users",
      dataIndex: "applicationUserCount",
      className: "is-currency",
      render: (value: any) => (isNumber(value) ? value : <Typography.Text disabled>-</Typography.Text>),
      ellipsis: true,
      width: columnWidth.COUNT,
      sorter: (a: any, b: any) => a.applicationUserCount - b.applicationUserCount,
    },
    {
      title: "Spend (YTD)",
      dataIndex: "adminApplicationSpend",
      className: "is-currency",
      render: (value: any) =>
        isNumber(value) ? currencyFormat(value, true) : <Typography.Text disabled>-</Typography.Text>,
      width: columnWidth.COUNT,
      ellipsis: true,
      defaultSortOrder: "descend",
      sorter: (a: any, b: any) => a.adminApplicationSpend - b.adminApplicationSpend,
    },
  ];

  return (
    <DataTable
      columns={columns}
      tableData={data.map((d: any, i: number) => ({ ...d, key: `${i}-${d.applicationName}` }))}
      isLoading={isLoading}
      exportFileName="application-departments"
    />
  );
};
