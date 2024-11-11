import React, { useContext, useEffect, useState } from "react";
import { post } from "@services/api.service";
import { DetailsMissing } from "./DetailsMissing";
import { ApplicationOnboardingContext } from "./Wrapper";
import { useNotification } from "@hooks/useNotification";
import { Image, Button, Col, Result, Row, Space, Spin, Typography } from "antd";
import styled from "styled-components";
import styles from "@styles/variables.module.scss";
import { isEmpty } from "lodash";
import { imageKey } from "~/Utils";
import { useNavigate } from "react-router-dom";
export const SimilarApps = () => {
  const { formData } = useContext(ApplicationOnboardingContext);
  const navigate = useNavigate();
  const [similarApps, setSimilarApps] = useState<
    {
      applicationLogo: string;
      applicationName: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openToast } = useNotification();
  const SimilarCard = styled.div`
    height: 100px;
    width: 100%;
    border: 1px solid hsla(188, 71%, 69%, 1);
    display: flex;
    align-items: center;
    border-radius: 4px;
    padding: 20px;
  `;
  useEffect(() => {
    setIsLoading(true);
    if (formData && formData.application && formData.application.application) {
      const payload = {
        categoryName: formData.application.application.applictionCategory
      };
      post(
        `v1/dashboard/similar-apps?category`,
        payload
      )
        .then((res: any) => {
          if (res.status === "OK") {
            if (res.response.data) {
              setSimilarApps(res.response.data);
            }
          }

          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          openToast({ content: err, type: "error" });
        });
    }
  }, [formData]);

  if (
    !formData ||
    !formData.application ||
    !formData.application.application ||
    !formData.application.contracts
  )
    return <DetailsMissing />;

  return (
    <>
      {/* <Row>
        <Col>
          <Typography.Text>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem
          </Typography.Text>
        </Col>
      </Row> */}
      {isLoading ? (
        <Row justify="center" style={{ marginTop: styles.whitespace5 }}>
          <Col>
            <Spin />
          </Col>
        </Row>
      ) : !isEmpty(similarApps) ? (
        <Row
          style={{ marginTop: styles.whitespace5, width: "100%" }}
          gutter={16}
        >
          {similarApps.map((app) => (
            <Col
              xs={24}
              md={8}
              style={{ marginBottom: styles.whitespace3 }}
              key={app.applicationName}
            >
              <SimilarCard>
                <Row gutter={20} align="middle">
                  <Col>
                    <Image
                      src={`${app.applicationLogo}${imageKey}`}
                      height={48}
                      width={48}
                      preview={false}
                    />
                  </Col>
                  <Col>
                    <Typography.Title level={5} style={{ margin: 0 }} ellipsis>
                      {app.applicationName}
                    </Typography.Title>
                  </Col>
                </Row>
              </SimilarCard>
            </Col>
          ))}
        </Row>
      ) : (
        <Result
          status="success"
          title="No similar application found"
          subTitle="There is no similar application found in your organization for this application category"
        />
      )}
      <Row style={{ marginTop: styles.whitespace6 }} justify="end">
        <Col>
          <Space direction="vertical" style={{ textAlign: "right" }}>
            <Space>
              <Button
                onClick={() =>
                  navigate("/applications/onboarding/supporting-docs")
                }
              >
                Back
              </Button>
              <Button
                onClick={() => navigate("/applications/onboarding/review")}
                type="primary"
              >
                Next
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>
    </>
  );
};
