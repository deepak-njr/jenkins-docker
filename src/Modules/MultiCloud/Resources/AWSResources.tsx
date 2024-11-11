import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { get } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { TableColumnsType, Tag, Tooltip, Typography } from "antd";

import { isEmpty, map, values } from "lodash";
import styles from "@styles/variables.module.scss";
import { MultiCloud } from "../CloudConstants";
import { useQuery } from "~/Hooks/useQuery";
import { strings } from "@utils/Strings";

interface Props {
  height: number;
}

export const AWSResources = ({ height }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }[]>([]);
  const { openToast } = useNotification();
  const query = useQuery();
  useEffect(() => {
    if (query.get("vendor") === MultiCloud.AWS) {
      setIsLoading(true);
      get(`/cloud/resources?category=${MultiCloud.AWS}`)
        .then((res: any) => {
          if (res && res.response && res.response.data) {
            let newData = res.response.data;
            newData = newData.map((record: any) => {
              let arr: any = [];
              if (!isEmpty(record.resourceTags)) {
                arr = Object.keys(record.resourceTags).map((key) => ({ name: key, value: record.resourceTags[key] }));
              }
              arr = arr.filter((item: any) => item.value);
              return {
                ...record,
                resourceTagsArr: arr,
              };
            });
            setData(newData);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          openToast({ content: err, type: "error" });
        });
    }
  }, [query]);

  const columns: TableColumnsType = [
    {
      title: "Resource Id",
      dataIndex: "resourceId",
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
      sorter: (a: any, b: any) => (a.resourceId || "").localeCompare(b.resourceId || ""),
      defaultSortOrder: "ascend",
    },
    {
      title: "Resource Type",
      dataIndex: "resourceType",
      ellipsis: true,
      render: (value: string) => value,
      width: 200,
      sorter: (a: any, b: any) => (a.resourceType || "").localeCompare(b.resourceType || ""),
    },
    {
      title: "Account ID",
      dataIndex: "accountId",
      ellipsis: true,
      render: (value: string) => value,
      width: 150,
      sorter: (a: any, b: any) => (a.accountId || "").localeCompare(b.accountId || ""),
    },
    {
      title: "Region",
      dataIndex: "region",
      ellipsis: true,
      render: (value: string) => value,
      sorter: (a: any, b: any) => (a.region || "").localeCompare(b.region || ""),
      width: 150,
    },
    {
      title: "Tags",
      dataIndex: "resourceTags",
      width: 150,
      render: (value: any) =>
        value &&
        values(value).map((item) => (
          <Tooltip
            title={item.key}
            color={styles.white}
            overlayInnerStyle={{
              color: styles.primary,
            }}
          >
            <Tag
              color="default"
              style={{
                marginRight: 8,
                maxWidth: 150,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.value}
            </Tag>
          </Tooltip>
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
      exportFileName="AWS Resources"
    />
  );
};
