import { Button, Space } from "antd";
import cs from "classnames";
import { useEffect, useState } from "react";
import styles from "./ButtonGroup.module.scss";

interface Props {
  buttonItems: string[];
  onClick?: (e: React.MouseEvent, currentButton: string) => void;
  defaultActive?: string;
  disabled?: boolean;
}

export const ButtonGroup = ({
  buttonItems,
  onClick,
  defaultActive,
  disabled,
}: Props) => {
  const [activeButton, setActiveButton] = useState<string>();

  useEffect(() => {
    if (defaultActive) {
      setActiveButton(defaultActive);
    }
  }, [defaultActive]);
  return (
    <div className={styles.buttonGroupSection}>
      <Space direction="horizontal" size="middle">
        {buttonItems.map((btn) => (
          <Button
            key={btn}
            type="ghost"
            shape="round"
            disabled={disabled}
            className={cs(styles.button, {
              [styles.active]: activeButton === btn,
            })}
            onClick={(e) => {
              setActiveButton(btn);
              if (onClick) onClick(e, btn);
            }}
          >
            {btn}
          </Button>
        ))}
      </Space>
    </div>
  );
};
