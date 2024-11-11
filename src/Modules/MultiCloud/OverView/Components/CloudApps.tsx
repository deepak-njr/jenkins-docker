import { useEffect, useRef, useState } from "react";
import { WrapperCard } from "@components/index";
import { Avatar, Col, Divider, Popover, Row, Space, Typography, Carousel, Tooltip } from "antd";
import cs from "classnames";
import {
  imageKey,
  mockMulticloudAWS,
  mockMulticloudAzure,
  mockMulticloudDO,
  mockMulticloudGCP,
  mockMulticloudOracle,
} from "~/Utils";
import { get } from "@services/api.service";
import styles from "../OverView.module.scss";
import alpha from "color-alpha";
import styled from "styled-components";
import { CarouselRef } from "antd/lib/carousel";
import { Icon } from "@iconify/react";
import { filter, groupBy, map, orderBy, times } from "lodash";
import { Link, useNavigate } from "react-router-dom";
import { getRedirectLink } from "./getRedirect";
import { withCloudConfigurator } from "../../WithCloudConfigurator";
import { MultiCloud } from "../../CloudConstants";

const StyledAvatar = styled(Avatar)`
  background: ${alpha(styles.gray, 0.1)};
  padding: ${styles.whitespace1};
  border-radius: 10px;
`;

export const CloudApps = withCloudConfigurator(() => {
  const [data, setData] = useState<any>([]);
  const ref = useRef<CarouselRef>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);

    get("cloud/overview").then(async (res: any) => {
      if (res.response) {
        const data = filter(res.response.data, (d) => d.vendorName !== "Amazon");
        const awsMockData = mockMulticloudAWS
          ? [
              {
                vendorName: "AWS",
                logo: "https://saaspemedia.blob.core.windows.net/images/logos/svg/aws.svg",
                service: ["Virtual Machine", "Networkwatchers", "Registries", "Privatednszones", "Storageaccounts"].map(
                  (item) => ({
                    serviceName: item,
                    count: 3,
                  })
                ),
              },
            ]
          : data.filter((item) => item.vendorName === MultiCloud.AWS);
        const azureMockData = mockMulticloudAzure
          ? [
              {
                vendorName: "Azure",
                logo: "https://saaspemedia.blob.core.windows.net/images/logos/svg/azure-ad.svg",
                service: ["Virtual Machine", "Networkwatchers", "Registries", "Privatednszones", "Storageaccounts"].map(
                  (item) => ({
                    serviceName: item,
                    count: 3,
                  })
                ),
              },
            ]
          : data.filter((item) => item.vendorName === MultiCloud.AZURE);
        const digitalOceanMockData = mockMulticloudDO
          ? [
              {
                vendorName: "Digital Ocean",
                logo: "https://saaspemedia.blob.core.windows.net/images/logos/svg/digital-ocean.svg",
                service: ["Droplets", "App Platform", "Functions", "Spaces", "Snapshots"].map((item) => ({
                  serviceName: item,
                  count: 3,
                })),
              },
            ]
          : [];

        const gcpMockData = mockMulticloudGCP
          ? [
              {
                vendorName: "GCP",
                logo: "https://saaspemedia.blob.core.windows.net/images/logos/svg/gcp.svg",
                service: ["Droplets", "App Platform", "Functions", "Spaces", "Snapshots"].map((item) => ({
                  serviceName: item,
                  count: 3,
                })),
              },
            ]
          : [];

        const oracleMockData = mockMulticloudOracle
          ? [
              {
                vendorName: "Oracle Cloud",
                logo: "https://saaspemedia.blob.core.windows.net/images/logos/svg/oracle-cloud.svg",
                service: ["HPC", "Cloud Security", "Data Lakehouse", "ISV", "Multicloud Startegies"].map((item) => ({
                  serviceName: item,
                  count: 3,
                })),
              },
            ]
          : [];
        const combinedData = [
          ...awsMockData,
          ...azureMockData,
          ...digitalOceanMockData,
          ...gcpMockData,
          ...oracleMockData,
        ];
        const sliderSize = 3;
        const sliderData = [];
        for (let i = 0; i < combinedData.length; i += sliderSize) {
          const chunk = combinedData.slice(i, i + sliderSize).map((d: any) => ({
            ...d,
            service: orderBy(d.service, "count", "desc"),
          }));

          sliderData.push({
            key: `slider${i}`,
            items: chunk,
          });
        }
        setData(sliderData);
      }
      setTimeout(() => setLoading(false), 300);
    });
  };
  useEffect(() => {
    getData();
  }, []);

  if (!data) return null;

  return (
    <WrapperCard>
      {" "}
      {loading ? (
        times(3, (i) => (
          <div style={{ marginBlock: 8 }}>
            <WrapperCard
              key={i}
              loading={loading}
            >
              &nbsp;
            </WrapperCard>
          </div>
        ))
      ) : (
        <Carousel
          arrows={true}
          ref={ref}
          afterChange={(e) => setCurrentSlide(e)}
        >
          {data.map((d: any) => (
            <div>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
              >
                {d.items.map((item: any) => (
                  <CloudApp
                    item={item}
                    key={item.vendorName}
                  />
                ))}
              </Space>
            </div>
          ))}
        </Carousel>
      )}
      {data.length > 1 && (
        <ul className={styles.CarouselPagination}>
          <li
            className={styles.LeftArrow}
            onClick={() => ref.current && ref.current.prev()}
          >
            <Icon icon={"akar-icons:chevron-left"} />
          </li>
          {data.map((d: any, i: number) => (
            <li
              className={cs(styles.Pagination, {
                [styles.Active]: i === currentSlide,
              })}
              onClick={() => ref.current && ref.current.goTo(i)}
            >
              {i + 1}
            </li>
          ))}
          <li
            className={styles.RightArrow}
            onClick={() => ref.current && ref.current.next()}
          >
            {" "}
            <Icon icon={"akar-icons:chevron-right"} />
          </li>
        </ul>
      )}
    </WrapperCard>
  );
});

