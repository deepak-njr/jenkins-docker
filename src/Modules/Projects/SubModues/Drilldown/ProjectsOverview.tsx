import { AppAvgSpend, BasicInfo } from "./Components";
import { Col, Row, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ContentWrapper } from "@components/index";
import { Icon } from "@iconify/react";
import { ProjectAppplications } from "./Components/ProjectApplications";
import { get } from "@services/api.service";
import styles from "../../Projects.module.scss";
import { useNotification } from "@hooks/useNotification";

export const ProjectOverview = () => {
  const { id } = useParams();
  const [data, setData] = useState<{ [key in string]: any }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { openToast } = useNotification();

  const fetchUser = () => {
    setIsLoading(true);
    get(`v1/project/detailview?projectId=${id}`)
      .then((res: any) => {
        setData(res.response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        openToast({ content: err, type: "error" });
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  return (
    <ContentWrapper
      loading={isLoading}
      customTitle={
        <Space style={{ alignItems: "center", lineHeight: 1 }}>
          <Icon
            onClick={() => navigate(-1)}
            icon="akar-icons:arrow-left"
            style={{
              fontSize: "1.8rem",
              cursor: "pointer",
              color: styles.primary,
              marginRight: styles.whitespace1,
            }}
          />
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            {data.projectName}
          </Typography.Title>{" "}
        </Space>
      }
    >
      <Row gutter={16}>
        <Col xs={24} md={12} style={{ marginBottom: styles.whitespace2 }}>
          <BasicInfo
            projectCode={data.projectCode}
            department={data.projectDepartmentName}
            projectManager={data.projectManagerEmail}
            applicationsCount={data.applicationCount}
            startDate={data.projectStartDate}
            endDate={data.projectEndDate}
            fetchUser={fetchUser}
          />
        </Col>
        <Col
          xs={24}
          md={12}
          style={{
            display: "inline-flex",
            flexDirection: "column",
            marginBottom: styles.whitespace2,
          }}
        >
          <AppAvgSpend />
        </Col>
        <Col span={24} style={{ marginBottom: styles.whitespace2 }}>
          <ProjectAppplications data={data} fetchUser={fetchUser} />
        </Col>
        {/* <Col span={24}>
          <SpendComparison />
        </Col> */}
      </Row>
    </ContentWrapper>
  );
};
