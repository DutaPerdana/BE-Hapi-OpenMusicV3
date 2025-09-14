/* eslint-disable linebreak-style */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../../exceptions/InvariantError');
const NotFoundError = require('../../../exceptions/NotFoundError');
const AuthorizationError = require('../../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService){
    this._pool = new Pool();
    this._collaborationService= collaborationService;
  }


  async addPlaylist({ name, owner }){
    const id = `playlist-${nanoid(16)}`;
    const query ={
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id){
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getPlaylists(owner){
    const query = {
    //   text : 'SELECT * FROM playlists WHERE owner = $1',
      text: `SELECT playlists.id,playlists.name, users.username
        FROM playlists
        LEFT JOIN users ON users.id = playlists.owner
        LEFT JOIN collaborations col ON col.playlist_id = playlists.id
        WHERE playlists.owner = $1 OR col.user_id = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyPlaylistOwner(id, owner){
    const query = {
      text : 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    // console.log(result);
    if (!result.rows.length){
      throw new NotFoundError('Playlists tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner){
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      //periksa apakai ini seorang owner dari playlist
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      //jika eror nya notfound eror, masuk ke throw eror. artinya catatan tidak ada/tersedia
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
      //periksa, jika bukan owner sekarang periksa apakah ini sebagai kolaboration atau tidak, jika tidak langsung ke throw error
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
  // Kode Anda yang diperbaiki

  async deletePlaylistById(id){
    const query = {
      text : 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    // console.log(result);
    if (!result.rows.length){
      throw new NotFoundError('Playlists gagal dihapus, id tidak ditemukan');
    }
  }

  async addSongtoPlaylist(playlistId, songId, userId){
    const id = `PlaySong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1 , $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const querySongs ={
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const songsCheck =  await this._pool.query(querySongs);
    if (!songsCheck.rows.length){
      throw new NotFoundError('Songs tidak tersedia, silahkan cek kembali');
    }

    const result = await this._pool.query(query);

    if (!result.rows[0].id){
      throw new InvariantError('Songs gagal di tambahkan ke playlist');
    }

    await this.addActivity(playlistId, songId, userId, 'add');

  }

  async getPlaylistSong(playlistId){
    const query = {
      text: `SELECT s.id, s.title, s.performer
          FROM songs s
          LEFT JOIN playlist_songs ps ON s.id = ps.song_id
          WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    const songs = result.rows;

    const queryPlaylist = {
      text : `SELECT p.id, p.name, u.username
              FROM playlists p
              LEFT JOIN users u ON u.id = p.owner
              WHERE p.id = $1`,
      values: [playlistId],
    };

    const playlist = await this._pool.query(queryPlaylist);
    if (!playlist.rows.length){
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const p = playlist.rows[0];

    return {
      id: p.id,
      name: p.name,
      username: p.username,
      songs: songs,
    };

  }

  async deleteSonginPlaylist(playlistId, songId, userId){
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 RETURNING id',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new InvariantError('Songs gagal dihapuus, Id tidak ditemukan');
    }
    await this.addActivity(playlistId, songId, userId, 'delete');
  }

  // Di dalam class PlaylistsService

  async getPlaylistActivities(playlistId) {
    // const query = {
    //   text: `SELECT u.username, s.title, psa.action, psa.time
    //        FROM playlist_song_activities psa
    //        JOIN users u ON psa.user_id = u.id
    //        JOIN songs s ON psa.song_id = s.id
    //        WHERE psa.playlist_id = $1
    //        ORDER BY psa.time ASC`,
    //   values: [playlistId],
    // };

    const query = {
      text : `SELECT u.username, s.title, psa.action, psa.time
              FROM ps_activities psa
              LEFT JOIN users u ON u.id = psa.user_id
              LEFT JOIN songs s ON s.id = psa.song_id
              WHERE psa.playlist_id = $1
              ORDER BY psa.time ASC`,
      values : [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length){
      throw new NotFoundError('playlist tidak ditemukan, mohon cek kembali');
    }
    return result.rows;
  }

  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO ps_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id){
      throw new InvariantError('Activity gagal di tambahkan');
    }
  }

}

module.exports = PlaylistsService;