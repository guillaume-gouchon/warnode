/**
*	Sets the position of an element.
*/
gameSurface.setElementPosition = function (element, x, y) {
	var scenePosition = this.convertGamePositionToScenePosition({x : x, y : y});
	element.position.x = scenePosition.x;
	element.position.y = scenePosition.y;
	element.position.z = scenePosition.z;
}


/**
*	Converts a game position to a scene position.
*	@param : gamePosition = {x: xPosition, y : yPosition}
*	@return : scenePosition = {x : ... , y : ..., z : ...}
*/
gameSurface.convertGamePositionToScenePosition = function (gamePosition) {
	return {
		x : gamePosition.x * this.PIXEL_BY_NODE,
		y : gamePosition.y * this.PIXEL_BY_NODE,
		z : this.getZPositionFromHeightMap(gamePosition)
	}
}


gameSurface.getZPositionFromHeightMap = function (gamePosition) {
	var d = Math.sqrt(this.planeSurface.geometry.vertices.length);
	if (gamePosition.x >= 0 && gamePosition.x < gameContent.map.size.x 
		&& gamePosition.y >= 0 && gamePosition.y < gameContent.map.size.y ) {
			// console.log(this.planeSurface.geometry.vertices[parseInt(d * gamePosition.y / gameContent.map.size.y + d * d * gamePosition.x / gameContent.map.size.x)].z)
		return height[gamePosition.x][gamePosition.y];
		var vertice = this.planeSurface.geometry.vertices[parseInt(d * d * gamePosition.y / gameContent.map.size.y + d * gamePosition.x / gameContent.map.size.x)];
		window.console.log(gamePosition.x, gamePosition.y, vertice.x, vertice.y);
		return this.planeSurface.geometry.vertices[parseInt(d * d * gamePosition.y / gameContent.map.size.y + d * gamePosition.x / gameContent.map.size.x)].z;
	} else {
		return this.planeSurface.position.z;
	}
}


/**
*	Converts a scene position to a game position.
*	@param : scenePosition = {x: xPosition, y : yPosition}
*	@return : gamePosition = {x : ... , y : ...}
*/
gameSurface.convertScenePositionToGamePosition = function (scenePosition) {
	return {
		x : Math.min(gameContent.map.size.x - 1, Math.max(0, parseInt(scenePosition.x / this.PIXEL_BY_NODE))),
		y : Math.min(gameContent.map.size.y - 1, Math.max(0, parseInt(scenePosition.y / this.PIXEL_BY_NODE)))
	}
}

/**
*	Converts a scene position to a game position.
*	@param : scenePosition = {x: xPosition, y : yPosition}
*	@return : gamePosition = {x : ... , y : ...}
*/
gameSurface.convertScenePositionToGamePositionNoBounds = function (scenePosition) {
	return {
		x : Math.min(gameContent.map.size.x - 1, parseInt(scenePosition.x / this.PIXEL_BY_NODE)),
		y : Math.min(gameContent.map.size.y - 1, parseInt(scenePosition.y / this.PIXEL_BY_NODE))
	}
}


/**
*	Draws a selection circle.
*/
gameSurface.drawSelectionCircle = function(radius, color) {
 	var cylinder =  new THREE.Mesh(new THREE.TorusGeometry(radius, 0.2, 2, radius * 20), new THREE.LineBasicMaterial( { color: color, transparent: true, opacity: 0.7 } ));
 	cylinder.id = 'select';
 	cylinder.rotation.x = this.de2ra(90);
	cylinder.scale.x = 2;
	cylinder.scale.y = 2;
	cylinder.scale.z = 2;
	return cylinder;
}


/**
*	Draws a life bar on top of an element.
*/
gameSurface.drawLifeBar = function (element) {
	var elementData = tools.getElementData(element);

	var spriteMaterial = this.materials["billboardBar"].clone();
	var lifeBar = new THREE.Sprite(spriteMaterial);
	lifeBar.position.y = elementData.height * 2;
	lifeBar.scale.set(1, 1, 0);
	lifeBar.id = 'life';

	this.updateLifeBar(lifeBar, element, elementData);
	return lifeBar;
}


/**
*	Adds a life bar on top of element.
*/
gameSurface.addLifeBar = function (element) {
	var lifeBar = this.drawLifeBar(element);
	var model = element.m;
	model.add(lifeBar);
}


/**
*	Updates the life bar color and size.
*/
gameSurface.updateLifeBar = function (lifeBar, element, elementData) {
	var lifeRatio = element.l / elementData.l;
	lifeBar.scale.x = elementData.lifeBarWidth * lifeRatio;
	lifeBar.material.color.setHex(this.getLifeBarColor(lifeRatio));
}

