const Joi = require('joi');

// Definisikan schema validasi untuk objek AlbumPayload
const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 5)
    .required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer().optional(),
  albumId: Joi.string().optional(),
});

module.exports = { SongPayloadSchema };
