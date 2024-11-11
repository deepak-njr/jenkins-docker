import { MetricsCard } from "@components/index";
import styles from "@styles/variables.module.scss";
import { Space, Typography } from "antd";
import { Icon } from "@iconify/react";
import moment from "moment";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";

export const AssignedLicenses = ({
  assignedLicenses,
}: {
  assignedLicenses: number;
}) => {

  return (
    <MetricsCard
      style={{ height: "100%" }}
      icon={"bx:user"}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Assigned Licenses</span>}
      totalCount={
        <span style={{ color: styles.primary }}>{assignedLicenses}</span>
      }
      graph={
        <Space direction="vertical" style={{ display: "flex" }}>
          <TinyBarGraph count={currencyFormat(getRandomNumber(), true)} />
        </Space>
      }
    />
  );
};
