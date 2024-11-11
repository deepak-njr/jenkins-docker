import { useEffect, useState } from "react";
import styled from "styled-components";
import { Form, Row, Col, DatePicker, Grid, Select } from "antd";
import { ButtonGroup } from "@components/index";
import { isEmpty } from "lodash";
import { Icon } from "@iconify/react";
import colorAlpha from "color-alpha";

import styles from "@styles/variables.module.scss";
import moment from "moment";

const StyledFormItem = styled(Form.Item)`
  margin-bottom: 0px !important;
  .ant-row {
    align-items: center;
  }
`;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

interface Props {
  selectedSubscription?: string;
  subscriptionList?: { subscriptionId: string; subscriptionName: string }[];
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setSelectedSubscription?: (value: string) => void;
  setTitle: (value: string) => void;
}

export const ActionArea = ({
  setSelectedSubscription,
  setStartDate,
  setEndDate,
  selectedSubscription,
  subscriptionList,
  setTitle,
}: Props) => {
  const { xs, lg } = useBreakpoint();
  const [activeTimeRange, setActiveTimeRange] = useState("");
  const [customTimeFrame, setCustomTimeFrame] = useState<any[]>();

  useEffect(() => {
    setActiveTimeRange("3 Months Forecast");
  }, []);

  useEffect(() => {
    if (activeTimeRange) {
      const month = Number(activeTimeRange.split(" ")[0]);
      setStartDate(moment().format("YYYY-MM-DD"));
      setEndDate(
        moment()
          .add(month - 1, "month")
          .format("YYYY-MM-DD")
      );
      setTitle(activeTimeRange);
    }
    if (customTimeFrame) {
      setStartDate(moment(customTimeFrame[0]).format("YYYY-MM-DD"));
      setEndDate(moment(customTimeFrame[1]).format("YYYY-MM-DD"));
      setTitle(
        `${moment(customTimeFrame[0]).format("DD MMM YY")} - ${moment(customTimeFrame[1]).format("DD MMM YY")} Forecast`
      );
    }
  }, [activeTimeRange, customTimeFrame]);

  return (
    <Row gutter={[16, 16]}>
      <Col
        xs={24}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Row
          gutter={[16, 16]}
          style={{ width: "100%" }}
        >
          <Col {...(xs && { span: 24 })}>
            <ButtonGroup
              buttonItems={["3 Months Forecast", "6 Months Forecast", "12 Months Forecast"]}
              defaultActive={activeTimeRange}
              disabled={customTimeFrame && !isEmpty(customTimeFrame)}
              onClick={(e) => setActiveTimeRange(e.currentTarget.textContent || "")}
            />
          </Col>
          <Col
            {...(xs && { span: 24 })}
            style={{ display: "inline-flex" }}
          >
            <Form
              layout="horizontal"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <StyledFormItem
                label="Choose custom forecast"
                style={{
                  marginBottom: 0,
                }}
              >
                <RangePicker
                  size="large"
                  onChange={(e) => setCustomTimeFrame(e as any)}
                  allowClear
                  disabledDate={(current) => current && current.valueOf() < Date.now()}
                  suffixIcon={
                    <Icon
                      icon="lucide:calendar-clock"
                      style={{ color: styles.strawberry, fontSize: 16 }}
                    />
                  }
                  clearIcon={
                    <Icon
                      icon="ooui:clear"
                      style={{
                        color: colorAlpha(styles.gray, 0.4),
                        fontSize: 18,
                      }}
                    />
                  }
                />
              </StyledFormItem>
            </Form>
          </Col>
          {subscriptionList && setSelectedSubscription && (
            <Col
              {...(xs && { span: 24 })}
              style={{ ...(lg && { marginLeft: "auto" }) }}
            >
              <Select
                showSearch
                placeholder="Subscriptions"
                defaultValue={[selectedSubscription]}
                style={{ width: 200 }}
                dropdownMatchSelectWidth={false}
                size="large"
                onChange={(e: any) => setSelectedSubscription(e)}
                placement="bottomRight"
              >
                {subscriptionList.map((item) => (
                  <Select.Option
                    value={item.subscriptionId}
                    key={item.subscriptionId}
                  >
                    {item.subscriptionName}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          )}
        </Row>
      </Col>
    </Row>
  );
};
