const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 飞书API配置（从环境变量获取，确保安全）
const FEISHU_CONFIG = {
  APP_ID: process.env.FEISHU_APP_ID || 'your_app_id_here',
  APP_SECRET: process.env.FEISHU_APP_SECRET || 'your_app_secret_here',
  APP_TOKEN: process.env.FEISHU_APP_TOKEN || 'your_app_token_here',
  TABLE_ID: process.env.FEISHU_TABLE_ID || 'your_table_id_here',
  BASE_URL: 'https://open.feishu.cn/open-apis/bitable/v1'
};

// 缓存access token
let cachedAccessToken = null;
let tokenExpireTime = 0;

// 中间件
app.use(cors());
app.use(express.json());

// 获取飞书access token
async function getFeishuAccessToken() {
  const now = Date.now();
  
  // 如果token还有效，直接返回缓存的token
  if (cachedAccessToken && now < tokenExpireTime) {
    return cachedAccessToken;
  }
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      app_id: FEISHU_CONFIG.APP_ID,
      app_secret: FEISHU_CONFIG.APP_SECRET
    });
    
    const options = {
      hostname: 'open.feishu.cn',
      port: 443,
      path: '/open-apis/auth/v3/tenant_access_token/internal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.code === 0) {
            cachedAccessToken = response.tenant_access_token;
            tokenExpireTime = now + (response.expire - 300) * 1000; // 提前5分钟过期
            resolve(cachedAccessToken);
          } else {
            reject(new Error(`Failed to get access token: ${response.msg}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// 飞书API代理接口 - 获取点赞数据
app.get('/api/feishu/likes', async (req, res) => {
  try {
    const accessToken = await getFeishuAccessToken();
    
    const options = {
      hostname: 'open.feishu.cn',
      port: 443,
      path: `/open-apis/bitable/v1/apps/${FEISHU_CONFIG.APP_TOKEN}/tables/${FEISHU_CONFIG.TABLE_ID}/records`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const request = https.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.code === 0 && result.data.items.length > 0) {
            const likeCount = result.data.items[0].fields['点赞计数'] || 104;
            res.json({ count: likeCount, hasLiked: false });
          } else {
            res.json({ count: 104, hasLiked: false });
          }
        } catch (error) {
          console.error('Parse error:', error);
          res.status(500).json({ error: 'Failed to parse response' });
        }
      });
    });
    
    request.on('error', (error) => {
      console.error('Request error:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    });
    
    request.end();
  } catch (error) {
    console.error('Access token error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// 飞书API代理接口 - 更新点赞数据
app.post('/api/feishu/like', async (req, res) => {
  try {
    const accessToken = await getFeishuAccessToken();
    
    // 先获取当前记录
    const getOptions = {
      hostname: 'open.feishu.cn',
      port: 443,
      path: `/open-apis/bitable/v1/apps/${FEISHU_CONFIG.APP_TOKEN}/tables/${FEISHU_CONFIG.TABLE_ID}/records`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    const getRequest = https.request(getOptions, (getResponse) => {
      let getData = '';
      
      getResponse.on('data', (chunk) => {
        getData += chunk;
      });
      
      getResponse.on('end', () => {
        try {
          console.log('Feishu API response:', getData);
          const getResult = JSON.parse(getData);
          console.log('Parsed result:', getResult);
          if (getResult.code === 0 && getResult.data.items.length > 0) {
            const currentCount = parseInt(getResult.data.items[0].fields['点赞计数']) || 104;
            const recordId = getResult.data.items[0].record_id;
            const newCount = currentCount + 1;
            console.log('Current count:', currentCount, 'New count:', newCount, 'Type:', typeof newCount);
            
            // 更新记录
            const updateData = JSON.stringify({
              fields: {
                '点赞计数': newCount
              }
            });
            
            const updateOptions = {
              hostname: 'open.feishu.cn',
              port: 443,
              path: `/open-apis/bitable/v1/apps/${FEISHU_CONFIG.APP_TOKEN}/tables/${FEISHU_CONFIG.TABLE_ID}/records/${recordId}`,
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(updateData)
              }
            };
            
            console.log('Update options:', updateOptions);
            console.log('Update data:', updateData);
            
            const updateRequest = https.request(updateOptions, (updateResponse) => {
              let updateResponseData = '';
              
              updateResponse.on('data', (chunk) => {
                updateResponseData += chunk;
              });
              
              updateResponse.on('end', () => {
                console.log('Update response:', updateResponseData);
                try {
                  const updateResult = JSON.parse(updateResponseData);
                  console.log('Update result:', updateResult);
                  if (updateResult.code === 0) {
                    res.json({ count: newCount, hasLiked: true });
                  } else {
                    console.error('Update failed with code:', updateResult.code, 'message:', updateResult.msg);
                    res.status(500).json({ error: 'Failed to update like count' });
                  }
                } catch (error) {
                  console.error('Update parse error:', error);
                  res.status(500).json({ error: 'Failed to parse update response' });
                }
              });
            });
            
            updateRequest.on('error', (error) => {
              console.error('Update request error:', error);
              res.status(500).json({ error: 'Failed to update data' });
            });
            
            updateRequest.write(updateData);
            updateRequest.end();
          } else {
            res.status(500).json({ error: 'No records found' });
          }
        } catch (error) {
          console.error('Get parse error:', error);
          res.status(500).json({ error: 'Failed to parse get response' });
        }
      });
    });
    
    getRequest.on('error', (error) => {
      console.error('Get request error:', error);
      res.status(500).json({ error: 'Failed to fetch current data' });
    });
    
    getRequest.end();
  } catch (error) {
    console.error('Access token error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});