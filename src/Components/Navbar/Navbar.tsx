import { Icon } from "@iconify/react";
import { Menu, Layout, Typography, Divider, MenuProps, Button, Popover, Space } from "antd";
import styles from "./Navbar.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactElement, useContext, useState } from "react";
import { permissions, Roles } from "@utils/Roles";
import { useHasAccess } from "~/Hooks/useHasAccess";
import moment from "moment";
import { isObject } from "lodash";
import { MultiCloudContext } from "~/Context/MultiCloutContext";
import { enabledMenuItems } from "@utils/Constants";
const { Footer } = Layout;
const { Text, Title } = Typography;

const getIcon = (icon: string, rotate = 0) => (
  <Icon
    icon={icon}
    className={styles.navbarItemIcon}
    inline
    rotate={rotate}
  />
);

type NavItem = {
  icon: ReactElement;
  label: string;
  key: string;
  locked?: boolean;
  roles: string[];
};

type AntMenuItem = Required<MenuProps>["items"][number];

interface MenuItem extends NavItem {
  childrens?: NavItem[];
}

const secondaryMenu: NavItem[] = [
  {
    icon: getIcon("carbon:gui-management"),
    label: "Onboarding Management",
    key: "/onboarding-management/applications",
    roles: [permissions.VIEW_ONBOARDINGMGMT],
  },
  {
    icon: getIcon("ri:user-settings-line"),
    label: "Track Requests",
    key: "/track-requests",
    roles: [permissions.VIEW_REQUESTMGMT],
  },

  {
    icon: getIcon("carbon:help"),
    label: "Help & Support",
    key: "/support",
    locked: true,
    roles: ["*"],
  },
];

interface Props {
  collapsed: boolean;
}

