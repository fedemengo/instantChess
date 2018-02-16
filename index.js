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
    "E7": "bp4", "F7": "bp3", "G7": "bp2", "H7": "bp1",
    firstMove: {}
}, current_board = {};

var boards = {};

//###################### REQUESTS ###############################

app.get('/', function(req, res){
	res.redirect('/play?id=' + String(sha1(JSON.stringify(req.headers))).substring(0, 15) + '&c=w');
});

app.get('/play', function (req, res) {
    if(req.query.c == "w"){
        current_board = Object.assign({}, board);
        current_board.firstMove = new Set();
        res.render('white');
    } else {
        res.render('black');
    }
});

app.post('/validate', function (req, res) {
    console.log("attempt to move to " + req.body.newCoords.col + req.body.newCoords.row);
    validatePosition(current_board, req.body.pieceID, req.body.oldCoords, req.body.newCoords, function (isValid) {
        console.log((isValid ? "valid move" : "not valid move") + "\n");
        res.send(isValid);
    });
});

io.on('connection', function(socket){
	console.log("Connection:\t\t" + socket.id);
    socket.on('move', function(data){
        //console.log(data);

        // remove position of old piece
        for(var key in current_board) {
            if (current_board[key] == data.pieceID) {
                delete current_board[key];
            }
        }

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

http.listen(3000, function(){
    console.log('listening on localhost:3000');
});

//###################### UTILITY FUNCTIONS ###############################

function parse(pieceID) {
    var string = "";
    switch(pieceID[0]){
        case 'w': string += "White"; break;
        case 'b': string += "Black"; break;
    }
    switch(pieceID[1]){
        case 'p': string += "pawn"; break;
        case 'r': string += "rook"; break;
        case 'n': string += "knigth"; break;
        case 'b': string += "bishop"; break;
        case 'q': string += "queen"; break;
        case 'k': string += "king"; break;
    }
    return string;
}

function compareTo(a, b){
    return (a < b ? 1 : a > b ? -1 : 0);
}

function validatePosition(board, pieceID, from, to, callback) {
    var result = true;

    // if there is a piece of the same color, no piece can move there
    if(board[to.col + to.row] && board[to.col + to.row][0] == pieceID[0]){
        result = false;
    }
    // if move to the same square, then don't move at all
    if(from.col == to.col && from.row == to.row){
        result = false;
    }

    console.log(from);
    console.log(to);

    switch(pieceID[1]){
        case 'p':
            result = result && pawn(board, pieceID, from, to); break;
        case 'r':
            result = result && rook(board, pieceID, from, to); break;
        case 'n':
            result = result && knight(from, to); break;
        case 'b':
            result = result && bishop(board, pieceID, from, to); break;
        case 'q':
            result = result && (rook(board, pieceID, from, to) || bishop(board, pieceID, from, to));
        case 'k':
            break;
    }

    // check if King is in check

    if(result){
        current_board.firstMove.add(pieceID);
    }
    callback(result);
}

//###################### MOVES ###############################

function pawn(board, pieceID, from, to) {
    var dist = 1;
    if(!current_board.firstMove.has(pieceID)){
        dist = 2;
    }
    if(from.col == to.col){
        if(pieceID[0] == 'w'){
            if(to.row - from.row > dist || to.row - from.row < 0 || board[to.col + to.row]){
                return false;
            }
        } else {
            if(from.row - to.row > dist || from.row - to.row < 0 || board[to.col + to.row]){
                return false;
            }
        }
    } else if(from.col != to.col) {
        if (pieceID[0] == 'w') {
            if (to.row - from.row != 1) {
                return false;
            }
        } else if(pieceID[0] == 'b'){
            if (from.row - to.row != 1) {
                return false;
            }
        }
        if((!board[to.col + to.row]) || (board[to.col + to.row] && board[to.col + to.row][0] == pieceID[0])) {
            return false;
        }
    }
    return true;
}

function rook(board, pieceID, from, to) {
    if(from.col != to.col && from.row != to.row) {
        return false;
    }
    return longMove(board, from, to);
}

function knight(from, to) {
    var moveX = Math.abs(from.row-to.row);
    var moveY = Math.abs(from.col.charCodeAt(0)-to.col.charCodeAt(0));
    return ((moveX == 2 && moveY == 1) || (moveX == 1 && moveY == 2));
}

function bishop(board, pieceID, from, to) {
    var fromCol = from.col.charCodeAt(0), toCol = to.col.charCodeAt(0);
    if(from.col == to.col || from.row == to.row || Math.abs(fromCol-toCol) != Math.abs(from.row-to.row)) {
        return false;
    }
    return longMove(board, from, to);
}

function longMove(board, from, to){
    var incY = compareTo(from.col, to.col), incX = compareTo(from.row, to.row);
    var minY = from.col.charCodeAt(0), maxY = to.col.charCodeAt(0);
    var minX = from.row, maxX = to.row;

    for(var i=minY+incY, j=parseInt(minX)+incX; i!=maxY || j!=maxX; i+=incY, j+=incX){
        //console.log(String.fromCharCode(i) + j);
        if(board[String.fromCharCode(i) + j]) {
            return false;
        }
    }
    return true;
}