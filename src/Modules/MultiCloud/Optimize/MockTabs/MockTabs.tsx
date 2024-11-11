import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { get } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { Select, TableColumnsType, Typography } from "antd";

import styles from "@styles/variables.module.scss";
import { filter, map, times } from "lodash";
import { Metric } from "./Widgets/OptimizeMetrics";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import { strings } from "@utils/Strings";
import { MultiCloud } from "../../CloudConstants";
import { multiCloudCurrencyCode } from "@utils/Constants";


interface Props {
  height: number;
  label: string;
  exportName: string;
}

export const MockTabs = ({ height, label, exportName }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }[]>([]);
  const { openToast } = useNotification();

  const cloudData = () => {
    switch (label) {
      case MultiCloud.GCP:
        return [
          "Compute Engine",
          "Cloud Storage",
          "BigQuery",
          "App Engine",
          "Cloud Run",
        ];
      case MultiCloud.DIGITAL_OCEAN:
        return ["Droplets", "App Platform", "Functions", "Spaces", "Snapshots"];
      default:
        return [
          "HPC",
          "Cloud Security",
          "Data Lakehouse",
          "ISV",
          "Multicloud Startegies",
        ];
    }
  };

  const generateMockRecomendation = () => {
    const impacts = ["High", "Medium", "Low"];
    const vendors = ["Azure", "AWS", "GCP", "Digital Ocean", "Oracle Cloud"];
    const cloudInfo = cloudData();

    return times(15, (i) => {
      const resource = cloudInfo[Math.floor(Math.random() * cloudInfo.length)];
      const spend = getRandomNumber(200);
      return {
        resourceId: `${cloudInfo[Math.floor(Math.random() * cloudInfo.length)]
          }-${(Math.random() + 1).toString(36).substring(7)}`,
        resourceName: resource,
        subscriptionId: `${label} Test Subscription`,
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        action: `Right-size or shutdown underutilized ${resource}`,
        savingsAmount: spend,
        annualSavingsAmount: spend * 12,
        categroy: "Cost",
      };
    });
  };

  useEffect(() => {
    setData(generateMockRecomendation());
  }, []);

  const getColoriezedValue = (value: string) => {
    return (
      <Typography
        style={{
          color:
            value === "High"
              ? "#E80038"
              : value === "Medium"
                ? "#FE8E0E"
                : "#1363DF",
        }}
      >
        {value}
      </Typography>
    );
  };

  const columns: TableColumnsType = [
    {
      title: "Resource ID",
      dataIndex: "resourceId",
      ellipsis: true,
      render: (value: any, record: any) =>
        value ? (
          value
        ) : (
          <Typography.Text disabled style={{ fontSize: 14 }}>
            {strings.na}
          </Typography.Text>
        ),
      width: 200,
      sorter: (a: any, b: any) =>
        (a.resourceId || "").localeCompare(b.resourceId || ""),
    },
    {
      title: "Resource Name",
      dataIndex: "resourceName",
      ellipsis: true,
      width: 200,
      sorter: (a: any, b: any) =>
        (a.resourceName || "").localeCompare(b.resourceName || ""),
    },
    {
      title: "Subscription",
      dataIndex: "subscriptionId",
      ellipsis: true,
      width: 250,
      sorter: (a: any, b: any) =>
        (a.subscriptionId || "").localeCompare(b.subscriptionId || ""),
    },
    {
      title: "Impact",
      dataIndex: "impact",
      ellipsis: true,
      render: (value: string) => getColoriezedValue(value),
      width: 100,
      sorter: (a: any, b: any) =>
        (a.impact || "").localeCompare(b.impact || ""),
    },
    {
      title: "Actions",
      dataIndex: "action",
      width: 350,
      sorter: (a: any, b: any) =>
        (a.action || "").localeCompare(b.action || ""),
    },
    {
      title: "Cost Savings",
      dataIndex: "savingsAmount",
      className:"is-currency",
      ellipsis: true,
      render: (value: any, record: any) =>
        currencyFormat(value, false, multiCloudCurrencyCode),
      width: 150,
      sorter: (a: any, b: any) => a.savingsAmount - b.savingsAmount,
    },
    {
      title: "Annual Savings",
      dataIndex: "annualSavingsAmount",
      className:"is-currency",
      ellipsis: true,
      render: (value: any, record: any) =>
        currencyFormat(value, false, multiCloudCurrencyCode),
      width: 150,
      sorter: (a: any, b: any) => a.annualSavingsAmount - b.annualSavingsAmount,
      defaultSortOrder: "descend",
    },
  ];

  return (
    <>
      <Metric data={data} />
      <DataTable
        isLoading={isLoading}
        columns={columns}
        noDataText="No Recommendations found"
        tableData={map(data, (d: any, index) => ({
          ...d,
          key: `${d.resourceId || d.subscriptionId}-${index}`,
        }))}
        height={height - 100}
        multiSelect={false}
        exportFileName={exportName}
      />
    </>
  );
};
