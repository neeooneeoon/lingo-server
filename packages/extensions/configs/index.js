import * as dotenv from 'dotenv';

const result = dotenv.config();

const get = (key) => {
  if (result.error) {
    throw result.error;
  }
  const envConfig = result.parsed;
  return envConfig[key];
};

const TIME_ZONE = 'Asia/Ho_Chi_Minh';

export { get, TIME_ZONE };
