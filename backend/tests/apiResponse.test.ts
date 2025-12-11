import fetch from "node-fetch";

const API_BASE = "http://localhost:3000/api";

async function measureResponseTime(url: string) {
  const start = Date.now();
  try {
    const res = await fetch(url);
    await res.json(); // parse JSON to fully wait for response
  } catch (err: any) {
    console.error(`Error fetching ${url}:`, err.message);
    return null;
  }
  return Date.now() - start;
}

async function testApiResponse() {
  console.log("API Response Time Test (multiple runs)\n");

  // Endpoints to test
  const endpoints = ["/books", "/books/books-with-copies", "/users/1"];

  // Run each endpoint 5 times
  for (const endpoint of endpoints) {
    const times: number[] = [];
    for (let i = 0; i < 5; i++) {
      const t = await measureResponseTime(`${API_BASE}${endpoint}`);
      if (t !== null) times.push(t);
    }

    if (times.length > 0) {
      const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
      const min = Math.min(...times);
      const max = Math.max(...times);
      console.log(`${endpoint}: avg=${avg} ms, min=${min} ms, max=${max} ms`);
    } else {
      console.log(`${endpoint}: all requests failed`);
    }
  }
}

testApiResponse();
