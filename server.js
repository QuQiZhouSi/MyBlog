const express = require('express');
const fs = require('fs');
const markdownIt = require('markdown-it');
const path = require('path');
const app = express();
const PORT = 3000;

// ?建 markdown-it ?例,用于解析 Markdown ?容
const md = new markdownIt({
    html: true,
    breaks: true,
    linkify: true
});

// ?置 EJS 作?模板引擎
app.set('view engine', 'ejs');

// 根路由,渲染首?
app.get('/', (req, res) => {
    res.render('index', { title: 'My Blog' });
});

// ?于?面
app.get('/about', (req, res) => {
    res.send('This is the About page');
});

// 博客?面
app.get('/blog', (req, res) => {
    res.send('Welcome to the Blog page');
});

// 文章?面:根据?入的文件名?取并渲染 Markdown 文件
app.get('/post/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'posts', `${fileName}.md`);  // 使用正确的 __dirname
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(404).send('Post not found');
        }
        
        // 渲染 Markdown ?容? HTML
        let renderedContent = md.render(data);

        // ??渲染后的?容? EJS 模板
        res.render('post', { content: renderedContent });
    });
});

// ??服?器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
