
import { Col, Row } from "antd";
import React, { useEffect, useState } from "react";

interface Props {
    id: any;
    data: any;
    recipients: any;
    documents: any;
    refreshData?: (value: React.Key[]) => void;
}

export const OverView = ({ data, recipients, documents }: Props) => {
    return (
        <Row gutter={16}>
            <Col span={24}>
                DrillDown
            </Col>
        </Row>
    );
};
