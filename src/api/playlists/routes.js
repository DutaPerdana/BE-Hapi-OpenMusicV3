/* eslint-disable linebreak-style */
const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: {
      auth: 'playlists_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getPlaylistsHandler,
    options:{
      auth: 'playlists_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistByIdHandler,
    options:{
      auth: 'playlists_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: handler.postSongtoPlaylistHandler,
    options:{
      auth: 'playlists_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: handler.getSongtoPlaylistByIdHandler,
    options:{
      auth: 'playlists_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: handler.deleteSongtoPlaylistByIdHandler,
    options:{
      auth: 'playlists_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: handler.getSonginPlaylistActivitiesHandler,
    options:{
      auth: 'playlists_jwt',
    },
  },

];

module.exports = routes;