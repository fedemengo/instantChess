var color, socket, colors = {"w": "white", "b": "black"}, nextMove = {"w": "Black", "b": "White"};
$(function () {
	var current_url = window.location.href;
	$("#url").text(current_url.substr(0, current_url.length-1) + '1');
    socket = io();
    socket.on("notify", function (data) {

		var result = data.moveResult;
        var elem = document.querySelectorAll("div[col='" + result.from[0] + "'][row='" + result.from[1] + "'][color='" + result.color + "']")[0];
        color = String($("#player-color").text()).split(" ")[0][0];

		// update player turn
        $("#move").text(nextMove[result.color] + " move");

		// if the move is from the other player then update  board
        if (result.color != color){
			console.log("MOVE");

            elem.style.left = parseInt(elem.style.left.slice(0, -2)) + parseInt(data.x*45);
            elem.style.top = parseInt(elem.style.top.slice(0, -2)) + parseInt(data.y*45);

			elem.setAttribute("row", result.to[1]);
			elem.setAttribute("col", result.to[0]);

			// re-enable the possibility to move
            Array.from($(".disabled")).forEach(function (entry) {
                entry.className = "draggable " + entry.className.split(" ").splice(1).reduce((a, b) => a + " " + b);
            });
        } else {
			console.log("DONT MOVE");
        }

        // if take hide the taken piece
        if(result.flags === "c"){
            var color = result.color == "w" ? "b" : "w";
			document.querySelectorAll("div[col='" + result.to[0] + "'][row='" + result.to[1] + "'][color='" + color + "']")[0].style.visibility = "hidden";
        }

        var newMove = result.san;

        // update move listing
        if(colors[result.color] === "white"){
            $("<li></li>", { text: newMove }).appendTo("#list");
        } else {
            $("#list").find("li")[$("#list").find("li").length-1].textContent += ", " + newMove;
        }
    });
});

function sendWithSocket(msg, data) {
    socket.emit(msg, data);
}
