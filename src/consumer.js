/* eslint-disable linebreak-style */
require('dotenv').config();
const amqp = require('amqplib');
const PlaylistsService = require('./services/postgres/playlists/playlistsService');
const MailSender = require('./services/mail/MailSender');


const listen = async () => {
  const playlistsService = new PlaylistsService();
  const mailSender = new MailSender();

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlists', {
    durable: true,
  });

  console.log('Consumer sedang menunggu pesan di antrian export:playlists...');
  channel.consume('export:playlists', async (message) => {
    try {
      const { id, targetEmail } = JSON.parse(message.content.toString());

      console.log(`Menerima permintaan ekspor playlist ${id} ke ${targetEmail}`);

      const result = await playlistsService.getPlaylistSong(id);
      const resultt = {
        playlists: result,
      };
      console.log(resultt);
      await mailSender.sendEmail(targetEmail, JSON.stringify(resultt, null, 2));
      console.log(`Email untuk playlist ${id} berhasil dikirim ke ${targetEmail}`);
    } catch (error) {
      console.error('Terjadi kesalahan pada consumer:', error);
    } finally {
      // Memberi tahu RabbitMQ bahwa pesan sudah selesai diproses
      channel.ack(message);
    }
  }, { noAck: false }); // noAck: false agar kita bisa kontrol ack manual
};

listen();