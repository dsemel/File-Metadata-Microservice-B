var createError = require('http-errors');
var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

var fs = require('fs');


var multer = require('multer');

var mongoose = require('mongoose');

var dotenv = require('dotenv');
dotenv.config();

var urlDB = process.env.MONGO_DB_ATLAS;

var fileB = require('./routes/file.js');



var promise = mongoose.connect(urlDB, {

    //useMongoClient: true
    useNewUrlParser: true,
    useUnifiedTopology: true

});

mongoose.Promise = global.Promise;

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var port = process.env.PORT || 3000;




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.set('view engine', 'ejs');




app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(request,response){

  response.render('index', {myFile:""});
});


var limits = {
    files: 1,
    fileSize: 1024 * 1024,
};



var storage  = multer.diskStorage({
    destination:function(request, file, cb){

        cb(null, './public/files/uploads/')
    },

    filename: function(request, file, cb){

        cb(null, file.originalname)
    }
});


var upload = multer({ storage: storage, limits: limits });

app.post('/fileUpload', upload.single('myFile'), function(request,response){

    var fileName = request.file.originalname;
    var fileSize = request.file.size;
    var text0 = "File is "
    var text1 = ":  ";
    var text2 = "  bytes";
    var text3 = "{";
    var text4 = "}";

    fileB.findOne({file_name:fileName}, function(err,doc){

      if(doc){

            fileSize = doc.file_size;

          response.render('index', {myFile: text0 + text1 + text3 + fileSize + text2 + text4});


      }

      else{

          var newFile = fileB({file_name:fileName,
                               file_size:fileSize
          });

          newFile.save(function(err){

              if(err){
                  console.log(err);
              }

              fileSize = newFile.file_size;

              response.render('index', {myFile: text0 + text1 + text3 + fileSize + text2 + text4});



          });
      }
    });
           fs.unlink(request.file.path, function(err){

               if(err) throw err;
           });

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
// set locals, only providing error in development
   // res.locals.message = err.message;
    //res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  var message = err.message;


  res.render('error', {message: message, status: err.status});

});


var server = app.listen(port, function() {

  console.log('Your app is listening on port' + port);
});

module.exports = app;
