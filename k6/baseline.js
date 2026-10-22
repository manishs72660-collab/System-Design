import http from 'k6/http';
import { check } from 'k6';

const BASE = 'http://localhost:3000';

const brands = ['Nike', 'Adidas', 'Puma', 'Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo', 'Boat'];
const words = ['shoes', 'phone', 'shirt', 'laptop', 'watch', 'headphones', 'bag', 'jeans', 'zzzxyz', 'Wildcraft Speaker'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const r = Math.random();
  let res;

  if (r < 0.3) {
    res = http.get(`${BASE}/products?page=${1 + Math.floor(Math.random() * 100)}&limit=20`, { tags: { name: 'list' } });
  } else if (r < 0.6) {
    res = http.get(
      `${BASE}/products?category=${1 + Math.floor(Math.random() * 30)}&brand=${pick(brands)}&minPrice=500&maxPrice=20000&sort=price&limit=20`,
      { tags: { name: 'filter' } }
    );
  } else if (r < 0.8) {
    res = http.get(`${BASE}/products/search?q=${encodeURIComponent(pick(words))}&limit=20`, { tags: { name: 'search' } });
  } else {
    res = http.get(`${BASE}/products/${1 + Math.floor(Math.random() * 1000000)}`, { tags: { name: 'by_id' } });
  }

  check(res, { 'status 200': (r) => r.status === 200 });
}