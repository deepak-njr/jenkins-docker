import React, { useContext, useEffect, useState } from "react";
import { ContentWrapper, DataTable } from "@components/index";
import { Button, Space, TableColumnsType, Typography } from "antd";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { columnWidth } from "@components/DataTable/Properties";
import { imageKey } from "~/Utils";

import { MultiCloudContext } from "~/Context/MultiCloutContext";
import styles from "./index.module.scss";
import moment from "moment";

export const MulticloudList = () => {
  const navigate = useNavigate();
  const { multiCloudItems } = useContext(MultiCloudContext);

  const columns: TableColumnsType = [
    {
      title: "Vendor",
      dataIndex: "cloudProviderName",
      width: columnWidth.APPLICATION_NAME,
      fixed: true,
      render: (value: any, record: any, i: number) =>
        value ? (
          <Typography.Text>
            <Space>
              <span
                className={styles.logo}
                style={{
                  background: `url(${record.cloudProviderLogo}${imageKey})`,
                }}
              ></span>
              {record.cloudProviderName}
            </Space>
          </Typography.Text>
        ) : (
          <Typography.Text disabled>-</Typography.Text>
        ),
      ellipsis: true,
      sorter: (a: any, b: any) => a.cloudProviderName.localeCompare(b.cloudProviderName),
    },
    {
      title: "Client ID",
      dataIndex: "clientId",
      width: columnWidth.APPLICATION_NAME,
      sorter: (a: any, b: any) => a.clientId.localeCompare(b.clientId),
    },
    {
      title: "Tenant ID",
      dataIndex: "tenantId",
      width: columnWidth.APPLICATION_NAME,
      sorter: (a: any, b: any) => a.tenantId.localeCompare(b.tenantId),
    },
    {
      title: "Onboarded On",
      dataIndex: "onboardedDate",
      width: columnWidth.DATE,
      render: (value: string) => moment(value, "YYYY-MM-DD").format("DD MMM YYYY"),
      sorter: (a: any, b: any) =>
      a.onboardedDate &&
      b.onboardedDate &&
      a.onboardedDate.localeCompare(b.onboardedDate),
    },
  ];
  return (
    <ContentWrapper
      title="Cloud Configuration"
      actionItems={
        <Button
          type="primary"
          onClick={() => navigate("/multi-cloud/add")}
        >
          <Space>
            <Icon
              icon="akar-icons:plus"
              inline
            />
            Add
          </Space>
        </Button>
      }
    >
      <DataTable
        columns={columns}
        tableData={multiCloudItems.map((d: any, index: any) => ({ ...d, key: index }))}
        exportFileName="Multicloud Configurations"
      />
    </ContentWrapper>
  );
};
