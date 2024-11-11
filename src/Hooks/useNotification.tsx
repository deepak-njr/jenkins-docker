import { message, notification } from "antd";

type alertType = "success" | "info" | "warning" | "error";
interface MessageType {
  content: string;
  type: alertType | "loading";
}
export const useNotification = () => {
  const openToast = ({ content, type }: MessageType) =>
    message.open({ type, content });

  const openNotification = ({
    title,
    message,
    type,
  }: {
    title?: string;
    message: string;
    type: alertType;
  }) =>
    notification.open({
      message: title,
      description: message,
      type,
      placement: "topRight",
    });

  return { openToast, openNotification };
};
