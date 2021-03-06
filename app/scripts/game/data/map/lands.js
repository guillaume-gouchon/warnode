gameData.ELEMENTS[gameData.FAMILIES.land].push(
{
	goldmine : {	
		name : 'Gold Mine',
		t: 0,
		shape : [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.gold.id,
		ra : 3000,
		g : 'goldmine',
		gui : 'ic_goldmine.png',
		minimapColor : {r:237,g:226,b:117},
		nbTextures: 3
	},
	tree : {
		name : 'Tree',
		t: 1,
		shape : [[1]],
		canMoveIn : false,
		resourceType : gameData.RESOURCES.wood.id,
		ra : 75,
		g : 'tree',
		gui : 'ic_tree.png',
		minimapColor : {r:52,g:114,b:53},
		nbTextures: 2
	}
});
