import { Col, Row, Space, Typography, Menu, Dropdown, Skeleton, Tooltip } from "antd";
import { RingProgress, RingProgressConfig } from "@ant-design/plots";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { SkeletonList, WrapperCard } from "@components/index";
import styles from "./Widgets.module.scss";
import { RefObject, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import { Link } from "react-router-dom";

export const Invoices = () => {
  const ref: RefObject<HTMLDivElement> = useRef(null!!);
  const [dimension, setDimenstion] = useState(100);
  const [showChart, setShowChart] = useState(false);
  const [data, setdata] = useState<any>({});
  const { openToast } = useNotification();

  const config: Partial<RingProgressConfig> = {
    autoFit: false,
    progressStyle: {
      lineJoin: "round",
      lineCap: "round",
    },
    onReady: (plot) => {
      plot.changeSize(dimension, dimension);
    },
  };
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    get("v1/dashboard/get/invoices")
      .then((res: any) => {
        if (res.response.data) {
          setdata(res.response.data.getInvoicesResponse);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (ref.current) {
      const dimByHeight = 400 / 3 - 26; // (cardbody height / 3 )- (16px gap + 10px padding)
      setDimenstion(
        ref.current.clientWidth > dimByHeight
          ? dimByHeight
          : ref.current.clientWidth - 20
      );
      setShowChart(true);
    }
  }, [ref]);

  const categories = ["totalInvoices", "paidInvoices", "pendingInvoices"];

  const getColorOption = (name: string) => {
    switch (name) {
      case categories[0]: {
        return [styles.ringTotal, styles.ringTotalLight];
      }
      case categories[1]: {
        return [styles.ringPaid, styles.ringPaidLight];
      }
      case categories[2]: {
        return [styles.ringPending, styles.ringPendingLight];
      }
      default:
        return [];
    }
  };
  const getTextColorOption = (name: string) => {
    switch (name) {
      case categories[0]: {
        return styles.ringTotal;
      }
      case categories[1]: {
        return styles.ringPaid;
      }
      case categories[2]: {
        return styles.ringPending;
      }
      default:
        return "";
    }
  };

  const getTitle = (name: string) => {
    switch (name) {
      case categories[0]: {
        return "Total";
      }
      case categories[1]: {
        return "Paid";
      }
      case categories[2]: {
        return "Pending";
      }
      default:
        return "";
    }
  };

  return (
    <WrapperCard
      title={<Link to="/invoices">Invoices</Link>}
    // action={
    //   <Row justify="space-between" align="middle">
    //     <Space size={"middle"} className={styles.groupBtn}>
    //       <Typography.Link>
    //         <Dropdown
    //           overlay={
    //             <Menu
    //               items={
    //                 [
    //                   // {
    //                   //   label: "Profile",
    //                   //   key: "0",
    //                   // },
    //                 ]
    //               }
    //             />
    //           }
    //           trigger={["click"]}
    //         >
    //           <Icon
    //             icon="charm:menu-kebab"
    //             style={{
    //               color: styles.strawberry,
    //             }}
    //           />
    //         </Dropdown>
    //       </Typography.Link>
    //     </Space>
    //   </Row>
    // }
    >
      {isLoading ? (
        <SkeletonList rows={3} />
      ) : (
        <Space
          size={40}
          direction="vertical"
          style={{
            display: "flex",
            height: 520,
            justifyContent: "space-around",
          }}
        >
          {data &&
            categories.map((item) => (
              <Row gutter={16} align="middle" key={item}>
                <Col span={12} ref={ref} style={{ display: "flex" }}>
                  {showChart && (
                    <RingProgress
                      renderer="svg"
                      {...config}
                      statistic={{
                        title: {
                          formatter: () => data[item] || "0",
                          style: {
                            color: getTextColorOption(item),
                            fontWeight: "bold",
                          },
                        },
                        content: {
                          formatter: () => "Invoices",
                        },
                      }}
                      percent={data[item] / data["totalInvoices"]}
                      color={getColorOption(item)}
                    />
                  )}
                </Col>
                <Col span={12}>
                  <Typography.Text className={styles.costTitleText}>
                    {getTitle(item)}
                  </Typography.Text>
                  <Typography.Title ellipsis
                    level={5}
                    style={{ margin: 0 }}
                    className={styles.amount}
                  >
                    <Tooltip
                      title={
                        currencyFormat(
                          data[`${item}Cost`],
                          true
                        )}> {currencyFormat(
                          data[`${item}Cost`],
                          true
                        )}
                    </Tooltip>

                  </Typography.Title>
                </Col>
              </Row>
            ))}
        </Space>
      )
      }
    </WrapperCard >
  );
};
