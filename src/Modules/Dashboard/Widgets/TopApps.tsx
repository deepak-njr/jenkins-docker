import { DataTable, SkeletonChart, WrapperCard } from "@components/index";
import { Link, useNavigate } from "react-router-dom";
import {Space, Tooltip, Typography} from "antd";
import { useEffect, useState } from "react";

import { currencyFormat } from "@utils/CurrencyFormatter";
import { get } from "@services/api.service";
import { imageKey } from "@utils/Constants";
import { map } from "lodash";
import styles from "./Widgets.module.scss";

export const TopApps = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    get("v1/dashboard/topapps/bymetrics")
      .then((res: any) => {
        if (res && res.response.data) {
          setData(res.response.data.getTopAppResponse);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <WrapperCard
      title={<Link to="/applications">Top Apps by Usage</Link>}
      {...(loading && { bodyClass: styles.ActiveLoadingCard })}
    >
      {loading ? (
        <SkeletonChart
          chartType="table"
          chartHeight={300}
        />
      ) : (
        <DataTable
          className="table-clickable"
          multiSelect={false}
          size="middle"
          showTopBar={false}
          height={data.length * 120}
          onClick={(record) =>
            navigate(`/applications/${record.applicationId}?activeTab=overview`)
          }
          tableData={map(data, (d: any) => ({ ...d, key: d.applicationId }))}
          columns={[
            {
              title: "Application",
              dataIndex: "applicationName",
              render: (text, record: any, index) => {
                return (
                  <Space>
                    <span
                      style={{
                        background: `url(${record.logoUrl}${imageKey})`,
                      }}
                      className={styles.logo}
                    ></span>
                    {record.applicationName}
                  </Space>
                );
              },
              key: "name",
            },
            {
              title: "Project Name",
              dataIndex: "projectName",
              width: 150,
              key: "projectName",
            },
            {
              title: "Users",
              dataIndex: "userCount",
              width: 100,
              key: "user",
            },
            {
              title: "Spend",
              dataIndex: "adminCost",
              className: "is-currency",
              key: "spend",
              width: 150,
              render: (value) => (
                <Typography.Text
                  strong
                  style={{ color: styles.primary }}
                >
                  <Tooltip title={currencyFormat(value, true)}>{currencyFormat(value, true)}</Tooltip>
                </Typography.Text>
              ),
            },
          ]}
        />
      )}
    </WrapperCard>
  );
};
