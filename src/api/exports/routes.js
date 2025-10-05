/* eslint-disable linebreak-style */
const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{id}',
    handler: handler.postExportPlaylistsHandler,
    options: {
      auth: 'playlists_jwt',
    },
  },
];

module.exports = routes;
