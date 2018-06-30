var fonline = require("./fonlinebot.js");
var csv = require("csvtojson/v2");
var mysql = require('mysql');
var async = require('async');
var moment = require('moment');

module.exports = {

    events: function (events, dbhost, dbuser, dbpass, dbname, tblname) {

        csv({
            noheader: true,
            delimiter: [";"],
            output: "csv"
        }).fromString(events)
            .then(eventsjson => {

                return new Promise((resolve, reject) => {
                    var context = [];
                    context.events = eventsjson;

                    context.db = mysql.createConnection({
                        host: dbhost,
                        user: dbuser,
                        password: dbpass,
                        database: dbname
                    });

                    context.db.connect((err) => {
                        if (err) {
                            console.error('error connecting: ' + err.stack);
                            reject(err);
                        } else {
                            resolve(context);
                        }
                    });
                })
            })
            .then(context => {
                return new Promise((resolve, reject) => {

                    context.fieldnms = "date, timer, name";
                    context.headers = ["date", "timer", "name"];

                    console.log(`about to create # CREATE TABLE IF NOT EXISTS events ( date TEST, timer INT, name VARCHAR(255), execute INT )#`);
                    context.db.query(`CREATE TABLE IF NOT EXISTS events ( id INT UNSIGNED NOT NULL AUTO_INCREMENT, date DATETIME, timer INT, name TEXT, execute INT, PRIMARY KEY (id), UNIQUE KEY(date, name(255)))`,
                        [],
                        err => {
                            if (err) reject(err);
                            else resolve(context);
                        })
                });
            })
            .then(context => {
                return new Promise((resolve, reject) => {
                    async.eachSeries(context.events, (datum, next) => {
                            // console.log(`about to run INSERT INTO ${tblname} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`);
                            var d = [];
                            var date = "";
//                    console.log(`INSERT IGNORE INTO ${tblname} ( date, timer, name ) VALUES ( ${datum[0].replace(/\[|\]/g, '')}, ${datum[1]}, ${datum[2]} )`);
                            date = datum[0].replace(/\[|\]/g, '');
                            //  console.log(moment(date,'YYYY-MM-DDHH:mm:ss').format('YYYY-MM-DD HH:mm:ss'));
                            context.db.query(`INSERT INTO ${tblname} ( date, timer, name ) VALUES ( "${moment(date, 'YYYY-MM-DDHH:mm:ss').format('YYYY-MM-DD HH:mm:ss')}", "${datum[1]}", "${datum[2]}" ) ON DUPLICATE KEY UPDATE name = name`, d,
                                err => {
                                    if (err) {
                                        console.error(err);
                                        next(err);
                                    }
                                    else setTimeout(() => {
                                        next();
                                    });
                                });
                        },
                        err => {
                            if (err) reject(err);
                            else resolve(context);
                        });
                });
            })
            .then(context => {
                return new Promise((resolve, reject) => {
                    context.db.query("SELECT name, id, timer, date FROM events WHERE execute IS NULL", function (err, rows, fields) {
                        context.rows = rows;
                        if (err) reject(err);
                        else resolve(context);
                    });
                });

            })
            .then(context => {

                return new Promise((resolve, reject) => {
                    context.rows.forEach(function (row) {
                        context.db.query(`UPDATE events SET execute = 1 WHERE id = ${row.id}`, function (err, rows) {
                            //console.log(row.name);
                            fonline.sendevent(row);
                            if (err) {
                                console.log(err);
                                return reject(err);
                            }
                        });
                    });
                    resolve(context);

                });

            })
            .then(context => {
                context.db.end();
            }).catch(err => {
            console.error(err.stack);
        });


    }

}
