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
				x = Math.round(((parseFloat(target.getAttribute('data-x')) || 0) + event.dx)/45)*45,
				y = Math.round(((parseFloat(target.getAttribute('data-y')) || 0) + event.dy)/45)*45;

			target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);

			var rowSkip = parseInt(Math.round(x/45)), colSkip = parseInt(Math.round(y/45));

			if(window.location.search.split("c=")[1] == 'w') colSkip = -colSkip; // WHITE BOARD
			else rowSkip = -rowSkip; // BLACK BOARD

			var currentRow = parseInt(target.getAttribute('row'))+colSkip;
			var currentCol = String.fromCharCode(target.getAttribute('col').charCodeAt(0)+rowSkip);

			console.log("[" + currentCol + ", " + currentRow + "]");

			sendWithSocket("isTake", {
				row: currentRow,
				col: currentCol
			});


			sendWithSocket("move", {
				color: target.id[0],
				piece: target.id,
				posX: -x,
				posY: -y,
				row: currentRow,
				col: currentCol
			});
		}
	});

	function dragMoveListener (event) {
		var target = event.target,
		// keep the dragged position in the data-x/data-y attributes
			x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
			y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		// translate the element
		target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
		// update the position attributes
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;