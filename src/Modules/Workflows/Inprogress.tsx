import React from "react";
import { Space, Typography, TableColumnsType, Row, Col } from 'antd';
import styles from './index.module.scss';
import { imageKey } from '~/Utils';
import { columnWidth } from '@components/DataTable/Properties';
import moment from 'moment';
import { DataTable } from '@components/index';
import { Icon } from '@iconify/react';
import { map } from 'lodash';
import { permissions } from '~/Utils/Roles';
import { useState, useEffect } from 'react';
import { useHasAccess } from '~/Hooks/useHasAccess';
import { get, put } from '@services/api.service';
import { useNotification } from '~/Hooks/useNotification';

export const Inprogress = () => {
  const [completed, setCompleted] = useState("");
  const { hasPermissions } = useHasAccess();
  const [data, setData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false);
  const { openNotification } = useNotification();

  const menuClick = (key: string, record: { [key in string]: any }) => {
    if (key === "complete") {
      updateRecord(record.workFlowNumber)
    }
  };
  const updateRecord = (workFlowNumber: string) => {
    if (workFlowNumber) {
      setIsLoading(true);
      put(`v1/user/details/workflow/status?workFlowNumber=${workFlowNumber}`, null)
        .then((res: any) => {
          if (res && res.status === "OK") {
            openNotification({
              title: "Success",
              message: "Completed",
              type: "success",
            });
            getRecords()
          }
          setIsLoading(false);
        })
    }
  };
  const getRecords = () => {
    get("v1/user/details/workflow/status?category=inprogress")
      .then((res: any) => {
        if (res && res.status === "OK") {
          setData(res.response.data);
        }
      })
      .catch(() => {
      });
  }
  useEffect(() => {
    getRecords();
  }, []);
  const tableActions = {
    callback: menuClick,
    items: [
      {
        label: (
          <Typography.Text type="danger">
            <Space>
              Completed
            </Space>
          </Typography.Text>
        ),
        key: "complete",
      },
    ],
  };

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "name",
      width: columnWidth.APPLICATION_CATEGORY,
      render: (value: any) =>
        value && Boolean(value.toString()) ? (
          value
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) =>
        a.name.localeCompare(b.name),
    },
    {
      title: "Account Name",
      dataIndex: "accountName",
      width: columnWidth.APPLICATION_NAME,
      fixed: true,
      render: (value: any, record: any, i: number) =>
        value ? (
          <Typography.Text>
            {record.accountName}
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) =>
        a.accountName.localeCompare(b.accountName),
    },

    {
      title: "Created On",
      dataIndex: "createdOn",
      render: (value: any, record: any) =>
        value ? (
          moment(value, "YYYY-MM-DD").format(
            "DD MMM YYYY"
          )
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      sorter: (a: any, b: any) =>
        a.createdOn.localeCompare(b.createdOn),
      width: columnWidth.COUNT,
      ellipsis: true,
    },
    // {
    //   title: "Last Day to Respond",
    //   dataIndex: "lastDayToRespond",
    //   render: (value: any, record: any) =>
    //     value ? (
    //       moment(value, "YYYY-MM-DD").format(
    //         "DD MMM YYYY"
    //       )
    //     ) : (
    //       <Typography.Text disabled>-</Typography.Text>
    //     ),
    //   sorter: (a: any, b: any) =>
    //     a.lastDayToRespond - b.lastDayToRespond,
    //   width: columnWidth.COUNT,
    //   ellipsis: true,
    // },

  ];
  return (
    <Col>
      <DataTable
        columns={columns}
        isLoading={isLoading}
        tableData={data.map((d: any) => ({ ...d, key: d.appId }))}
        {...(hasPermissions([permissions.EDIT_WORKFLOW]) && {
          bulkDelete: (e: any) => setCompleted(e[0]),
          tableActions: tableActions,
        })}
        height={500}
        showTopBar={false}
      ></DataTable>
    </Col>
  );
};

