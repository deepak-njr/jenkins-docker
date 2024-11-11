import { Space, Typography, Avatar, Badge, TableColumnsType } from "antd";
import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { useNotification } from "@hooks/useNotification";
import { imageKey } from "@utils/Constants";

import { isNumber } from "lodash";
import { get } from "@services/api.service";
import { useQuery } from "@hooks/useQuery";

import { columnWidth } from "@components/DataTable/Properties";

export const Users = ({ id }: { id: string }) => {
  const [data, setData] = useState<any>([]);
  const { openToast, openNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const query = useQuery();

  const getRecords = useCallback(() => {
    get(`v1/department/overview?category=user&departmentId=${id}`)
      .then((res: any) => {
        if (res && res.response.data) {
          setData(res.response.data.departmentusersResponse);
        }
        setIsLoading(false);
      })
      .catch(() => {
        openToast({
          content: "Getting Users failed",
          type: "error",
        });
        setIsLoading(false);
      });
  }, []);
  useEffect(() => {
    if (query.get("activeTab") === "users") {
      getRecords();
      setIsLoading(true);
    }
  }, [query]);

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "userName",
      render: (value: any, record: any, i: number) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={record.userLogo && `${record.userLogo}${imageKey}`}
                icon={!record.userLogo && record.userName && record.userName.slice(0, 2).toUpperCase()}
              />
              {record.userName}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      fixed: true,
      width: columnWidth.USER_NAME,
      sorter: (a: any, b: any) => {
        const nameA = a.userName.toUpperCase().replace(/[^a-zA-Z]/g, "");
        const nameB = b.userName.toUpperCase().replace(/[^a-zA-Z]/g, "");
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      },
    },

    {
      title: "Status",
      dataIndex: "userStatus",
      render: (value: any) =>
        value ? (
          <Typography.Text>
            <Space>
              <Badge color={value === "Active" ? "green" : "red"} />
              {value}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      width: columnWidth.GENERAL,
      sorter: (a: any, b: any) => a.userStatus.localeCompare(b.userStatus),
    },
    {
      title: "Email",
      dataIndex: "userEmail",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.EMAIL,
      sorter: (a: any, b: any) => a.userEmail.localeCompare(b.userEmail),
    },
    {
      title: "Designation",
      dataIndex: "userDesignation",
      render: (value: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
      width: columnWidth.EMAIL,
      sorter: (a: any, b: any) =>
        a.userDesignation && b.userDesignation && a.userDesignation.localeCompare(b.userDesignation),
    },
    {
      title: "No.of Applications",
      dataIndex: "userApplicationCount",
      render: (value: any) => (isNumber(value) ? value : <Typography.Text disabled>-</Typography.Text>),
      ellipsis: true,
      width: columnWidth.COUNT,
      sorter: (a: any, b: any) => a.userApplicationCount - b.userApplicationCount,
      defaultSortOrder: "descend",
    },
  ];

  return (
    <DataTable
      columns={columns}
      tableData={data.map((d: any) => ({ ...d, key: d.userEmail }))}
      isLoading={isLoading}
      exportFileName="Department Users"
    />
  );
};
