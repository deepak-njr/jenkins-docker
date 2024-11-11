import * as React from 'react';
import { Component } from 'react';
import { Icon } from '@iconify/react';
import { Col, Row, Space, Typography } from 'antd';
import { WrapperCard, DataTable } from '~/Components';
import styles from '../onBoarding/BudgetsOnboarding.module.scss';
import { useNavigate } from 'react-router-dom';
import { FormikProps } from 'formik';
import { BudgetFormItems } from '~/Modules/MultiCloud/BudgetAndForecast/Budget/onBoarding/Wrapper';
import { map } from 'lodash';
import { currencyFormat } from '~/Utils';
import { multiCloudCurrencyCode } from '@utils/Constants';

const getItemText = (name: string, value: string) => {
    return (
        <Space direction="vertical" style={{ marginBottom: styles.whitespace4 }}>
            <Typography.Text type="secondary">{name}</Typography.Text>
            <Typography.Text>{value}</Typography.Text>
        </Space>
    );
};

export const ReviewBudget = ({
    values,
    setCurrentStep,
}: FormikProps<BudgetFormItems> & { setCurrentStep: React.Dispatch<React.SetStateAction<number>> }) => {
    const navigate = useNavigate();

    return (
        <Row style={{ marginBottom: styles.whitespace3 }}>
            <Col span={24}>
                <WrapperCard
                    title="Budget Details"
                    smallHeader
                    action={
                        <Icon
                            icon="carbon:edit"
                            style={{
                                color: styles.strawberry,
                                cursor: "pointer",
                                fontSize: 20,
                                verticalAlign: "middle",
                            }}
                            onClick={() =>
                                setCurrentStep(0)
                            }
                        />
                    }
                >
                    <Row>
                        <Col xs={24} md={8}>
                            {getItemText("Budget Scope", values.budgetScope)}
                        </Col>
                        <Col xs={24} md={8}>
                            {getItemText("Budget Name", values.budgetName)}
                        </Col>
                        <Col xs={24} md={8}>
                            {getItemText("Reset Period ", values.resetPeriod)}
                        </Col>
                        <Col xs={24} md={8}>
                            {getItemText("Creation Date", values.creationDate)}
                        </Col>
                        <Col xs={24} md={8}>
                            {getItemText("Expiration date", values.expirationDate)}
                        </Col>
                        <Col xs={24} md={8}>
                            {getItemText("Budget amount", values.budgetAmount)}
                        </Col>
                        <Col xs={24} md={8}>
                            {getItemText("Currency Code", multiCloudCurrencyCode)}
                        </Col>
                        <Col xs={24} md={8}>
                            {getItemText("Email Address", values.emailAddress)}
                        </Col>
                    </Row>
                </WrapperCard>
            </Col>
            <Col style={{ marginTop: styles.whitespace3 }}>
                <WrapperCard
                    title="Alert Details"
                    smallHeader
                    action={
                        <Icon
                            icon="carbon:edit"
                            style={{
                                color: styles.strawberry,
                                cursor: "pointer",
                                fontSize: 20,
                                verticalAlign: "middle",
                            }}
                            onClick={() =>
                                setCurrentStep(1)
                            }
                        />
                    }
                >
                    <Col style={{ marginBottom: styles.whitespace1 }}>
                        <DataTable
                            height={
                                values.alerts.length * 60 + 100 > 400
                                    ? 200
                                    : values.alerts.length * 60 + 100
                            }
                            multiSelect={false}
                            tableData={map(values.alerts, (license, i) => ({
                                ...license,
                                key: i,
                            }))}
                            columns={[
                                {
                                    key: "alertType",
                                    dataIndex: "alertType",
                                    title: "Alert Type",
                                },
                                {
                                    key: "threshold",
                                    dataIndex: "threshold",
                                    title: "Threshold",
                                },

                                {
                                    key: "amount",
                                    dataIndex: "amount",
                                    title: "Amount",
                                    render: (val: any) => {
                                        return `${currencyFormat(
                                            Number(val),
                                            false,
                                            multiCloudCurrencyCode,

                                        )}`;
                                    },
                                }
                            ]}
                            showTopBar={false}
                        />

                    </Col >
                    <Col xs={24} md={8}>
                        {getItemText("Recipient email", values.emailAddress)}
                    </Col>
                </WrapperCard >
            </Col >
        </Row >)
}

export default ReviewBudget;