const CloudApp = ({ item }: any) => {
  const colRef = useRef<HTMLDivElement>(null);
  const [itemPerRow, setItemPerRow] = useState(3);
  const navigate = useNavigate();
  const calcItemPerRow = () => {
    if (!colRef.current) return;

    const { width } = colRef.current.getBoundingClientRect();

    setItemPerRow(Math.floor(width / 85));
  };

  useEffect(() => {
    if (colRef) {
      calcItemPerRow();
      window.addEventListener("resize", calcItemPerRow);
    }
  }, []);

  const renderServiceList = (services: any[], logo: string, name: string) => {
    return (
      <>
        {services.map((spec: any, index: number) =>
          (index === 1 || index + 2) < itemPerRow ? (
            <div
              style={{ maxWidth: 70, minWidth: 70 }}
              key={`${index}-${itemPerRow}`}
            >
              <Typography.Title
                level={4}
                style={{ marginBottom: 0 }}
              >
                {spec.count}
              </Typography.Title>

              {/* <Typography.Text
                  style={{ fontSize: 12, display: "flex" }}
                  disabled
                  ellipsis
                >
                  {spec.type}
                </Typography.Text> */}
              <Tooltip
                placement="top"
                title={spec.serviceName}
                color={styles.white}
                overlayInnerStyle={{
                  color: styles.primary,
                }}
              >
                <Typography.Text
                  style={{
                    color: styles.primary,
                    maxWidth: 80,
                  }}
                  ellipsis
                >
                  {spec.serviceName}
                </Typography.Text>
              </Tooltip>
            </div>
          ) : null
        )}
        {services.length - itemPerRow + 1 > 0 && (
          <div style={{ maxWidth: "80px" }}>
            <Popover
              overlayInnerStyle={{ width: 500 }}
              trigger="click"
              placement="bottom"
              arrowPointAtCenter
              overlayClassName={styles.MorePopOver}
              title={
                <Space align="center">
                  <span
                    style={{
                      background: `url(${logo}${imageKey})`,
                    }}
                    className={styles.logo}
                  ></span>
                  {name}
                </Space>
              }
              content={
                <Row gutter={16}>
                  {services.map(
                    (spec: any, i) =>
                      i + 1 >= itemPerRow && (
                        <Col
                          span={6}
                          style={{ marginBottom: 16 }}
                        >
                          <Space>
                            <span style={{ maxWidth: 80 }}>
                              <Typography.Title level={4}>{spec.count}</Typography.Title>

                              {/* <Typography.Text
                  style={{ fontSize: 12, display: "flex" }}
                  disabled
                  ellipsis
                >
                  {spec.type}
                </Typography.Text> */}
                              <Tooltip
                                placement="top"
                                title={spec.serviceName}
                                color={styles.white}
                                overlayInnerStyle={{
                                  color: styles.primary,
                                }}
                              >
                                <Typography.Text
                                  style={{
                                    color: styles.primary,
                                    maxWidth: 80,
                                  }}
                                  ellipsis
                                >
                                  {spec.serviceName}
                                </Typography.Text>
                              </Tooltip>
                            </span>
                            <Divider
                              type="vertical"
                              style={{ height: "60px" }}
                            />
                          </Space>
                        </Col>
                      )
                  )}
                </Row>
              }
            >
              <Space align="center">
                <Typography.Text ellipsis>
                  <Link
                    to={getRedirectLink(item.vendorName)}
                    style={{ color: styles.primary }}
                  >
                    view all
                  </Link>
                </Typography.Text>
              </Space>
            </Popover>
          </div>
        )}
      </>
    );
  };

  return (
    <Link to={getRedirectLink(item.vendorName)}>
      <WrapperCard key={itemPerRow}>
        <Row gutter={16}>
          <Col span={8}>
            <Space>
              <StyledAvatar
                shape="square"
                size={48}
                src={`${item.logo}${imageKey}`}
              ></StyledAvatar>
              <Typography.Title
                level={4}
                style={{ marginBottom: 0 }}
              >
                {item.vendorName}
              </Typography.Title>
            </Space>
          </Col>
          <Col
            span={16}
            ref={colRef}
          >
            <Space
              split={
                <Divider
                  type="vertical"
                  style={{ height: "48px" }}
                />
              }
              direction="horizontal"
            >
              {renderServiceList(item.service, item.logo, item.vendorName)}
            </Space>
          </Col>
        </Row>
      </WrapperCard>
    </Link>
  );
};
