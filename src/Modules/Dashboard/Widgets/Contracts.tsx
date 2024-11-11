import { ProgressConfig } from "@ant-design/plots";
import { Progress } from 'antd';
import { Col, Row, Space, Typography, Menu, Dropdown } from "antd";
import { createRef, RefObject, useEffect, useRef, useState } from "react";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { Icon } from "@iconify/react";
import { get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import { SkeletonRow, WrapperCard } from "@components/index";

import styles from "./Widgets.module.scss";
import { Link } from "react-router-dom";

type headerProps = {
  DropdownMenuItem: React.ReactElement;
  costText: string;
  cost: number;
  isLoading: boolean;
};
const ActionItems = ({
  DropdownMenuItem,
  costText,
  cost,
  isLoading,
}: headerProps) => {
  return (
    <Row justify="space-between" align="middle">
      <Space size={"middle"}>
        <Typography.Link>
          <p className={styles.costText}>{costText}</p>
          {isLoading ? (
            <SkeletonRow rows={1} />
          ) : (
            <p className={styles.cost}>
              {currencyFormat(cost, true)}
            </p>
          )}
        </Typography.Link>

        {/* <Typography.Link>
          <Dropdown overlay={DropdownMenuItem} trigger={["click"]}>
            <Icon
              icon="charm:menu-kebab"
              style={{
                color: styles.strawberry,
              }}
            />
          </Dropdown>
        </Typography.Link> */}
      </Space>
    </Row>
  );
};

export const Contracts = () => {
  const { openToast } = useNotification();
  const myRefs = useRef([]);
  const dataKey = ["totalActiveContracts", "totalExpiringContracts"];
  const [width, setWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  myRefs.current = dataKey.map((e, i) => myRefs.current[i] ?? createRef());
  const [showProgress, setShowProgress] = useState(false);

  const [headerSateData, setHeaderData] = useState({
    menuItem: ["Weekly", "Monthly", "Yearly"],
    activeMenu: "Weekly",
    DropdownMenuItem: (
      <Menu
        items={
          [
            // {
            //   label: "Profile",
            //   key: "0",
            // },
          ]
        }
      />
    ),
  });
  const [data, setData] = useState<any>({});

  const config: Omit<ProgressConfig, "percent"> = {
    autoFit: false,

    onReady: (plot) => {
      plot.changeSize(width, 20);
    },
  };

  const getContractDetails = () => {
    setIsLoading(true);
    get("v1/dashboard/contract/details")
      .then((res: any) => {
        setData(res.response.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    getContractDetails();
  }, []);

  const getWidth = () => {
    const divRef = myRefs.current[0] as RefObject<HTMLDivElement>;
    if (divRef.current) {
      setWidth(divRef.current.clientWidth - 100);
      setTimeout(() => setShowProgress(true), 600);
    }
  };

  useEffect(() => {
    if (myRefs.current) {
      window.addEventListener("resize", getWidth);
      getWidth();
    }
  }, [myRefs.current]);

  const getColor = (title: string) => {
    switch (title) {
      case "totalActiveContracts":
        return styles.primary;
      case "totalExpiringContracts":
        return styles.secondary;
      default:
        return [];
    }
  };

  return (
    <WrapperCard
      title={<Link to="/contracts">Contracts</Link>}
      // subTitle={"Lorem ipsum dolor sit amet"}
      action={
        <ActionItems
          DropdownMenuItem={headerSateData.DropdownMenuItem}
          costText={"Total cost "}
          cost={data && data.totalContractSpendAdminCost && data.totalContractSpendAdminCost}
          isLoading={isLoading}
        />
      }
    >
      {isLoading ? (
        <div
          style={{
            height: 145,
            display: "flex",
            alignItems: "center",
          }}
        >
          <SkeletonRow rows={2} />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            width: "100%",
            justifyContent: "center",
            minHeight: 130,
          }}
        >
          {dataKey.map((item, i) => (
            <Row
              align="middle"
              justify="space-between"
              style={{ flexWrap: "nowrap" }}
              gutter={32}
              key={`item-${i}`}
            >
              <Col span={5}>
                <Typography.Text>
                  {item === "totalActiveContracts"
                    ? "Active Contracts"
                    : "Expiring Contracts"}
                </Typography.Text>
              </Col>
              <Col span={16} ref={myRefs.current[i]}>
                {showProgress && (
                  <Progress
                    {...config}
                    {...(data[item] / data["totalActiveContracts"] > 0 && {
                      progressStyle: { lineCap: "round" },
                    })}
                    percent={data[item]}
                    strokeColor={getColor(item)}
                    width={width}
                    showInfo={false}
                  />
                )}
              </Col>
              <Col span={3}>
                <Typography.Text>{data[item]}</Typography.Text>
              </Col>
            </Row>
          ))}
        </div>
      )}
    </WrapperCard>
  );
};
