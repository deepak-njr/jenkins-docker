import { Avatar, Button, Drawer, Space, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { get, put } from "~/Services";

import { DataTable } from "~/Components";
import { imageKey } from "@utils/Constants";
import { useNotification } from "~/Hooks/useNotification";
import { useParams } from "react-router-dom";

interface Props {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  licenseId: string;
  unmappedLicenses: number;
  refreshData: () => void;
}

export const AssignUser = (props: Props) => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const { openNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const getApplicationInfo = () => {
    get(`v1/application/overview?applicationId=${id}`)
      .then((res: any) => {
        setIsLoading(false);
        if (res?.response?.data) {
          get(`v1/department/user/unmapped?departmentId=${res.response.data.departmentId}&licenseId=${props.licenseId}`)
            .then((res: any) => {
              if (res.response.data) {
                setData(res.response.data);
              }
            })
            .catch(() => {
              setIsLoading(false);
            });
        }
      })
      .catch(() => {
        setIsLoading(false);
      });
  };
  const handleAssign = (id: string[], licenseId: any) => {
    if (!id) return;
    if (selectedItems.length > props.unmappedLicenses) {
      openNotification({
        message: "exceded licenses",
        type: "error",
      });
    } else {
      put("v1/application/license/link", {
        licenseId: licenseId,
        userId: id,
      }).then((res: any) => {
        if (res) {
          openNotification({
            title: "success",
            message: "Licenses updated",
            type: "success",
          });
          props.setOpenModal(false);
          props.refreshData();
        }
      });
    }
  };
  useEffect(() => {
    if (selectedItems.length > props.unmappedLicenses) {
      openNotification({
        message: "exceded licenses limit",
        type: "error",
      });
    }
  }, [selectedItems]);

  useEffect(() => {
    if (props.openModal) {
      getApplicationInfo();
    }
  }, [props.openModal]);

  const userColumns = [
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
      ellipsis: true,
    },
    {
      title: "Email",
      dataIndex: "userEmail",
      render: (value: any, record: any) => value || <Typography.Text disabled>-</Typography.Text>,
      ellipsis: true,
    },
  ];
  return (
    <Drawer
      title="Assign License to Users"
      placement="right"
      width={600}
      closable={false}
      destroyOnClose={true}
      open={props.openModal}
      footer={
        <Space
          align="end"
          style={{ float: "right" }}
        >
          <Button onClick={() => props.setOpenModal(false)}>Cancel</Button>
          <Button
            type="primary"
            disabled={selectedItems.length <= 0 || selectedItems.length > props.unmappedLicenses}
            onClick={(e: any) => handleAssign(selectedItems, props.licenseId)}
          >
            Assign
          </Button>
        </Space>
      }
      onClose={() => {
        props.setOpenModal(false);
      }}
    >
      <DataTable
        columns={userColumns}
        tableData={data.map((d: any) => ({ ...d, key: d.userId }))}
        isLoading={isLoading}
        maxSelection={props.unmappedLicenses}
        showSelection={`${props.unmappedLicenses} Licences available`}
        selectedItems={(selectedItems: any) => {
          if (selectedItems.length <= props.unmappedLicenses) {
            setSelectedItems(selectedItems);
          }
        }}
        hideExport
      />
    </Drawer>
  );
};
