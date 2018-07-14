var mongoose = require('mongoose');
var multer = require('multer');

var Schema = mongoose.Schema;

var fileSchema = new mongoose.Schema({

    file_name:{type: String, required: true},
    file_size: {type: Number, required: true}


});

var fileModel = mongoose.model('fileModel', fileSchema);

module.exports = fileModel;