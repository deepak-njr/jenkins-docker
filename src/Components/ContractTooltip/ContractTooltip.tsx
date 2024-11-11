import { Col, Row, Badge, Tooltip, Typography } from "antd";
import { TooltipLayout } from "~/Components/Chart/TooltipLayout";
import { Icon } from "@iconify/react";

import styles from "@styles/variables.module.scss";

interface Props {
  children: React.ReactNode;
}

export const ContractTooltip = ({ children }: Props) => {
  return (
    <Tooltip
      showArrow={false}
      overlayClassName="contractTotalCost"
      placement="left"
      title={
        <TooltipLayout
          title={"Actual Amount"}
          body={
            <Row
              gutter={16}
              justify="space-between"
              align="middle"
            >
              <Col>
                <Badge className={styles.Dot} />
                <Typography.Text
                  strong
                  style={{ color: styles.primary }}
                >
                  {children}
                </Typography.Text>
              </Col>
            </Row>
          }
        />
      }
    >
      <Icon
        icon="bi:info-circle-fill"
        color="gray"
      />
    </Tooltip>
  );
};
