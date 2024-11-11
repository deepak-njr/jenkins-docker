import { Icon } from "@iconify/react";
import { Collapse } from "antd";
import alpha from "color-alpha";
import { memo, ReactNode } from "react";
import styled from "styled-components";
import styles from "./ExpansionPanel.module.scss";

interface Props {
  color?: string;
  title: string | ReactNode;
  children: ReactNode;
}

const StyledCollapsedPanel = styled(Collapse)<{ color: string }>`
  position: relative;
  margin-bottom: 16px;
  :before {
    content: "";
    height: 100%;
    width: 6px;
    background-color: ${({ color }) => (color ? color : "")};

    position: absolute;
    border-radius: 8px 0px 0px 8px;
  }
  .ant-collapse-item {
    background-color: ${({ color }) => (color ? alpha(color, 0.02) : "")};
  }
`;

const StyledIcon = styled(Icon)`
  height: 24px;
  width: 24px;
  padding: 5px;
  border-radius: 100% !important;
`;

export const ExpansionPanel = memo(({ color, title, children }: Props) => {
  return (
    <StyledCollapsedPanel
      color={color || ""}
      className={styles.ExpansionPanel}
      style={{ ...(color && { borderColor: alpha(color, 0.5) }) }}
      expandIconPosition="end"
      expandIcon={(props) => {
        return (
          <StyledIcon
            fontSize={20}
            fontWeight="bold"
            icon="akar-icons:chevron-down"
            style={{
              color: styles.strawberry,
              background: alpha(styles.strawberry, 0.2),
            }}
            // {...props}
            rotate={props.isActive ? "180deg" : 0}
          />
        );
      }}
    >
      <Collapse.Panel
        header={title}
        key="accordion"
        style={{
          borderRadius: styles.whitespace1,
          ...(color && { borderColor: alpha(color, 0.5) }),
        }}
      >
        {children}
      </Collapse.Panel>
    </StyledCollapsedPanel>
  );
});
