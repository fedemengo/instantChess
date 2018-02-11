var flag = 0, oldData;
// target elements with the "draggable" class
interact('.draggable')

.draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    restrict: {
        restriction: "parent",
        endOnly: true,
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // enable autoScroll
    autoScroll: true,

    // call this function on every dragmove event
    onmove: function (event) {
        // keep the dragged position in the data-x/data-y attributes
        var target = event.target,
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        if(!flag){
            flag = 1;
            oldData = position(target, parseInt(Math.round(x/45)), parseInt(Math.round(y/45)));
        }
    },

    // call this function on every dragend event
    onend: function (event) {
        flag = 0;
        var target = event.target,
            x = Math.round((parseFloat(target.getAttribute('data-x')))/45)*45,
            y = Math.round((parseFloat(target.getAttribute('data-y')))/45)*45;

        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        var data = position(target, parseInt(Math.round(x/45)), parseInt(Math.round(y/45)));

        if(!(data.x == oldData.x && data.y == oldData.y)){
            sendWithSocket("move", {
                pieceID: target.id,
                posX: -x,
                posY: -y,
                row: [oldData.x, data.x],
                col: [oldData.y, data.y]
            });

            Array.from(document.getElementsByClassName("draggable")).forEach(function (entry) {
                var classes = entry.getAttribute('class').split(" ");
                entry.setAttribute("class", "disabled " + classes[1]);
            });
        }
    }
});

function position(target, colSkip, rowSkip){
    target.id[0] == 'b' ? colSkip = -colSkip : rowSkip = -rowSkip;
	return {
		x: parseInt(target.getAttribute('row'))+rowSkip,
		y: String.fromCharCode(target.getAttribute('col').charCodeAt(0)+colSkip)
	};
}
