import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const CALCULATOR_REST_API_V1_URL = process.env.CALCULATOR_REST_API_V1_URL;

if (!CALCULATOR_REST_API_V1_URL) {
  console.error('Error: CALCULATOR_REST_API_V1_URL environment variable is required');
  process.exit(1);
}

app.use('/api', createProxyMiddleware({
  target: CALCULATOR_REST_API_V1_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
}));

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API requests proxied to ${CALCULATOR_REST_API_V1_URL}`);
});
