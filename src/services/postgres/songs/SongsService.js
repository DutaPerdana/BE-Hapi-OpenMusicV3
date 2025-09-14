const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const invariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const InvariantError = require('../../../exceptions/InvariantError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${  nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs(id, title, year, genre, performer, duration, album_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };
    if (albumId){
      await this.verifyAlbumId(albumId);
    }


    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new invariantError('Song gagal di tambahkan');
    }
    return result.rows[0].id;
  }
  // async getSongs() {
  //   const result = await this._pool.query(
  //     "SELECT id, title, performer FROM songs"
  //   );
  //   return result.rows;
  // }

  async getSongs({ title, performer }) {
    // Terima objek parameter
    let query = 'SELECT id, title, performer FROM songs';
    const values = [];
    const conditions = [];

    if (title) {
      conditions.push('title ILIKE $1'); // Gunakan ILIKE untuk pencarian case-insensitive
      values.push(`%${title}%`);
    }

    if (performer) {
      const paramIndex = values.length + 1; // Tentukan indeks parameter berikutnya
      conditions.push(`performer ILIKE $${paramIndex}`);
      values.push(`%${performer}%`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    const result = await this._pool.query(query, values);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id= $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(id, { title, year, genre, performer, duration }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5 WHERE id = $6 RETURNING id',
      values: [title, year, genre, performer, duration, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('gagal memperbaharyi song, id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal di hapus, id tidak ditemukan');
    }
  }

  async verifyAlbumId(id){
    const query = {
      text : 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length){
      throw new InvariantError('Album Tidak Tersedia, Silahkan Cek kembali');
    }
  }
}

module.exports = SongsService;
