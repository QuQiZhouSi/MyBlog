const express = require('express');
const fs = require('fs');
const markdownIt = require('markdown-it');
const path = require('path');
const app = express();
const PORT = 3000;

// ?�� markdown-it ?��,�Τ_�ѪR Markdown ?�e
const md = new markdownIt({
    html: true,
    breaks: true,
    linkify: true
});

// ?�m EJS �@?�ҪO����
app.set('view engine', 'ejs');

// �ڸ���,��V��?
app.get('/', (req, res) => {
    res.render('index', { title: 'My Blog' });
});

// ?�_?��
app.get('/about', (req, res) => {
    res.send('This is the About page');
});

// �ի�?��
app.get('/blog', (req, res) => {
    res.send('Welcome to the Blog page');
});

// �峹?��:���u?�J�����W?���}��V Markdown ���
app.get('/post/:filename', (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'posts', `${fileName}.md`);  // �ϥΥ��̪� __dirname
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(404).send('Post not found');
        }
        
        // ��V Markdown ?�e? HTML
        let renderedContent = md.render(data);

        // ??��V�Z��?�e? EJS �ҪO
        res.render('post', { content: renderedContent });
    });
});

// ??�A?��
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
