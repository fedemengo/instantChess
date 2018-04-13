var color, socket, nextMove = {"w": "black", "b": "white"}, SQUARE_SIZE = 45;;
$(() => {
    // banner displaying opponent's url
    if(!parseInt(window.location.href.slice(-1)))
		$("#url").first().text(window.location.href.slice(0, -1) + "1");
	else
        $(".alert.alert-info").first().remove();

    socket = io();
    socket.on("notify", (data) => {

		var result = data.moveResult;
        color = $("#player-color").text().split(" ")[0][0];
        
		// update player turn
        $("#move").text(nextMove[result.color] + " move");
        
		// if the move is from the other player then update  board
        if (result.color !== color){
            var elem = $("div[col='" + result.from[0] + "'][row='" + result.from[1] + "'][color='" + result.color + "']").get(0);
            var left = parseInt($(elem).css("left").slice(0, -2)) + data.x * SQUARE_SIZE;
            var top = parseInt($(elem).css("top").slice(0, -2)) + data.y * SQUARE_SIZE;

            $(elem).attr({
                "style": "left: " + left + "px; top: " + top + "px;",
                "row": result.to[1],
                "col": result.to[0]
            });

			// re-enable the possibility to move
            Array.from($(".disabled")).forEach(entry => {
            	entry.classList.remove("disabled");
            	entry.classList.add("draggable");
			});
        }

        // if take hide the taken piece
        if(result.flags === "c"){
            var color = (result.color === "w" ? "b" : "w");
            $("div[col='" + result.to[0] + "'][row='" + result.to[1] + "'][color='" + color + "']").first().attr({
                "style": "visibility: hidden;",
                "row": "-1",
                "col": "-1" 
            });
        } else if(result.flags === "e"){
			var color = (result.color === "w" ? "b" : "w");
            $("div[col='" + result.to[0] + "'][row='" + result.from[1] + "'][color='" + color + "']").first().attr({
                "style": "visibility: hidden;",
                "row": "-1",
                "col": "-1" 
            });    
        }

        // update move listing
        if(result.color === "w"){
            $("<li></li>", { text: result.san }).appendTo("#list");
        } else {
            $("#list").find("li")[$("#list").find("li").length-1].textContent += ", " + result.san;
        }
    });
});

sendWithSocket = (msg, data) => {
    socket.emit(msg, data);
}
