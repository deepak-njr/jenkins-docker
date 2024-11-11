import { Space, Typography, Menu, Dropdown, Spin } from "antd";
import { useEffect, useState } from "react";
import styles from "../OverView.module.scss";
import { currencyCode } from "@utils/Constants";

import { PieChart, WrapperCard } from "@components/index";
import { Icon } from "@iconify/react";
import { get } from "~/Services/api.service";
import { map } from "lodash";

type headerProps = {
  DropdownMenuItem: React.ReactElement;
};

const ActionItems = ({ DropdownMenuItem }: headerProps) => {
  return (
    <Space size={"middle"}>
      <Typography.Link>
        <Dropdown
          overlay={DropdownMenuItem}
          trigger={["click"]}
        >
          <Icon
            icon="charm:menu-kebab"
            style={{
              color: styles.strawberry,
            }}
          />
        </Dropdown>
      </Typography.Link>
    </Space>
  );
};

export const CostByVendor = () => {
  const [data, setData] = useState<{ category: string; value: number; currency: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    get("cloud/cost/bycloud/vendor ")
      .then((res: any) => {
        setData(
          map(res.response.data, (data) => ({
            category: data.vendorName,
            value: data.totalAmountSpent,
            currency: data.currency,
          }))
        );

        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <WrapperCard
      title={"Cost by Cloud Provider"}
      subTitle={"This Quarter"}
      // action={
      //   <ActionItems
      //     DropdownMenuItem={
      //       <Menu
      //         items={
      //           [
      //             // {
      //             //   label: "Profile",
      //             //   key: "0",
      //             // },
      //           ]
      //         }
      //       />
      //     }
      //   />
      // }
    >
      <div style={{ height: 75 + 350 + 48 }}>
        {isLoading ? (
          <span
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spin size="large" />
          </span>
        ) : (
          <PieChart
            data={data}
            tooltipTitle="spend"
            isCurrency
            isMultiCloud
            isPercent={false}
            showCategoryPercent={false}
            sideBySide={false}
            compactLegend={true}
          />
        )}
      </div>
    </WrapperCard>
  );
};
