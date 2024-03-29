const query = require('../db/db-connection');
const {multipleColumnSet} = require('../utils/common.utils');
const Helper = require('../utils/helper.utils');
const User = require('./user.model');
const Author = require('./author.model');

class BookModel {
    tableName = 'book';

    find = async (params = {page: 1}) => {

        const offset = Helper.getOffset(params.page, Helper.limit);

        let sql = `SELECT * FROM ${this.tableName} 
                   ORDER BY title 
                   LIMIT ${Helper.limit} 
                   OFFSET ${offset} `;

        if (!Object.keys(params).length) {
            return await query(sql);
        }
        const {columnSet, values} = multipleColumnSet(params)

        const rows = await query(sql, [...values]);
        let data = Helper.emptyOrRows(rows);

        console.log(data)
        const page = params.page;

        return {
            data,
            page
        }
    }


    findOne = async (params) => {
        const {columnSet, values} = multipleColumnSet(params)

        const sql = `SELECT * FROM ${this.tableName}
        WHERE ISBN = '${params.ISBN}'`;

        const result = await query(sql, [...values]);

        return result[0];
    }

    findBooksByAuthorId = async (id) => {
        const sql = `SELECT title, genre, image, ISBN, description
         FROM ${this.tableName}
         WHERE author_id = ${id}
         ORDER BY title`;

        if (!Object.keys(id).length) {
            return await query(sql);
        }
        const {columnSet, values} = multipleColumnSet(id)

        const result = await query(sql, [...values]);

        return result;
    }

    findMatchingTitle = async (params) => {
        const offset = Helper.getOffset(params.page, Helper.limit);
        const sql = `SELECT * FROM ${this.tableName}
        WHERE title LIKE '%${params.search}%'
         ORDER BY title 
         LIMIT ${Helper.limit} 
         OFFSET ${offset}`;

        if (!Object.keys(params).length) {
            return await query(sql);
        }
        const {columnSet, values} = multipleColumnSet(params)

        const rows = await query(sql, [...values]);
        let data = Helper.emptyOrRows(rows);

        console.log(data)
        const page = params.page;

        return {
            data,
            page
        }

    }

    findUserBookSections = async (params) => {

        const sql = `SELECT ub.status as section, COUNT(*) as books 
        FROM ${User.tableName} u 
        JOIN user_book ub on u.id = ub.user_id
        JOIN ${this.tableName} b on b.ISBN = ub.book_ISBN
        WHERE  u.id = ${params}
        GROUP BY ub.status`;

        if (!Object.keys(params).length) {
            return await query(sql);
        }
        const {columnSet, values} = multipleColumnSet(params)

        const result = await query(sql, [...values]);
        return result;

    }

    findUserBooksBySection = async (params) => {
        let userId = params[0];
        let section = params[1];

        const sql = `SELECT b.title, b.genre, a.first_name, a.last_name FROM ${this.tableName} b
        JOIN user_book ub on b.ISBN = ub.book_ISBN
        JOIN ${User.tableName} u on ub.user_id = u.id
        JOIN ${Author.tableName} a on a.id = b.author_id
        WHERE u.id = ${userId}
        AND ub.status = '${section}'`;

        if (!Object.keys(params).length) {
            return await query(sql);
        }

        const {columnSet, values} = multipleColumnSet(params)

        const result = await query(sql, [...values]);
        return result;

    }



    delete = async (id) => {
        const sql = `DELETE FROM ${this.tableName}
        WHERE ISBN = ?`;
        const result = await query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }

    update = async (params, id) => {
        const {columnSet, values} = multipleColumnSet(params)

        const sql = `UPDATE book SET ${columnSet} WHERE ISBN = ?`;

        const result = await query(sql, [...values, id]);

        return result;
    }

    create = async ({ISBN, author_id, title, genre, image, description}) => {

        const sql = `INSERT INTO ${this.tableName}
        (ISBN, author_id, title, genre, image, description) VALUES (?,?,?,?,?,?)`;

        const result = await query(sql, [ISBN, author_id, title, genre, image, description]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }

}

module.exports = new BookModel;
