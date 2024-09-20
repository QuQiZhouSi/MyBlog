const express = require('express');
const fs = require('fs');
const markdownIt = require('markdown-it');
const mathjax = require('mathjax');
const path = require('path');
const app = express();
const PORT = 3000;
const md = new markdownIt({
    html: true,
    breaks: true,
    linkify: true
});
app.set('view engine','ejs');

app.get('/',(req, res) => {
    res.render('index', { title: 'My Blog'});
});

app.get('/about', (req, res) => {
    res.send('This is the About page');
});

app.get('/blog',(req,res) => {
    res.send('Welcome to the Blog page');
});

app.get('/post/:filename',(req,res) => {
    const fileName = req.params.filename;
    const filePath = path.join(_dirname, 'posts', `${fileName}.md`);
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if(err){
            return res.status(404).send('Post not found');
        }
        let renderedContent = md.render(data);
        res.render('post', { content: renderedContent});
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
