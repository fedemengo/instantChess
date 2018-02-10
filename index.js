var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require('express');
var sha1 = require('sha1');

app.use("/img", express.static(__dirname + '/img'));
app.use("/html", express.static(__dirname + '/html'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/style", express.static(__dirname + '/style'));
app.use("/node_modules/socket.io-client/dist/", express.static(__dirname + '/node_modules/socket.io-client/dist/'));

var board = {
    "A1": "wr1",
    "B1": "wn1",
    "C1": "wb1",
    "D1": "wq",
    "E1": "wk",
    "F1": "wb2",
    "G1": "wn2",
    "H1": "wr2",
    "A2": "wp1",
    "B2": "wp2",
    "C2": "wp3",
    "D2": "wp4",
    "E2": "wp5",
    "F2": "wp6",
    "G2": "wp7",
    "H2": "wp8",

    "A8": "br2",
    "B8": "bn2",
    "C8": "bb2",
    "D8": "bq",
    "E8": "bk",
    "F8": "bb1",
    "G8": "bn1",
    "H8": "br1",
    "A7": "bp8",
    "B7": "bp7",
    "C7": "bp6",
    "D7": "bp5",
    "E7": "bp4",
    "F7": "bp3",
    "G7": "bp2",
    "H7": "bp1"
};

var current_board = {};

app.get('/', function(req, res){
	res.redirect('/play?id=' + sha1(req) + '&c=w');
});

app.get('/play', function (req, res) {
    if(req.query.c == 'w'){
        current_board = board;
        res.sendFile(__dirname + '/html/white.html');
    } else {
        res.sendFile(__dirname + '/html/black.html');
    }
});

io.on('connection', function(socket){
	console.log("New connection:\t\t" + socket.id);
    socket.on('move', function(data){
        console.log("socket: move");
        console.log(log(data.piece) + ": [" + data.col + ", " + data.row + "]\n");

        // remove position of old piece
        for(var key in board)
            if(board[key] == data.piece)
                delete board[key];

        // check if takes
        if(board[data.col + data.row] != null){
            data.take = board[data.col + data.row];
        }

        // update position
        board[data.col + data.row] = data.piece;
        io.emit('notify', data);
    });
    
    socket.on('disconnect', function(){
        console.log("Disconnected:\t\t" + socket.id);
    });
});

function log(data) {
    if(data == undefined)
        return "undefined";
    var string = "";
    if(data[0] == 'w'){
        string += "white ";
    } else {
        string += "black ";
    }

    switch(data[1]){
        case 'p':
            string += "pawn "; break;
        case 'r':
            string += "rook "; break;
        case 'n':
            string += "knigth "; break;
        case 'b':
            string += "bishop "; break;
        case 'q':
            string += "queen "; break;
        case 'k':
            string += "king "; break;
    }
    string += data[2];
    return string;
}

http.listen(3000, function(){
    console.log('listening on localhost:3000');
});
