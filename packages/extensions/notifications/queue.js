import Queue from 'bull';
import { get } from '../configs/index.js';

const config = {
  redis: {
    host: get('REDIS_HOST'),
    port: Number(get('REDIS_PORT')) ? Number(get('REDIS_PORT')) : 6379,
  },
};

const notificationQueue = new Queue('notification', config);
export { notificationQueue };