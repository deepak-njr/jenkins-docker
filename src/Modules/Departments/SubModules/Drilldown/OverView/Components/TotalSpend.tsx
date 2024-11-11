import React from "react";
import { MetricsCard } from "@components/index";
import { currencyFormat } from "@utils/CurrencyFormatter";
import styles from "@styles/variables.module.scss";
import { Space, Typography, Tooltip } from "antd";
import { Icon } from "@iconify/react";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import moment from "moment";
import { TinyBarGraph } from "~/mocks/TinyBarGraph";
import { useAuth } from '~/Hooks/useAuth';

export const TotalSpend = ({ cost }: { cost: number }) => {
  const { user } = useAuth();

  return (
    <MetricsCard
      icon="fa6-solid:money-check-dollar"
      iconColor={styles.strawberry}
      title="Average Montly Spend"
      totalCount={
        <span style={{ color: styles.primary }}>
          <Tooltip title={currencyFormat(cost, true)}>
            {currencyFormat(cost, true)}
          </Tooltip>        </span>
      }
    //       graph={
    //         <Space direction="vertical" style={{ display: "flex" }}>
    //           <TinyBarGraph count={currencyFormat(getRandomNumber(), user.currency, "standard")}
    //  />
    //         </Space>
    //       }
    />
  );
};
