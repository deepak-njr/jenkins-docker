import { Space, Typography, Tooltip } from 'antd';
import { Icon } from "@iconify/react";
import moment from "moment";

import { MetricsCard } from "@components/index";
import { currencyFormat } from "@utils/CurrencyFormatter";

import { getRandomNumber } from "~/mocks/getRandomNumber";
import styles from "@styles/variables.module.scss";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";


export const AverageMonthlySpend = ({ amount }: { amount: number }) => {


  return (
    <MetricsCard
      icon={"fa6-solid:money-check-dollar"}
      style={{ height: "100%" }}
      iconColor={styles.strawberry}
      title={<span style={{ color: styles.gray }}>Average Monthly Spend</span>}
      totalCount={
        <span style={{ color: styles.primary }}>
          <Tooltip title={currencyFormat(amount, true)}>
            {currencyFormat(amount, true)}
          </Tooltip>
        </span>
      }
    // graph={
    //   <Space direction="vertical" style={{ display: "flex" }}>
    //     <TinyBarGraph count={currencyFormat(getRandomNumber(), user.currency, "standard")} />
    //   </Space>
    // }
    />
  );
};
