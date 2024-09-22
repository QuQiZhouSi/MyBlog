// app.js

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypePrism from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';
import matter from 'gray-matter';
import { visit } from 'unist-util-visit';

// 导入自定义插件
import rehypePluginLineNumbers from './rehype-plugin-line-numbers.js';

import { refractor } from 'refractor';
// 导入常见语言
import cpp from 'refractor/lang/cpp.js';
import python from 'refractor/lang/python.js';
import javascript from 'refractor/lang/javascript.js';
import java from 'refractor/lang/java.js';
import html from 'refractor/lang/markup.js';
import css from 'refractor/lang/css.js';
import json from 'refractor/lang/json.js';
import bash from 'refractor/lang/bash.js';
import php from 'refractor/lang/php.js';
import ruby from 'refractor/lang/ruby.js';
import sql from 'refractor/lang/sql.js';
import yaml from 'refractor/lang/yaml.js';
import markdown from 'refractor/lang/markdown.js';
import typescript from 'refractor/lang/typescript.js';
import markup from 'refractor/lang/markup.js';

// 注册 markup 语言
refractor.register(markup);
// 注册这些语言
refractor.register(cpp);
refractor.register(python);
refractor.register(javascript);
refractor.register(java);
refractor.register(html);
refractor.register(css);
refractor.register(json);
refractor.register(bash);
refractor.register(php);
refractor.register(ruby);
refractor.register(sql);
refractor.register(yaml);
refractor.register(markdown);
refractor.register(typescript);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 配置 Multer 用于文件上传
const upload = multer({ dest: 'uploads/' });

// 设置 EJS 视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 静态文件服务
app.use(express.static('public'));

// 解析 POST 请求中的表单数据
app.use(express.urlencoded({ extended: false }));

// 检查并创建 uploads 和 posts 文件夹
const uploadsDir = path.join(__dirname, 'uploads');
const postsDir = path.join(__dirname, 'posts');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir);
}

// 上传页面
app.get('/upload', (req, res) => {
  res.render('upload');
});

// 上传 Markdown 博客的路由
app.post('/upload', upload.single('markdownFile'), (req, res) => {
  const { originalname, filename } = req.file;
  const filePath = path.join(uploadsDir, filename);
  const newFilePath = path.join(postsDir, originalname);

  // 移动文件到 posts 文件夹
  fs.renameSync(filePath, newFilePath);
  res.redirect('/');
});

// 查看单个博客
app.get('/post/:title', (req, res) => {
  const postTitle = req.params.title;
  const decodedTitle = decodeURIComponent(postTitle);
  const filePath = path.join(postsDir, `${decodedTitle}.md`);

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('读取文章失败:', err);
      return res.status(404).send('文章未找到');
    }

    const { content, data: frontmatter } = matter(data);

    let headings = [];

    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      // 收集标题信息
      .use(() => (tree) => {
        visit(tree, 'heading', (node) => {
          const text = node.children
            .filter((child) => child.type === 'text' || child.type === 'inlineCode')
            .map((child) => child.value)
            .join('');
          headings.push({
            depth: node.depth,
            text: text,
          });
        });
      })
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings)
      .use(rehypeKatex)
      .use(rehypePrism)
      .use(rehypePluginLineNumbers) // 使用自定义插件添加行号
      .use(rehypeStringify)
      .use(remarkParse)
      .process(content)
      .then((file) => {
        res.render('post', {
          title: frontmatter.title || decodedTitle,
          content: String(file),
          headings: headings, // 将标题信息传递给模板
        });
      })
      .catch((error) => {
        console.error('处理 Markdown 文件时出错:', error);
        res.status(500).send('服务器内部错误');
      });
  });
});

// 首页
app.get('/', (req, res) => {
  // 读取 posts 目录下的所有文件
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      console.error('读取 posts 目录失败:', err);
      return res.status(500).send('服务器错误');
    }

    const articles = [];
    let personalArticle = null;

    files.forEach((filename) => {
      // 仅处理 .md 文件
      if (path.extname(filename) === '.md') {
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // 使用 gray-matter 解析前置内容
        const { data } = matter(fileContent);

        const article = {
          filename: path.parse(filename).name, // 获取不带扩展名的文件名
          title: data.title || '无标题',
          summary: data.summary || '暂无摘要',
          author: data.author || '作者未署名',
          tag: data.tag || '',
        };

        // 检查是否为 personal.md,若是则保存
        if (filename === 'personal.md') {
          personalArticle = article;
        } else {
          articles.push(article);
        }
      }
    });

    // 如果 personal.md 存在,将其放在数组的最前面
    if (personalArticle) {
      articles.unshift(personalArticle);
    }

    // 将文章列表传递给模板进行渲染
    res.render('index', { articles });
  });
});


// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器正在 http://localhost:${PORT} 运行`);
});
