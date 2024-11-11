import { Button, Col, Modal, Row, Typography, Collapse, Result } from "antd";
import { Component, ErrorInfo, ReactNode } from "react";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: null, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      ...this.state,
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Modal
          open={true}
          closable={false}
          footer={null}
          centered
          width={800}
        >
          <Row justify="center" style={{ marginBottom: 16 }}>
            <Col style={{ textAlign: "center" }}>
              <Title>Something went wrong!</Title>
              <Text>Don't worry it's not you - it's us. Sorry about that</Text>
            </Col>
          </Row>
          {["localhost", "dev-app.saaspe.com"].includes(
            window.location.hostname
          ) && (
            <Row style={{ marginBottom: 16 }}>
              <Col span={24}>
                <Collapse>
                  <Panel header={this.state.error?.message} key="1">
                    <code>
                      <pre>
                        <Title level={4}>Error Stack</Title>
                        {this.state.error?.stack}
                        <br />
                        <br />
                        <br />
                        <Title level={4}>Error Info</Title>
                        {JSON.stringify(this.state.errorInfo, undefined, 2)}
                      </pre>
                    </code>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
          )}

          <Row justify="center">
            <Col>
              <Button
                type="primary"
                onClick={() => {
                  window.location.replace(window.location.origin);
                }}
              >
                Go Home
              </Button>
            </Col>
          </Row>
        </Modal>
      );
    }

    return this.props.children;
  }
}
