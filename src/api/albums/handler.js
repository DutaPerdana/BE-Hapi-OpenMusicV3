const autoBind = require('auto-bind');
//buat class
class AlbumsHandler {
  constructor(service, storageService, validator, uploadsvalidator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
    this._uploadsvalidator = uploadsvalidator;

    // this.postAlbumHandler = this.postAlbumHandler.bind(this);
    // this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    // this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    // this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    // this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }
  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album: album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album telah berhasil di edit',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album telah berhasil di hapus',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const { cover } =  request.payload;
    const { id } = request.params;

    this._uploadsvalidator.validateImageHeaders(cover.hapi.headers);
    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;
    await this._service.addCoverAlbum(id, fileLocation);
    const response = h.response({
      status : 'success',
      message : 'Sampul Berhasil di Unggah',
    });
    response.code(201);
    return response;

  }
}

module.exports = AlbumsHandler;
