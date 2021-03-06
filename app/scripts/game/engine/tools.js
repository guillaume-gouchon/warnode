var tools = {};


/**
*	Returns the distance between two positions.
*/
tools.getPositionsDistance = function (position1, position2) {
	return Math.max(Math.abs(position1.x - position2.x), Math.abs(position1.y - position2.y));
}


/**
*	Returns the distance between two elements (including shapes).
*/
tools.getElementsDistance = function (element1, element2) {
	var min = 10000;
	if(element2 != null) {
		var elementData = tools.getElementData(element2);
		var shape = elementData.shape;
		for(var i in shape) {
			for(var j in shape[i]) {
				var distance = this.getPositionsDistance(element1.p, this.getPartPosition(element2, i, j));
				if(distance < min) {
					min = distance;
				}
				if(min == 1) {
					return min;
				}
			}
		}
	}

	return min;
}


/**
*	Returns the closest part position from element 2 to element 1.
*/
tools.getClosestPart = function (element1, element2) {
	var min = 10000;
	var closest;
	var elementData = tools.getElementData(element2);
	var shape = elementData.shape;
	for(var i in shape) {
		for(var j in shape[i]) {
			var distance = this.getPositionsDistance(element1.p, this.getPartPosition(element2, i, j));
			if(distance < min) {
				min = distance;
				closest = this.getPartPosition(element2, i, j);
			}
			if(min == 1) {
				return closest;
			}
		}
	}

	return closest;
}


/**
*	Returns the position of an element's part.
*/
tools.getPartPosition = function (element, i, j) {
	var shape = null;
	if(element.shape == null) {
		var elementData = tools.getElementData(element);
		shape = elementData.shape;
	} else {
		shape = element.shape;
	}
	return {
		x : parseInt(element.p.x + parseInt(i) - parseInt(shape[0].length / 2)),
		y : parseInt(element.p.y + parseInt(j) - parseInt(shape.length / 2))
	}
}


/**
*	Returns closest free tiles around the element.
*/
tools.getFreeTilesAroundElements = function (game, element) {
	var array = [];
	var elementData = tools.getElementData(element);
	var shape = elementData.shape;
	for(var i in shape) {
		for(var j in shape[i]) {
			if(shape[i][j] > 0) {
				var partPosition = this.getPartPosition(element, i, j);
				var neighbors = this.getNeighbors(game.grid, partPosition.x, partPosition.y);
				for(var n in neighbors) {
					var neighbor = neighbors[n];
					if(game.grid[neighbor.x][neighbor.y].c == 0) {
						array.push({x : neighbor.x, y : neighbor.y});
					}
				}
			}		
		}
	}
	return array;
}


/**
*	Returns neighbors.
*/
tools.getNeighbors = function (grid, x, y) {
	 var ret = [];

	// West
	if(grid[x-1] && grid[x-1][y] != null) {
		ret.push({x: x-1, y: y});
	}

	// East
	if(grid[x+1] && grid[x+1][y] != null) {
		ret.push({x: x+1, y: y});
	}

	// South
	if(grid[x] && grid[x][y-1] != null) {
		ret.push({x: x, y: y-1});
	}

	// North
	if(grid[x] && grid[x][y+1] != null) {
		ret.push({x: x, y: y+1});
	}

	// Southwest
	if(grid[x-1] && grid[x-1][y-1] != null) {
  		ret.push({x: x-1, y: y-1});
	}

	// Southeast
	if(grid[x+1] && grid[x+1][y-1] != null) {
		ret.push({x: x+1, y: y-1});
	}

	// Northwest
	if(grid[x-1] && grid[x-1][y+1] != null) {
		ret.push({x: x-1, y: y+1});
	}

	// Northeast
	if(grid[x+1] && grid[x+1][y+1] != null) {
		ret.push({x: x+1, y: y+1});
	}

	return ret;
}

