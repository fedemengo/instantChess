var flag = 0, oldPos, oldData;
// target elements with the 'draggable' class
interact('.draggable')

.draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    restrict: { restriction: 'parent', endOnly: true, elementRect: { top: 0, left: 0, bottom: 1, right: 1 } },
    // enable autoScroll
    autoScroll: true,

    // call this function on every dragmove event
    onmove: function (event) {
        // keep the dragged position in the data-x/data-y attributes
        var target = event.target,
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // update attribute
        target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        // store the original position
        if(!flag){
            flag = 1;
            target.style.zIndex = 6;
            oldPos = { x: Math.round(x/45)*45, y: Math.round(y/45)*45 };
            oldCoords = coordinate(target, parseInt(Math.round(x/45)), parseInt(Math.round(y/45)));
        }
    },

    // call this function on every drag-end event
    onend: function (event) {
        flag = 0;
        var target = event.target,
            x = Math.round((parseFloat(target.getAttribute('data-x')))/45)*45,
            y = Math.round((parseFloat(target.getAttribute('data-y')))/45)*45;

        var coords = coordinate(target, parseInt(Math.round(x/45)), parseInt(Math.round(y/45)));

        console.log('[' + oldPos.x + ', ' + oldPos.y + '] - [' + x + ', ' + y + ']');

        $.post('/validate', { position: coords.y + coords.x, color: target.id[0] }, function(valid){
            if(valid){
                target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);

                if(!(coords.x == oldCoords.x && coords.y == oldCoords.y)){
                    sendWithSocket('move', {
                        pieceID: target.id,
                        posX: -x,
                        posY: -y,
                        row: [oldCoords.x, coords.x],
                        col: [oldCoords.y, coords.y]
                    });

                    Array.from($('.draggable')).forEach(function (entry) {
                        entry.className = 'disabled ' + entry.className.split(' ')[1];
                    });
                }
            } else {
                var Oldx = Math.round(oldPos.x/45)*45, Oldy = Math.round(oldPos.y/45)*45;
                target.style.webkitTransform = target.style.transform = 'translate(' + Oldx + 'px, ' + Oldy + 'px)';
                target.setAttribute('data-x', Oldx);
                target.setAttribute('data-y', Oldy);
            }
        });
        target.style.zIndex = 5;
    }
});

function coordinate(target, colSkip, rowSkip){
    target.id[0] == 'b' ? colSkip = -colSkip : rowSkip = -rowSkip;
	return {
		x: parseInt(target.getAttribute('row')) + rowSkip,
		y: String.fromCharCode(target.getAttribute('col').charCodeAt(0) + colSkip)
	};
}
