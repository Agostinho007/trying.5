const express = require('express');
const fs = require('fs');
const WebSocket = require('ws');
const cors = require('cors');
const PORT = process.env.PORT || 3000;

const application = express();
application.use(express.json());
application.use(express.static('.'));

application.use(cors({
    origin: ' * ',
}))

const wss = new WebSocket.Server({port: process.env.PORT})

function lerDados(){
    try {
        return JSON.parse(fs.readFileSync('server/database.json'));
    } catch (error) {
        console.error('Erro ao Ler Dados: ', error);
        return {
            users: [], mensagens: []
        }
    }
}

function salvarDados(dados){
    try {
        fs.writeFileSync('server/database.json',  JSON.stringify(dados, null, 2));
    } catch (error) {
        console.error('Erro ao salvar dados em database.json: ', error);
    }
}

wss.on('connection', (ws) => {
    console.log('Novo Cliente Concectado!');
    const dados = lerDados();
    ws.send(JSON.stringify({tipo: 'historico', mensagens: dados.mensagens}));


    ws.on('message', (mensagem) => {
    const dados = lerDados();
    const novaMensagem = JSON.parse(mensagem);
    dados.mensagens.push({
        id: Date.now(),
        texto: novaMensagem.texto,
        usuario: novaMensagem.usuario||'Anonimo',
        timestamp: new Date().toISOString()
    });
    salvarDados(dados);
    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                tipo: 'novaMensagem', 
                mensagem: dados.mensagens[dados.mensagens.length -1 ]
            }))
        }
    })

    ws.on('close', () => {
        console.log('Cliente Desconectado!');
    });
});});


application.post('/api/users', (req, res) => {
    try {
        const novouser = req.body;
        const dados = JSON.parse(fs.readFileSync('server/database.json'));
        dados.users.push(novouser);
        fs.writeFileSync('server/database.json', JSON.stringify(dados, null, 2));
        res.status(201).json(novouser);
    } catch (error) {
        console.error('Erro: ', error);
        res.status(500).json({
            error: 'Erro no Servidor'
        });
    }
})

application.listen(PORT, () => {
    console.log(`Server ON in port ${PORT} `);
})