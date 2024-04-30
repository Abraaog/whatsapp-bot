const venom = require('venom-bot');
const fs = require('fs');

const SESSION_FILE_PATH = './session.json';

venom
  .create({
    session: 'mySession',
  })
  .then((client) => {
    // Inicia a sessão
    client.onStateChange((state) => {
      console.log('State changed:', state);
      if (state === 'CONFLICT' || state === 'UNPAIRED') client.forceRefocus();
    });

    // Salva a sessão no arquivo
    client.onStateChange((state) => {
      if (state === 'CONFLICT' || state === 'UNPAIRED') {
        console.log('O WhatsApp Web foi desconectado');
        fs.unlinkSync(SESSION_FILE_PATH);
      }
    });

    client.onStateChange((state) => {
      if (state === 'CONNECTED' && client?.user) {
        console.log('Conectado ao WhatsApp Web como', client.user.name);
        fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(client.base64EncodedAuthInfo()));
      }
    });

    client.onStateChange((state) => {
      if (state === 'UNPAIRED') {
        console.log('Você foi desconectado do WhatsApp Web');
        fs.unlinkSync(SESSION_FILE_PATH);
      }
    });

    // Mostra o QR Code
    client.onStreamChange((state) => {
      console.log('Estado do Stream:', state);
      if (state === 'qr') {
        const qrCode = client.qrcode;
        console.log('QR Code:', qrCode);
      }
    });

    // Lógica para lidar com as mensagens recebidas
    client.onMessage((message) => {
      // Extrai as informações essenciais da mensagem
      const numeroRemetente = message.from;
      const conteudoMensagem = message.body;
      const nomeRemetente = message.sender.pushname;
      const horaMensagem = new Date(message.timestamp * 1000).toLocaleTimeString();

      // Exibe as informações essenciais no console
      console.log(`Número do Remetente: ${numeroRemetente}`);
      console.log(`Mensagem: ${conteudoMensagem}`);
      console.log(`Remetente: ${nomeRemetente}`);
      console.log(`Hora da Mensagem: ${horaMensagem}`);

      // Exemplo de resposta
      client.sendText(message.from, 'Sua mensagem foi recebida!');

      // Aqui você pode adicionar mais lógica, se necessário
    });
  })
  .catch((error) => {
    console.error('Erro ao iniciar o cliente VenomBot:', error);
  });
