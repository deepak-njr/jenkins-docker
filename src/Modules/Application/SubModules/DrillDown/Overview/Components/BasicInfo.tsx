import { WrapperCard } from "@components/index";
import { Icon } from "@iconify/react";
import { Badge, Button, Col, Row, Space, Typography } from "antd";

import styles from "@styles/variables.module.scss";
import { useState } from "react";
import { EditApplication } from "../../EditApplication";
import { useHasAccess } from "~/Hooks/useHasAccess";
import { permissions } from "~/Utils/Roles";

export const BasicInfo = ({
  category,
  department,
  owner,
  status,
  secondaryOwnerEmail,
  refreshData,
  appLink,
}: {
  category: string;
  department: string;
  owner: string;
  status: string;
  secondaryOwnerEmail?:string;
  refreshData: () => void;
  appLink: string;
}) => {
  const [openModal, setOpenModal] = useState(false);
  const { hasPermissions } = useHasAccess();
  return (
    <>
      <EditApplication
        openModal={openModal}
        refreshData={refreshData}
        setOpenModal={(value) => {
          setOpenModal(value);
        }}
      />
      <WrapperCard
        title="Application Details"
        {...(hasPermissions([permissions.EDIT_APPLICATION]) && {
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
          size={"large"}
        >
          <Row gutter={16}>
            <Col lg={6} md={8} xs={12}>
              <Typography.Text style={{ color: styles.primary }} strong>
                Category
              </Typography.Text>
            </Col>
            <Col lg={6} md={16} xs={12}>
              <Typography.Text>{category}</Typography.Text>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={8} xs={12}>
              <Typography.Text style={{ color: styles.primary }} strong>
                Owner's Email
              </Typography.Text>
            </Col>
            <Col lg={6} md={16} xs={12}>
              <Typography.Text>{owner}</Typography.Text>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={8} xs={12}>
              <Typography.Text style={{ color: styles.primary }} strong>
                Owner's Department
              </Typography.Text>
            </Col>
            <Col lg={6} md={16} xs={12}>
              <Typography.Text>{department}</Typography.Text>
            </Col>
          </Row>
          {secondaryOwnerEmail && <Row gutter={16}>
            <Col lg={6} md={8} xs={12}>
              <Typography.Text style={{ color: styles.primary }} strong>
                Secondary Contact's Email
              </Typography.Text>
            </Col>
            <Col lg={6} md={16} xs={12}>
              <Typography.Text>{secondaryOwnerEmail}</Typography.Text>
            </Col>
          </Row>}

          <Row gutter={16}>
            <Col lg={6} md={8} xs={12}>
              <Typography.Text style={{ color: styles.primary }} strong>
                Status
              </Typography.Text>
            </Col>
            <Col lg={6} md={16} xs={12}>
              <Typography.Text>
              <Space>
                <Badge color={status === "Active" ? "green" : "red"} />
                {status}
                </Space>
              </Typography.Text>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col lg={6} md={8} xs={12}>
              <Typography.Text style={{ color: styles.primary }} strong>
                Application Link
              </Typography.Text>
            </Col>
            <Col lg={6} md={16} xs={12}>
              <a href={appLink} target="_blank" rel="noreferrer">
                {appLink}
              </a>
            </Col>
          </Row>
        </Space>
      </WrapperCard>
    </>
  );
};
