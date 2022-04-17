const Joi = require('joi');
const SQLNoRow = require('../exceptions/sql_no_row');
const NotFoundError = require('../exceptions/not_found_error');
const InternalServerError = require('../exceptions/internal_server_error');
const BadRequest = require('../exceptions/bad_request');
const KunjunganModel = require('../models/kunjungan_model');

class KunjunganService {
    constructor(promiseMysqlPool) {
        this.dbPool = promiseMysqlPool;
    }

    async getKunjunganByIDPengunjung(id) {
        try {
            const connection = await this.dbPool.getConnection();

            const queryResult = await connection.execute('SELECT * FROM kunjungan WHERE idPengunjung = ?', [id]);
            if (queryResult[0].length < 1) throw new SQLNoRow();

            connection.release();

            return queryResult[0]

        } catch (err) {
            console.error(err.message);

            if (err instanceof SQLNoRow) throw new NotFoundError('kunjungan data is not found');
            throw new InternalServerError('an error occurred while getting kunjungan data');
        }
    }

    async createKunjungan(params) {
        try {
            await KunjunganModel.getCreateKunjunganModel().validateAsync(params);

            const kunjungan = {
                idPengunjung: params.idPengunjung,
                idMitra: params.idMitra,
                tanggal: params.tanggal,
                checkin: params.checkin,
                checkout: params.checkout,
                statusKunjungan: params.statusKunjungan
            };

            const connection = await this.dbPool.getConnection();

            const queryResult = await connection.execute('INSERT INTO kunjungan SET idPengunjung = ?,idMitra = ?, tanggal = ?, checkin = ?, checkout = ?, statusKunjungan = ?', [
                kunjungan.idPengunjung, kunjungan.idMitra, kunjungan.tanggal, kunjungan.checkin, kunjungan.checkout, kunjungan.statusKunjungan
            ]);

            connection.release();

            return queryResult[0];

        } catch (err) {
            console.error(err.message);

            if (err instanceof Joi.ValidationError) throw new BadRequest(err.message);
            throw new InternalServerError('an error occurred while getting kunjungan');
        }
    }
}

module.exports = KunjunganService;