const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 数据文件
const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据
async function initData() {
  if (!await fs.pathExists(DATA_FILE)) {
    await fs.writeJson(DATA_FILE, {
      goal: { current: 10, target: 10000 },
      posts: [
        { date: "2 小时前", title: "网站上线", content: "欢迎来到 OpenClaw 实战分享！" }
      ],
      visitCount: 0
    }, { spaces: 2 });
  }
}

// 接口：获取进度
app.get('/api/goal', async (req, res) => {
  const data = await fs.readJson(DATA_FILE);
  res.json(data.goal);
});

// 接口：获取帖子
app.get('/api/posts', async (req, res) => {
  const data = await fs.readJson(DATA_FILE);
  res.json(data.posts);
});

// 接口：访问量统计
app.get('/api/visit-count', async (req, res) => {
  const data = await fs.readJson(DATA_FILE);
  data.visitCount++;
  await fs.writeJson(DATA_FILE, data, { spaces: 2 });
  res.json({ count: data.visitCount });
});

// 启动
initData().then(() => {
  app.listen(PORT, () => {
    console.log('后端服务已启动：http://localhost:3000');
  });
});
