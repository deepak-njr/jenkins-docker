import {
  Avatar,
  Button,
  Col,
  Divider,
  Dropdown,
  Grid,
  Image,
  Input,
  InputRef,
  Layout,
  Menu,
  Row,
  Space,
  Typography,
} from "antd";
import { imageKey, mediaHost } from "~/Utils";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@iconify/react";
import { Roles } from "~/Utils/Roles";
import { UserOutlined } from "@ant-design/icons";
import cs from "classnames";
import { get } from "@services/api.service";
import gpt from "~/Assets/SVG/gptSupport.svg";
import logo from "@assets/SVG/logo.svg";
import styles from "./Header.module.scss";
import { useAuth } from "@hooks/useAuth";
import { useLocalStorage } from "~/Hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { useNotification } from "~/Hooks/useNotification";

const { Text } = Typography;
const { useBreakpoint } = Grid;

export const Header = () => {
  const [searchText, setSearchText] = useState("");
  const { user, logout } = useAuth();
  const [profileDetails, setProfileDetails] = useState<any>({});
  const [, setUser] = useLocalStorage("user", {});
  const { lg, md, xs } = useBreakpoint();
  const { openToast } = useNotification();
  const navigate = useNavigate();
  const extras = useRef<HTMLDivElement>(null);
  const searchBar = useRef<InputRef>(null);

  if (!user) {
    navigate("/auth/login");
  }

  useEffect(() => {
    if ((user.email && !user.userName) || (user.role === "CLM_USER" && !user.userName)) {
      get(`v1/user/details/profile`)
        .then((res: any) => {
          if (res.response.data) {
            setUser({
              ...user,
              userLogo: res.response.data.userLogo,
              userName: res.response.data.userName,
            });
            setProfileDetails(res.response.data);
          }
        })
        .catch();
    } else if (user && user.userLogo) {
      setProfileDetails({
        userLogo: user.userLogo,
        userName: user.userName,
      });
    }
  }, []);

  const getRole = () => {
    switch (user.role) {
      case Roles.SUPER_ADMIN:
        return "Super Admin";
      case Roles.CONTRIBUTOR:
        return "Contributor";
      case Roles.REVIEWER:
        return "Reviewer";
      case Roles.APPROVER:
        return "Approver";
      case Roles.SUPPORT:
        return "Support";
      case Roles.CLM_USER:
        return "CLM User";
      default:
        return "";
    }
  };

  if (!user) {
    navigate("/auth/login");
  }

  return (
    <Layout.Header
      className={cs(styles.header, {
        [styles.SmallHeader]: xs,
      })}
    >
      <Row
        align="middle"
        style={{ height: "100%" }}
      >
        <Col
          span={5}
          className={styles.logoStyle}
        >
          <Image
            src={`${mediaHost}/images/branding/logo.png${imageKey}`}
            preview={false}
            style={{
              maxWidth: 180,
              cursor: "pointer",
            }}
            onClick={() => {
              if (user.role === "CLM_USER") {
                navigate("/clm/dashboard");
              } else {
                navigate("/dashboard");
              }
            }}
          />
        </Col>
        <Col
          span={7}
          style={{ display: "flex" }}
        >
          <Input
            ref={searchBar}
            className={cs(styles.searchBox, {
              [styles.SearchNarrow]: !lg || !md,
            })}
            {...((!md || !lg) && {
              onFocus: () => extras && extras.current && extras.current.classList.add(styles.hidden),
              onBlur: () => extras && extras.current && extras.current.classList.remove(styles.hidden),
            })}
            inputMode="search"
            value={searchText}
            suffix={
              <Icon
                icon="eva:search-outline"
                height="20"
                style={{
                  margin: "auto",
                  color: styles.strawberry,
                }}
              />
            }
            {...(lg && { placeholder: "Search here" })}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                navigate(`/applications?search=${e.currentTarget.value}`);
                setSearchText("");
                e.currentTarget.blur();
              }
            }}
          />
        </Col>
        <Col
          span={12}
          style={{ textAlign: "right", justifyContent: "space-between" }}
        >
          <div
            className={styles.NavExtras}
            ref={extras}
            style={{
              marginLeft: "auto",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              lineHeight: 1,
              gap: 16,
            }}
          >
            <Divider
              type="vertical"
              style={{
                borderLeft: "1px solid rgba(0, 0, 0, 0.22)",
                background: "D7D5F1",
                height: "56px",
              }}
            />
            <Typography.Link>
              <Icon
                icon={"clarity:bell-outline-badged"}
                style={{ margin: "auto", color: styles.strawberry }}
                height="20"
              />
            </Typography.Link>
            {user.role !== "CLM_USER" && (
              <Button
                onClick={() => navigate(`/askamigo`)}
                shape="round"
                style={{
                  background: styles.primary,
                  color: "White",
                  height: 36,
                }}
              >
                <Space>
                  <Image
                    src={gpt}
                    preview={false}
                  />
                  Ask Amigo
                </Space>
              </Button>
            )}
            <Typography.Link>
              <Dropdown
                overlay={
                  <Menu>
                    {!lg && (
                      <Menu.Item
                        key="profile"
                        disabled
                      >
                        <Space
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            lineHeight: 1,
                            textAlign: "left",
                            alignItems: "start",
                            justifyContent: "center",
                          }}
                          size={4}
                        >
                          <Text
                            strong
                            className={styles.userName}
                            ellipsis
                          >
                            {profileDetails && profileDetails.userName}
                          </Text>
                          <Text
                            type="secondary"
                            strong={false}
                            ellipsis
                          >
                            {getRole()}
                          </Text>
                        </Space>
                      </Menu.Item>
                    )}
                    <Menu.Item
                      key="change password"
                      onClick={() => navigate("/auth/change-password")}
                      disabled={user.role === "CLM_USER"}
                    >
                      Change Password
                    </Menu.Item>

                    <Menu.Item
                      key="logout"
                      onClick={() => logout()}
                    >
                      Logout
                    </Menu.Item>
                  </Menu>
                }
                trigger={["click"]}
              >
                <Space
                  size={"small"}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <Avatar
                    size={40}
                    src={`${profileDetails.userLogo}${imageKey}`}
                    // icon={< />}
                  />
                  {lg && (
                    <Space
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        lineHeight: 1,
                        textAlign: "left",
                        alignItems: "start",
                        justifyContent: "center",
                      }}
                      size={4}
                    >
                      <Text
                        style={{padding:"2px 0px"}}
                        strong
                        className={styles.userName}
                        ellipsis
                      >
                        {profileDetails && profileDetails.userName}
                        {/* {profileDetails.userName
                          ? profileDetails.userName
                          : user && user.email && user.email.split("@")[0]} */}
                      </Text>
                      <Text
                        type="secondary"
                        strong={false}
                        ellipsis
                      >
                        {getRole()}
                      </Text>
                    </Space>
                  )}
                  <Icon
                    icon="ep:arrow-down-bold"
                    height="20"
                    style={{ margin: "auto", color: styles.strawberry }}
                  />
                </Space>
              </Dropdown>
            </Typography.Link>
          </div>
        </Col>
      </Row>
    </Layout.Header>
  );
};
