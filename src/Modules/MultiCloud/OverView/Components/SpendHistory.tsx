import { Space, Typography, Menu, Dropdown } from "antd";
import styles from "../OverView.module.scss";

import { useEffect, useState } from "react";
import { ButtonGroup, WrapperCard, LineChart } from "@components/index";
import { Icon } from "@iconify/react";
import { get } from "~/Services";
// import { map } from "lodash";
// import moment from "moment";
import { getRamdomData } from "~/mocks/getRandomColChartData";
import { withCloudConfigurator } from "../../WithCloudConfigurator";

export const SpendHistory = withCloudConfigurator(({ configuredCloudApps }) => {
  const [currentSelection, setCurrentSelection] = useState("Monthly");
  const [lineData, setLineData] = useState<any>([]);

  useEffect(() => {
    get("cloud/monthly/spendinghistory")
      .then((res: any) => {
        setLineData(res.response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
const formattedData = lineData.monthlySpendingHistory
  const transformedData = formattedData?.map((monthData: any) => {
    const services = monthData?.CloudProvider?.reduce((acc: any, service: any) => {
      acc[service?.name] = parseInt(service?.cost?.INR, 10);
      return acc;
    }, { name: monthData.month });
    return services;
  });

  return (
    <WrapperCard
      title={"Spend History"}
      // action={
      //   <Space size={"middle"}>
      //     <ButtonGroup
      //       buttonItems={["Weekly", "Monthly", "Yearly"]}
      //       defaultActive={currentSelection}
      //       onClick={(e) =>
      //         setCurrentSelection(e.currentTarget.textContent || "")
      //       }
      //     />
      //     <Typography.Link>
      //       <Dropdown
      //         overlay={
      //           <Menu
      //             items={
      //               [
      //                 // {
      //                 //   label: "Profile",
      //                 //   key: "0",
      //                 // },
      //               ]
      //             }
      //           />
      //         }
      //         trigger={["click"]}
      //       >
      //         <Icon
      //           icon="charm:menu-kebab"
      //           style={{
      //             color: styles.strawberry,
      //           }}
      //         />
      //       </Dropdown>
      //     </Typography.Link>
      //   </Space>
      // }
    >
      <LineChart
        // data={data}
        data={transformedData}
        maxValue={Math.random()}
        legendSymbol="circle"
        isGroup
        isCurrency
        height={300}
        legendPosition="top-right"
      />
    </WrapperCard>
  );
});
