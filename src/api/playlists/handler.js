/* eslint-disable linebreak-style */
const autoBind = require('auto-bind');
class PlaylistsHandler {
  constructor(service, validator){
    this._service = service;
    this._validator = validator;

    // this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    // this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    // this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    // this.postSongtoPlaylistHandler = this.postSongtoPlaylistHandler.bind(this);
    // this.getSongtoPlaylistByIdHandler= this.getSongtoPlaylistByIdHandler.bind(this);
    // this.deleteSongtoPlaylistByIdHandler = this.deleteSongtoPlaylistByIdHandler.bind(this);
    // this.getSonginPlaylistActivitiesHandler= this.getSonginPlaylistActivitiesHandler.bind(this);
    autoBind(this);
  }

  async postPlaylistHandler(request, h){
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;

    const { id: credentialId } = request.auth.credentials;
    const playlist = await this._service.addPlaylist({ name, owner: credentialId, });

    const response = h.response({
      status : 'success',
      data: {
        playlistId: playlist,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request){
    const { id: credentialId } = request.auth.credentials;
    const playlist = await this._service.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists: playlist,
      },
    };
  }

  async deletePlaylistByIdHandler(request){
    const { id } = request.params;
    const { id : credentialId } = request.auth.credentials;
    //sebelum hapus panggil fungsi verify owner, apakah benar dia adalah pemilik playlist yang ingin di hapsu
    await this._service.verifyPlaylistOwner(id, credentialId);

    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil di hapus',
    };
  }

  async postSongtoPlaylistHandler(request, h){
    this._validator.validateSongPlaylistPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id : credentialId } = request.auth.credentials;
    // await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.verifyPlaylistAccess(id, credentialId);

    await this._service.addSongtoPlaylist(id, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil di tambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongtoPlaylistByIdHandler(request){
    const { id } =request.params;
    const { id: credentialId } = request.auth.credentials;
    // await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._service.getPlaylistSong(id);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };

  }

  async getSonginPlaylistActivitiesHandler(request){
    const { id } =request.params;
    const { id: credentialId } = request.auth.credentials;
    // await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.verifyPlaylistAccess(id, credentialId);
    const act = await this._service.getPlaylistActivities(id);

    return {
      status: 'success',
      data: {
        playlistId : id,
        activities : act,
      }
    };
  }

  async deleteSongtoPlaylistByIdHandler(request){
    const { songId } = request.payload;
    const { id } = request.params;
    const { id : credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.deleteSonginPlaylist(id, songId, credentialId);

    return {
      status: 'success',
      message: 'Berhasil menghapus song dalam playlist',
    };
  }
}

module.exports = PlaylistsHandler;