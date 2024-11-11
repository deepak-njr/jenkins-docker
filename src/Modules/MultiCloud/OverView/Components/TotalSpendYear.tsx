import React from "react";
import { WrapperCard } from "@components/index";
import { Icon } from "@iconify/react";
import { Avatar, Space, Typography } from "antd";
import styled from "styled-components";

import styles from "../OverView.module.scss";
import { currencyFormat } from "@utils/CurrencyFormatter";

const StyledAvatar = styled(Avatar)`
  height: 70px;
  width: 70px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 10px;
  background-color: #eee;
`;

export const TotalSpendYear = ({
  cost,
  currency,
}: {
  cost: number;
  currency: string;
}) => {
  return (
    <WrapperCard>
      <Space
        direction="vertical"
        style={{
          textAlign: "center",
          height: 112 * 2,
          width: "100%",
          justifyContent: "center",
        }}
      >
        <StyledAvatar
          shape="square"
          icon={
            <Icon
              icon={"clarity:dollar-bill-line"}
              style={{ color: styles.strawberry, fontSize: 60 }}
            />
          }
        />
        <Typography.Title level={3}>
          {currencyFormat(cost, false, currency )}
        </Typography.Title>
        <Typography.Text>Total Spend this Year</Typography.Text>
        {/* <Typography.Text ellipsis>
          <span style={{ color: styles.secondaryGreen }}>
            <Icon icon="akar-icons:arrow-up" />{" "}
            {currencyFormat(15.1, currency, "standard")}
          </span>
        </Typography.Text> */}
      </Space>
    </WrapperCard>
  );
};
