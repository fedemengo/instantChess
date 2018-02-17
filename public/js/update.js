var color, socket, colors = {"w": "White", "b": "Black"}, nextMove = {"w": "Black", "b": "White"};
$(function () {
    socket = io();
    socket.on("notify", function (data) {

        console.log("[" + data.pieceID[1].toUpperCase() + data.col[0].toLowerCase() + data.row[0] + "] - ["
            + data.pieceID[1].toUpperCase() + data.col[1].toLowerCase() + data.row[1] + "]");

        var take = "", elem = $("#" + data.pieceID)[0];
        color = String($("#player-color").text()).split(" ")[0];

		// update player turn
        $("#move").text(nextMove[data.pieceID[0]] + " move");

		// if the move is from the other player then update  board
        if (colors[data.pieceID[0]] != color){
            elem.style.left = data.x;
            elem.style.top = data.y;

            // re-enable the possibility to move
            Array.from($(".disabled")).forEach(function (entry) {
                entry.className = "draggable " + entry.className.split(" ")[1];
            });
        }

        // if take hide the taken piece
        if(data.take){
            take = "x";
            $("#" + data.take)[0].style.visibility = "hidden";
        }

        var newMove = data.pieceID[1].toUpperCase() + data.col[0].toLowerCase() + data.row[0] + "-" + take + data.col[1].toLowerCase() + data.row[1];

        // update move listing
        if(colors[data.pieceID[0]] == "White"){
            $("<li></li>", { text: newMove }).appendTo("#list");
        } else {
            $("#list").find("li")[$("#list").find("li").length-1].textContent += ", " + newMove;
        }
    });
});

function sendWithSocket(msg, data) {
    socket.emit(msg, data);
}
