/* eslint-disable no-irregular-whitespace */
const Hapi = require('@hapi/hapi');
const AlbumsService = require('./services/postgres/albums/AlbumsService');
const albums = require('./api/albums');
const ClientError = require('./exceptions/ClientError');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const songs = require('./api/songs');
const SongsService = require('./services/postgres/songs/SongsService');
require('dotenv').config();

const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
//users
const users = require('./api/users');
const UsersService = require('./services/postgres/users/usersService');
const UsersValidator = require('./validator/users');

//authenticatiions
const authentications= require('./api/authentications');
const AuthenticationsService = require('./services/postgres/authentications/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');
const TokenManager = require('./tokenize/TokenManager');

//playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/playlists/playlistsService');
const PlaylistsValidator = require('./validator/playlists');


//collaaborations
const CollaborationsService = require('./services/postgres/collaborations/collaborationsService');
const collaborations = require('./api/collaborations');
const CollaborationsValidator = require('./validator/collaborations');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');


const init = async () => {
  //daftarkan albumj service
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/albums/file/covers'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('playlists_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // daftarkan plugins
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        storageService: storageService,
        validator: AlbumsValidator,
        uploadsvalidator: UploadsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;

    // penanganan client error secara internal.
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
  //ubah ketika di deploy
  // console.log(`Server berjalan pada http://${process.env.HOST}:${process.env.PORT}`);
};

init();