gameSurface.updateProgressBar = function (object, element, elementData) {
	// update progress bar
	var progressBar = null;
	for (var i in object.children) {
		if (object.children[i].id == 'prog') {
			progressBar = object.children[i];
			break;
		}
	}
	if (element.q.length > 0 && element.qp > 0) {
		if (progressBar == null) {
			var spriteMaterial = this.materials["billboardBar"].clone();
			var progressBar = new THREE.Sprite(spriteMaterial);
			progressBar.scale.set(1, .6, 0);
			progressBar.position.y = elementData.height * 2 - 1;
			progressBar.id = 'prog';
			object.add(progressBar);
		}
		progressBar.scale.x = elementData.lifeBarWidth * element.qp / 100;
		progressBar.position.x = - elementData.lifeBarWidth / 4.8 + progressBar.scale.x / 4.8;
	} else {
		// population limit reached message
		if (element.qp >= 99 && gameContent.players[gameContent.myArmy].pop.current == gameContent.players[gameContent.myArmy].pop.max) {
			this.showMessage(this.MESSAGES.popLimitReached);
		} else if (progressBar != null) {
			object.remove(progressBar);
		}
	}
}


/**
*	Updates the target element position.
*/
gameSurface.updateOrderPosition = function () {
	if (gameContent.selected.length > 0) {
		var element = utils.getElementFromId(gameContent.selected[0]);
		if (element == null) { 
			this.order.visible = false;
			return; 
		}

	 	if (element.a != null && (element.a.moveTo != null || element.a.id != null) || element.rp != null) {
			var position = null;
			if (element.rp != null) {
				position = element.rp;
			} else if (element.a.moveTo != null) {
				position = element.a.moveTo;
			} else {
				var target = utils.getElementFromId(element.a.id);
				if (target != null) {
					position = target.p;
				} else {
					this.order.visible = false;
					return;
				}
			}

			this.setElementPosition(this.order, position.x, position.y);
			
			if (this.order.scale.x >= gameSurface.ORDER_SIZE_MAX) {
				gameSurface.orderFactor = -1;
			} else if (this.order.scale.x <= gameSurface.ORDER_SIZE_MIN){
				gameSurface.orderFactor = 1;
			}
			this.order.scale.x += this.ORDER_ANIMATION_SPEED * gameSurface.orderFactor;
			this.order.scale.y += this.ORDER_ANIMATION_SPEED * gameSurface.orderFactor;
			this.order.visible = true;
		}  else if (this.order.visible) {
			this.order.visible = false;
		}
	} else if (this.order.visible) {
		this.order.visible = false;
	}
}


/**
*	The user is drawing a selection rectangle.
*/
gameSurface.updateSelectionRectangle = function (x1, y1, x2, y2) {
	var dx = Math.abs(x1 - x2);
	var dy = Math.abs(y1 - y2);
	if (dx > 0 &&  dy > 0) {
		$('#selectionRectangle').css({
			'top' : Math.min(y1, y2),
			'left': Math.min(x1, x2),
			'width': dx,
			'height': dy
		});
		$('#selectionRectangle').removeClass('hide');
	} else {
		$('#selectionRectangle').addClass('hide');
	}
}


/**
*	Converts degree to radians.
*/
gameSurface.de2ra = function(degree) {
	return degree * (Math.PI / 180);
}


/**
*	The user selected an element.
*/
gameSurface.selectElement = function (elementId) {
	var element = utils.getElementFromId(elementId);
	if (element != null) {
		var model = element.m;
		var elementData = tools.getElementData(element);
		var color;
		if (rank.isEnemy(gameContent.players, gameContent.myArmy, element)) {
			color = this.SELECTION_ENEMY_COLOR;
		} else if (rank.isAlly(gameContent.players, gameContent.myArmy, element)) {
			color = this.SELECTION_ALLY_COLOR;
		} else {
			color = this.SELECTION_NEUTRAL_COLOR;
		}
		model.add(this.drawSelectionCircle((elementData.f != gameData.FAMILIES.unit ? 1.5 : 1) * elementData.shape.length / 2 * this.PIXEL_BY_NODE / 2, color));
	}
}


/**
*	The user unselected an element.
*/
gameSurface.unselectElement = function (elementId) {
	try {
		var model = utils.getElementFromId(elementId).m;
		var index = model.children.length;
		while (index --) {
			var child = model.children[index];
			if (child.id == 'select') {
				model.remove(child);
			}
		}
	} catch (e) {
	}
}


/**
*	The user unselected all the selected elements.
*/
gameSurface.unselectAll = function () {
	for (var i in gameContent.selected) {
		this.unselectElement(gameContent.selected[i]);
	}
}


/**
*	Updates unit orientation depending on movement.
*/
gameSurface.updateOrientation = function (d, dx, dy) {
	if (dx == 0 && dy < 0) {
		d.rotation.y = this.de2ra(270);
	} else if (dx > 0 && dy < 0) {
		d.rotation.y = this.de2ra(315);
	} else if (dx > 0 && dy == 0) {
		d.rotation.y = this.de2ra(0);
	} else if (dx > 0 && dy > 0) {
		d.rotation.y = this.de2ra(45);
	} else if (dx == 0 && dy > 0) {
		d.rotation.y = this.de2ra(90);
	} else if (dx < 0 && dy > 0) {
		d.rotation.y = this.de2ra(135);
	} else if (dx < 0 && dy == 0) {
		d.rotation.y = this.de2ra(180);
	} else if (dx < 0 && dy < 0) {
		d.rotation.y = this.de2ra(225);
	}
	d.rotation.y += this.de2ra(90);
}


