import express from 'express';
import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeRaw from 'rehype-raw';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 解析当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// 设置 EJS 作为模板引擎
app.set('view engine', 'ejs');

// 设置静态文件目录,例如用于加载 CSS 和 JS 文件
app.use(express.static(path.join(__dirname, 'public')));

// 首页路由
app.get('/', (req, res) => {
    res.render('index', { title: '我的博客' });
});

// 博客页面路由
app.get('/blog', (req, res) => {
    res.send('歡迎來到博客頁面');
});

// 读取并渲染 Markdown 文件
app.get('/post/:filename', async (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'posts', `${fileName}.md`);

    // 确保使用 utf-8 编码读取文件
    fs.readFile(filePath, 'utf-8', async (err, data) => {
        if (err) {
            console.error('读取文件时出错:', err);
            return res.status(404).send('找不到文章');
        }

        try {
            // 使用 unified 解析并渲染 Markdown
            const result = await unified()
                .use(remarkParse)  // 解析 Markdown
                .use(remarkGfm)  // 支持 GitHub 风格 Markdown
                .use(remarkMath)  // 支持数学公式
                .use(remarkRehype, { allowDangerousHtml: true })  // 转换为 HTML
                .use(rehypeRaw)  // 支持内嵌 HTML
                .use(rehypeKatex)  // 渲染数学公式
                .use(rehypePrism)  // 代码高亮
                .use(rehypeSlug)  // 给标题添加 ID
                .use(rehypeAutolinkHeadings, { behavior: 'wrap' })  // 给标题添加超链接
                .use(rehypeSanitize)  // 安全过滤
                .use(rehypeStringify)  // 输出 HTML
                .process(data);

            // 渲染 HTML 到模板
            res.render('post', { content: result.contents });
        } catch (err) {
            console.error('处理 Markdown 文件时出错:', err);
            res.status(500).send('处理 Markdown 文件时出错');
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器正在 http://localhost:${PORT} 运行`);
});
