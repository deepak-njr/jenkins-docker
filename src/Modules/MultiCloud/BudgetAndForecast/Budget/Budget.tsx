import { Col, Row, Tabs } from "antd";
import { useEffect } from "react";
import { Azure } from "./Azure";
import { AWS } from "./Aws";
import { useQuery } from "~/Hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { withCloudConfigurator } from "../../WithCloudConfigurator";
import { MultiCloud } from "../../CloudConstants";
import { MockBudget } from "./MockBudget";
import { camelCase, isEqual } from "lodash";
import { mockMulticloudAWS, mockMulticloudAzure } from "~/Utils";

export const Budget = withCloudConfigurator(
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
            children: mockMulticloudAzure ? (
              <MockBudget
                height={height}
                label={MultiCloud.AZURE}
              />
            ) : (
              <Azure height={height} />
            ),
          };
        case camelCase(MultiCloud.AWS):
          return {
            label: "AWS",
            key: MultiCloud.AWS,
            children: mockMulticloudAWS ? (
              <MockBudget
                height={height}
                label={MultiCloud.AWS}
              />
            ) : (
              <AWS height={height} />
            ),
          };
        case camelCase(MultiCloud.DIGITAL_OCEAN):
          return {
            label: "Digital Ocean",
            key: camelCase(MultiCloud.DIGITAL_OCEAN),
            children: (
              <MockBudget
                height={height}
                label={MultiCloud.DIGITAL_OCEAN}
              />
            ),
          };
        case camelCase(MultiCloud.GCP):
          return {
            label: "GCP",
            key: MultiCloud.GCP,
            children: (
              <MockBudget
                height={height}
                label={MultiCloud.GCP}
              />
            ),
          };
        case camelCase(MultiCloud.ORACLE_CLOUD):
          return {
            label: "Oracle Cloud",
            key: camelCase(MultiCloud.ORACLE_CLOUD),
            children: (
              <MockBudget
                height={height}
                label={MultiCloud.ORACLE_CLOUD}
              />
            ),
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
            className="tabs-plain"
            activeKey={id}
            onChange={(activeKey) => navigate(`/multi-cloud/budget-forecast/Budgets?vendor=${activeKey}`)}
            items={configuredCloudApps.map((item) => getCloudItem(item))}
          />
        </Col>
      </Row>
    );
  }
);
