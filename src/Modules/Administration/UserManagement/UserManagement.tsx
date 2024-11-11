import React from "react";
import { ContentWrapper, DataTable } from "@components/index";
import { Avatar, Button, message, Modal, Select, Space, TableColumnsType, Tabs, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import moment from "moment";
import { imageKey } from "~/Utils";
import { columnWidth } from "@components/DataTable/Properties";
import { useCallback, useEffect, useState } from "react";
import { api, get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { permissions } from "~/Utils/Roles";
import { toUpper } from "lodash";
import { useQuery } from "~/Hooks/useQuery";

export const UserManagement = () => {
  const navigate = useNavigate();
  const { hasPermissions } = useHasAccess();
  const [data, setData] = useState<any>([]);
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const query = useQuery();
  const activeTab = query.get("activeTab") || "activeUsers";
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>([]);

  const getRecords = useCallback(() => {
    setIsLoading(true);
    const isActive = activeTab;
    get(`v1/user/details/admin/list?isActive=${isActive}`)
      .then((res: any) => {
        if (res.response.data) {
          setData(res.response.data);
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
  }, [activeTab]);

  const handleRevoke = (email: any) => {
    const formData = new FormData();
    formData.append("email", email);
    api
      .delete(`v1/user/details/revoke/admin/access`, { data: formData })
      .then(() => {
        message.success("Admin Access revoked successfully");
        getRecords();
      })
      .catch(() => {
        message.error("User can't be revoked");
      });
  };

  const handleUpdateRole = () => {
    setIsLoading(true);
    if (selectedUser) {
      setOpenModal(false);
      const formData = new FormData();
      formData.append("userEmail", selectedUser.userEmail);
      formData.append("userRole", selectedUser.role);
      api
        .put(`v1/user/details/admin/userRole/Update`, formData)
        .then((res: any) => {
          message.success(res.data.message);
          getRecords();
        })
        .catch((err: any) => {
          message.error(err?.response?.data?.message);
          setIsLoading(false);
        });
    }
  };

  const handleRetain = (email: any) => {
    const formData = new FormData();
    formData.append("email", email);
    api
      .put(`v1/user/details/retain/admin/access`, formData)

      .then((res) => {
        message.success("Admin Access Retained successfully");
        getRecords();
      })
      .catch(() => {
        message.error("Admin is not yet revoked");
      });
  };

  const menuClick = (key: string, record: { [key in string]: any }) => {
    if (key === "revoke") {
      handleRevoke(record.userEmail);
    } else if (key === "updateRole") {
      setSelectedUser(record);
      setOpenModal(true);
    } else {
      handleRetain(record.userEmail);
    }
  };
  useEffect(() => {
    if (!query.get("activeTab")) {
      navigate(`/administration/user-management?activeTab=${activeTab}`);
    } else {
      getRecords();
    }
  }, [activeTab, navigate, query, getRecords]);

  const handleCancel = () => {
    setOpenModal(false);
  };

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "userName",
      render: (value: any, record: any) => (
        <Typography.Text>
          <Space>
            <Avatar
              src={record.userAvatar && `${record.userAvatar}${imageKey}`}
              icon={!record.userAvatar && record.userName && record.userName.slice(0, 2).toUpperCase()}
            />
            {record.userName}
          </Space>
        </Typography.Text>
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
      title: "Last Login",
      dataIndex: "saaspeLastLogin",
      // render: (value: any) => value,
      ellipsis: true,
      width: columnWidth.DATE,
      render: (value: any) =>
        value ? (
          <Typography.Text>{moment(value).format("DD MMM YYYY")}</Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      sorter: (a: any, b: any) => a.saaspeLastLogin - b.saaspeLastLogin,
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (value: any) => (value ? toUpper(value) : value),
      ellipsis: true,
      width: columnWidth.GENERAL,
      sorter: (a: any, b: any) => a.role.localeCompare(b.role),
    },
  ];
  const items = [
    {
      label: "Active Users",
      key: "activeUsers",
      children: <></>,
    },
    {
      label: "Inactive Users",
      key: "inActiveUsers",
      children: <></>,
    },
  ];

  const tableActions = {
    callback: menuClick,
    items:
      activeTab === "activeUsers"
        ? [
            { label: <Typography.Text>Revoke</Typography.Text>, key: "revoke" },
            { label: <Typography.Text>Update</Typography.Text>, key: "updateRole" },
          ]
        : [{ label: <Typography.Text>Retain</Typography.Text>, key: "retain" }],
  };

  return (
    <ContentWrapper
      title="User Management"
      actionItems={
        hasPermissions([permissions.ADD_ADMINUSER]) && (
          <Button
            type="primary"
            onClick={() => navigate("/administration/user-management/add")}
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
      bodyStyle={{ height: "500px" }}
    >
      <Tabs
        activeKey={query?.get("activeTab") || ""}
        items={items}
        onChange={(activeKey) => {
          navigate(`/administration/user-management?activeTab=${activeKey}`);
        }}
      ></Tabs>
      <DataTable
        columns={columns}
        tableData={data.map((d: any) => ({ ...d, key: d.userId, userName: d.userName ? d.userName.trim() : "" }))}
        tableActions={tableActions}
        isLoading={isLoading}
        isPagination
        exportFileName="Users"
      />
      <Modal
        open={openModal}
        onCancel={handleCancel}
        closable
        maskClosable={false}
        title="Update Role"
        onOk={handleUpdateRole}
        bodyStyle={{ height: "200px" }}
      >
        <div>
          <h4>Select Role</h4>
          <Select
            defaultValue={selectedUser.role}
            onChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
            style={{ width: "300px" }}
          >
            {["CONTRIBUTOR", "REVIEWER", "APPROVER", "SUPER_ADMIN", "SUPPORT"].map(
              (role: any) =>
                role !== selectedUser.role && (
                  <Select.Option
                    key={role}
                    value={role}
                  >
                    {role}
                  </Select.Option>
                )
            )}
          </Select>
        </div>
      </Modal>
    </ContentWrapper>
  );
};
