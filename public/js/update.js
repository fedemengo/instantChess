var color, socket, colors = {"w": "white", "b": "black"}, nextMove = {"w": "black", "b": "white"};
$(function () {
	$("#url")[0].text = window.location.href.slice(0, -1) + "1";
    socket = io();
    socket.on("notify", function (data) {

		var result = data.moveResult;
        var elem = document.querySelectorAll("div[col='" + result.from[0] + "'][row='" + result.from[1] + "'][color='" + result.color + "']")[0];
        color = String($("#player-color").text()).split(" ")[0][0];

		// update player turn
        $("#move").text(nextMove[result.color] + " move");

		// if the move is from the other player then update  board
        if (result.color !== color){

            elem.style.left = String(parseInt(elem.style.left.slice(0, -2)) + parseInt(String(data.x*45)));
            elem.style.top = String(parseInt(elem.style.top.slice(0, -2)) + parseInt(String(data.y*45)));

			elem.setAttribute("row", result.to[1]);
			elem.setAttribute("col", result.to[0]);

			// re-enable the possibility to move
            Array.from($(".disabled")).forEach(function (entry) {
            	entry.classList.remove("disabled");
            	entry.classList.add("draggable");
			});
        }

        // if take hide the taken piece
        if(result.flags === "c"){
            var color = (result.color === "w" ? "b" : "w");
			document.querySelectorAll("div[col='" + result.to[0] + "'][row='" + result.to[1] + "'][color='" + color + "']")[0].style.visibility = "hidden";
        } else if(result.flags === "e"){
			var color = (result.color === "w" ? "b" : "w");
			document.querySelectorAll("div[col='" + result.to[0] + "'][row='" + result.from[1] + "'][color='" + color + "']")[0].style.visibility = "hidden";
		}

        // update move listing
        if(colors[result.color] === "white"){
            $("<li></li>", { text: result.san }).appendTo("#list");
        } else {
            $("#list").find("li")[$("#list").find("li").length-1].textContent += ", " + result.san;
        }
    });
});

function sendWithSocket(msg, data) {
    socket.emit(msg, data);
}