export const Navbar = ({ collapsed }: Props) => {
  const { hasPermissions, hasRole } = useHasAccess();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const onboardedCloudApps = useContext(MultiCloudContext).multiCloudItems;

  function getItem({
    roles,
    label,
    key,
    icon,
    children,
    locked,
    checkRole = false,
  }: {
    roles: string[];
    label: React.ReactNode;
    key?: React.Key | null;
    icon?: React.ReactNode;
    children?: AntMenuItem[];
    locked?: boolean;
    checkRole?: boolean;
  }): AntMenuItem {
    if (checkRole) {
      if (hasRole(roles[0])) {
        return {
          key,
          icon,
          children,
          label,
          ...(locked && { disabled: true }),
        } as AntMenuItem;
      } else {
        return null;
      }
    } else if (hasPermissions(roles)) {
      return {
        key,
        icon,
        children,
        label,
        ...(isObject(label?.valueOf()) && {
          className: styles.PopoverMenu,
        }),
        ...(locked && !isObject(label?.valueOf()) && { disabled: true }),
      } as AntMenuItem;
    }
    return null;
  }

  const primaryItems: AntMenuItem[] = [
    getItem({
      roles: [permissions.VIEW_DASHBOARD],
      label: "Dashboard",
      key: "/dashboard",
      icon: getIcon("ic:outline-poll"),
    }),
    getItem({
      roles: [permissions.VIEW_APPLICATION],
      label: "Applications",
      key: "/applications",
      icon: getIcon("icon-park:application-menu"),
    }),
    getItem({
      roles: [permissions.VIEW_USER],
      label: "Users",
      key: "/users",
      icon: getIcon("ph:users-bold"),
    }),
    getItem({
      roles: [permissions.VIEW_DEPARTMENT],
      label: "Departments",
      key: "/departments",
      icon: getIcon("icon-park-outline:connection-point", 3),
    }),
    ...(onboardedCloudApps.length === 0 && hasPermissions([permissions.ADD_ADMINUSER])
      ? [
          getItem({
            roles: ["*"],
            locked: true,
            label: (
              <Popover
                overlayInnerStyle={{
                  maxWidth: 250,
                }}
                style={{ width: "100%" }}
                key={`${open}`}
                trigger="click"
                open={open}
                onOpenChange={(e) => setOpen(e)}
                content={
                  <Space direction="vertical">
                    <Typography.Text
                      type="danger"
                      style={{ textAlign: "center" }}
                    >
                      No Cloud Configured
                    </Typography.Text>
                    <Typography.Text>To get started, Configure a cloud provider using below option</Typography.Text>
                    <Button
                      block
                      type="primary"
                      onClick={() => {
                        setOpen(false);
                        navigate("/multi-cloud/add");
                      }}
                    >
                      <Space>
                        <Icon
                          icon="akar-icons:plus"
                          inline
                        />
                        Add Cloud Provider
                      </Space>
                    </Button>
                  </Space>
                }
                destroyTooltipOnHide
                placement="right"
              >
                Multicloud
              </Popover>
            ),
            key: "nocloud",
            icon: getIcon("ant-design:cloud-outline"),
          }),
        ]
      : []),
    ...(onboardedCloudApps.length > 0
      ? [
          getItem({
            roles: ["*"],
            label: "Multicloud",
            key: "multi-cloud",
            icon: getIcon("ant-design:cloud-outline"),
            children: [
              getItem({
                roles: ["*"],
                label: "Overview",
                key: "/multi-cloud/overview",
              }),
              getItem({
                roles: ["*"],
                label: "Budget & Forecast",
                key: "/multi-cloud/budget-forecast/Budgets",
              }),
              getItem({
                roles: ["*"],
                label: "Optimize",
                key: "/multi-cloud/optimize",
              }),
              getItem({
                roles: ["*"],
                label: "Resources",
                key: "/multi-cloud/resources",
              }),
            ],
          }),
        ]
      : []),

    getItem({
      roles: [permissions.VIEW_DEPARTMENT],
      label: "Projects",
      key: "/projects",
      icon: getIcon("fa-solid:project-diagram"),
    }),
    getItem({
      roles: [permissions.VIEW_APPLICATION],
      label: "Subscriptions",
      key: "/subscriptions",
      icon: getIcon("eos-icons:subscriptions-created"),
    }),
    getItem({
      roles: [permissions.VIEW_APPLICATION],
      label: "Contracts",
      key: "/contracts",
      icon: getIcon("fluent:document-checkmark-20-regular"),
    }),
    getItem({
      roles: [permissions.VIEW_CONTRACT],
      label: "CLM",
      key: "clm",
      icon: getIcon("mdi:contract-sign"),
      children: [
        getItem({
          roles: ["*"],
          label: "Dashboard",
          key: "/clm/dashboard",
        }),
        getItem({
          roles: ["*"],
          label: "Contracts",
          key: "/clm/contracts",
        }),
        getItem({
          roles: ["*"],
          label: "Templates",
          key: "/clm/templates",
        }),
      ],
    }),
    getItem({
      roles: [permissions.VIEW_APPLICATION],
      label: "Renewals",
      key: "/renewals",
      icon: getIcon("icon-park-outline:circular-connection"),
    }),
    getItem({
      roles: [permissions.VIEW_APPLICATION],
      label: "Invoices",
      key: "/invoices",
      icon: getIcon("la:file-invoice"),
    }),
    getItem({
      roles: [permissions.VIEW_MARKETPLACE],
      label: "Market Place",
      key: "/marketplace",
      icon: getIcon("ic:sharp-folder-open"),
    }),
  ];

  const secondaryItems: AntMenuItem[] = [
    getItem({
      roles: [Roles.SUPER_ADMIN],
      label: "Administration",
      key: "",
      icon: getIcon("dashicons:admin-generic"),
      checkRole: true,
      children: [
        getItem({
          roles: [permissions.VIEW_ADMINUSER],
          label: "User Management",
          key: "/administration/user-management",
        }),
        getItem({
          roles: [permissions.VIEW_ADMINUSER],
          label: "Cloud Configuration",
          key: "/administration/multicloud",
        }),
        getItem({
          roles: [permissions.VIEW_ADMINUSER],
          label: "Preferences",
          key: "/administration/preferences",
        }),
      ],
    }),
    getItem({
      roles: [permissions.ENABLE_INTEGRATION],
      label: "Integrations",
      key: "/integrations?activeTab=all",
      icon: getIcon("mdi:link-variant"),
    }),
    getItem({
      roles: [permissions.VIEW_ONBOARDINGMGMT],
      label: "Onboarding Management",
      key: "/onboarding-management/applications",
      icon: getIcon("carbon:gui-management"),
    }),
    getItem({
      roles: [permissions.VIEW_REQUESTMGMT],
      label: "Track Requests",
      key: "/track-requests?activeTab=user",
      icon: getIcon("ri:user-settings-line"),
    }),
    getItem({
      roles: [permissions.VIEW_WORKFLOW],
      label: "Workflows",
      key: "/workflows",
      icon: getIcon("octicon:workflow-16"),
    }),
    getItem({
      roles: ["*"],
      label: "Audit Logs",
      key: "/audit-logs",
      icon: getIcon("ant-design:cloud-outline"),
    }),
    getItem({
      roles: ["*"],
      locked: true,
      label: "Help & Support",
      key: "/support",
      icon: getIcon("carbon:help"),
    }),
  ];

  const getOpenKeys = () => {
    const keys: any = [];

    primaryItems.find((o: any) =>
      o?.key === pathname
        ? keys.push(o.key)
        : o?.children?.find((c: any) => (c?.key === pathname ? keys.push(o.key) : null))
    );

    return keys;
  };

  const getPrimaryActiveKey = () => {
    let result = "";
    primaryItems.map((primary: any) => {
      // console.log(pathname.split("/")[1]);
      primary?.key?.split("/")[1]?.split("?")[0] === pathname.split("/")[1]
        ? (result = primary.key)
        : primary?.children?.map((child: any) => {
            child.key?.split("/")[2]?.split("?")[0] === pathname.split("/")[2]?.split("?")[0]
              ? (result = child.key)
              : "";
          });
    });

    return result;
  };

  const getSecondaryActiveKey = () => {
    let result = "";
    secondaryItems.map((secondary: any) => {
      secondary?.key.split("/")[1]?.split("?")[0] === pathname.split("/")[1]
        ? (result = secondary.key)
        : secondary?.children?.map((child: any) => (child.key === pathname ? (result = child.key) : ""));
    });
    return result;
  };

  return (
    <Layout
      style={{
        background: styles.primary,
        height: "100%",
        paddingTop: 12,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Menu
        selectable
        mode="inline"
        items={primaryItems.filter((item: any) => item && enabledMenuItems.includes(item.label))}
        style={{
          background: styles.primary,
        }}
        className={styles.navBar}
        defaultOpenKeys={getOpenKeys()}
        selectedKeys={[getPrimaryActiveKey()]}
        onClick={({ key }) => {
          if (key === "nocloud") {
            // setOpen(true);
            return false;
          } else {
            navigate(key);
          }
        }}
      />
      <span className={styles.divider}>
        <Divider style={{ marginBlock: styles.whitespace3 }} />
      </span>
      <Menu
        selectable
        mode="inline"
        items={secondaryItems.filter((item: any) => item && enabledMenuItems.includes(item.label))}
        style={{
          background: styles.primary,
        }}
        defaultOpenKeys={getOpenKeys()}
        selectedKeys={[getSecondaryActiveKey()]}
        className={styles.navBar}
        onClick={({ key }) => key && navigate(key)}
      />
      {!collapsed && (
        <Footer className={styles.footerStyle}>
          <Title
            level={5}
            style={{ color: styles.white }}
          >
            &copy; Saaspe. {moment().format("YYYY")}
          </Title>
          {/* <Text
            type="secondary"
            style={{
              color: styles.white,
              clear: "both",
              display: "flex",
            }}
          >
            <small>Powerfull analytics tools for your business</small>
          </Text> */}
        </Footer>
      )}
    </Layout>
  );
};
