import { Tabs } from "antd";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { ContentWrapper } from "@components/index";
import { useQuery } from "~/Hooks/useQuery";
import { useNavigate } from "react-router-dom";

import { AzureResources } from "./AzureResources";
import { AWSResources } from "./AWSResources";
import { withCloudConfigurator } from "../WithCloudConfigurator";
import { MultiCloud } from "../CloudConstants";
import { camelCase } from "lodash";
import { MockTabs } from "./MockTabs";
import { mockMulticloudAWS, mockMulticloudAzure } from "~/Utils";

export const Resources = withCloudConfigurator(
  ({ configuredCloudApps }: { configuredCloudApps: Array<MultiCloud> }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [tabPanelHeight, setTabPanelHeight] = useState<number>(0);
    const query = useQuery();
    const navigate = useNavigate();
    const id = query.get("vendor") || "";

    useEffect(() => {
      if (!query.get("vendor")) {
        navigate({
          search: `?vendor=${configuredCloudApps[0]}`,
        });
      }
    }, [query]);
    useEffect(() => {
      if (ref.current) {
        setTabPanelHeight(ref.current.getBoundingClientRect().height);
      }
    }, [ref]);
    const tabPanelStyle: CSSProperties = {
      height: tabPanelHeight,
      overflowY: "auto",
      overflowX: "hidden",
    };

    const getCloudItem = (item: MultiCloud): any => {
      switch (camelCase(item)) {
        case camelCase(MultiCloud.AZURE):
          return {
            label: "Azure",
            key: MultiCloud.AZURE,
            children: mockMulticloudAzure ? (
              <MockTabs height={tabPanelHeight} exportName="Azure"/>
            ) : (
              <AzureResources height={tabPanelHeight} />
            ),
          };
        case camelCase(MultiCloud.AWS):
          return {
            label: "AWS",
            key: MultiCloud.AWS,
            children: mockMulticloudAWS ? (
              <MockTabs height={tabPanelHeight} exportName="AWS" />
            ) : (
              <AWSResources height={tabPanelHeight} />
            ),
          };
        case camelCase(MultiCloud.DIGITAL_OCEAN):
          return {
            label: "Digital Ocean",
            key: camelCase(MultiCloud.DIGITAL_OCEAN),
            children: <MockTabs height={tabPanelHeight} exportName="Digital Ocean"/>,
          };
        case camelCase(MultiCloud.GCP):
          return {
            label: "GCP",
            key: MultiCloud.GCP,
            children: <MockTabs height={tabPanelHeight} exportName="GCP" />,
          };
        case camelCase(MultiCloud.ORACLE_CLOUD):
          return {
            label: "Oracle Cloud",
            key: camelCase(MultiCloud.ORACLE_CLOUD),
            children: <MockTabs height={tabPanelHeight} exportName="Oracle Cloud" />,
          };
        default:
          return null;
      }
    };

    return (
      <ContentWrapper title="Resources">
        <div ref={ref} style={{ height: "98%", width: "100%" }}>
          <Tabs
            items={configuredCloudApps.map((item) => getCloudItem(item))}
            activeKey={id}
            onChange={(activeKey) =>
              navigate(`/multi-cloud/resources?vendor=${activeKey}`)
            }
            
          ></Tabs>
        </div>
      </ContentWrapper>
    );
  }
);
