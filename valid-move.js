function compareTo(a, b){
    return (a < b ? 1 : a > b ? -1 : 0);
}

var validMove = {
    pawn: function (board, pieceID, from, to) {
        var dist = 1;
        if(!board.firstMove.has(pieceID)){
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
    },
    rook: function (board, pieceID, from, to) {
        if(from.col != to.col && from.row != to.row) {
            return false;
        }
        return validMove.longMove(board, from, to);
    },
    knight: function (from, to) {
        var moveX = Math.abs(from.row-to.row);
        var moveY = Math.abs(from.col.charCodeAt(0)-to.col.charCodeAt(0));
        return ((moveX == 2 && moveY == 1) || (moveX == 1 && moveY == 2));
    },
    bishop: function (board, pieceID, from, to) {
        var fromCol = from.col.charCodeAt(0), toCol = to.col.charCodeAt(0);
        if(from.col == to.col || from.row == to.row || Math.abs(fromCol-toCol) != Math.abs(from.row-to.row)) {
            return false;
        }
        return validMove.longMove(board, from, to);
    },
    queen: function (board, pieceID, from, to) {
        return validMove.rook(board, pieceID, from, to) || validMove.bishop(board, pieceID, from, to);
    },
    longMove: function (board, from, to){
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
};
module.exports = validMove;