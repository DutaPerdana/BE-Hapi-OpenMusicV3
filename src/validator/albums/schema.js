const Joi = require('joi');

// Definisikan schema validasi untuk objek AlbumPayload
const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  //Aturan ini menyatakan bahwa nilai angka untuk year maksimal adalah tahun saat ini ditambah 5 tahun
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 5)
    .required(), // Menambahkan validasi tahun yang lebih spesifik. //required artinya wajid di isi
  cover: Joi.string().uri().optional(),
});

module.exports = { AlbumPayloadSchema };
