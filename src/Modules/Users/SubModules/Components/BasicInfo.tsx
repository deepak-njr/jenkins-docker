import { WrapperCard } from "@components/index";
import { Icon } from "@iconify/react";
import { Button, Col, Row, Space, Typography } from "antd";

import styles from "@styles/variables.module.scss";
import moment from "moment";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { permissions } from "~/Utils/Roles";
import { useState } from "react";
import { EditUser } from "./EditUser";

export const BasicInfo = ({
  department,
  designation,
  type,
  fetchUser,
  reportingto,
  onboardedDate,
}: {
  department: string;
  designation: string;
  type: string;
  reportingto: string;
  onboardedDate: string;
  fetchUser: () => void;
}) => {
  const { hasPermissions } = useHasAccess();
  const [openModal, setOpenModal] = useState(false);

  return (
    <WrapperCard
      title="User Details"
      {...(hasPermissions([permissions.EDIT_USER]) && {
        action: (
          <Button
            type="link"
            style={{ color: styles.strawberry, fontSize: "1.1rem" }}
          >
            <Icon icon="carbon:edit" onClick={() => setOpenModal(true)} />
          </Button>
        ),
      })}
    >
      <Space
        style={{ display: "flex", width: "100%" }}
        direction="vertical"
        size={"middle"}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text style={{ color: styles.primary }} strong>
              Department
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{department}</Typography.Text>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text style={{ color: styles.primary }} strong>
              Designation
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{designation}</Typography.Text>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text style={{ color: styles.primary }} strong>
              Employee Type
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{type}</Typography.Text>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text style={{ color: styles.primary }} strong>
              Reporting Manager
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>{reportingto}</Typography.Text>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Text style={{ color: styles.primary }} strong>
              Onboarded Date
            </Typography.Text>
          </Col>
          <Col span={12}>
            <Typography.Text>
              {moment(onboardedDate).format("DD MMM YYYY")}
            </Typography.Text>
          </Col>
        </Row>
      </Space>
      <EditUser
        openModal={openModal}
        fetchUser={fetchUser}
        setOpenModal={(value:any) => {
          setOpenModal(value);
        }}
      />
    </WrapperCard>
  );
};
