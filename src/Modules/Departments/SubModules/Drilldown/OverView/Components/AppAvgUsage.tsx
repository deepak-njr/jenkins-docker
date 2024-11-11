import { PieChart, WrapperCard } from "@components/index";
import { useEffect, useState } from "react";

import { get } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { useParams } from "react-router-dom";

export const AppAvgUsage = (users: any) => {
  const [data, setData] = useState([]);
  const { openToast } = useNotification();
  const { id } = useParams();

  useEffect(() => {
    get(`v1/department/usage/analytics?deptId=${id}`)
      .then((res: any) => {
        if (res.response.data) {
          setData(res.response.data);
        } else {
          openToast({
            content: "Loading analytics failed",
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
      title={"Applications - Usage"}
    >
      <PieChart
        data={data.map((application: any) => ({
          category: application.applicationName,
          value: application.userCount,
          additionInfo: `${application.userCount} user(s)`,
          currency: application.currency,
        }))}
        usersCount={users.users}
        tooltipTitle="Usage"
        pieCenterContent={{
          title: "Avg. Usage",
        }}
        showMoreTitle={"Applications - Usage"}
        isPercent
      />
    </WrapperCard>
  );
};
