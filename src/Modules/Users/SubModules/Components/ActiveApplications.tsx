import { Space, Typography } from "antd";
import { Icon } from "@iconify/react";
import moment from "moment";

import { MetricsCard } from "@components/index";

import { getRandomNumber } from "~/mocks/getRandomNumber";
import styles from "@styles/variables.module.scss";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";

export const ActiveApplications = ({
  applications,
}: {
  applications: number;
}) => {
  return (
    <MetricsCard
      icon={"bx:user"}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Active Applications</span>}
      totalCount={<span style={{ color: styles.primary }}>{applications}</span>}
      graph={
        <Space direction="vertical" style={{ display: "flex" }}>
          <TinyBarGraph count={getRandomNumber(100)} />
        </Space>
      }
    />
  );
};
