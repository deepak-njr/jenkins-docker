import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { useNotification } from "~/Hooks/useNotification";
import { TableColumnsType, Tag, Typography } from "antd";
import { strings } from "@utils/Strings";
import { flatten, map, times } from "lodash";
import { useQuery } from "~/Hooks/useQuery";

interface Props {
  height: number;
  exportName: string;
}

export const MockTabs = ({ height, exportName }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }[]>([]);
  const { openToast } = useNotification();
  const query = useQuery();

  const cloudData = () => {
    switch (query.get("vendor")) {
      case "2":
        return ["Virtual Machine", "Ingress", "AKS", "ACR", "Resource Mover"];
      case "2":
        return ["Athena", "EMR", "CloudSearch", "Redshift", "Appflow"];
      case "3":
        return ["Compute Engine", "Cloud Storage", "BigQuery", "App Engine", "Cloud Run"];
      case "4":
        return ["Droplets", "App Platform", "Functions", "Spaces", "Snapshots"];
      default:
        return ["HPC", "Cloud Security", "Data Lakehouse", "ISV", "Multicloud Startegies"];
    }
  };

  const generateMockData = () => {
    const tags = ["DEV", "SIT", "PROD", "DB", "Testing"];
    setData(
      flatten(
        map(cloudData(), (data) =>
          times(5, (i) => {
            let resourceTags = times(2, () => tags[Math.floor(Math.random() * tags.length)]);
            let resourceTagsArr = Object.keys(resourceTags).map((key: any) => ({
              name: key,
              value: resourceTags[key],
            }));
            return {
              resourceName: `${data}-${(Math.random() + 1).toString(36).substring(7)}`,
              resourceType: data,
              subscriptionName: "Demo Subscription",
              resourceLocation: "Southeast Asia",
              resourceTags: times(2, () => tags[Math.floor(Math.random() * tags.length)]),
              resourceTagsArr,
            };
          })
        )
      )
    );
  };

  useEffect(() => {
    generateMockData();
  }, []);

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "resourceName",
      ellipsis: true,
      render: (value: any, record: any) =>
        value ? (
          value
        ) : (
          <Typography.Text
            disabled
            style={{ fontSize: 14 }}
          >
            {strings.na}
          </Typography.Text>
        ),
      width: 200,
      sorter: (a: any, b: any) => (a.resourceName || "").localeCompare(b.resourceName || ""),
      defaultSortOrder: "ascend",
    },
    {
      title: "Type",
      dataIndex: "resourceType",
      ellipsis: true,
      width: 200,
      sorter: (a: any, b: any) => (a.resourceType || "").localeCompare(b.resourceType || ""),
    },
    {
      title: "Subscription",
      dataIndex: "subscriptionName",
      ellipsis: true,
      width: 250,
      sorter: (a: any, b: any) => (a.subscriptionName || "").localeCompare(b.subscriptionName || ""),
    },
    {
      title: "Location",
      dataIndex: "resourceLocation",
      ellipsis: true,
      render: (value: string) => value,
      width: 150,
      sorter: (a: any, b: any) => (a.resourceLocation || "").localeCompare(b.resourceLocation || ""),
    },
    {
      title: "Tags",
      dataIndex: "resourceTags",
      width: 150,
      render: (value: string[]) =>
        value &&
        value.map((item) => (
          <Tag
            color="default"
            style={{ marginRight: 8 }}
          >
            {item}
          </Tag>
        )),
    },
  ];

  return (
    <DataTable
      isLoading={isLoading}
      columns={columns}
      noDataText="No Recommendations found"
      tableData={map(data, (d: any, index) => ({
        ...d,
        key: `${d.resourceId || d.subscriptionId}-${index}`,
      }))}
      height={height}
      exportFileName={exportName}
    />
  );
};
