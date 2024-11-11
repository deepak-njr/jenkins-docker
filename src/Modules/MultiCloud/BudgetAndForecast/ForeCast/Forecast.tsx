import { Col, Row, Tabs } from "antd";
import { useQuery } from "~/Hooks/useQuery";
import { useNavigate } from "react-router-dom";

import { AzureForeCast } from "./AzureForecast";
import { AWSForecast } from "./AwsForecast";
import { MultiCloud } from "../../CloudConstants";
import { withCloudConfigurator } from "../../WithCloudConfigurator";
import { useEffect } from "react";
import { camelCase } from "lodash";
import { MockTabs } from "./MockTabs";
import { mockMulticloudAWS, mockMulticloudAzure } from "~/Utils";

export const Forecast = withCloudConfigurator(
  ({ height, configuredCloudApps }: { height: number; configuredCloudApps: Array<MultiCloud> }) => {
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

    const getCloudItem = (item: MultiCloud): any => {
      switch (camelCase(item)) {
        case camelCase(MultiCloud.AZURE):
          return {
            label: "Azure",
            key: MultiCloud.AZURE,
            children: mockMulticloudAzure ? <MockTabs /> : <AzureForeCast />,
          };
        case camelCase(MultiCloud.AWS):
          return {
            label: "AWS",
            key: MultiCloud.AWS,
            children: mockMulticloudAWS ? <MockTabs /> : <AWSForecast />,
          };
        case camelCase(MultiCloud.DIGITAL_OCEAN):
          return {
            label: "Digital Ocean",
            key: camelCase(MultiCloud.DIGITAL_OCEAN),
            children: <MockTabs />,
          };
        case camelCase(MultiCloud.GCP):
          return {
            label: "GCP",
            key: MultiCloud.GCP,
            children: <MockTabs />,
          };
        case camelCase(MultiCloud.ORACLE_CLOUD):
          return {
            label: "Oracle Cloud",
            key: camelCase(MultiCloud.ORACLE_CLOUD),
            children: <MockTabs />,
          };
        default:
          return null;
      }
    };

    return (
      <Row
        gutter={16}
        justify="space-between"
        align="middle"
      >
        <Col span={24}>
          <Tabs
            items={configuredCloudApps.map((item) => getCloudItem(item))}
            className="tabs-plain"
            activeKey={id}
            onChange={(activeKey) => navigate(`/multi-cloud/budget-forecast/Forecast?vendor=${activeKey}`)}
          ></Tabs>
        </Col>
      </Row>
    );
  }
);
