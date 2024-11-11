import React, { useEffect, useState } from "react";

import styles from "./index.module.scss";

import {
  Modal,
  Spin,
  Comment,
  Avatar,
  Space,
  Rate,
  Typography,
  Image,
} from "antd";
import Meta from "antd/lib/card/Meta";
import { get } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { map } from "lodash";

interface Props {
  isOpen: boolean;
  close: () => void;
  UUID: string;
  logo: string;
  name: string;
  category: string;
}

export const MarketplaceComment = ({
  isOpen,
  close,
  UUID,
  logo,
  name,
  category,
}: Props) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openToast } = useNotification();
  useEffect(() => {
    if (isOpen && UUID) {
      setIsLoading(true);
      get(`v1/marketplace/product/reviews?UUID=${UUID}`)
        .then((res: any) => {
          if (res.status === "OK") {
            setData(res.response.data);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          openToast({ content: err, type: "error" });
          setIsLoading(false);
        });
      return () => {
        setData([]);
        setIsLoading(false);
      };
    }
  }, [UUID, isOpen]);

  //   {
  //     "vendorId": "13a54d23-fc12-4531-8b46-53eb490fc0c5",
  //     "vendorName": "Salesforce Sales Cloud",
  //     "name": "Nitin M.",
  //     "designation": "Manager, Nielsen Connect Global Sales Operations",
  //     "companyDetails": "Enterprise(> 1000 emp.)",
  //     "rating": 5,
  //     "ratedOn": "Sep 08, 2022",
  //     "review": "\"Terrific solution for pipeline management\"",
  //     "uuid": "c1e3ae68-676e-489d-8c26-61fe6c236337"
  // },
  return (
    <Modal
      open={isOpen}
      onCancel={close}
      onOk={close}
      title={
        <Meta
          avatar={
            logo ? (
              <Image
                src={logo}
                preview={false}
                className={styles.ProductLogo}
              />
            ) : (
              <Avatar> {name && name?.slice(0, 2)}</Avatar>
            )
          }
          title={<Typography.Text ellipsis>{name}</Typography.Text>}
          description={
            <Typography.Text ellipsis disabled>
              {category}
            </Typography.Text>
          }
        />
      }
    >
      {isLoading ? (
        <span className={styles.Spinner}>
          <Spin />
        </span>
      ) : (
        <div style={{ maxHeight: window.innerHeight - 300, overflow: "auto" }}>
          {map(
            data,
            (d: any) =>
              d.name && (
                <Comment
                  key={d.uuid}
                  author={
                    <Space direction="vertical" size={0}>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {d.name}
                      </Typography.Title>
                      <Typography.Text strong>{d.designation}</Typography.Text>
                      <Typography.Text disabled style={{ fontSize: 12 }}>
                        {d.companyDetails}
                      </Typography.Text>
                    </Space>
                  }
                  avatar={<Avatar>{d.name.slice(0, 2)} </Avatar>}
                  content={
                    <Space direction="vertical" size={0}>
                      <Space>
                        <Rate value={d.rating} />
                        <Typography.Text disabled style={{ fontSize: 12 }}>
                          {d.ratedOn}
                        </Typography.Text>
                      </Space>

                      <Typography.Text>{d.review}</Typography.Text>
                    </Space>
                  }
                  datetime={<></>}
                />
              )
          )}
        </div>
      )}
    </Modal>
  );
};
