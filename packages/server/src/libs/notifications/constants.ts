import { messaging } from 'firebase-admin/lib/messaging';

export const DAILY_MESSAGE: messaging.MessagingPayload = {
  notification: {
    title: '⏰ Nhắc nhở hằng ngày.',
    body: 'Bạn chỉ cần dành ra 10 phút mỗi ngày để nâng cao kỹ năng Tiếng Anh. Bắt đầu thôi!',
  },
};

export const LEARNING_VOCABULARY_MESSAGE: messaging.MessagingPayload = {
  notification: {
    title: '💡 LINGO MÁCH BẠN',
    body: 'Có thể bạn chưa biết, buổi sáng là thời điểm tốt nhất để ghi nhớ từ vựng. Học ngay thôi!',
  },
};

export const UPDATE_SYSTEM_MESSAGE: messaging.MessagingPayload = {
  notification: {
    title: '⚙️ Cập nhật hệ thống',
    body: 'Hiện tại ứng dụng đang trong thời gian bảo trì. Xin cảm ơn!',
  },
};

export const MAX_DEVICE_MULTICAST = 1000;
