const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const invariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${  nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new invariantError('Album gagal di tambahkan');
    }
    return result.rows[0].id;
  }
  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows;
  }

  // async getAlbumById(id) {
  //   const query = {
  //     text: "SELECT id, title, performer FROM songs WHERE album_id= $1",
  //     values: [id],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rows.length) {
  //     throw new NotFoundError("Album tidak ditemukan");
  //   }
  //   console.log(result.rows[0]);
  //   return result.rows[0];
  // }

  async getAlbumById(id) {
    // 1. Ambil detail album
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rows.length) {
      throw new NotFoundError('Album tidak ditemukan'); // Pastikan Anda memiliki NotFoundError
    }

    const album = albumResult.rows[0];

    // 2. Ambil daftar lagu yang terkait dengan album ini
    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const songsResult = await this._pool.query(songsQuery);

    // 3. Gabungkan hasilnya
    // Pastikan nama properti di objek songs sesuai dengan yang diinginkan di respons API
    const songs = songsResult.rows.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));

    // Menggabungkan detail album dan daftar lagu ke dalam satu objek
    return {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: album.cover || null,
      songs: songs, // Tambahkan properti songs
    };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('gagal memperbaharyi album, id tidak ditemukan');
    }
  }

  //tambahakn untuk post covers
  async addCoverAlbum(id, fileLocation){
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [fileLocation, id],
    };
    // console.log(id);
    const result = await this._pool.query(query);
    // console.log(result);
    if (!result.rowCount) {
      throw new NotFoundError('gagal memperbaharui album, id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal di hapus, id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
