import { ContentWrapper } from "~/Components";
import { Badge, Button, Space, Col, Row, Typography, Select } from "antd";
import { strings } from "@utils/Strings";
import { keys, filter, isEmpty } from "lodash";
import { currencyData } from "~/Utils/CurrencyCodes";
import styles from "./index.module.scss";
import { updateCurrency } from "@utils/getLocalStorage";
import { apiBaseUrl, post, get } from "@services/api.service";
import { useNotification } from "@hooks/useNotification";
import { useState, useEffect } from "react";
import { getTimeDifference } from "@utils/CommonUtils";
import { currency as currencyList } from "@utils/StringConstants"
import { currencyOptions } from "@utils/CurrenyOptions"
import { CustomButton } from "@components/index";



export const PreferencesList = () => {
  const [data, setData] = useState<any>(null);
  const [currencyValue, setCurrencyValue] = useState<any>([]);
  const [disabled, setDisabled] = useState(true);
  const [currency, setCurrency] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { openToast, openNotification } = useNotification();
  const { Text } = Typography;

  const getCurrencyValue = () => {
    get(`v1/currency/admin/preference`)
      .then((res: any) => {
        setData(res.response.data);
        setCurrency(res.response.data.adminCurrency)
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (isEmpty(data)) {
      getCurrencyValue();
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(data)) {
      if (getTimeDifference(data.updatedTime, Date.now(), "minutes") < 30) {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    }
  }, [data]);

  const postCurrencyValue = () => {
    post("v1/currency/update", { currency: currency })
      .then((res: any) => {

        setCurrencyValue(res.response.data);
        get(`${apiBaseUrl}/userprofile/access`)
          .then((res: any) => {
            const { currency } = res.response.data;
            if (currency) {
              updateCurrency(currency)
              getCurrencyValue()
            }
            if (res && res.response.data) {
              setData(data.response.data.currency);
            }
          })
        openNotification({
          title: "success!!",
          message: "Currency updated successfully",
          type: "success",
        });
      }
      )
      .catch((err) => {
        setIsLoading(false);
        // openToast({ content: err, type: "error" });

      });
  };
  return (
    <ContentWrapper title="Preferences">
      <Row>
        <Col span={24}>
          <Typography.Title level={4}>Preferred Currency </Typography.Title>
        </Col>
      </Row>
      <Row>
        <Col>
          <Typography.Title type="secondary" level={5}>
            Choose Currency
          </Typography.Title>
        </Col>
      </Row>
      <Row>
        <Col >
          <Space>
            <Select
              showSearch
              disabled={disabled}
              size="large"
              value={currency}
              className={styles.unitWidth}
              onChange={(value) => setCurrency(value)}
            >
              {currencyOptions(currencyData, currencyList)}
            </Select>
          </Space>
          </Col>
         <Col style={{paddingLeft: "10px"}}>
          <Space>
            <CustomButton 
              loading={isLoading}
              type="primary"
              disabled={disabled}
              onClick={() => postCurrencyValue()}
              value="Save"
            />
          </Space>
        </Col>
      </Row >
      <Row>
        <Col style={{ marginTop: "15px" }}>
          <h1>{strings.note}</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Space>
            <Badge color="#312D76" />
            <Text>{strings.note1}</Text>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col style={{ margin: "8px 0px" }}>
          <Space>
            <Badge color="#312D76" />
            <Text>
              {strings.note2}{" "}
              <span style={{ fontWeight: "bold" }}> {strings.noteTime} </span>{" "}
              {strings.note3}
            </Text>
          </Space>
        </Col>
      </Row>
    </ContentWrapper >
  );
};
