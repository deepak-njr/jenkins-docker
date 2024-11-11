import { PieChart, WrapperCard } from "@components/index";
import { useEffect, useState } from "react";

import { get } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { useParams } from "react-router-dom";

export const AppAvgSpend = (userId: any) => {
  const [data, setData] = useState([]);
  const { openToast } = useNotification();
  const { id } = useParams();

  useEffect(() => {
    get(`v1/user/details/spend/analytics?userId=${id}`)
      .then((res: any) => {
        if (res.response.data) {
          setData(res.response.data);
        } else {
          openToast({
            content: "Loading expenses failed",
            type: "error",
          });
        }
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
      });
  }, []);
  return (
    <WrapperCard
      title={"Application - Spend"}
      // subTitle={"Lorem ipsum dolor sit amet"}
      // action={
      //   <Space size={"middle"}>
      //     <Typography.Link>
      //       <Button
      //         type="ghost"
      //         shape="round"
      //         className="smoked"
      //         icon={
      //           <Icon
      //             icon="charm:download"
      //             style={{
      //               color: styles.strawberry,
      //             }}
      //           />
      //         }
      //       >
      //         Get Report
      //       </Button>
      //     </Typography.Link>
      //     <Typography.Link>
      //       <Dropdown overlay={<Menu items={[]} />} trigger={["click"]}>
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
      <PieChart
        data={data.map((application: any) => ({
          category: application.applicationName,
          value: application.adminCost,
        }))}
        tooltipTitle="Usage"
        pieCenterContent={{
          title: "Avg. Spend",
        }}
        isCurrency
      />
    </WrapperCard>
  );
};
