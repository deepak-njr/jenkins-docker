import { Space, Typography, Menu, Dropdown } from "antd";
import styles from "./Widgets.module.scss";
import { flatten, map } from "lodash";

import { useState, useEffect } from "react";
import {
  ButtonGroup,
  WrapperCard,
  ColumnChart,
  SkeletonChart,
} from "@components/index";
import { Icon } from "@iconify/react";
import { getRamdomData } from "~/mocks/getRandomColChartData";
import { get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import {useAuth} from '@hooks/useAuth';
export const Spend = () => {
  const { openToast } = useNotification();
  const [data, setData] = useState<any>([]);
  const [currentSelection, setCurrentSelection] = useState("Monthly");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    get("v1/dashboard/analytics/spend")
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
      title={"Spend"}
      {...(isLoading && { bodyClass: styles.ActiveLoadingCard })}
    >
      <div className={styles.ChatWrapper}>
        {isLoading ? (
          <SkeletonChart chartType="column" chartHeight={250} />
        ) : (
          <ColumnChart
            data={flatten(
              map(data, (values) => ({
                month: values.month,
                Spend: values.adminCost,
                "No. of Applications": values.applicationCount,
              }))
            )}
            currencyType={user.currency}
            legendSymbol="circle"
            xValueKey="month"
            isCurrency
            legend={false}
          />
        )}
      </div>
    </WrapperCard>
  );
};
