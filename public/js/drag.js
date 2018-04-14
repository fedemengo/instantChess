var flag = 0, oldCoords, oldPos, newCoords, newPos, SQUARE_SIZE = 45;
// target elements with the "draggable" class
interact(".draggable")

.draggable({
    // enable inertial throwing
    //inertia: true,
    // keep the element within the area of it's parent
    restrict: { restriction: "parent", endOnly: true, elementRect: { top: 0, left: 0, bottom: 1, right: 1 } },
    // enable autoScroll
    autoScroll: true,
    // call this function on every dragmove event
    onmove: event => {
        var target = event.target;
		// store the original position
		if(!flag){
            flag = 1;
            $(target).css({"zIndex": "6"});
            
			oldCoords = { 
                "x": $(target).css("left").slice(0, -2), 
                "y": $(target).css("top").slice(0, -2)
            };

			oldPos = { 
                "col": $(target).attr("col"), 
                "row": $(target).attr("row")
            };
			//console.log(oldCoords);
			console.log(oldPos);
		}
        var x = (parseFloat($(target).attr("x")) || 0) + event.dx,
            y = (parseFloat($(target).attr("y")) || 0) + event.dy;

        // update attribute
        $(target).css({
            "webkitTransform": "translate(" + x + "px, " + y + "px)",
            "transform": "translate(" + x + "px, " + y + "px)"
        });

        $(target).attr({ 
            "x": x, 
            "y": y 
        });
    },
    // call this function on every drag-end event
    onend: event => {
        flag = 0;
        var target = event.target;
        var x = Math.round((parseFloat($(target).attr("x"))) / SQUARE_SIZE) * SQUARE_SIZE,
            y = Math.round((parseFloat($(target).attr("y"))) / SQUARE_SIZE) * SQUARE_SIZE;

        newCoords = { 
            "x": x, 
            "y": y 
        };

        var dx = x, dy = y; 
        $(target).attr("color") === "b" ? dx = -dx : dy = -dy;
        newPos = {
            "col": String.fromCharCode(oldPos.col.charCodeAt(0) + parseInt(dx / SQUARE_SIZE)),
            "row": (parseInt(oldPos.row) + (dy / SQUARE_SIZE)).toString()
        };

		//console.log(newCoords);
		console.log(newPos);

        $.post("/validate", {
            oldPos: oldPos,
			newPos: newPos,
			gameID: window.location.search.substr(1).slice(0, -1)
        }, res => {
            if(res.valid){
                $(target).css({
                    "webkitTransform": "translate(0px, 0px)",
                    "transform": "translate(0px, 0px)",
                    "left": parseInt($(target).css("left").slice(0, -2)) + parseInt(x) + "px",
                    "top": parseInt($(target).css("top").slice(0, -2)) + parseInt(y) + "px"
                });
                
                $(target).attr({
                    "row": newPos.row,
                    "col": newPos.col,
                    "x": "0px",
                    "y": "0px"
                });

                sendWithSocket("move", {
                	"pieceID": target.id,
                    "x": - Math.round(x / SQUARE_SIZE),
                    "y": - Math.round(y / SQUARE_SIZE),
                    "row": [oldPos.row, newPos.row],
                    "col": [oldPos.col, newPos.col],
					"moveResult": res.data
                });

                Array.from($(".draggable")).forEach((entry) => {
                	$(entry).addClass("disabled");
					$(entry).removeClass("draggable");
                });
            } else {
                $(target).css({
                    "webkitTransform": "translate(0px, 0px)",
                    "transform": "translate(0px, 0px)"
                });
                
                $(target).attr({ 
                    "x": "0px",
                    "y": "0px" 
                });
            }
        });
        $(target).css({"zIndex": "5"});
    }
});
