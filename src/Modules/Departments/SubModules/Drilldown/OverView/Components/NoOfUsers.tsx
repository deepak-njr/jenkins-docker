import { MetricsCard } from "@components/index";
import styles from "@styles/variables.module.scss";
import { Space, Typography } from "antd";
import { Icon } from "@iconify/react";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import moment from "moment";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";

export const NoOfUsers = ({ users }: { users: number }) => {
  return (
    <MetricsCard
      icon="ph:users-light"
      iconColor={styles.strawberry}
      title="No. of Users"
      totalCount={users}
      graph={
        <Space direction="vertical" style={{ display: "flex" }}>
          <TinyBarGraph count={getRandomNumber(100)} />
        </Space>
      }
    />
  );
};
