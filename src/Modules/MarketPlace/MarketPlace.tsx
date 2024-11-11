import {
  Card,
  Col,
  Result,
  Row,
  Space,
  Image,
  Typography,
  Avatar,
  Button,
  Spin,
  Modal,
  Input,
  Form,
  List,
  Layout,
  Grid,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { get, post } from "@services/api.service";
import { useNotification } from "~/Hooks/useNotification";
import { filter, isEmpty, keys, map, uniq } from "lodash";
import { ContentWrapper } from "~/Components";
import Meta from "antd/lib/card/Meta";
import { imageKey } from "@utils/Constants";

import styles from "./index.module.scss";
import { unitFormat } from "~/Utils";
import TextArea from "antd/lib/input/TextArea";
import { MarketplaceComment } from "./MarketplaceComment";
import { Icon } from "@iconify/react";
const { useBreakpoint } = Grid;

export const MarketPlace = () => {
  const [data, setData] = useState<{ [key in string]: any }>([]);
  const [filteredData, setFilteredData] = useState<{ [key in string]: any }>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openToast } = useNotification();
  const ref = useRef<HTMLDivElement>(null);
  const [wrapperWidth, setWrapperWidth] = useState(0);
  const [searchString, setSearchString] = useState("");
  const [activeElement, setActiveElement] = useState("All");
  const { md } = useBreakpoint();

  useEffect(() => {
    setIsLoading(true);
    get("v1/marketplace/products?range=0-100")
      .then((res: any) => {
        if (res.status === "OK") {
          setData(res.response.data);
          setFilteredData(res.response.data);
        }
        setTimeout(() => setIsLoading(false), 100);
      })
      .catch((err) => {
        openToast({
          content: err,
          type: "error",
        });
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (ref.current) {
      setWrapperWidth(ref.current.getBoundingClientRect().width);
    }
  }, [ref.current]);

  const onCategoryClick = (value: string) => {
    setIsLoading(true);
    const filtered = filter(data, (d: any) => d.subCategory === value);
    setActiveElement(value);
    if (value === "All") {
      setFilteredData(data);
      setIsLoading(false);
    } else {
      setFilteredData(filtered);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isEmpty(searchString)) {
      setIsLoading(true);
      setTimeout(() => {
        setFilteredData(
          filter(
            data,
            (d) => d && keys(d).some((key) => String(d[key]).toLowerCase().includes(searchString.toLowerCase()))
          )
        );
      }, 300);
      setIsLoading(false);
    } else {
      setFilteredData(data);
    }
  }, [searchString, data]);

  return (
    <ContentWrapper
      title="Market Place"
      loading={isLoading}
    >
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Input
            placeholder="Search"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className={styles.Search}
            suffix={
              searchString ? (
                <Icon
                  icon="humbleicons:times"
                  height="20"
                  onClick={() => {
                    setSearchString("");
                  }}
                  style={{
                    margin: "auto",
                    color: styles.strawberry,
                    cursor: "pointer",
                  }}
                />
              ) : (
                <Icon
                  icon="eva:search-outline"
                  height="20"
                  style={{ margin: "auto", color: styles.strawberry }}
                />
              )
            }
          />
        </Col>
      </Row>
      <Layout
        style={{ maxHeight: "100%", height: window.innerHeight - 270 }}
        className={styles.MarketPlaceLayout}
      >
        <Layout.Sider
          collapsed={!md}
          className={styles.CategorySider}
        >
          <div className={styles.Categories}>
            <Typography.Title level={4}>Categories</Typography.Title>
            <List.Item
              onClick={() => onCategoryClick("All")}
              className={activeElement === "All" ? styles.menuActive : styles.ListItem}
            >
              All
            </List.Item>
            <List
              dataSource={uniq(map(filteredData, (d: any) => d.subCategory))}
              renderItem={(item) => (
                <List.Item
                  key={item}
                  onClick={() => onCategoryClick(item)}
                  className={item === activeElement ? styles.menuActive : styles.ListItem}
                >
                  {item}
                </List.Item>
              )}
            />
          </div>
        </Layout.Sider>
        <Layout.Content
          style={{
            paddingInline: styles.whitespace2,
            height: "100%",
            overflowY: "auto",
          }}
        >
          <Row gutter={[16, 16]}>
            {!isEmpty(filteredData) ? (
              map(filteredData, (d: any, index: number) => (
                <ProductCardItem
                  {...d}
                  wrapperWidth={wrapperWidth}
                  key={index}
                />
              ))
            ) : (
              <Row justify="center">
                <Col>
                  <Result title="No items found" />
                </Col>
              </Row>
            )}
          </Row>
        </Layout.Content>
      </Layout>
    </ContentWrapper>
  );
};

const ProductCardItem = (item: {
  id: string;
  logo: string;
  uuid: string;
  title: string;
  subCategory: string;
  description: string;
  rating: {
    rating: string;
    ratedBy: string;
  };
  wrapperWidth: number;
}) => {
  const [show, setShow] = useState(false);
  const [selectedID, setSelectedID] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(true);
  const { openToast, openNotification } = useNotification();

  useEffect(() => {
    setTimeout(() => setLoading(false), 10);
  }, []);

  const submitForm = () => {
    if (requirment !== "") {
      const payload = {
        enquiryMessage: requirment,
        productId: item.uuid,
        productName: item.title,
      };
      setLoading(true);
      post(`v1/marketplace/email`, payload)
        .then((res: any) => {
          if (res && res.status === "OK") {
            openNotification({
              title: "Success",
              message: "Your enquiry request is submitted",
              type: "success",
            });
            setLoading(false);
            setShow(false);
          }
          form.resetFields();
        })
        .catch((err: any) => {
          openToast({ content: err, type: "error" });
          setLoading(false);
          setShow(false);
        });
    }
  };
  const [form] = Form.useForm();
  const requirment = Form.useWatch("requirment", form);

  const onCancel = () => {
    form.resetFields();
    setShow(false);
  };

  return (
    <Col
      xs={24}
      md={12}
      xl={8}
    >
      <Card
        size="default"
        className={styles.ProductCard}
        bodyStyle={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Meta
          avatar={
            item.logo ? (
              <Image
                src={`${item.logo}${imageKey}`}
                preview={false}
                className={styles.ProductLogo}
              />
            ) : (
              <Avatar> {item.title.slice(0, 2)}</Avatar>
            )
          }
          title={
            <Typography.Title
              level={5}
              style={{ whiteSpace: "normal", wordBreak: "break-word" }}
            >
              {item.title}
            </Typography.Title>
          }
          description={<Typography.Text>{item.subCategory}</Typography.Text>}
        />
        <div className={styles.Rating}>
          <Icon
            icon="material-symbols:star-rounded"
            className={styles.RatingIcon}
          />
          <Typography.Text>
            {Number(item.rating.rating.split(" ")[0])}
            <Typography.Text type="secondary">/5</Typography.Text>
          </Typography.Text>
          <Typography.Link
            type="secondary"
            onClick={() => {
              setSelectedID(item.uuid);
              setShowComments(true);
            }}
          >
            ({unitFormat(parseInt(item.rating.ratedBy, 10), "standard")} ratings)
          </Typography.Link>
        </div>

        <Space
          direction="vertical"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <Typography.Paragraph
            ellipsis={{
              rows: 7,
              suffix: ".",
            }}
            style={{
              height: "160px",
              marginBlock: 0,
              marginTop: styles.whitespace2,
            }}
          >
            {loading ? (
              <span className={styles.Spinner}>
                <Spin />
              </span>
            ) : (
              item.description
            )}
          </Typography.Paragraph>
          <Space style={{ whiteSpace: "nowrap", overflow: "hidden", width: "100%" }}>
            {/* <Rate disabled allowHalf defaultValue={} /> */}
          </Space>

          <Button
            type="primary"
            style={{ marginInline: "auto" }}
            block
            onClick={() => setShow(true)}
          >
            Enquire Now
          </Button>
        </Space>
      </Card>
      <MarketplaceComment
        logo={`${item.logo}${imageKey}`}
        name={item.title}
        category={item.subCategory}
        isOpen={showComments}
        close={() => setShowComments(false)}
        UUID={selectedID}
      />
      <Modal
        open={show}
        maskClosable={false}
        closable
        width={600}
        onCancel={() => onCancel()}
        confirmLoading={loading}
        onOk={submitForm}
        okButtonProps={{
          disabled:
            isEmpty(requirment) || (requirment && (requirment[0] === " " || requirment[requirment.length - 1] === " ")),
        }}
        okText={"Submit"}
        title="Breif your Requirement"
      >
        <Space
          direction="vertical"
          style={{ width: "100%" }}
        >
          <Meta
            avatar={
              item.logo ? (
                <Image
                  src={`${item.logo}${imageKey}`}
                  preview={false}
                  className={styles.ProductLogo}
                />
              ) : (
                <Avatar> {item.title.slice(0, 2)}</Avatar>
              )
            }
            title={<Typography.Text ellipsis>{item.title}</Typography.Text>}
            description={<Typography.Text ellipsis>{item.subCategory}</Typography.Text>}
          />

          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: styles.whitespace3 }}
          >
            <Form.Item
              name="requirment"
              label="Requirement"
              rules={[
                { required: true, message: "Please input your requirement" },
                // { min: 4, message: "Message must be at least 4 characters" },
                {
                  pattern: /^\S(.*\S)?$/,
                  message: "Requirement cannot include leading and trailing spaces",
                },
              ]}
              validateTrigger="onBlur"
            >
              <TextArea rows={5}></TextArea>
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </Col>
  );
};
