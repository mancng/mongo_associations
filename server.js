//Require Express
var express = require( 'express' );
var app = express();

//Get body-parser
var bodyParser = require( 'body-parser' );
app.use(bodyParser.urlencoded({ extended: true }));

//Set Path
var path = require( 'path' );
app.use(express.static(path.join( __dirname, './static' )));
app.set('views', path.join( __dirname, './views' ));
app.set('view engine', 'ejs');

//MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mongoose_message');

//Define Schema variable
var Schema = mongoose.Schema;

//Define Message Schema
var MessageSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 4 },
    message_content: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]},{timestamps: true});

var CommentSchema = new mongoose.Schema({
    _message: { type: Schema.Types.ObjectId, ref: 'Message'},
    name: { type: String, required: true, minlength: 4 },
    comment_content: { type: String, required: true }}, {timestamps: true});

//Set models by passing them their respective Schemas
mongoose.model('Message', MessageSchema);
mongoose.model('Comment', CommentSchema);

//Store our models in variables
var Message = mongoose.model('Message');
var Comment = mongoose.model('Comment');
mongoose.Promise = global.Promise;


//Routes
app.get('/', function(req, res){
    Message.find({})
    .populate('comments')
    .exec(function(err, message){
        res.render('index', {allMessages: message});
    });
});





// app.get('/', function(req, res){
//     Message.find({}, function(err, messages){
//         if(err){
//             console.log("Error when getting all messages");
//         } else {
            
//             res.render('index', {allMessages: messages});
//         };
//     });
// });

app.post('/messages', function(req, res){
    // console.log("POST DATA: ", req.body);

    var message = new Message({
        name: req.body.message_name, message_content: req.body.message
    });

    message.save(function(err){
        if(err){
            console.log("Error when saving message to Mongo" + err);
        } else {
            res.redirect('/');
        };
    });
});

app.post('/comments/:id', function(req, res){
    // console.log("POST DATA: ", req.body);
    // console.log("id:" , req.params.id);
    Message.findOne({_id: req.params.id}, function(err, message){
        var comment = new Comment({
            name: req.body.comment_name, comment_content: req.body.comment
        });

        comment._message = message._id;
        message.comments.push(comment);
        comment.save(function(err){
            message.save(function(err){
                if(err){
                    console.log("Error adding comment to message");
                } else {
                    res.redirect('/');
                };
            });
        });
    });
});



//Listen to the server
app.listen(8000, function(){
    console.log("listening to 8000");
});