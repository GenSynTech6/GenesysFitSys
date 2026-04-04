const express = require('express');
const basicAuth = require('express-basic-auth');
const path = require('path');
const app = express();

// O Render define a porta automaticamente na variável process.env.PORT
const PORT = process.env.PORT || 3000;

// Configuração da Autenticação do Monarca
app.use('/admin-portal', basicAuth({
    users: { 'admin': 'Lavinia1a@' }, 
    challenge: true, 
    realm: 'Genesys System Admin',
}));

// Serve os arquivos estáticos da pasta public (CSS, JS, Imagens)
app.use(express.static('public'));

// Rota protegida do Painel de Controle
app.get('/admin-portal', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// CRITICAL: Adicionado '0.0.0.0' para compatibilidade com o Render/Cloud
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ SISTEMA ONLINE NA PORTA ${PORT} ]`);
    console.log(`[ ACESSO: http://sua-url.onrender.com/admin-portal ]`);
});