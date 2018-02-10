var flag = 0;
var initPos;
var oldData;
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
		onmove: dragMoveListener,

		// call this function on every dragend event
		onend: function (event) {
			var target = event.target,
				x = Math.round((parseFloat(target.getAttribute('data-x')))/45)*45,
				y = Math.round((parseFloat(target.getAttribute('data-y')))/45)*45;

			target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);

			var data = position(target, parseInt(Math.round(x/45)), parseInt(Math.round(y/45)));
			flag = 0;

			sendWithSocket("move", {
				piece: target.id,
				posX: -x,
				posY: -y,
				row: data.x,
				col: data.y,
				oldRow: oldData.x,
				oldCol: oldData.y
			});

			Array.from(document.getElementsByClassName("draggable")).forEach(function (entry) {
				var classes = entry.getAttribute('class').split(" ");
				entry.setAttribute("class", "disabled " + classes[1]);
			});

			//for(var entry in draggables){
				//var classes = entry.getAttribute('class').split(" ");
				//
			//}
		}
	});

	function dragMoveListener (event) {
		var target = event.target;

		// keep the dragged position in the data-x/data-y attributes
		var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
			y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		if(!flag){
			flag = 1;
			oldData = position(target,
				parseInt(Math.round((Math.round(x/45)*45)/45)),
				parseInt(Math.round((Math.round(y/45)*45)/45))
			);
		}

		// translate the element
		target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
		// update the position attributes
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;

function position(target, colSkip, rowSkip){
	if(window.location.search.split("c=")[1] == 'b')
		colSkip = -colSkip; // WHITE BOARD
	else
		rowSkip = -rowSkip; // BLACK BOARD
	return {
		x: parseInt(target.getAttribute('row'))+rowSkip,
		y: String.fromCharCode(target.getAttribute('col').charCodeAt(0)+colSkip)
	};
}