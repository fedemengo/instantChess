var flag = 0, oldCoords, oldPos, newPos, SQUARE_SIZE = 45;
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
    onmove: function (event) {
        // keep the dragged position in the x/y attributes
        var target = event.target;

		// store the original position
		if(!flag){
			flag = 1;
			target.style.zIndex = "6";
			oldCoords = {
				x: target.style.left.slice(0, -2),
				y: target.style.top.slice(0, -2)
			};
			oldPos = {
				col: target.attributes.col.value,
				row: target.attributes.row.value
			};
			console.log("Init");
			console.log(oldCoords);
			console.log(oldPos);
		}

        var x = (parseFloat(target.getAttribute("x")) || 0) + event.dx,
            y = (parseFloat(target.getAttribute("y")) || 0) + event.dy;

        // update attribute
        target.style.webkitTransform = target.style.transform = "translate(" + x + "px, " + y + "px)";
        target.setAttribute("x", x);
        target.setAttribute("y", y);
    },

    // call this function on every drag-end event
    onend: function (event) {
        flag = 0;
        var target = event.target;

        var x = Math.round((parseFloat(target.getAttribute("x")))/SQUARE_SIZE)*SQUARE_SIZE,
            y = Math.round((parseFloat(target.getAttribute("y")))/SQUARE_SIZE)*SQUARE_SIZE;

        //console.log(x + " " + y);
		newCoords = {
			x: x,
			y: y
		};

        newPos = coord2Pos(target, x/SQUARE_SIZE, y/SQUARE_SIZE, oldPos);

        //console.log("[" + oldPos.row + ", " + oldPos.col + "] - [" + row + ", " + col + "]");
        //console.log(row + " " + col);

		console.log("Final");
		console.log(newPos);
		console.log(newCoords);

        $.post("/validate", {
            oldPos: oldPos,
			newPos: newPos,
			gameID: window.location.search.substr(1).slice(0, -1)
        }, function(valid){
            if(valid.valid){


                target.style.webkitTransform = target.style.transform = "translate(0px, 0px)";
                target.style.left = parseInt(target.style.left.slice(0, -2)) + parseInt(x) + "px";
				target.style.top = parseInt(target.style.top.slice(0, -2)) + parseInt(y) + "px";

				target.setAttribute("row", newPos.row);
                target.setAttribute("col", newPos.col);
				target.setAttribute("x", "0px");
				target.setAttribute("y", "0px");

                sendWithSocket("move", {
                	pieceID: target.id,
                    x: -Math.round(x/SQUARE_SIZE),
                    y: -Math.round(y/SQUARE_SIZE),
                    row: [oldPos.row, newPos.row],
                    col: [oldPos.col, newPos.col],
					moveResult: valid.data
                });

                Array.from($(".draggable")).forEach(function (entry) {
                	entry.classList.add("disabled");
					entry.classList.remove("draggable");
                });
            } else {
				target.style.webkitTransform = target.style.transform = "translate(0px, 0px)";
                target.setAttribute("x", "0px");
                target.setAttribute("y", "0px");
            }
        });
        target.style.zIndex = "5";
    }
});

function coord2Pos(target, x, y, oldPos) {
	target.attributes.color.value === "b" ? x = -x : y = -y;
	return {
		col: String.fromCharCode(oldPos.col.charCodeAt(0) + parseInt(x)),
		row: (parseInt(oldPos.row) + y).toString()
	}
}