import { MetricsCard } from "@components/index";
import styles from "@styles/variables.module.scss";
import { Space, Typography, Tooltip } from 'antd';
import { Icon } from "@iconify/react";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import moment from "moment";
import { currencyFormat } from "~/Utils";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";

export const ContractValue = ({
  cost,
  currency,
}: {
  cost: number;
  currency: string;
}) => {
  return (
    <MetricsCard
      icon={"fa6-solid:money-check-dollar"}
      iconColor={styles.strawberry}
      title="Contract Value"
      totalCount={
        <Tooltip title={currencyFormat(cost, true)}>
          {currencyFormat(cost, true)}
        </Tooltip>
      }
    />
  );
};
