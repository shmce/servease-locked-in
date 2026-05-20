import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: Number(__ENV.MOBILE_K6_VUS ?? '1'),
  duration: __ENV.MOBILE_K6_DURATION ?? '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<750'],
  },
};

const baseUrl = (__ENV.MOBILE_K6_BASE_URL ?? 'http://localhost:5001').replace(
  /\/$/,
  '',
);

export default function mobileGatewaySmoke() {
  const response = http.get(`${baseUrl}/v1/health`);

  check(response, {
    'gateway health is reachable': (res) => res.status >= 200 && res.status < 500,
  });
}
