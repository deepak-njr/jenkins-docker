import { Row } from "antd";
import { ColumnChart, SkeletonChart, WrapperCard } from "@components/index";
import { Icon } from "@iconify/react";
import styles from "./Widgets.module.scss";
import { flatten, map } from "lodash";
import { getRandomNumber } from "~/mocks/getRandomNumber";
import { useState, useEffect } from "react";
import { get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import {useAuth} from '@hooks/useAuth';

const SubHeader = () => {
  return (
    <Row align="middle">
      <Icon icon="akar-icons:arrow-up" color={styles.secondaryGreen} />
      <span className={styles.subHeader}>
        <span
          style={{
            color: styles.secondaryGreen,
          }}
        >
          +2.7%{" "}
        </span>{" "}
        than last week
      </span>
    </Row>
  );
};

export const BudgetAnalysis = () => {
  const [data, setData] = useState<any>([]);
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    setIsLoading(true);
    get("v1/dashboard/analytics/department/budget")
      .then((res: any) => {
        setData(res.response.data.quarter);
        setIsLoading(false);
      })
      .catch((err) => setIsLoading(false));
  }, []);

  return (
    <WrapperCard
      title={"Budget Analysis"}
      // subTitle={<SubHeader />}
    >
      {isLoading ? (
        <SkeletonChart chartHeight={500} chartType="column" />
      ) : (
        <ColumnChart
          data={flatten(
            map(data, (values) => ({
              name: values.name,
              spent: values.adminCost,
            }))
          )}
          height={500}
          currencyType={user.currency}
          legend={false}
          columnWidth={15}
          sameColor={true}
          isCurrency={true}
        />
      )}
    </WrapperCard>
  );
};
