import { WrapperCard, PieChart } from "@components/index";
import { Icon } from "@iconify/react";
import { Button, Dropdown, Menu, Space, Typography } from "antd";

import styles from "@styles/variables.module.scss";
import { getRandomNumber } from "~/mocks/getRandomNumber";

export const AppAvgUsage = () => {
  return (
    <WrapperCard
      title={"Application - Usage"}
      // subTitle={"Lorem ipsum dolor sit amet"}
      action={
        <Space size={"middle"}>
          <Typography.Link>
            <Button
              type="ghost"
              shape="round"
              className="smoked"
              icon={
                <Icon
                  icon="charm:download"
                  style={{
                    color: styles.strawberry,
                  }}
                />
              }
            >
              Get Report
            </Button>
          </Typography.Link>
          <Typography.Link>
            <Dropdown overlay={<Menu items={[]} />} trigger={["click"]}>
              <Icon
                icon="charm:menu-kebab"
                style={{
                  color: styles.strawberry,
                }}
              />
            </Dropdown>
          </Typography.Link>
        </Space>
      }
    >
      <PieChart
        data={[
          {
            category: "Adroll",
            value: getRandomNumber(1000),
            additionInfo: "12 users",
          },
          {
            category: "Zoho",
            value: getRandomNumber(1000),
            additionInfo: "75 users",
          },
          {
            category: "Act!",
            value: getRandomNumber(1000),
            additionInfo: "45 Users",
          },
          {
            category: "Azure Ad",
            value: getRandomNumber(1000),
            additionInfo: "4 Users",
          },
          {
            category: "Others",
            value: getRandomNumber(1000),
            additionInfo: "45 Users",
          },
        ]}
        tooltipTitle="Usage"
        pieCenterContent={{
          title: "Avg. Usage",
          value: "85%",
        }}
        isPercent
      />
    </WrapperCard>
  );
};
