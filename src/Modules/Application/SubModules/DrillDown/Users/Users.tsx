import { Space, Typography, Avatar, TableColumnsType } from "antd";
import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { imageKey } from "@utils/Constants";

import { columnWidth } from "@components/DataTable/Properties";

import moment from "moment";
import { get } from "@services/api.service";
import { useQuery } from "@hooks/useQuery";

export const Users = ({ id, height }: { id: string; height: number }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const query = useQuery();

  const getRecords = useCallback(() => {
    get(`v1/application/overview?category=user&applicationId=${id}`)
      .then((res: any) => {
        setIsLoading(false);

        if (res && res.response.data) {
          setData(res.response.data);
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (query.get("activeTab") === "users" && id) {
      getRecords();
      setIsLoading(true);
    }
  }, [getRecords, query, id]);

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
      width: columnWidth.USER_NAME,
      ellipsis: true,
      fixed: true,
      sorter: (a: any, b: any) => a.userName.localeCompare(b.userName),
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
      width: columnWidth.DESIGNATION,
      sorter: (a: any, b: any) => a.userDesignation.localeCompare(b.userDesignation),
    },
    {
      title: "Last Login",
      dataIndex: "userLastLogin",
      render: (value: any) => (value ? moment(value).fromNow() : <Typography.Text disabled>-</Typography.Text>),
      ellipsis: true,
      width: columnWidth.RELATIVE_TIME,
      defaultSortOrder: "descend",
      sorter: (a: any, b: any) => a.userLastLogin - b.userLastLogin,
    },
  ];

  return (
    <DataTable
      columns={columns}
      tableData={data.map((d: any) => ({ ...d, key: d.userEmail }))}
      isLoading={isLoading}
      height={height - 60}
      exportFileName="Application Users"
    />
  );
};
