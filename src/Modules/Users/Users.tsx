import { Avatar, Button, Space, TableColumnsType, Tag, Typography } from "antd";
import { filter, map } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { ContentWrapper } from "@components/index";
import { DataTable } from "@components/index";
import { Icon } from "@iconify/react";
import { UserTransferOwner } from "./UserTransferOwner";
import { columnWidth } from "@components/DataTable/Properties";
import { get } from "@services/api.service";
import { imageKey } from "@utils/Constants";
import { permissions } from "~/Utils/Roles";
import styles from "./Users.module.scss";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { useNavigate } from "react-router-dom";

export const Users = () => {
  const { hasPermissions } = useHasAccess();
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [delereUserId, setDeleteUserId] = useState("");

  const getRecords = useCallback(() => {
    get("v1/user/details/user-list-view")
      .then((res: any) => {
        setData(res.response.data.userListViews);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);
  useEffect(() => {
    getRecords();
    setIsLoading(true);
  }, [getRecords]);

  const menuClick = (key: string, record: { [key in string]: any }) => {
    if (key === "delete") {
      setDeleteUserId(record.userId);
    }
  };

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "userName",
      render: (value: any, record: any, i: number) =>
        value ? (
          <Typography.Text>
            <Space>
              <Avatar
                src={record.userAvatar && `${record.userAvatar}${imageKey}`}
                icon={!record.userAvatar && record.userName && record.userName.slice(0, 2).toUpperCase()}
              />
              {record.userName}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      fixed: true,
      width: columnWidth.USER_NAME,
      sorter: (a: any, b: any) => a.userName.localeCompare(b.userName),
      defaultSortOrder: "ascend",
      ellipsis: true,
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
      title: "Applications",
      dataIndex: "userApplications",
      width: columnWidth.GENERAL,
      sorter: (a: any, b: any) =>
        a.userApplications && b.userApplications && a.userApplications.length - b.userApplications.length,
      render: (value: any) =>
        value ? (
          value[0] && value[0].applicationName ? (
            <Typography.Text>
              {map(
                value,
                (val, i: any) =>
                  i <= 2 && (
                    <Avatar
                      src={`${val.applicationLogo}${imageKey}`}
                      shape="square"
                      className={styles.applictions}
                    />
                  )
              )}
              {value.length - 3 > 0 && <Tag style={{ marginLeft: 4 }}>+ {value.length - 3}</Tag>}
            </Typography.Text>
          ) : (
            <Typography.Text disabled>-</Typography.Text>
          )
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
    },
  ];

  const tableActions = {
    callback: menuClick,
    items: [
      {
        label: (
          <Typography.Text type="danger">
            <Space>
              <Icon
                icon="fluent:delete-48-regular"
                inline
                fontSize={16}
              />
              Delete
            </Space>
          </Typography.Text>
        ),
        key: "delete",
      },
    ],
  };
  return (
    <ContentWrapper
      loading={isLoading}
      title={"Users"}
      actionItems={
        hasPermissions([permissions.ADD_USER]) && (
          <Button
            type="primary"
            onClick={() => navigate("/users/onboarding")}
          >
            <Space>
              <Icon
                icon="akar-icons:plus"
                inline
              />
              Add
            </Space>
          </Button>
        )
      }
    >
      <DataTable
        className="table-clickable"
        columns={columns}
        tableData={data.map((d: any) => ({ ...d, key: d.userId, userName: d.userName ? d.userName.trim() : "" }))}
        {...(hasPermissions([permissions.DELETE_USER]) && {
          bulkDelete: (e: any) => setDeleteUserId(e[0]),
          tableActions: tableActions,
        })}
        singleDelete={true}
        exportFileName="Users"
        onClick={(record) => navigate(`/users/${record.key}`)}
      />
      {delereUserId && (
        <UserTransferOwner
          removeUserID={delereUserId}
          removeUserName={filter(data, (d) => d.userId === delereUserId)[0]?.userName}
          remoseUserEmail={filter(data, (d) => d.userId === delereUserId)[0]?.userEmail}
          refreshUsers={getRecords}
          setRemoveUserID={() => setDeleteUserId("")}
        />
      )}
    </ContentWrapper>
  );
};
