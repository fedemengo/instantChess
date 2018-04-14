var color, socket, nextMove = {"w": "black", "b": "white"}, SQUARE_SIZE = 45;;
$(() => {
    // banner displaying opponent's url
    if (!parseInt(window.location.href.slice(-1))) {
		$("#url").first().text(window.location.href.slice(0, -1) + "1");
    } else {
        $(".alert.alert-info").first().remove();
    }

    socket = io();
    socket.on("notify", res => {
		var move = res.moveResult;
        color = $("#player-color").text().split(" ")[0][0];
        
		// update player turn
        $("#move").text(nextMove[move.color] + " move");
        
		// if the move is from the other player then update  board
        if (move.color !== color){
            var elem = $("div[col='" + move.from[0] + "'][row='" + move.from[1] + "'][color='" + move.color + "']").get(0);
            var left = parseInt($(elem).css("left").slice(0, -2)) + res.x * SQUARE_SIZE;
            var top = parseInt($(elem).css("top").slice(0, -2)) + res.y * SQUARE_SIZE;

            $(elem).attr({
                "style": "left: " + left + "px; top: " + top + "px;",
                "row": move.to[1],
                "col": move.to[0]
            });

			// re-enable the possibility to move
            Array.from($(".disabled")).forEach(entry => {
            	$(entry).removeClass("disabled");
            	$(entry).addClass("draggable");
			});
        }

        // if take hide the taken piece
        var color = (move.color === "w" ? "b" : "w");
        if(move.flags === "c"){
            $("div[col='" + move.to[0] + "'][row='" + move.to[1] + "'][color='" + color + "']").first().remove();
        } else if(move.flags === "e"){
			$("div[col='" + move.to[0] + "'][row='" + move.from[1] + "'][color='" + color + "']").first().remove();
        }

        // update move listing
        if(move.color === "w"){
            $("<li></li>", { text: move.san }).appendTo("#list");
        } else {
            $("#list").find("li").last().append(", " + move.san);
        }
    });
});

sendWithSocket = (msg, data) => {
    socket.emit(msg, data);
}
