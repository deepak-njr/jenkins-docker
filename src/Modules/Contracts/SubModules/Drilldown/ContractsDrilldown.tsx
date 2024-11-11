import { CSSProperties, useEffect, useRef, useState } from "react";
import { Space, Tabs, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";

import { ContentWrapper } from "@components/index";
import { Icon } from "@iconify/react";
import { Licenses } from "./Licenses/Licenses";
import { OverView } from "./OverView/OverView";
import { get } from "@services/api.service";
import { isEmpty } from "lodash";
import styles from "../../Contract.module.scss";
import { useQuery } from "@hooks/useQuery";

export const ContractsDrilldown = () => {
  const { id } = useParams();
  const query = useQuery();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [tabPanelHeight, setTabPanelHeight] = useState<number | string>("auto");
  const [data, setData] = useState<{ [key in string]: any }>({});

  useEffect(() => {
    if (isEmpty(data)) {
      get(
        `v1/application/contract/overview?contractId=${id}`
      ).then((res: any) => {
        if (res && res.response.data) {
          setData(res.response.data);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    setTimeout(() => {
      if (ref.current) {
        setTabPanelHeight(ref.current.getBoundingClientRect().height - 40);
      }
    }, 300);
  }, [ref]);

  const tabPanelStyle: CSSProperties = {
    height: tabPanelHeight,
    overflowY: "auto",
    overflowX: "hidden",
  };
  const items = [
    {
      label: "Overview",
      key: "overview",
      children: <OverView data={data} id={id} />,
    },
    {
      label: "Licenses",
      key: "licenses",
      children: <Licenses id={id ?? ""} />,
    },
    {
      label: "Documents",
      key: "documents",
      styles: { tabPanelStyle },
      disabled: true,
    },
  ];

  return (
    <ContentWrapper
      customTitle={
        <Space style={{ alignItems: "center", lineHeight: 1 }}>
          <Icon
            onClick={() => navigate("/contracts")}
            icon="akar-icons:arrow-left"
            style={{
              fontSize: "1.8rem",
              cursor: "pointer",
              color: styles.primary,
              marginRight: styles.whitespace1,
            }}
          />
          <Typography.Title level={3} style={{ margin: 0 }}>
            {data.contractName}
          </Typography.Title>
        </Space>
      }
    >
      <div ref={ref} style={{ height: "99%" }}>
        <Tabs
          items={items}
          key={tabPanelHeight}
          style={{ height: "100%" }}
          activeKey={query.get("activeTab") || ""}
          onChange={(activeKey) =>
            navigate(`/contracts/${id}?activeTab=${activeKey}`)
          }
        ></Tabs>
      </div>
    </ContentWrapper>
  );
};
