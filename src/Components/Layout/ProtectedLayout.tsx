import { Navigate, useLocation, useOutlet } from "react-router-dom";
import { Layout, Space, Grid } from "antd";

import { useAuth } from "@hooks/useAuth";
import { ErrorBoundary, Header, Navbar } from "@components/index";

import styles from "./Layout.module.scss";
import { useEffect, useState } from "react";
const { useBreakpoint } = Grid;
const { Content, Sider } = Layout;
export const ProtectedLayout = () => {
  const { user } = useAuth();
  const outlet = useOutlet();
  const location = useLocation();
  const { md, lg, sm } = useBreakpoint();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(window.innerHeight - 109);

    window.addEventListener("resize", () => {
      setHeight(window.innerHeight - 109);
    });
  }, []);

  if (!user || !user.token) {
    return <Navigate to="/auth/login" replace state={{ location }} />;
  }

  const collapsed = !(md && lg);

  return (
    <Layout>
      <Space direction="vertical" size="middle">
        <Header />
        <Layout>
          <Sider
            style={{
              height,
            }}
            className={styles.sider}
            collapsed={collapsed}
          >
            <Navbar collapsed={collapsed} />
          </Sider>
          <ErrorBoundary>
            <Content
              style={{
                overflowY: "auto",
                overflowX: "hidden",
                height,
                width: "100%",
                paddingInline: styles.whitespace2,
              }}
            >
              {outlet}
            </Content>
          </ErrorBoundary>
        </Layout>
      </Space>
    </Layout>
  );
};
