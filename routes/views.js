const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home', {title: 'Página Inicial', scripts: []});
});

router.get('/inicio', (req, res) => {
    res.render('inicio', {title: 'Início', scripts: ['./inicio.js']});
});

router.get('/controle', (req, res) => {
    const { comprimento, largura } = req.query;
    res.render('controle', {
        title: 'Controle', 
        comprimento: parseInt(comprimento),
        largura: parseInt(largura),
        scripts: ['./controle.js']
    });
});

module.exports = router;