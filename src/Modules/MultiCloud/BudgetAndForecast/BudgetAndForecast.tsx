import { Button, Space, Tabs } from "antd";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContentWrapper } from "~/Components";
import { Budget } from "./Budget/Budget";
import { Forecast } from "./ForeCast/Forecast";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { Icon } from "@iconify/react";
import { permissions } from "~/Utils/Roles";

export const BudgetAndForecast = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { hasPermissions } = useHasAccess();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabPanelHeight, setTabPanelHeight] = useState<number>(0);
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
  const items = [
    {
      label: "Budgets",
      key: "Budgets",
      styles: { tabPanelStyle },
      children: <Budget height={tabPanelHeight} />,
    },
    {
      label: "Forecast",
      key: "Forecast",
      styles: { tabPanelStyle },
      children: <Forecast height={tabPanelHeight} />,
    },
  ];

  return (
    <ContentWrapper
     title="Budget &amp; Forecasting"
     actionItems={
      hasPermissions([permissions.CREATE_BUDGET]) && (
        <Button
          type="primary"
          onClick={() => navigate("/multi-cloud/budget-forecast/budget/onboarding/budget-details")}
        >
          <Space>
            <Icon icon="akar-icons:plus" inline />
            Add
          </Space>
        </Button>
      )
    }
     >
      <div ref={ref} style={{ height: "98%", width: "100%" }}>
        <Tabs
          items={items}
          activeKey={id}
          onChange={(activeKey) =>
            navigate(`/multi-cloud/budget-forecast/${activeKey}`)
          }
        ></Tabs>
      </div>
    </ContentWrapper>
  );
};