/**
*	Returns the game elements from their ids.
*/
tools.getGameElementsFromIds = function (game, ids) {
	var elements = [];
	for (var i in ids) {
		elements.push(game.gameElements[Object.keys(gameData.FAMILIES)[('' + ids[i]).charAt(1)]][ids[i]]);
	}
	return elements;
}


/**
*	Adds an element to a set of unique elements.
*/
tools.addUniqueElementToArray = function (array, element) {
	var index = array.indexOf(element);
	if (index == -1) {		
		array.push(element);
	}
}


/**
*	Copies an object and avoids circular structure.
*/
tools.clone = function (obj) {
    var copy = {};
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr) && attr != 'a') copy[attr] = obj[attr];
    }
    return copy;
}


/**
*	Returns the nearest specified element.
*/
tools.getNearestStuff = function (game, fromElement, family, type, rank, noLimit) {

	var nearestStuff = null;

	if (!noLimit) {// search within the limit of the element's vision

		var distance = 0;
		var elementData = tools.getElementData(fromElement);

		do {
			distance ++;
			nearestStuff = tools.searchInTiles(game, this.getTilesAround(game.grid, fromElement.p, distance, false), fromElement, family, type, rank);
		} while (nearestStuff == null && distance < elementData.vision);
	
	} else {// search anywhere

		var min = 1000;
		for (var i in game.gameElements[Object.keys(gameData.FAMILIES)[family]]) {
			var element = game.gameElements[Object.keys(gameData.FAMILIES)[family]][i];
			if ((type == null || element.t == type) && (rank == null || game.players[fromElement.o].ra[element.o] == rank)) {
				var distance = this.getElementsDistance(fromElement, element);
				if (distance < min) {
					min = distance;
					nearestStuff = element;
					if (min < 4) { return nearestStuff; }
				}
			}  
		}

	}

	return nearestStuff;
}


/**
*	Returns tiles inside a square.
*/
tools.getTilesAround = function (grid, center, size, isFilled) {
	var tiles = [];
	
	for (var i = center.x - size; i <= center.x + size; i++) {
		if (grid[i] != null) {
			if (isFilled || i == center.x - size || i == center.x + size) {
				for (var j = center.y - size; j <= center.y + size; j++) {
					if (grid [i][j]) {
						tiles.push(grid[i][j]);
					}
				}
			} else {
				if (grid [i][center.y - size]) {
					tiles.push(grid[i][center.y - size]);
				} else if (grid [i][center.y + size]) {
					tiles.push(grid[i][center.y + size]);
				};
			}
		}
	}

	return tiles;
}


/**
*	Search for any element in a list of tiles.
*/
tools.searchInTiles = function (game, tiles, fromElement, family, type, rank) {

	for (var i in tiles) {
		// if there is something
		if (tiles[i].c > 0) {
			var content = game.gameElements[Object.keys(gameData.FAMILIES)[family]][tiles[i].c];
			if (content != null && content.f == family && (type == null || content.t == type)
				&& (rank == null || game.players[fromElement.o].ra[content.o] == rank)) {
				return content;
			}
		}
	}
	
	return null;
}


/**
*	Returns the game element with the chosen id.
*/
tools.getElementById = function (game, id) {
	return game.gameElements[Object.keys(gameData.FAMILIES)[('' + id)[1]]][id];
}


/**
*	Returns element data.
*/
tools.getElementData = function (element) {
	if (element.t >= 0) {
		var list = gameData.ELEMENTS[element.f][element.r];
		return list[Object.keys(list)[element.t]];	
	} else {
		return gameData.ELEMENTS[element.f][element.r][element.t];
	}
	
}

/**
*	Returns element data.
*/
tools.getElementDataFrom = function (family, race, type) {
	var list = gameData.ELEMENTS[family][race];
	if (type >= 0) {
		return list[Object.keys(list)[type]];	
	} else {
		return list[type];
	}
}
