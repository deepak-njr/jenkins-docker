import { Space, Typography } from "antd";
import { Icon } from "@iconify/react";
import moment from "moment";

import { MetricsCard } from "@components/index";

import { getRandomNumber } from "~/mocks/getRandomNumber";
import styles from "@styles/variables.module.scss";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";

export const AverageUsage = ({ usage }: { usage: number }) => {
  return (
    <MetricsCard
      icon={"bx:bar-chart-square"}
      style={{ height: "100%" }}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Average Usage</span>}
      totalCount={<span style={{ color: styles.primary }}>{usage}%</span>}
      graph={
        <Space direction="vertical" style={{ display: "flex" }}>
          <TinyBarGraph count={getRandomNumber(100)}/>
        </Space>
      }
    />
  );
};
