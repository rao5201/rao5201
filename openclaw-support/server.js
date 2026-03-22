const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

// 初始化Express
const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
// 静态文件托管（前端页面）
app.use(express.static(path.join(__dirname, 'public')));

// 模拟数据文件路径
const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据文件
async function initData() {
    if (!await fs.exists(DATA_FILE)) {
        const initData = {
            goal: { current: 10, target: 10000 }, // 赞助目标
            posts: [ // 帖子列表
                {
                    type: 'public',
                    date: '2 小时前',
                    title: '新项目上线啦！🚀',
                    content: '大家好，我刚刚在 GitHub 上更新了新的代码库。这是一个关于网页解析的小工具，欢迎大家 Star 和 Fork！'
                },
                {
                    type: 'public',
                    date: '昨天',
                    title: '网站搭建完成 ❤️',
                    content: '我的个人主页终于上线了！虽然还在起步阶段，但我会继续努力产出更多高质量的内容。'
                }
            ],
            visitCount: 128, // 访问量
            adForms: [] // 广告表单提交记录
        };
        await fs.writeJSON(DATA_FILE, initData, { spaces: 2 });
    }
}

// 1. 获取赞助进度
app.get('/api/goal', async (req, res) => {
    try {
        const data = await fs.readJSON(DATA_FILE);
        res.json(data.goal);
    } catch (err) {
        res.status(500).json({ error: '获取进度失败' });
    }
});

// 2. 获取帖子列表
app.get('/api/posts', async (req, res) => {
    try {
        const data = await fs.readJSON(DATA_FILE);
        res.json(data.posts);
    } catch (err) {
        res.status(500).json({ error: '获取帖子失败' });
    }
});

// 3. 获取访问量（并自增）
app.get('/api/visit-count', async (req, res) => {
    try {
        const data = await fs.readJSON(DATA_FILE);
        data.visitCount += 1; // 访问量自增
        await fs.writeJSON(DATA_FILE, data, { spaces: 2 });
        res.json({ count: data.visitCount });
    } catch (err) {
        res.status(500).json({ error: '获取访问量失败' });
    }
});

// 4. 提交广告表单
app.post('/api/ad-form', async (req, res) => {
    try {
        const { name, phone, slot, desc } = req.body;
        // 简单验证
        if (!name || !phone || !slot) {
            return res.json({ success: false, message: '必填字段不能为空' });
        }
        // 读取数据
        const data = await fs.readJSON(DATA_FILE);
        // 保存表单数据
        data.adForms.push({
            id: Date.now(),
            name,
            phone,
            slot,
            desc,
            createTime: new Date().toLocaleString()
        });
        // 写入文件
        await fs.writeJSON(DATA_FILE, data, { spaces: 2 });
        res.json({ success: true, message: '提交成功' });
    } catch (err) {
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

// 5. 赞助金额更新（模拟支付回调）
app.post('/api/donate', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.json({ success: false, message: '金额无效' });
        }
        const data = await fs.readJSON(DATA_FILE);
        data.goal.current += Number(amount);
        await fs.writeJSON(DATA_FILE, data, { spaces: 2 });
        res.json({ success: true, current: data.goal.current });
    } catch (err) {
        res.status(500).json({ success: false, message: '更新金额失败' });
    }
});

// 启动服务器
initData().then(() => {
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
        console.log('前端页面访问：http://localhost:3000');
    });
}).catch(err => {
    console.error('初始化数据失败:', err);
});