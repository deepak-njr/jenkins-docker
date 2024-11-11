import { Space, Typography, Tooltip } from "antd";
import { Icon } from "@iconify/react";
import moment from "moment";

import { MetricsCard } from "@components/index";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import styles from "@styles/variables.module.scss";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";

export const TotalSpend = ({ amount, currency }: { amount: number; currency: string }) => {

  return (
    <MetricsCard
      style={{ height: "100%" }}
      icon={"clarity:dollar-bill-line"}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Total Spend</span>}
      totalCount={
        <span style={{ color: styles.primary }}>
          <Tooltip title={currencyFormat(amount, true)}>
            {currencyFormat(amount, true)}
          </Tooltip>
        </span>
      }
    />
  );
};
