import { Col, Row } from "antd";
import { LatestContracts, Metric, ExpiringContracts } from "./Widgets";

import styles from "@styles/variables.module.scss";
import { useCallback, useEffect, useState } from "react";
import { useNotification } from "~/Hooks/useNotification";
import { get } from "@services/api.service";
import { get as _get } from "lodash";

export const CLMDashboard = () => {
  const colCommonStyles = {
    marginBottom: styles.whitespace2,
  };
  const [dashboardData, setDashboardData] = useState<any>({});
  const { openToast } = useNotification();
  const [isLoading, setIsLoading] = useState(false);

  const getRecords = useCallback(() => {
    setIsLoading(true);
    get("v1/clm/dashboard/view")
      .then((res: any) => {
        if (res && res.response && res.response.data) {
          setDashboardData(res.response.data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({
          content: "Getting Contracts failed",
          type: "error",
        });
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    getRecords();
  }, []);

  return (
    <>
      <Metric
        data={dashboardData}
        isLoading={isLoading}
      />
      <Row gutter={16}>
        <Col
          xs={24}
          lg={12}
        >
          <Row>
            <Col
              span={24}
              style={colCommonStyles}
            >
              <LatestContracts
                data={_get(dashboardData, "latestContracts", [])}
                isLoading={isLoading}
              />
            </Col>
          </Row>
        </Col>
        <Col
          xs={24}
          lg={12}
        >
          <Row>
            <Col
              span={24}
              style={colCommonStyles}
            >
              <ExpiringContracts
                data={_get(dashboardData, "expiredContracts", [])}
                isLoading={isLoading}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
