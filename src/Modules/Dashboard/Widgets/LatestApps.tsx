import { Col, Image, List, Row, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { SkeletonList, WrapperCard } from "@components/index";
import { useEffect, useState } from "react";

import { get } from "@services/api.service";
import { imageKey } from "@utils/Constants";
import moment from "moment";
import styles from "./Widgets.module.scss";

export const LatestApps = () => {
  const [data, setData] = useState<any>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    get("v1/dashboard/topapps/recent")
      .then((res: any) => {
        setData(res.response.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);
  return (
    <WrapperCard
      title={<Link to="/applications">Latest Applications</Link>}
      action={<Link to="/applications">View All</Link>}
    >
      {loading ? (
        <SkeletonList rows={5} />
      ) : (
        <List
          dataSource={data}
          renderItem={(item: any) => (
            <List.Item
              key={item.applicationID}
              onClick={() =>
                navigate(
                  `/applications/${item.applicationID}?activeTab=overview`
                )
              }
              style={{ cursor: "pointer" }}
            >
              <List.Item.Meta
                style={{ alignItems: "center" }}
                avatar={
                  <div style={{ width: 70 }}>
                    <Image
                      src={`${item.applicationLogo}${imageKey}`}
                      preview={false}
                      style={{ maxHeight: 40 }}
                    />
                  </div>
                }
                description={
                  <Row gutter={16} style={{ alignItems: "center" }}>
                    <Col span={4}>
                      <Typography.Text
                        style={{ color: styles.primary }}
                        ellipsis
                        strong
                      >
                        {item.applicationName}
                      </Typography.Text>
                    </Col>
                    <Col span={16}>
                      <Typography.Paragraph
                        style={{ margin: 0 }}
                        ellipsis={{ rows: 2 }}
                      >
                        {item.applicationShortDescription}
                      </Typography.Paragraph>
                    </Col>
                    <Col span={4} style={{ textAlign: "right" }}>
                      <Typography.Text type="success" ellipsis>
                        {item.applicationCreatedDate &&
                          moment(new Date(item.applicationCreatedDate)).format(
                            "DD MMM YYYY"
                          )}
                      </Typography.Text>
                    </Col>
                  </Row>
                }
              />
            </List.Item>
          )}
        />
      )}
    </WrapperCard>
  );
};
