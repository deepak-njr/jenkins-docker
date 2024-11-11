import { useEffect, useState } from "react";
import { DataTable } from "@components/index";
import { get } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { TableColumnsType, Tag, Tooltip, Typography } from "antd";

import { map, values, isEmpty } from "lodash";
import styles from "@styles/variables.module.scss";
import { useQuery } from "~/Hooks/useQuery";
import { MultiCloud } from "../CloudConstants";
import { strings } from "@utils/Strings";

interface Props {
  height: number;
}

export const AzureResources = ({ height }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ [key in string]: any }[]>([]);
  const { openToast } = useNotification();
  const query = useQuery();

  useEffect(() => {
    if (query.get("vendor") === MultiCloud.AZURE) {
    }
    setIsLoading(true);

    get(`/cloud/resources?category=${MultiCloud.AZURE}`)
      .then((res: any) => {
        if (res.response.data) {
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
        setIsLoading(false);
        openToast({ content: err, type: "error" });
      });
  }, [query]);

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
      width: 150,
      sorter: (a: any, b: any) => (a.resourceType || "").localeCompare(b.resourceType || ""),
    },
    {
      title: "Subscription",
      dataIndex: "subscriptionName",
      ellipsis: true,
      width: 200,
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
        values(value).map((item) => (
          <Tooltip
            title={item}
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
              {item}
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
      tableData={map(data, (d: any, index) => {
        return {
          ...d,
          key: `${d.resourceId || d.subscriptionId}-${index}`,
        };
      })}
      height={height}
      exportFileName="Azure Resources"
      exportOverrideDataIndexFields={[{ currentField: "resourceTags", newField: "resourceTagsArr" }]}
    />
  );
};
