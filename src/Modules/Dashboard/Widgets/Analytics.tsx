import styles from "./Widgets.module.scss";
import {
  ButtonGroup,
  LineChart,
  SkeletonChart,
  WrapperCard,
} from "@components/index";
import { useEffect, useState } from "react";
import { get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";

export const Analytics = () => {
  const { openToast } = useNotification();
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const maxValue = data.reduce((max: any, item: any) => {
    return Math.max(max, item.applicationCount, item.userCount);
  }, 0);

  useEffect(() => {
    setIsLoading(true);
    get("v1/dashboard/usage/trend")
      .then((res: any) => {
        setData(res.response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
        setIsLoading(false);
      });
  }, []);
  return (
    <WrapperCard
      title="Usage Trends"
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
      {...(isLoading && { bodyClass: styles.ActiveLoadingCard })}
    >
      <div className={styles.ChatWrapper}>
        {isLoading ? (
          <SkeletonChart
            dots={true}
            dotPosition={"top-right"}
            chartType="line"
            chartHeight={250}
          />
        ) : (
          <LineChart
            data={data.map((application: any) => ({
              name: application.month,
              Users: application.userCount,
              Applications: application.applicationCount,
            }))}
            maxValue={maxValue}
            legendPosition="top-right"
            height={280}
          />
        )}
      </div>
    </WrapperCard>
  );
};
