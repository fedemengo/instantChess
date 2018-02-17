function compareTo(a, b){
    return (a < b ? 1 : a > b ? -1 : 0);
}

var validMove = {
    pawn: function (board, pieceID, from, to) {
        var dist = board.firstMove.has(pieceID) ? 1 : 2;
        var movementDist = (pieceID[0] == 'w' ? to.row - from.row : from.row - to.row);

        // move forward - don't take OR move diagonal - attempt take
        if(from.col == to.col){
            // position is empty AND moved forward of right amount - IS NOT VALID
            return !board[to.col + to.row] && movementDist > 0 && movementDist < dist;
        } else {   /*|| board[to.col + to.row][0] == pieceID[0]*/
            // row diagonal movement is exactly 1 AND position is not empty, the piece is not of same color (already checked for every piece)
            return movementDist == 1 && board[to.col + to.row];
        }
    },
    rook: function (board, pieceID, from, to) {
        // the move is potentially valid, check if there piece in the middle of the movement
        return (from.col == to.col || from.row == to.row) && validMove.longMove(board, from, to);
    },
    knight: function (from, to) {
        var moveX = Math.abs(parseInt(from.row)-parseInt(to.row));
        var moveY = Math.abs(from.col.charCodeAt(0)-to.col.charCodeAt(0));
        // move should be a L
        return (moveX == 2 && moveY == 1) || (moveX == 1 && moveY == 2);
    },
    bishop: function (board, pieceID, from, to) {
        var moveX = Math.abs(parseInt(from.row)-parseInt(to.row));
        var moveY = Math.abs(from.col.charCodeAt(0) - to.col.charCodeAt(0));
        // the move is potentially valid, check if there piece in the middle of the movement
        return moveX == moveY && validMove.longMove(board, from, to);
    },
    queen: function (board, pieceID, from, to) {
        return validMove.rook(board, pieceID, from, to) || validMove.bishop(board, pieceID, from, to);
    },
    longMove: function (board, from, to){
        var incY = compareTo(from.col, to.col), incX = compareTo(from.row, to.row);
        var minY = from.col.charCodeAt(0), maxY = to.col.charCodeAt(0);
        var minX = parseInt(from.row), maxX = parseInt(to.row);

        for(var i=minY+incY, j=minX+incX; i!=maxY || j!=maxX; i+=incY, j+=incX){
            console.log(String.fromCharCode(i) + j);
            if(board[String.fromCharCode(i) + j]) {
                return false;
            }
        }
        return true;
    }
};
module.exports = validMove;
