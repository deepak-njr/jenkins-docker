import { Applications, OverView, Users } from "..";
import { Button, Space, Tabs, Typography } from "antd";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ContentWrapper } from "@components/index";
import { Icon } from "@iconify/react";
import { Projects } from "./Projects/Projects";
import { get } from "@services/api.service";
import { isEmpty } from "lodash";
import { permissions } from "~/Utils/Roles";
import styles from "../../Departments.module.scss";
import { useHasAccess } from "@hooks/useHasAccess";
import { useQuery } from "@hooks/useQuery";

export const DepartmentDrillDown = () => {
  const { id} = useParams();

  const { hasPermissions } = useHasAccess();
  const query = useQuery();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [tabPanelHeight, setTabPanelHeight] = useState<number | string>("auto");
  const [data, setData] = useState<{ [key in string]: any }>({});

  useEffect(() => {
    setTimeout(() => {
      if (ref.current) {
        setTabPanelHeight(ref.current.getBoundingClientRect().height - 40);
      }
    }, 300);
  }, [ref]);

  const tabPanelStyle: CSSProperties = {
    height: tabPanelHeight,
    overflowY: "auto",
    overflowX: "hidden",
  };

  useEffect(() => {
    if (isEmpty(data)) {
      get(`v1/department/overview?departmentId=${id}`).then(
        (res: any) => {
          if (res && res.response.data) {
            setData(res.response.data.departmentOverviewResponse);
          }
        }
      );
    }
  }, [id]);
  const items = [
    {
      label: "Overview",
      key: "overview",
      children: (
        <OverView
          avgCost={data.departmentAvgMonthlyAdminCost}
          users={data.departmentUserCount}
          apps={data.departmentApplicationCount}
          projectCount={data.projectsCount}
        />
      ),
    },
    {
      label: "Applications",
      key: "applications",
      children: <Applications id={id ?? ""} />,
    },
    {
      label: "Users",
      key: "users",
      children: <Users id={id ?? ""} />,
    },
    {
      label: "Projects",
      key: "projects",
      children: <Projects id={id ?? ""} />,
    },
  ];
  return (
    <ContentWrapper
      customTitle={
        <Space style={{ alignItems: "center", lineHeight: 1 }}>
          <Icon
            onClick={() => navigate("/departments")}
            icon="akar-icons:arrow-left"
            style={{
              fontSize: "1.8rem",
              cursor: "pointer",
              color: styles.primary,
              marginRight: styles.whitespace1,
            }}
          />
          <Typography.Title level={3} style={{ margin: 0 }}>
            {data.departmentName}
          </Typography.Title>
        </Space>
      }
      actionItems={
        query.get("activeTab") === "projects" &&
        hasPermissions([permissions.ADD_DEPARTMENT]) && (
          <Button
            type="primary"
            onClick={() =>
              navigate(`/departments/${id}/projects/onboarding`, {
                state: { departmentName: data.departmentName },
              })
            }
          >
            <Space>
              <Icon icon="akar-icons:plus" inline />
              Add
            </Space>
          </Button>
        )
      }
    >
      <div ref={ref} style={{ height: "99%" }}>
        <Tabs
          items={items}
          key={tabPanelHeight}
          style={{ height: "100%" }}
          activeKey={query.get("activeTab") || ""}
          onChange={(activeKey) =>
            navigate(`/departments/${id}?activeTab=${activeKey}`)
          }
        />
      </div>
    </ContentWrapper>
  );
};
