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

    // 保留 Markdown 渲染逻辑,保持与原有功能一致
    let headings = [];
    let tags = frontmatter.tag;
    let tagError = false;

    // 确保 tags 为数组,避免错误
    if (!Array.isArray(tags)) {
      tags = []; // 默认设置为空数组
      tagError = true; // 设置标签格式错误标记
    }

    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
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
      .use(rehypePluginLineNumbers) // 保留行号功能
      .use(rehypeStringify)
      .process(content)
      .then((file) => {
        res.render('post', {
          title: frontmatter.title || decodedTitle,
          author: frontmatter.author || '作者未署名',  // 默认作者
          tags: tags,                                 // 正常的标签
          tagError: tagError,                         // 标记标签错误
          content: String(file),                      // 渲染后的文章内容
          headings: headings                          // 保留原有功能
        });
      })
      .catch((error) => {
        console.error('处理 Markdown 文件时出错:', error);
        res.status(500).send('服务器内部错误');
      });
  });
});

// 标签页
app.get('/tag/:tag', (req, res) => {
  const tagQuery = req.params.tag.toLowerCase();

  fs.readdir(postsDir, (err, files) => {
    if (err) {
      console.error('读取 posts 目录失败:', err);
      return res.status(500).send('服务器错误');
    }

    const results = [];

    files.forEach((filename) => {
      if (path.extname(filename).toLowerCase() === '.md') {
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContent);

        const tags = Array.isArray(data.tag) ? data.tag : [];
        if (tags.some(tag => tag.toLowerCase() === tagQuery)) {
          results.push({
            filename: path.parse(filename).name,
            title: data.title,
            author: data.author,
            tags: tags
          });
        }
      }
    });

    res.render('tag_results', { tag: tagQuery, results });
  });
});

// 作者页
app.get('/author/:author', (req, res) => {
  const authorQuery = req.params.author.toLowerCase();

  fs.readdir(postsDir, (err, files) => {
    if (err) {
      console.error('读取 posts 目录失败:', err);
      return res.status(500).send('服务器错误');
    }

    const results = [];

    files.forEach((filename) => {
      if (path.extname(filename).toLowerCase() === '.md') {
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContent);

        if (data.author && data.author.toLowerCase() === authorQuery) {
          results.push({
            filename: path.parse(filename).name,
            title: data.title,
            tags: data.tag || []
          });
        }
      }
    });

    res.render('author_results', { author: authorQuery, results });
  });
});




// 首页
// app.js

// 首页
app.get('/', (req, res) => {
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      console.error('读取 posts 目录失败:', err);
      return res.status(500).send('服务器错误');
    }

    const articles = [];
    let topArticles = {
      personal: null,
      upload: null,
      markdownlanguage: null,
      rule: null,
    };

    files.forEach((filename) => {
      if (path.extname(filename).toLowerCase() === '.md') {
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContent);

        const article = {
          filename: path.parse(filename).name,
          title: data.title || '无标题',
          summary: data.summary || '暂无摘要',
          author: data.author || '作者未署名',
          tags: data.tag || [], // 获取标签
          mtime: fs.statSync(filePath).mtime
        };

        const lowerFilename = filename.toLowerCase();
        if (lowerFilename === 'personal.md') topArticles.personal = article;
        else if (lowerFilename === 'upload.md') topArticles.upload = article;
        else if (lowerFilename === 'markdownlanguage.md') topArticles.markdownlanguage = article;
        else if (lowerFilename === 'rule.md') topArticles.rule = article;
        else articles.push(article);
      }
    });

    articles.sort((a, b) => b.mtime - a.mtime);

    // 置顶文章
    if (topArticles.rule) articles.unshift(topArticles.rule);
    if (topArticles.markdownlanguage) articles.unshift(topArticles.markdownlanguage);
    if (topArticles.upload) articles.unshift(topArticles.upload);
    if (topArticles.personal) articles.unshift(topArticles.personal);

    res.render('index', { articles });
  });
});

// 搜索功能
app.get('/search', (req, res) => {
  const query = req.query.q.toLowerCase();

  fs.readdir(postsDir, (err, files) => {
    if (err) {
      console.error('读取 posts 目录失败:', err);
      return res.status(500).send('服务器错误');
    }

    const results = [];

    files.forEach((filename) => {
      if (path.extname(filename).toLowerCase() === '.md') {
        const filePath = path.join(postsDir, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContent);

        // 确保 tags 是数组,避免 .some 出错
        const tags = Array.isArray(data.tag) ? data.tag : [];

        // 搜索标题、作者或标签
        const isMatch = (data.title && data.title.toLowerCase().includes(query)) ||
                        (data.author && data.author.toLowerCase().includes(query)) ||
                        (tags.some(tag => tag.toLowerCase().includes(query)));

        if (isMatch) {
          results.push({
            filename: path.parse(filename).name,
            title: data.title,
            author: data.author,
            tags: tags,
            summary: data.summary || '暂无摘要'
          });
        }
      }
    });

    res.render('search_results', { query, results });
  });
});


// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器正在 http://localhost:${PORT} 运行`);
});
