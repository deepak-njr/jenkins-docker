import { CSSProperties, useCallback, useState } from "react";
import { ContentWrapper } from "@components/index";

import { Tabs } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  ApplicationList,
  DepartmentList,
  ProjectList,
  UsersList,
} from "./SubModules";
import { ContractList } from "./SubModules/Contracts/ContractList";

export const OnboardingMgmt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ref = useCallback((node: HTMLDivElement) => {
    if (node) {
      setTimeout(
        () => setTabPanelHeight(node.getBoundingClientRect().height - 40),
        100
      );
    }
  }, []);
  const [tabPanelHeight, setTabPanelHeight] = useState<number>(0);

  const tabPanelStyle: CSSProperties = {
    height: tabPanelHeight,
    overflowY: "auto",
    overflowX: "hidden",
  };

  const tabs = [
    {
      label: "Applications",
      key: "applications",
      children: <ApplicationList height={tabPanelHeight} />,
      styles: { tabPanelStyle },
    },
    {
      label: "Contracts",
      key: "contracts",
      children: <ContractList height={tabPanelHeight} />,
      styles: { tabPanelStyle },
    },
    {
      label: "Users",
      key: "users",
      children: <UsersList height={tabPanelHeight} />,
      styles: { tabPanelStyle },
    },
    {
      label: "Departments",
      key: "departments",
      children: <DepartmentList height={tabPanelHeight} />,
      styles: { tabPanelStyle },
    },
    {
      label: "Projects",
      key: "projects",
      children: <ProjectList height={tabPanelHeight} />,
      styles: { tabPanelStyle },
    },
  ];

  return (
    <ContentWrapper title={"Onboarding Management"}>
      <div ref={ref} style={{ height: "99%" }}>
        <Tabs
          items={tabs}
          style={{ height: "100%" }}
          activeKey={id}
          onChange={(activeKey) =>
            navigate(`/onboarding-management/${activeKey}`)
          }
        ></Tabs>
      </div>
    </ContentWrapper>
  );
};
