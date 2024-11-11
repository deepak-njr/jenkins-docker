import React, { useState, useEffect, ReactNode } from "react";
import { Modal, Button, Row, Col, Image, Typography } from "antd";
import { inaAcitvityTimeout, logoutTimout } from "./Constants";
import { strings } from "./Strings";
import { useNavigate } from "react-router-dom";
import Session from "@assets/SVG/session.svg";
import { useLocation } from "react-router-dom";
import { useIdleTimer, workerTimers } from "react-idle-timer";
import { silentRefresh } from "@services/api.service";

const { Text } = Typography;

interface State {
  lastActive: number | null;
  timeout: number | null;
  logout: number | null;
}
interface Props {
  children: ReactNode;
}
const timeout = Number(logoutTimout) * 60000;
const promptBeforeIdle = Number(inaAcitvityTimeout) * 60000;

export const InactivityDetector = ({ children }: Props) => {
  const [state, setState] = useState("Active");
  const [remaining, setRemaining] = useState(timeout);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("lastActive");
    localStorage.removeItem("user");
    navigate("/auth/login", {
      state: {
        sessionExpired: true,
      },
    });
    window.location.reload();
  };

  const onIdle = () => {
    setState("Idle");
    setOpen(false);
    logout();
  };

  const onActive = () => {
    setState("Active");
    setOpen(false);
  };

  const onPrompt = () => {
    setState("Prompted");
    setOpen(true);
  };

  const { getRemainingTime, activate } = useIdleTimer({
    crossTab: true,
    onIdle,
    onActive,
    onPrompt,
    timeout,
    promptBeforeIdle,
    throttle: 500,
  });

  useEffect(() => {
    if (remaining === 0) {
      logout();
    }
  }, [remaining]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000));
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  const onActivity = () => {
    activate();
    silentRefresh();
  };

  return (
    <>
      {children}
      <Modal
        open={open}
        closable={false}
        maskClosable={false}
        footer={null}
        centered
        width={500}
      >
        <Row justify="center">
          <Col>
            <Image
              src={Session}
              preview={false}
            />
          </Col>
        </Row>
        <Row
          justify="center"
          style={{ margin: 16 }}
        >
          <Col style={{ textAlign: "center" }}>
            <h3 style={{ fontWeight: "bold", paddingBottom: 15 }}>{strings.sessionExpire}</h3>
            <Text>
              {strings.sessionInactive}{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                {" "}
                {Math.floor(remaining / 60)} : {remaining % 60}{" "}
              </span>{" "}
              {strings.sessionMinutes}
            </Text>
          </Col>
        </Row>
        <Row
          justify="center"
          style={{ margin: 20 }}
        >
          <Col span={6}>
            <Button onClick={() => logout()}>{strings.sessionSignOut}</Button>
          </Col>
          <Col span={8}>
            <Button
              type="primary"
              onClick={() => onActivity()}
            >
              {strings.sessionSignIn}
            </Button>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
