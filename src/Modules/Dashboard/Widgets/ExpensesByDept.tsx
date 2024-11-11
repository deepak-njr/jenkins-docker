import { Space, Typography, Menu, Dropdown, Button, Modal, List, Row, Image } from "antd";
import { useMemo, useEffect, useState } from "react";
import styles from "./Widgets.module.scss";

import { PieChart, SkeletonPieChart, WrapperCard } from "@components/index";
import { Icon } from "@iconify/react";
import { get } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { map, uniq } from "lodash";
import { imageKey } from "@utils/Constants";
import { Link } from "react-router-dom";
import cs from "classnames";
import * as _ from "lodash";

type headerProps = {
  DropdownMenuItem: React.ReactElement;
};

const ActionItems = ({ DropdownMenuItem }: headerProps) => {
  return (
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

export const ExpensesByDept = () => {
  const [expenseData, setExpenseData] = useState([]);
  const [open, setOpen] = useState(false);
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    get(`v1/dashboard/analytics/department/expense`)
      .then((res: any) => {
        if (res.response.data) {
          setExpenseData(res.response.data);
        } else {
          openToast({
            content: "Loading expenses failed",
            type: "error",
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  }, []);

  const data = useMemo(
    () => [
      {
        category: "Marketing",
        value: 10000,
      },
      {
        category: "Finance",
        value: 20000,
      },
      {
        category: "IT",
        value: 25000,
      },
      {
        category: "HR",
        value: 50000,
      },
      {
        category: "Others",
        value: 1000,
      },
    ],
    []
  );

  return (
    <WrapperCard
      title={"Expenses by Department"}
      // subTitle={"Lorem ipsum dolor sit amet"}
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
      {...(isLoading && { bodyClass: styles.ActiveLoadingCard })}
    >
      <div className={styles.ChatWrapper}>
        {isLoading ? (
          <SkeletonPieChart />
        ) : (
          <PieChart
            data={expenseData.map((value: any) => ({
              category: value.category,
              value: value.adminCost,
            }))}
            isTotal={true}
            tooltipTitle="spend"
            showMoreTitle="Expenses by Department"
            pieCenterContent={{
              value: null,
            }}
            isCurrency
          />
        )}
      </div>
    </WrapperCard>
  );
};
