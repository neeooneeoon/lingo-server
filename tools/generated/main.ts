import * as dotenv from 'dotenv';

const result = dotenv.config({
  path: './.env',
});

if (result.error) {
  console.log(result.error);
} else {
  const envConfig = result.parsed;
  console.log(envConfig['DB_URL']);
}