/**
*	Updates the building geometry.
*/
gameSurface.updateBuildingGeometry = function () {	
	for (var i in this.building.children) {
		this.building.children[i].visible = false;
	}
	var shape = gameContent.building.shape;
	for (var i in shape) {
		for (var j in shape) {
			var material;
			if (shape[i][j] == userInput.CAN_BE_BUILT_HERE) {
				material = this.canBuildHereMaterial;
			} else if (shape[i][j] == userInput.CANNOT_BE_BUILT_HERE) {
				material = this.cannotBuildHereMaterial;
			} else {
				continue;
			}
			var index = i * this.BUILDING_STRUCTURE_SIZE + parseInt(j);
			this.building.children[index].material = material;
			this.building.children[index].visible = true;
		}
	}
	this.setElementPosition(this.building, gameContent.building.p.x - parseInt(shape.length / 2), gameContent.building.p.y - parseInt(shape.length / 2));
	this.building.visible = true;
}


/**
*	Hides the building geometry.
*/
gameSurface.removeBuildingGeometry = function () {
	for (var i in this.building.children) {
		this.building.children[i].visible = false;
	}
	this.building.visible = false;
}


/**
*	Animates the selection circle of an element.
*/
gameSurface.animateSelectionCircle = function (elementId) {
	this.selectElement(elementId);
	var model = utils.getElementFromId(elementId).m;
	var target;
	for (var i in model.children) {
		if (model.children[i].id == 'select') {
			target = model.children[i];
			break;
		}
	}
	var tweenFadeIn = new TWEEN.Tween({alpha:1}).delay(300).to({alpha:0}, 300)
	.onComplete(function () {
		target.visible = false;
	}).start();
	var tweenFadeOut = new TWEEN.Tween({alpha:0}).to({alpha:1}, 300)
	.onComplete(function () {
		target.visible = true;
	});
	var tweenFadeOut2 = new TWEEN.Tween({alpha:0}).to({alpha:1}, 500)
	.onComplete(function () {
		gameSurface.unselectElement(elementId);
	});
	tweenFadeIn.chain(tweenFadeOut);
	tweenFadeOut.chain(tweenFadeOut2);
}


/**
*	Returns the color of the life bar.
*/
gameSurface.getLifeBarColor = function (lifeRatio) {
	if (lifeRatio < 0.25) {
		return 0xcc0000;
	} else if (lifeRatio < 0.5) {
		return 0xFF7700;
	} else if (lifeRatio < 0.75) {
		return 0xFFE100;
	} else {
		return 0x299a0b;
	}
}
/**
*	Returns the color of the life bar.
*/
gameSurface.getLifeBarBackgroundColor = function (lifeRatio) {
	if (lifeRatio < 0.25) {
		return 'lowLife';
	} else if (lifeRatio < 0.5) {
		return 'mediumLife';
	} else if (lifeRatio < 0.75) {
		return 'highLife';
	} else {
		return 'veryHighLife';
	}
}



/**
*	List of messages that can be displayed during the game.
*/
gameSurface.MESSAGES = {
	popLimitReached : {
		id : 0, text : 'You need more houses'
	},
	musicEnabled : {
		id : 1, text : 'Music enabled'
	},
	musicDisabled : {
		id : 2, text : 'Music disabled'
	}
};


/**
*	Shows a message then disappear.
*/
gameSurface.showMessage = function (message, color) {
	$('#messages').removeClass('hide');
	var date = new Date();
	$('#messages').append('<div>' + date.getHours() + ':' + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0':'') + date.getSeconds() + '<span class="' + (color == null ? 'white': color) + '">' + message.text + '</span></div>')
				.scrollTop(10000);
}


/**
*	Initializes movement extrapolation for one unit.
*/
gameSurface.extrapol = function (model, dx, dy, dz) {
	model.ex = dx;
	model.ey = dy;
	model.ez = dz;
	model.et = this.MOVEMENT_EXTRAPOLATION_ITERATION;
	this.ex.push(model);
}


/**
*	Extrapolates units' movement.
*/
gameSurface.updateMoveExtrapolation = function () {
	var index = this.ex.length;
	while (index --) {
		var model = this.ex[index];
		var element = utils.getElementFromId(model.elementId);
		model.position.x += model.ex * this.PIXEL_BY_NODE / this.MOVEMENT_EXTRAPOLATION_ITERATION;
		model.position.y += model.ey * this.PIXEL_BY_NODE / this.MOVEMENT_EXTRAPOLATION_ITERATION;
		model.position.z += model.ez / this.MOVEMENT_EXTRAPOLATION_ITERATION;

		model.et -= 1;

		if (model.et <= 0 && element != null) {
			this.setElementPosition(model, element.p.x, element.p.y);
			model.et = 0;
			model.ex = 0;
			model.ey = 0;
			model.ez = 0;
			this.ex.splice(index, 1);
		}
	}
}
