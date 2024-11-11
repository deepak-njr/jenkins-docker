import { Tabs } from "antd";
import { useEffect, useRef, useState } from "react";
import { ContentWrapper } from "@components/index";
import { Azure } from "./Azure/AzureDataTable";
import { AWS } from "./Aws/AwsOptimize";
import { useQuery } from "~/Hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { withCloudConfigurator } from "../WithCloudConfigurator";
import { MultiCloud } from "../CloudConstants";
import { camelCase } from "lodash";
import { MockTabs } from "./MockTabs/MockTabs";
import { mockMulticloudAWS, mockMulticloudAzure } from "~/Utils";

export const Optimize = withCloudConfigurator(
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

    const getCloudItem = (item: MultiCloud): any => {
      switch (camelCase(item)) {
        case camelCase(MultiCloud.AZURE):
          return {
            label: "Azure",
            key: MultiCloud.AZURE,
            children: mockMulticloudAzure ? (
              <MockTabs height={tabPanelHeight} label={MultiCloud.AZURE} exportName="Azure"/>
            ) : (
              <Azure height={tabPanelHeight} />
            ),
          };
        case camelCase(MultiCloud.AWS):
          return {
            label: "AWS",
            key: MultiCloud.AWS,
            children: mockMulticloudAWS ? (
              <MockTabs height={tabPanelHeight} label={MultiCloud.AWS} exportName="AWS"/>
            ) : (
              <AWS height={tabPanelHeight} />
            ),
          };

        case camelCase(MultiCloud.DIGITAL_OCEAN):
          return {
            label: "Digital Ocean",
            key: camelCase(MultiCloud.DIGITAL_OCEAN),
            children: (
              <MockTabs
                height={tabPanelHeight}
                label={MultiCloud.DIGITAL_OCEAN}
                exportName="Digital Ocean"
              />
            ),
          };
        case camelCase(MultiCloud.GCP):
          return {
            label: "GCP",
            key: MultiCloud.GCP,
            children: (
              <MockTabs height={tabPanelHeight} label={MultiCloud.GCP} exportName="GCP" />
            ),
          };
        case camelCase(MultiCloud.ORACLE_CLOUD):
          return {
            label: "Oracle Cloud",
            key: camelCase(MultiCloud.ORACLE_CLOUD),
            children: (
              <MockTabs
                height={tabPanelHeight}
                label={MultiCloud.ORACLE_CLOUD}
                exportName="Oracle Cloud"
              />
            ),
          };
        default:
          return null;
      }
    };

    return (
      <ContentWrapper title="Optimize">
        <div ref={ref} style={{ height: "98%", width: "100%" }}>
          <Tabs
            items={configuredCloudApps.map((item) => getCloudItem(item))}
            activeKey={id}
            onChange={(activeKey) =>
              navigate(`/multi-cloud/optimize?vendor=${activeKey}`)
            }
          ></Tabs>
        </div>
      </ContentWrapper>
    );
  }
);
