import {
  Calendar as AntCalander,
  Badge,
  Col,
  Dropdown,
  Image,
  List,
  Menu,
  Popover,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { SkeletonRow, WrapperCard } from "@components/index";
import { keys, map, times, uniq } from "lodash";
import { useEffect, useState } from "react";

import { Icon } from "@iconify/react";
import cs from "classnames";
import { currencyFormat } from "@utils/CurrencyFormatter";
import { get } from "@services/api.service";
import { imageKey } from "@utils/Constants";
import moment from "moment";
import styles from "./Widgets.module.scss";

export const Calendar = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    [key in string]: {
      contractID: string;
      applicationID: string;
      applicationName: string;
      applicationLogo: string;
      adminCost: number;
      renewalDate: string;
      currency: string;
    }[];
  }>({});
  const [showDateDetails, setShowDateDetails] = useState<Partial<string>>();
  const [monthData, setMonthData] = useState<{
    availableMonths: string[];
    selectedMonth: string;
  }>({
    availableMonths: [],
    selectedMonth: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  moment.updateLocale("en", {
    weekdaysMin: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  });

  useEffect(() => {
    setIsLoading(true);
    get("v1/dashboard/upcoming/renewals")
      .then((res: any) => {
        const formattedData: { [key in string]: any } = {};
        res.response.data.map((item: any) => {
          if (!item.renewalDate) return;
          if (formattedData[moment(item.renewalDate).format("DD-MMM-YYYY")]) {
            formattedData[moment(item.renewalDate).format("DD-MMM-YYYY")].push(item);
          } else {
            formattedData[moment(item.renewalDate).format("DD-MMM-YYYY")] = [item];
          }
        });

        setData(formattedData);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const monthFormat = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const uniqueMonths = uniq(map(keys(data), (val) => moment(new Date(val)).format("MMM YY")))
      .sort((a, b) => {
        const aM: string = a.split(" ")[0];
        const bM: string = b.split(" ")[0];
        return monthFormat.indexOf(aM) - monthFormat.indexOf(bM);
      })
      .sort((a, b) => {
        const aM: number = Number(a.split(" ")[1]);
        const bM: number = Number(b.split(" ")[1]);
        return aM - bM;
      });
    setMonthData({
      availableMonths: times(6, (i) => moment().add(i, "month").format("MMM YY")),
      selectedMonth: monthData.selectedMonth || uniqueMonths[-1],
    });
  }, [data]);


  const dateCellRender = (value: any) => {
    return (
      <Popover
        open={showDateDetails === moment(value).format("DD-MMM-YYYY")}
        key={value.date()}
        onOpenChange={() => setShowDateDetails(undefined)}
        content={() => (
          <>
            <Row>
              <Col span={24}>
                <b style={{ fontSize: 28, marginRight: 5 }}>{moment(value).format("DD")}</b>{" "}
                {moment(value).format("MMM YYYY")}
              </Col>
            </Row>
            <Row>
              <Col
                span={24}
                style={{ cursor: "pointer" }}
              >
                {showDateDetails && (
                  <List
                    dataSource={data[showDateDetails]}
                    style={{ maxHeight: "250px", overflow: "auto" }}
                    renderItem={(item) => (
                      <List.Item
                        style={{ textTransform: "capitalize" }}
                        onClick={() => navigate(`/renewals?search=${item.contractID}`)}
                      >
                        <Row>
                          <Space size={"middle"}>
                            <Image
                              src={`${item.applicationLogo}${imageKey}`}
                              alt={item.applicationName}
                              style={{
                                maxHeight: "30px",
                                marginInline: "10px",
                              }}
                              preview={false}
                            />
                            <Typography.Text
                              style={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              ellipsis
                            >
                              {item.applicationName}
                            </Typography.Text>
                          </Space>
                        </Row>
                        <Row>{currencyFormat(item.adminCost, true)}</Row>
                      </List.Item>
                    )}
                  />
                )}
              </Col>
            </Row>
          </>
        )}
        overlayInnerStyle={{
          maxWidth: 350,
          width: 350,
        }}
        placement="left"
      >
        <span
          className={cs(styles.DateCell, {
            [styles.DateCellActive]: moment(value).format("DD-MMM-YYYY") === moment(new Date()).format("DD-MMM-YYYY"),
          })}
        >
          {value.date()}
          {data[moment(value).format("DD-MMM-YYYY")] && (
            <span className={styles.CalDateindicator}>
              <Badge
                className={styles.antBadge}
                color={styles.neon}
              />
            </span>
          )}
        </span>
      </Popover>
    );
  };

  return (
    <WrapperCard
      key={monthData.selectedMonth}
      title={<Link to="/renewals">Upcoming Renewals</Link>}
      action={
        <Dropdown
          overlay={
            <Menu
              items={map(monthData.availableMonths, (val, i) => ({
                key: i,
                label: val,
              }))}
              onClick={(e: any) =>
                setMonthData((existing: any) => ({
                  selectedMonth: existing.availableMonths[e.key],
                  availableMonths: existing.availableMonths,
                }))
              }
              defaultValue={monthData.availableMonths.indexOf(monthData.selectedMonth)}
            />
          }
          trigger={["click"]}
        >
          <div className={styles.calendarRightBtn}>
            <span>{monthData.selectedMonth || moment().format("MMM YY")}</span>
            <Icon
              icon="ep:arrow-down-bold"
              style={{
                color: styles.strawberry,
              }}
            />
          </div>
        </Dropdown>
      }
    >
      {isLoading ? (
        <SkeletonRow rows={6} />
      ) : (
        <AntCalander
          fullscreen={false}
          headerRender={() => null}
          className={styles.Cal}
          style={{ height: 300 }}
          defaultValue={moment(monthData.selectedMonth ? `01 ${monthData.selectedMonth}` : new Date())}
          dateFullCellRender={dateCellRender}
          onSelect={(e: any) => {
            setShowDateDetails(moment(e).format("DD-MMM-YYYY"));
            setMonthData((existing: any) => ({
              selectedMonth: moment(e).format("MMM YY"),
              availableMonths: existing.availableMonths,
            }));
          }}
        />
      )}
    </WrapperCard>
  );
};
