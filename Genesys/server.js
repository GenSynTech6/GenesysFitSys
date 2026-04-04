const express = require('express');
const basicAuth = require('express-basic-auth');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração da Autenticação do Monarca
app.use('/admin-portal', basicAuth({
    users: { 'admin': 'Lavinia1a@' }, // Usuário e Senha
    challenge: true, // Faz o navegador abrir a janelinha de login
    realm: 'Genesys System Admin',
}));

// Serve os arquivos da pasta public
app.use(express.static('public'));

// Rota protegida
app.get('/admin-portal', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`[ SISTEMA ONLINE NA PORTA ${PORT} ]`);
});