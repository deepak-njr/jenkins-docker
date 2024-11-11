import { Icon } from "@iconify/react";
import { Button, Space, Tabs } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ContentWrapper } from "~/Components";
import { useQuery } from "~/Hooks/useQuery";
import { Completed } from "./Completed";
import { Inprogress } from "./Inprogress";

export const Workflows = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const items = [
    {
      label: "In Progress",
      key: "inprogress",
      children: <Inprogress />,
    },
    {
      label: "Completed",
      key: "completed",
      children: <Completed />,
    },
  ];

  return (
    <ContentWrapper
      title="Workflows"
      actionItems={
        <Button type="primary" onClick={() => navigate("/workflows/create")}>
          <Space>
            <Icon icon="akar-icons:plus" inline />
            Create Workflow
          </Space>
        </Button>
      }
    >
      <Tabs
        items={items}
        activeKey={query.get("activeTab") || "inprogress"}
        onChange={(activeKey) => navigate(`/workflows?activeTab=${activeKey}`)}
      />
    </ContentWrapper>
  );
};
