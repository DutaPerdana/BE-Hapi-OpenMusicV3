/* eslint-disable linebreak-style */
const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistPayloadSchema, PostSongPlaylistPlayloadSchema } = require('./schema');

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateSongPlaylistPayload: (payload) => {
    const validationResult = PostSongPlaylistPlayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
