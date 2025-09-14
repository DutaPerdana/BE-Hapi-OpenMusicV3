/* eslint-disable linebreak-style */
const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongPlaylistPlayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PlaylistPayloadSchema, PostSongPlaylistPlayloadSchema };
