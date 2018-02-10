var color = window.location.search.split("c=")[1];
var socket;
$(function () {
    socket = io();
    socket.on("notify", function (data) {

        console.log("[" + data.piece[1].toUpperCase() + data.oldCol.toLowerCase() + data.oldRow + "]");
        console.log("[" + data.col.toLowerCase() + data.row + "]");

        var take = "";
        var elem = document.getElementById(data.piece);
        // update the position attributes
        if (data.piece[0] != color)
            elem.setAttribute("style", "left: " + data.posX + "px; top: " + data.posY + "px;");
        if(data.take){
            take = "x";
            document.getElementById(data.take).setAttribute("style", "visibility: hidden");
        }

        var newMove = data.piece[1].toUpperCase() + data.oldCol.toLowerCase() + data.oldRow + "-" + take + data.col.toLowerCase() + data.row;
        if(data.piece[0] == 'w'){
            jQuery('<li></li>', {
                text: newMove
            }).appendTo('#list');
        } else {
            $('#list').find('li')[$('#list').find('li').length-1].textContent += ", " + newMove;
        }
    });
});
function sendWithSocket(msg, data) {
    socket.emit(msg, data);
}