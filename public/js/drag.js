var flag = 0, oldPos, oldCoords;
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
        // keep the dragged position in the data-x/data-y attributes
        var target = event.target,
            row = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
            col = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

        // update attribute
        target.style.webkitTransform = target.style.transform = "translate(" + row + "px, " + col + "px)";
        target.setAttribute("data-x", row);
        target.setAttribute("data-y", col);

        // store the original position
        if(!flag){
            flag = 1;
            target.style.zIndex = 6;
            oldPos = { row: Math.round(row/45)*45, col: Math.round(col/45)*45 };
            oldCoords = coordinate(target, Math.round(row/45), Math.round(col/45));
        }
    },

    // call this function on every drag-end event
    onend: function (event) {
        flag = 0;
        var target = event.target,
            row = Math.round((parseFloat(target.getAttribute("data-x")))/45)*45,
            col = Math.round((parseFloat(target.getAttribute("data-y")))/45)*45;

        var coords = coordinate(target, Math.round(row/45), Math.round(col/45));

        console.log("[" + oldPos.row + ", " + oldPos.col + "] - [" + row + ", " + col + "]");

        $.post("/validate", {
            pieceID: target.id,
            oldCoords: oldCoords,
            newCoords: coords
        }, function(valid){
            if(valid){
                target.style.webkitTransform = target.style.transform = "translate(" + row + "px, " + col + "px)";
                target.setAttribute("data-x", row);
                target.setAttribute("data-y", col);

                sendWithSocket("move", {
                    pieceID: target.id,
                    x: -row,
                    y: -col,
                    row: [oldCoords.row, coords.row],
                    col: [oldCoords.col, coords.col]
                });

                Array.from($(".draggable")).forEach(function (entry) {
                    entry.className = "disabled " + entry.className.split(" ")[1];
                });
            } else {
                // move the piece to its original position
                target.style.webkitTransform = target.style.transform = "translate(" + oldPos.row + "px, " + oldPos.col + "px)";
                target.setAttribute("data-x", oldPos.row);
                target.setAttribute("data-y", oldPos.col);
            }
        });
        target.style.zIndex = 5;
    }
});

function coordinate(target, colSkip, rowSkip){
    target.id[0] == "b" ? colSkip = -colSkip : rowSkip = -rowSkip;
	return {
		row: parseInt(target.getAttribute("row")) + rowSkip,
		col: String.fromCharCode(target.getAttribute("col").charCodeAt(0) + colSkip)
	};
}
