//###################### INCLUDES ###############################
var app = require('express')();
var bodyParser = require('body-parser');
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var sha1 = require('sha1');

//###################### SETTING ###############################

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

//###################### VARIABLES ###############################

var board = {
    "A1": "wr1", "B1": "wn1", "C1": "wb1", "D1": "wq",
    "E1": "wk", "F1": "wb2", "G1": "wn2", "H1": "wr2",
    "A2": "wp1", "B2": "wp2", "C2": "wp3", "D2": "wp4",
    "E2": "wp5", "F2": "wp6", "G2": "wp7", "H2": "wp8",

    "A8": "br2", "B8": "bn2", "C8": "bb2", "D8": "bq",
    "E8": "bk", "F8": "bb1", "G8": "bn1", "H8": "br1",
    "A7": "bp8", "B7": "bp7", "C7": "bp6", "D7": "bp5",
    "E7": "bp4", "F7": "bp3", "G7": "bp2", "H7": "bp1"
}, current_board = {};

var boards = {};

function shallowCopy(oldObj) {
    var newObj = {};
    for(var i in oldObj) {
        if(oldObj.hasOwnProperty(i)) {
            newObj[i] = oldObj[i];
        }
    }
    return newObj;
}

app.get('/', function(req, res){
	res.redirect('/play?id=' + String(sha1(JSON.stringify(req.headers))).substring(0, 15) + '&c=w');
});

app.get('/play', function (req, res) {
    if(req.query.c == 'w'){
        current_board = shallowCopy(board);
        res.render('white');
    } else {
        res.render('black');
    }
});

app.post('/validate', function (req, res) {
    var position = req.body.position;
    var color = req.body.color;
    console.log("\nAttempt to mote to " + position);
    if(current_board[position] && current_board[position][0] == color){
        res.send(false);
    } else {
        res.send(true);
    }
});

io.on('connection', function(socket){
	console.log("New connection:\t\t" + socket.id);
    socket.on('move', function(data){
        console.log("socket: move");
        console.log(data);
        //console.log(parse(data.pieceID) + ": " + data.col[1] + data.row[1] + "\n");

        // remove position of old piece
        for(var key in current_board)
            if(current_board[key] == data.pieceID)
                delete current_board[key];

        // check if takes
        if(current_board[data.col[1] + data.row[1]] != null){
            data.take = current_board[data.col[1] + data.row[1]];
        }

        // update position
        current_board[data.col[1] + data.row[1]] = data.pieceID;
        io.emit('notify', data);
    });
    
    socket.on('disconnect', function(){
        console.log("Disconnected:\t\t" + socket.id);
    });
});

function parse(data) {
    if(data == undefined)
        return "undefined";
    var string = "";
    if(data[0] == 'w'){
        string += "white ";
    } else {
        string += "black ";
    }
    switch(data[1]){
        case 'p': string += "pawn"; break;
        case 'r': string += "rook"; break;
        case 'n': string += "knigth"; break;
        case 'b': string += "bishop"; break;
        case 'q': string += "queen"; break;
        case 'k': string += "king"; break;
    }
    return string;
}

http.listen(3000, function(){
    console.log('listening on localhost:3000');
});