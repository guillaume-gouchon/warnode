var gameSurface={},scene,camera;gameSurface.IMG_PATH="js/game/data/g/";gameSurface.MODELS_PATH="js/game/data/g/3D/";gameSurface.PIXEL_BY_NODE=10;gameSurface.NEAR=1;gameSurface.FAR=2E3;gameSurface.ZOOM_MAX=30;gameSurface.ZOOM_MIN=110;gameSurface.ZOOM_STEP=10;gameSurface.ZOOM_ROTATION_STEP=0.1;gameSurface.ORDER_ROTATION_SPEED=0.05;gameSurface.FOG_DENSITY=5E-4;gameSurface.SELECTION_ENEMY_COLOR="#f00";gameSurface.SELECTION_ALLY_COLOR="#0f0";gameSurface.SELECTION_NEUTRAL_COLOR="#e3e314";
gameSurface.CAMERA_INIT_ANGLE=0.7;gameSurface.ORDER_OPACITY=0.7;gameSurface.SELECTION_RECTANGLE_HEIGHT=4*gameSurface.PIXEL_BY_NODE;gameSurface.SELECTION_RECTANGLE_OPACITY=0.5;gameSurface.SELECTION_RECTANGLE_COLOR=0;gameSurface.CAN_BUILD_CUBE_COLOR=65280;gameSurface.CANNOT_BUILD_CUBE_COLOR=16711680;gameSurface.BUILD_CUBE_OPACITY=0.5;gameSurface.MAP_SCROLL_SPEED=10;gameSurface.MAP_SCROLL_X_MIN=0;gameSurface.MAP_SCROLL_Y_MIN=0;gameSurface.CENTER_CAMERA_Y_OFFSET=8*gameSurface.PIXEL_BY_NODE;
gameSurface.BARS_HEIGHT=0.5;gameSurface.BARS_DEPTH=0.2;gameSurface.BUILDING_STRUCTURE_SIZE=5;gameSurface.BUILDING_INIT_Z=-2*gameSurface.PIXEL_BY_NODE;gameSurface.ARMIES_COLORS=["_red","_blu","_gre","_yel"];gameSurface.PLAYERS_COLORS=["red","blue","green","yellow"];gameSurface.iteration=0;gameSurface.geometries=null;gameSurface.materials=null;gameSurface.terrain=null;gameSurface.scroll=[0,0];gameSurface.isKeyboardScrolling=!1;gameSurface.stuffToBeLoaded=0;gameSurface.ex=[];gameSurface.loader=null;
gameSurface.projector=null;gameSurface.order=null;gameSurface.selectionRectangle=null;gameSurface.canBuildHereMaterial=null;gameSurface.cannotBuildHereMaterial=null;gameSurface.basicCubeGeometry=null;gameSurface.building=null;
gameSurface.init=function(){function a(){gameSurface.iteration=1E3<gameSurface.iteration?0:gameSurface.iteration+1;requestAnimationFrame(a);gameSurface.updateMoveExtrapolation();gameSurface.updateGameWindow();gameSurface.updateOrderPosition();TWEEN.update();0==gameSurface.iteration%5&&GUI.update();renderer.render(scene,camera)}$("#loadingLabel").html("Loading");scene=new THREE.Scene;camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,this.NEAR,this.FAR);camera.position.x=0;
camera.position.y=0;camera.position.z=this.ZOOM_MIN;camera.rotation.x=this.CAMERA_INIT_ANGLE;scene.fog=new THREE.Fog(16777215,this.FOG_DENSITY,600);renderer=new THREE.WebGLRenderer;renderer.setSize(window.innerWidth-5,window.innerHeight-5);document.body.appendChild(renderer.domElement);this.projector=new THREE.Projector;this.geometries={};this.materials={};this.loader=new THREE.JSONLoader;gameSurface.stuffToBeLoaded+=2;for(var b in gameData.ELEMENTS)for(var c in gameData.ELEMENTS[b])for(var d in gameData.ELEMENTS[b][c])gameSurface.stuffToBeLoaded+=
2,b!=gameData.FAMILIES.terrain&&(gameSurface.stuffToBeLoaded+=gameContent.players.length-1);gameSurface.stuffToBeLoaded-=2;this.createScene();this.init3DModels();window.addEventListener("resize",this.onWindowResize,!1);a()};
gameSurface.createScene=function(){var a=new THREE.PointLight(16777215);a.position.x=0;a.position.y=0;a.position.z=150;scene.add(a);var b=[],c=new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(this.MODELS_PATH+"skybox.jpg",new THREE.UVMapping,function(){gameSurface.updateLoadingCounter()})});c.side=THREE.BackSide;for(a=0;6>a;a++)b.push(c);c=new THREE.MeshFaceMaterial(b);a=new THREE.CubeGeometry(2E3,2E3,2E3);a=new THREE.Mesh(a,c);a.position.x=gameContent.map.size.x*this.PIXEL_BY_NODE/2-
5;a.position.y=gameContent.map.size.y*this.PIXEL_BY_NODE/2;scene.add(a);this.terrain=(new TerrainGeneration(gameContent.map.size.x*this.PIXEL_BY_NODE,gameContent.map.size.y*this.PIXEL_BY_NODE,64,10)).diamondSquare();for(var c=new THREE.PlaneGeometry(2200,2200,64,64),d=0,a=0;64>=a;a++)for(b=0;64>=b;b++)d++;a=THREE.ImageUtils.loadTexture(this.MODELS_PATH+"grass.png",new THREE.UVMapping,function(){gameSurface.updateLoadingCounter()});a.wrapT=a.wrapS=THREE.RepeatWrapping;a=new THREE.MeshBasicMaterial({map:a});
a=new THREE.Mesh(c,a);a.position.x=gameContent.map.size.x*this.PIXEL_BY_NODE/2-5;a.position.y=gameContent.map.size.y*this.PIXEL_BY_NODE/2;a.overdraw=!0;scene.add(a);this.order=new THREE.Mesh(new THREE.TorusGeometry(5,2,2,5),new THREE.MeshLambertMaterial({color:16711680,opacity:this.ORDER_OPACITY,transparent:!0}));this.order.visible=!1;scene.add(this.order);a=new THREE.CubeGeometry(1,1,this.SELECTION_RECTANGLE_HEIGHT);this.selectionRectangle=new THREE.Mesh(a,new THREE.MeshLambertMaterial({color:this.SELECTION_RECTANGLE_COLOR,
opacity:this.SELECTION_RECTANGLE_OPACITY,transparent:!0}));scene.add(this.selectionRectangle);this.canBuildHereMaterial=new THREE.LineBasicMaterial({color:this.CAN_BUILD_CUBE_COLOR,opacity:this.BUILD_CUBE_OPACITY,transparent:!0});this.cannotBuildHereMaterial=new THREE.LineBasicMaterial({color:this.CANNOT_BUILD_CUBE_COLOR,opacity:this.BUILD_CUBE_OPACITY,transparent:!0});this.basicCubeGeometry=new THREE.CubeGeometry(this.PIXEL_BY_NODE,this.PIXEL_BY_NODE,this.PIXEL_BY_NODE);this.building=new THREE.Object3D;
for(a=0;a<this.BUILDING_STRUCTURE_SIZE;a++)for(b=0;b<this.BUILDING_STRUCTURE_SIZE;b++)c=new THREE.Mesh(this.basicCubeGeometry,this.canBuildHereMaterial),c.position.x=a*this.PIXEL_BY_NODE,c.position.y=b*this.PIXEL_BY_NODE,c.visible=!1,this.building.add(c);this.building.visible=!1;scene.add(this.building)};
gameSurface.init3DModels=function(){for(var a in gameData.ELEMENTS)for(var b in gameData.ELEMENTS[a])for(var c in gameData.ELEMENTS[a][b]){var d=gameData.ELEMENTS[a][b][c];null==this.geometries[d.g]&&(this.geometries[d.g]={},this.loadObject(d.g,a))}};
gameSurface.loadObject=function(a,b){this.loader.load(this.MODELS_PATH+a,this.geometryLoaded(a));if(b!=gameData.FAMILIES.terrain)for(var c=0;c<gameContent.players.length;c++){var d=this.ARMIES_COLORS[c];gameSurface.materials[a+d]=new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH+a.replace(".js","")+d+".png",new THREE.UVMapping,function(){gameSurface.updateLoadingCounter()})})}else gameSurface.materials[a]=new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture(gameSurface.MODELS_PATH+
a.replace(".js",".png"),new THREE.UVMapping,function(){gameSurface.updateLoadingCounter()})})};gameSurface.geometryLoaded=function(a){return function(b){gameSurface.geometries[a]=b;gameSurface.updateLoadingCounter()}};gameSurface.updateLoadingCounter=function(){this.stuffToBeLoaded--;0==this.stuffToBeLoaded&&gameManager.startGame()};
gameSurface.updateGameWindow=function(){camera.position.x+this.scroll[0]>=this.MAP_SCROLL_X_MIN&&camera.position.x+this.scroll[0]<=gameContent.map.size.x*this.PIXEL_BY_NODE?camera.position.x+=this.scroll[0]:this.scroll[0]=0;camera.position.y+this.scroll[1]>=this.MAP_SCROLL_Y_MIN&&camera.position.y+this.scroll[1]<=gameContent.map.size.y*this.PIXEL_BY_NODE?camera.position.y+=this.scroll[1]:this.scroll[1]=0};
gameSurface.updateScrolling=function(a,b,c){this.scroll[a]=b*this.MAP_SCROLL_SPEED;c&&(this.isKeyboardScrolling=0==b?!1:!0)};gameSurface.updateZoom=function(a){var b=camera.position.z-a*this.ZOOM_STEP;b<=this.ZOOM_MIN&&b>=this.ZOOM_MAX&&(camera.position.z=b,camera.rotation.x+=0>a?-this.ZOOM_ROTATION_STEP:this.ZOOM_ROTATION_STEP)};
gameSurface.onWindowResize=function(){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth-5,window.innerHeight-5)};gameSurface.addElement=function(a){this.createObject(gameData.ELEMENTS[a.f][a.r][a.t].g,a)};
gameSurface.createObject=function(a,b){var c=new THREE.Mesh(this.geometries[a],b.f==gameData.FAMILIES.terrain?this.materials[a]:this.materials[a+this.ARMIES_COLORS[b.o]]);c.elementId=b.id;this.setElementPosition(c,b.p.x,b.p.y);"tree.js"==a?(c.rotation.x=this.de2ra(90),c.rotation.y=this.de2ra(360*Math.random()),c.scale.y=1.3):"castle.js"==a?(c.rotation.x=this.de2ra(90),c.scale.x=3,c.scale.y=3,c.scale.z=3):"goldmine.js"==a?(c.rotation.x=this.de2ra(90),c.scale.x=1.5,c.scale.y=1.5,c.scale.z=1.5,c.rotation.y=
this.de2ra(360*Math.random())):"house.js"==a?(c.rotation.x=this.de2ra(90),c.scale.x=3,c.scale.y=3,c.scale.z=3):"casern.js"==a?(c.rotation.x=this.de2ra(90),c.scale.x=2,c.scale.y=2,c.scale.z=2):"peon.js"==a?(c.rotation.x=this.de2ra(90),c.scale.x=2,c.scale.y=2,c.scale.z=2):"swordsman.js"==a?(c.rotation.x=this.de2ra(90),c.scale.x=2,c.scale.y=2,c.scale.z=2):"bowman.js"==a?(c.rotation.x=this.de2ra(90),c.scale.x=2,c.scale.y=2,c.scale.z=2):"knight.js"==a&&(c.rotation.x=this.de2ra(90),c.scale.x=2,c.scale.y=
2,c.scale.z=2);b.f==gameData.FAMILIES.building&&(100>b.cp&&(c.position.z+=this.BUILDING_INIT_Z),GUI.addElementOnMinimap(b));scene.add(c);gameContent.gameElements[b.id]={d:c,s:b}};
gameSurface.updateElement=function(a){var b=gameContent.gameElements[a.id].d;if(a.f==gameData.FAMILIES.unit){var c=gameContent.gameElements[a.id].s,d=a.p.x-c.p.x,c=a.p.y-c.p.y;if(0!=d||0!=c)this.updateOrientation(b,d,c),this.extrapol(b,d,c)}(gameManager.isOfflineGame||a.f==gameData.FAMILIES.building)&&this.setElementPosition(b,a.p.x,a.p.y);d=gameData.ELEMENTS[a.f][a.r][a.t];if(a.f==gameData.FAMILIES.building)if(100>a.cp)b.position.z-=(100-a.cp)/20*this.PIXEL_BY_NODE;else if(0<a.q.length){var c=null,
e;for(e in b.children)if("prog"==b.children[e].id){c=b.children[e];break}null==c?(c=new THREE.Mesh(new THREE.CubeGeometry(this.BARS_DEPTH,this.BARS_HEIGHT,1),new THREE.MeshBasicMaterial({color:16777215})),c.id="prog",c.position.x=d.shape.length/3*this.PIXEL_BY_NODE/2,c.position.y=d.height+1,c.rotation.y=this.de2ra(90),b.add(c)):(c.scale.z=a.qp/100*d.shape.length/3*this.PIXEL_BY_NODE,c.position.x=d.shape.length/3*this.PIXEL_BY_NODE/2*(1-a.qp/100),99<=a.qp&&gameContent.players[gameContent.myArmy].pop.current==
gameContent.players[gameContent.myArmy].pop.max&&this.showMessage(this.MESSAGES.popLimitReached))}else for(e in b.children)"prog"==b.children[e].id&&b.remove(b.children[e]);if(a.f!=gameData.FAMILIES.terrain)for(e in b.children)if("life"==b.children[e].id){this.updateLifeBar(b.children[e],a,d);b.children[e].rotation.y=-b.rotation.y+this.de2ra(90);break}gameContent.gameElements[a.id]={d:b,s:a}};
gameSurface.removeElement=function(a){scene.remove(gameContent.gameElements[a.id].d);0<=gameContent.selected.indexOf(a.id)&&gameContent.selected.splice(gameContent.selected.indexOf(a.id),1);GUI.removeElementFromMinimap(a);delete gameContent.gameElements[a.id]};gameSurface.getAbsolutePositionFromPixel=function(a,b){var c=this.getFirstIntersectObject(a,b);return null!=c?this.convertScenePositionToGamePosition(c.point):{x:0,y:0}};
gameSurface.getFirstIntersectObject=function(a,b){var c=new THREE.Vector3(2*(a/window.innerWidth)-1,2*-(b/window.innerHeight)+1,0.5);this.projector.unprojectVector(c,camera);c=(new THREE.Raycaster(camera.position,c.sub(camera.position).normalize())).intersectObjects(scene.children);return 0<c.length?c[0]:null};
TerrainGeneration=function(a,b,c,d){this.width=a;this.height=b;this.segments=c;this.smoothingFactor=d;this.terrain=[];this._init=function(){this.terrain=[];for(var a=0;a<=this.segments;a++){this.terrain[a]=[];for(var b=0;b<=this.segments;b++)this.terrain[a][b]=0}};this.diamondSquare=function(){this._init();for(var a=this.segments+1,b=this.segments;2<=b;b/=2){var c=b/2;this.smoothingFactor/=2;for(var d=0;d<this.segments;d+=b)for(var g=0;g<this.segments;g+=b){var h=this.terrain[d][g]+this.terrain[d+
b][g]+this.terrain[d][g+b]+this.terrain[d+b][g+b],h=h/4,h=h+(2*this.smoothingFactor*Math.random()-this.smoothingFactor);this.terrain[d+c][g+c]=h}for(d=0;d<this.segments;d+=c)for(g=(d+c)%b;g<this.segments;g+=b)h=this.terrain[(d-c+a)%a][g]+this.terrain[(d+c)%a][g]+this.terrain[d][(g+c)%a]+this.terrain[d][(g-c+a)%a],h/=4,h+=2*this.smoothingFactor*Math.random()-this.smoothingFactor,this.terrain[d][g]=h,0===d&&(this.terrain[this.segments][g]=h),0===g&&(this.terrain[d][this.segments]=h)}return this.terrain}};
gameSurface.centerCameraOnElement=function(a){a=this.convertGamePositionToScenePosition(a.p);camera.position.x=a.x;camera.position.y=a.y-this.CENTER_CAMERA_Y_OFFSET};gameSurface.setElementPosition=function(a,b,c){var d=this.convertGamePositionToScenePosition({x:b,y:c});a.position.x=d.x;a.position.y=d.y;b=this.terrain[parseInt(65*b/gameContent.map.size.x)][parseInt(65*c/gameContent.map.size.y)];a.position.z=Math.abs(b)};gameSurface.convertGamePositionToScenePosition=function(a){return{x:a.x*this.PIXEL_BY_NODE,y:a.y*this.PIXEL_BY_NODE,z:0}};
gameSurface.convertScenePositionToGamePosition=function(a){return{x:Math.min(gameContent.map.size.x-2,Math.max(0,parseInt(a.x/this.PIXEL_BY_NODE))),y:Math.min(gameContent.map.size.y-2,Math.max(0,parseInt(a.y/this.PIXEL_BY_NODE)))}};gameSurface.drawSelectionCircle=function(a,b){for(var c=new THREE.MeshBasicMaterial({color:b}),d=new THREE.Geometry,e=0;100>=e;e++){var f=3.6*e*Math.PI/180;d.vertices.push(new THREE.Vector3(Math.cos(f)*a,0,Math.sin(f)*a))}c=new THREE.Line(d,c);c.id="select";return c};
gameSurface.drawLifeBar=function(a,b){var c=new THREE.Mesh(new THREE.CubeGeometry(this.BARS_DEPTH,this.BARS_HEIGHT,1),new THREE.MeshBasicMaterial({color:16777215}));c.id="life";c.position.x=0;c.position.y=b.height;c.rotation.y=this.de2ra(90);this.updateLifeBar(c,a,b);return c};gameSurface.updateLifeBar=function(a,b,c){var d=b.l/c.l;a.scale.z=c.shape.length/3*this.PIXEL_BY_NODE*b.l/c.l;a.material.color.setHex(this.getLifeBarColor(d))};
gameSurface.updateOrderPosition=function(){if(0<gameContent.selected.length&&(null!=gameContent.gameElements[gameContent.selected[0]].s.mt&&null!=gameContent.gameElements[gameContent.selected[0]].s.mt.x||null!=gameContent.gameElements[gameContent.selected[0]].s.rp||null!=gameContent.gameElements[gameContent.selected[0]].s.a)){var a;a=null!=gameContent.gameElements[gameContent.selected[0]].s.a?gameContent.gameElements[gameContent.selected[0]].s.a.p:null!=gameContent.gameElements[gameContent.selected[0]].s.rp?
gameContent.gameElements[gameContent.selected[0]].s.rp:gameContent.gameElements[gameContent.selected[0]].s.mt;this.setElementPosition(this.order,a.x,a.y);this.order.rotation.z+=this.ORDER_ROTATION_SPEED;this.order.visible=!0}else this.order.visible&&(this.order.visible=!1)};
gameSurface.updateSelectionRectangle=function(a,b,c,d){var e=Math.abs(a-c),f=Math.abs(b-d);0<e&&0<f?(a={x:Math.min(a,c)+e/2+1,y:Math.min(b,d)+f/2,z:0},this.selectionRectangle.position=a,this.selectionRectangle.scale.x=e,this.selectionRectangle.scale.y=f,this.selectionRectangle.visible=!0):this.selectionRectangle.visible=!1};gameSurface.de2ra=function(a){return a*(Math.PI/180)};
gameSurface.selectElement=function(a){var b=gameContent.gameElements[a].s,c=gameData.ELEMENTS[b.f][b.r][b.t],d;d=rank.isEnemy(gameContent.players,gameContent.myArmy,b)?this.SELECTION_ENEMY_COLOR:rank.isAlly(gameContent.players,gameContent.myArmy,b)?this.SELECTION_ALLY_COLOR:this.SELECTION_NEUTRAL_COLOR;a=gameContent.gameElements[a].d;a.add(this.drawSelectionCircle(c.shape.length/2*this.PIXEL_BY_NODE/2,d));b.f!=gameData.FAMILIES.terrain&&(b=this.drawLifeBar(b,c),b.rotation.y=-a.rotation.y+this.de2ra(90),
a.add(b))};gameSurface.unselectElement=function(a){try{for(var b=gameContent.gameElements[a].d,c=b.children.length;c--;){var d=b.children[c];("select"==d.id||"life"==d.id)&&b.remove(d)}}catch(e){}};gameSurface.unselectAll=function(){for(var a in gameContent.selected)this.unselectElement(gameContent.selected[a])};
gameSurface.updateOrientation=function(a,b,c){0==b&&0>c||(0<b&&0>c?a.rotation.y=this.de2ra(45):0<b&&0==c?a.rotation.y=this.de2ra(90):0<b&&0<c?a.rotation.y=this.de2ra(135):0==b&&0<c?a.rotation.y=this.de2ra(180):0>b&&0<c?a.rotation.y=this.de2ra(225):0>b&&0==c?a.rotation.y=this.de2ra(270):0>b&&0>c&&(a.rotation.y=this.de2ra(315)))};
gameSurface.updateBuildingGeometry=function(){for(var a in this.building.children)this.building.children[a].visible=!1;var b=gameContent.building.shape;for(a in b)for(var c in b){var d;if(b[a][c]==userInput.CAN_BE_BUILT_HERE)d=this.canBuildHereMaterial;else if(b[a][c]==userInput.CANNOT_BE_BUILT_HERE)d=this.cannotBuildHereMaterial;else continue;var e=a*this.BUILDING_STRUCTURE_SIZE+parseInt(c);this.building.children[e].material=d;this.building.children[e].visible=!0}this.setElementPosition(this.building,
gameContent.building.p.x-parseInt(b.length/2),gameContent.building.p.y-parseInt(b.length/2));this.building.visible=!0};gameSurface.removeBuildingGeometry=function(){for(var a in this.building.children)this.building.children[a].visible=!1;this.building.visible=!1};
gameSurface.animateSelectionCircle=function(a){this.selectElement(a);var b=gameContent.gameElements[a].d,c,d;for(d in b.children)if("select"==b.children[d].id){c=b.children[d];break}b=(new TWEEN.Tween({alpha:1})).delay(300).to({alpha:0},300).onComplete(function(){c.visible=!1}).start();d=(new TWEEN.Tween({alpha:0})).to({alpha:1},300).onComplete(function(){c.visible=!0});var e=(new TWEEN.Tween({alpha:0})).to({alpha:1},500).onComplete(function(){gameSurface.unselectElement(a)});b.chain(d);d.chain(e)};
gameSurface.getLifeBarColor=function(a){return 0.3>a?16711680:0.6>a?14934804:65280};gameSurface.MESSAGES={popLimitReached:{id:0,text:"You need more houses"}};
gameSurface.showMessage=function(a,b){if(0==$("#message"+a.id).length){$("#messages").append('<div><div id="message'+a.id+'" class="fadeOut easeTransition">'+a.text+"</div></div>");null==b?$("#message"+a.id).css("background","white"):$("#message"+a.id).css("background",b);var c=(new TWEEN.Tween({alpha:0})).to({alpha:1},100).onComplete(function(){$("#message"+a.id).removeClass("fadeOut")}).start(),d=(new TWEEN.Tween({alpha:0})).to({alpha:1},8E3).onComplete(function(){$("#message"+a.id).addClass("fadeOut")}),
e=(new TWEEN.Tween({alpha:0})).to({alpha:1},500).onComplete(function(){$("#message"+a.id).parent("div").remove()});c.chain(d);d.chain(e)}};gameSurface.extrapol=function(a,b,c){a.ex=b;a.ey=c;a.et=3;this.ex.push(a)};
gameSurface.updateMoveExtrapolation=function(){for(var a=this.ex.length;a--;){var b=this.ex[a];b.position.x+=b.ex*this.PIXEL_BY_NODE/3;b.position.y+=b.ey*this.PIXEL_BY_NODE/3;b.et-=1;if(0>=b.et){var c=gameContent.gameElements[b.elementId].s;this.setElementPosition(b,c.p.x,c.p.y);b.et=0;b.ex=0;b.ey=0;this.ex.splice(a,1)}}};var GUI={toolbar:[],MINIMAP_SIZE:140,BUTTONS_SIZE:80,TOOLBAR_BUTTONS:{build:{buttonId:1E3,image:"build.png",isEnabled:!0,name:"Build"},cancel:{buttonId:1001,image:"cancel.png",isEnabled:!0,name:"Cancel"}},MOUSE_ICONS:{standard:'url("js/game/data/g/cursor.png"), auto',select:'url("js/game/data/g/cursor_hover.png"), auto',attack:'url("js/game/data/g/cursor_attack.png"), auto',arrowTop:"n-resize",arrowTopRight:"ne-resize",arrowTopLeft:"nw-resize",arrowBottom:"s-resize",arrowBottomRight:"se-resize",arrowBottomLeft:"sw-resize",
arrowRight:"e-resize",arrowLeft:"w-resize"},showBuildings:!1,init:function(){this.createResourcesBar();this.initInfobar();this.initMinimap()},update:function(){this.updatePopulation();this.updateResources();this.updateToolbar();this.updateInfo();this.updateMinimap()},updateToolbar:function(){if(0<gameContent.selected.length&&rank.isAlly(gameContent.players,gameContent.myArmy,gameContent.gameElements[gameContent.selected[0]].s)){var a=gameContent.gameElements[gameContent.selected[0]].s;a.f==gameData.FAMILIES.building?
this.toolbar=100>a.cp?[GUI.TOOLBAR_BUTTONS.cancel]:production.getWhatCanBeBought(gameContent.players,a.o,gameData.ELEMENTS[gameData.FAMILIES.building][a.r][a.t].buttons):a.f==gameData.FAMILIES.unit&&(this.toolbar=this.showBuildings?this.getBuildingButtons(a):gameData.ELEMENTS[gameData.FAMILIES.unit][a.r][a.t].buttons)}else this.toolbar=[];$("#toolbar .toolbarButton").addClass("hide");for(var b in this.toolbar)this.createToolbarButton(this.toolbar[b])},getBuildingButtons:function(a){return production.getWhatCanBeBought(gameContent.players,
a.o,gameData.ELEMENTS[gameData.FAMILIES.building][a.r])},updateMouse:function(a){document.body.style.cursor=a},createResourcesBar:function(){for(var a in gameData.RESOURCES)this.createResourceElement(gameData.RESOURCES[a])},createResourceElement:function(a){a='<div id="resource'+a.id+'"><div class="spriteBefore sprite-'+a.name+'">0</div></div>';$("#resources").append(a)},updateResources:function(){var a=gameContent.players[gameContent.myArmy],b;for(b in gameData.RESOURCES){var c=gameData.RESOURCES[b];
$("div","#resource"+c.id).html(a.re[c.id])}},createToolbarButton:function(a){if(null!=$("#toolbar"+a.buttonId).html())$("#toolbar"+a.buttonId).removeClass("hide");else{var b='<div id="toolbar'+a.buttonId+'" class="toolbarButton sprite sprite-boxNormal" title="'+a.name+'"><div class="sprite sprite-'+a.image.replace(".png","")+'"></div></div>';$("#toolbar").append(b);for(var c in a.needs){var b=a.needs[c],d;for(d in gameData.RESOURCES)if(gameData.RESOURCES[d].id==b.t){var e=(this.toolbar.length-1)*
GUI.BUTTONS_SIZE-$("#toolbar"+a.buttonId).position().top+20*c+10;$("#toolbar"+a.buttonId).append('<div class="price" style="bottom: '+e+'px"><div class="spriteBefore sprite-'+gameData.RESOURCES[d].image.replace(".png","")+'15" />'+b.value+"</div></div>");break}}}a.isEnabled?$("#toolbar"+a.buttonId).removeClass("disabled"):$("#toolbar"+a.buttonId).addClass("disabled")},updatePopulation:function(){var a=gameContent.players[gameContent.myArmy];$("div","#population").html(a.pop.current+" / "+a.pop.max)},
selectButton:function(a){this.unselectButtons();$("#toolbar"+a.buttonId).addClass("sprite-boxSelect")},unselectButtons:function(){$(".toolbarButton").removeClass("sprite-boxSelect")},initInfobar:function(){$("#info").css("left",(window.innerWidth-$("#info").width())/2)},updateInfo:function(){if(0<gameContent.selected.length){var a=gameContent.gameElements[gameContent.selected[0]].s,b=gameData.ELEMENTS[a.f][a.r][a.t];$("#name").html(b.name);$("#portrait").attr("class","sprite sprite-"+b.image.replace(".png",
""));$("#stats").html("");if(a.f==gameData.FAMILIES.terrain){$("#life").html("&infin; / &infin;");for(var c in gameData.RESOURCES)if(gameData.RESOURCES[c].id==b.resourceType){this.addStatLine(gameData.RESOURCES[c].image.replace(".png","")+"15",a.ra,"Amount of resources left");break}}else if($("#life").html(a.l+"/"+b.l),a.f==gameData.FAMILIES.building)for(c in GUI.addStatLine("defense",b.defense,"Defense"),GUI.addStatLine("pop20",b.pop,"Max Population Bonus"),a.q)b=gameData.ELEMENTS[gameData.FAMILIES.unit][a.r][a.q[c]],
0==c?GUI.addQueue(b.image,parseInt(a.qp)+"%",b.name):GUI.addQueue(b.image,"",b.name);else GUI.addStatLine("attack",b.attack,"Attack"),GUI.addStatLine("defense",b.defense,"Defense"),GUI.addStatLine("attackSpeed",b.attackSpeed,"Attack Speed"),GUI.addStatLine("range",b.range,"Range");$("#info").removeClass("hide")}else $("#info").hasClass("hide")||$("#info").addClass("hide")},addStatLine:function(a,b,c){$("#stats").append('<div class="stat" title="'+c+'"><div class="spriteBefore sprite-'+a+'">'+b+"</div></div>")},
addQueue:function(a,b,c){$("#stats").append('<div class="queue" title="'+c+'"><div id="queueProgress">'+b+'</div><div class="sprite sprite-'+a.replace(".png","")+'15"></div></div>')},initMinimap:function(){$("#minimap").mousedown(function(a){var b=(GUI.MINIMAP_SIZE-window.innerWidth+a.clientX)/GUI.MINIMAP_SIZE*gameContent.map.size.x*gameSurface.PIXEL_BY_NODE,c=(window.innerHeight-a.clientY)/GUI.MINIMAP_SIZE*gameContent.map.size.y*gameSurface.PIXEL_BY_NODE;if(1==a.which)camera.position.x=b,camera.position.y=
c;else if(3==a.which&&0<gameContent.selected.length&&rank.isAlly(gameContent.players,gameContent.myArmy,gameContent.gameElements[gameContent.selected[0]].s)&&(gameContent.gameElements[gameContent.selected[0]].s.f==gameData.FAMILIES.unit||gameContent.gameElements[gameContent.selected[0]].s.f==gameData.FAMILIES.building))b=parseInt(b/gameSurface.PIXEL_BY_NODE),c=parseInt(c/gameSurface.PIXEL_BY_NODE),userInput.sendOrder(b,c)})},updateMinimap:function(){$("#minimapLocation").css("left",-8+this.MINIMAP_SIZE*
camera.position.x/(gameContent.map.size.x*gameSurface.PIXEL_BY_NODE));$("#minimapLocation").css("top",-8+this.MINIMAP_SIZE*(1-camera.position.y/(gameContent.map.size.y*gameSurface.PIXEL_BY_NODE)))},addElementOnMinimap:function(a){$("#minimap").append('<span id="minimap'+a.id+'" class="minimapPoint '+gameSurface.PLAYERS_COLORS[a.o]+'">&nbsp;</span>');$("#minimap"+a.id).css("left",this.MINIMAP_SIZE*a.p.x/gameContent.map.size.x);$("#minimap"+a.id).css("top",this.MINIMAP_SIZE*(1-a.p.y/gameContent.map.size.y))},
removeElementFromMinimap:function(a){$("#minimap"+a.id).remove()}};var gameManager={isOfflineGame:!1,offlineLoop:null,initGame:function(a){this.getPlayerId();if(this.isOfflineGame)this.initOfflineGame(a);else try{this.connectToServer(a)}catch(b){}},startGame:function(){$("#playOffline").fadeOut();$("#gui").removeClass("hide");$("#introScreen").addClass("hide");gameContent.init(this.waitingData);this.isOfflineGame&&(this.offlineLoop=setInterval(function(){gameContent.update(gameContent.game.update())},125))},initOfflineGame:function(a){try{this.disconnect()}catch(b){console.log(b)}gameContent.myArmy=
0;gameContent.players=[new gameData.Player(0,0,a.army),new gameData.Player(0,1,0)];gameContent.map=new gameData.Map(gameData.MAP_TYPES[a.mapType],gameData.MAP_SIZES[a.mapSize],gameData.VEGETATION_TYPES[a.vegetation],gameData.INITIAL_RESOURCES[a.initialResources]);gameContent.game=gameCreation.createNewGame(gameContent.map,gameContent.players);this.waitingData=gameContent.game.gameElements;gameSurface.init();GUI.init();input.initInputs()},connectToServer:function(a){gameManager.socket=io.connect("http://warnode.com");
this.socket.on("askUserData",function(){gameManager.socket.emit("userData",{player:{playerId:gameManager.playerId,army:a.army},game:a})});this.socket.on("gameStart",function(a){gameContent.players=a.players;gameContent.myArmy=a.myArmy;gameContent.map=a.map;gameManager.waitingData=a.initElements;gameSurface.init();GUI.init();input.initInputs()});this.socket.on("gameData",function(a){gameContent.update(a)});this.socket.on("gameStats",function(a){gameManager.showStats(a)})},disconnect:function(){this.socket.emit("goOffline",
null)},createPlayerId:function(){var a=(new Date).getTime()+Math.random();utils.createCookie("rts_player_id",a);return a},getPlayerId:function(){var a=utils.readCookie("rts_player_id");null==a&&(a=this.createPlayerId());this.playerId=a},sendOrderToEngine:function(a,b){this.isOfflineGame?order.dispatchReceivedOrder(gameContent.game,a,b):gameManager.socket.emit("order",[a,b])},endGame:function(a){a==gameData.PLAYER_STATUSES.victory?($("#endGameMessage").addClass("victory"),$("#endGameMessage").html("Victory !")):
($("#endGameMessage").addClass("defeat"),$("#endGameMessage").html("Defeat..."));$("#endGame").fadeIn();$("#endGameMessage").addClass("moveToLeft");this.isOfflineGame&&(clearInterval(this.offlineLoop),this.showStats(gameContent.game.stats))},showStats:function(a){$("table","#endGameStats").css("width",window.innerWidth-60);for(var b in a){var c=a[b],d;d=b==gameContent.myArmy?"You":"Player "+b;$("#tableBody").append('<tr class="'+gameSurface.PLAYERS_COLORS[b]+'"><td>'+d+"</td><td>"+c.killed+"</td><td>"+
c.lost+"</td><td>"+c.buildingsDestroyed+"</td><td>"+c.unitsCreated+"</td><td>"+c.resources+"</td><td>"+c.buildersCreated+"</td><td>"+c.buildingsCreated+"</td></tr>")}}};var gameContent={map:null,players:null,myArmy:null,game:null,gameElements:{},selected:[],building:null,selectionRectangle:[],init:function(a){for(var b in a){var c=a[b];gameSurface.addElement(c);c.f==gameData.FAMILIES.building&&c.o==this.myArmy&&gameSurface.centerCameraOnElement(c)}},update:function(a){for(var b in a.added){var c=a.added[b];null==this.gameElements[c.id]&&gameSurface.addElement(c)}for(b in a.removed)if(c=a.removed[b],null!=this.gameElements[c.id]){var d=this.selected.indexOf(c.id);
0<=d&&this.selected.splice(d,1);gameSurface.removeElement(c)}for(b in a.modified)c=a.modified[b],null!=this.gameElements[c.id]&&gameSurface.updateElement(c);this.players=a.players;(this.players[this.myArmy].s==gameData.PLAYER_STATUSES.victory||this.players[this.myArmy].s==gameData.PLAYER_STATUSES.defeat)&&gameManager.endGame(this.players[this.myArmy].s);for(b in a.chat)gameSurface.showMessage({id:parseInt(1E3*Math.random()),text:a.chat[b].text},gameSurface.PLAYERS_COLORS[a.chat[b].o])}};var utils={readCookie:function(a){a+="=";for(var b=document.cookie.split(";"),c=0;c<b.length;c++){for(var d=b[c];" "==d.charAt(0);)d=d.substring(1,d.length);if(0==d.indexOf(a))return d.substring(a.length,d.length)}return null},createCookie:function(a,b){document.cookie=a+"="+b+"; path=/"},canBeBuiltHere:function(a){var b=tools.getPartPosition(a,0,0),c=b.x+a.shape[0].length-1,d=b.y+a.shape.length-1,e;for(e in gameContent.gameElements){var f=gameContent.gameElements[e].s,j=gameData.ELEMENTS[f.f][f.r][f.t].shape,
f=tools.getPartPosition(f,0,0),k=f.x+j[0].length-1,j=f.y+j.length-1;if(f.x>=b.x&&f.x<=c&&(f.y>=b.y&&f.y<=d||j>=b.y&&j<=d)||k>=b.x&&k<=c&&(f.y>=b.y&&f.y<=d||j>=b.y&&j<=d)){a.canBeBuiltHere=!1;for(var g=f.x;g<=k;g++)for(var h=f.y;h<=j;h++)g>=b.x&&(g<=c&&h>=b.y&&h<=d)&&(a.shape[g-b.x][h-b.y]=userInput.CANNOT_BE_BUILT_HERE)}}}};var inputDispatcher={TOOLBAR_KEYBOARD_SHORTCUTS:[81,87,69,82,65,83,68,70],onLeftClick:function(a){if(1==a.which){var b=a.x;a=a.y;if(0<GUI.toolbar.length&&b<GUI.BUTTONS_SIZE+10&&10<b&&a<window.innerHeight-10&&a>window.innerHeight-10-GUI.BUTTONS_SIZE*GUI.toolbar.length)return userInput.clickOnToolbar(GUI.toolbar[parseInt(GUI.toolbar.length-(window.innerHeight-a-10)/GUI.BUTTONS_SIZE)]),!1;if(null!=gameContent.building)return userInput.tryBuildHere(),!1;userInput.clickToSelect(b,a);return!0}},onDoubleClick:function(a){1==
a.which&&userInput.doubleClickToSelect(a.x,a.y);return!1},onRightClick:function(a){if(a.x>window.innerWidth-GUI.MINIMAP_SIZE&&a.y>window.innerHeight-GUI.MINIMAP_SIZE)return!1;null!=gameContent.building?userInput.leaveConstructionMode():0<gameContent.selected.length&&(rank.isAlly(gameContent.players,gameContent.myArmy,gameContent.gameElements[gameContent.selected[0]].s)&&(gameContent.gameElements[gameContent.selected[0]].s.f==gameData.FAMILIES.unit||gameContent.gameElements[gameContent.selected[0]].s.f==
gameData.FAMILIES.building))&&userInput.dispatchUnitAction(a.x,a.y);return!1},onMouseMove:function(a){userInput.updateConstructionMode(a.x,a.y)},onMouseUp:function(){userInput.removeSelectionRectangle()},onMouseWheel:function(a){0<Math.abs(a.wheelDelta)&&userInput.changeZoom(a.wheelDelta/Math.abs(a.wheelDelta));return!1},onKeyDown:function(a){a=window.event?a.which:a.keyCode;switch(a){case 13:return userInput.onEnterKey(),!0;case 38:return gameSurface.updateScrolling(1,1,!0),!0;case 40:return gameSurface.updateScrolling(1,
-1,!0),!0;case 39:return gameSurface.updateScrolling(0,1,!0),!0;case 37:return gameSurface.updateScrolling(0,-1,!0),!0}if(userInput.isChatWindowOpen){var b=$("input","#chat").val();8==a?$("input","#chat").val(b.substring(0,b.length-1)):$("input","#chat").val(b+String.fromCharCode(a).toLowerCase())}else for(b in inputDispatcher.TOOLBAR_KEYBOARD_SHORTCUTS)if(inputDispatcher.TOOLBAR_KEYBOARD_SHORTCUTS[b]==a)return userInput.pressToolbarShortcut(b),!1;return!0},onKeyUp:function(a){switch(window.event?
a.which:a.keyCode){case 38:return gameSurface.updateScrolling(1,0,!0),!1;case 40:return gameSurface.updateScrolling(1,0,!0),!1;case 39:return gameSurface.updateScrolling(0,0,!0),!1;case 37:return gameSurface.updateScrolling(0,0,!0),!1}}};var input={initInputs:function(){this.initMouse();this.initKeyboard()},mousePosition:{x:0,y:0},initMouse:function(){document.onmousedown=function(a){return inputDispatcher.onLeftClick(a)};document.oncontextmenu=function(a){return inputDispatcher.onRightClick(a)};document.onmousemove=function(a){userInput.checkIfMapScrolling(a.x,a.y);userInput.updateMouseIcon(a.x,a.y);userInput.selectGroup(a.x,a.y);if(3<Math.abs(a.x-input.mousePosition.x)+Math.abs(a.y-input.mousePosition.y))inputDispatcher.onMouseMove(a);
input.mousePosition.x=a.x;input.mousePosition.y=a.y;return!1};document.onmouseup=function(a){return inputDispatcher.onMouseUp(a)};document.onmousewheel=function(a){return inputDispatcher.onMouseWheel(a)};document.ondblclick=function(a){return inputDispatcher.onDoubleClick(a)}},initKeyboard:function(){document.onkeydown=function(a){return inputDispatcher.onKeyDown(a)};document.onkeyup=function(a){return inputDispatcher.onKeyUp(a)}}};var userInput={CAN_BE_BUILT_HERE:10,CANNOT_BE_BUILT_HERE:1,isChatWindowOpen:!1,clickOnToolbar:function(a){a.isEnabled&&(a.buttonId==GUI.TOOLBAR_BUTTONS.build.buttonId?GUI.showBuildings=!0:GUI.showBuildings&&a.isEnabled?this.enterConstructionMode(a):a.buttonId==GUI.TOOLBAR_BUTTONS.cancel.buttonId?gameManager.sendOrderToEngine(order.TYPES.cancelConstruction,[gameContent.gameElements[gameContent.selected[0]].s.id]):gameContent.gameElements[gameContent.selected[0]].s.f==gameData.FAMILIES.building&&gameManager.sendOrderToEngine(order.TYPES.buy,
[gameContent.selected,a]))},enterConstructionMode:function(a){gameContent.building=a;GUI.selectButton(a);this.updateConstructionMode(input.mousePosition.x,input.mousePosition.y)},updateConstructionMode:function(a,b){if(null!=gameContent.building){gameContent.building.p=gameSurface.getAbsolutePositionFromPixel(a,b);gameContent.building.canBeBuiltHere=!0;for(var c in gameContent.building.shape)for(var d in gameContent.building.shape[c])gameContent.building.shape[c][d]=this.CAN_BE_BUILT_HERE;utils.canBeBuiltHere(gameContent.building);
gameSurface.updateBuildingGeometry()}},leaveConstructionMode:function(){gameContent.building=null;gameSurface.removeBuildingGeometry();GUI.unselectButtons();GUI.showBuildings=!1},changeZoom:function(a){gameSurface.updateZoom(a)},pressToolbarShortcut:function(a){a<GUI.toolbar.length&&this.clickOnToolbar(GUI.toolbar[a])},updateMouseIcon:function(a,b){var c=gameSurface.getFirstIntersectObject(a,b),d=gameSurface.scroll[0],e=gameSurface.scroll[1];null!=c&&null!=c.object.elementId?(c=gameContent.gameElements[c.object.elementId].s,
null!=c&&c.f!=gameData.FAMILIES.terrain&&rank.isEnemy(gameContent.players,gameContent.myArmy,c)?GUI.updateMouse(GUI.MOUSE_ICONS.attack):GUI.updateMouse(GUI.MOUSE_ICONS.select)):gameSurface.isKeyboardScrolling||(0<d&&0<e?GUI.updateMouse(GUI.MOUSE_ICONS.arrowTopRight):0<d&&0==e?GUI.updateMouse(GUI.MOUSE_ICONS.arrowRight):0<d&&0>e?GUI.updateMouse(GUI.MOUSE_ICONS.arrowBottomRight):0>d&&0<e?GUI.updateMouse(GUI.MOUSE_ICONS.arrowTopLeft):0>d&&0==e?GUI.updateMouse(GUI.MOUSE_ICONS.arrowLeft):0>d&&0>e?GUI.updateMouse(GUI.MOUSE_ICONS.arrowBottomLeft):
0==d&&0<e?GUI.updateMouse(GUI.MOUSE_ICONS.arrowTop):0==d&&0>e?GUI.updateMouse(GUI.MOUSE_ICONS.arrowBottom):GUI.updateMouse(GUI.MOUSE_ICONS.standard))},SCROLL_THRESHOLD:10,checkIfMapScrolling:function(a,b){a<this.SCROLL_THRESHOLD?gameSurface.updateScrolling(0,-1,!1):a>window.innerWidth-this.SCROLL_THRESHOLD?gameSurface.updateScrolling(0,1,!1):!gameSurface.isKeyboardScrolling&&0!=gameSurface.scroll[0]&&gameSurface.updateScrolling(0,0,!1);b<this.SCROLL_THRESHOLD?gameSurface.updateScrolling(1,1,!1):b>
window.innerHeight-this.SCROLL_THRESHOLD?gameSurface.updateScrolling(1,-1,!1):!gameSurface.isKeyboardScrolling&&0!=gameSurface.scroll[1]&&gameSurface.updateScrolling(1,0,!1)},tryBuildHere:function(){gameContent.building.canBeBuiltHere&&(gameManager.sendOrderToEngine(order.TYPES.buildThatHere,[gameContent.selected,gameContent.building,gameContent.building.p.x,gameContent.building.p.y]),this.leaveConstructionMode())},dispatchUnitAction:function(a,b){var c,d=gameSurface.getFirstIntersectObject(a,b);
null!=d&&(null!=d.object.elementId?(c=gameContent.gameElements[d.object.elementId].s.p,gameSurface.animateSelectionCircle(d.object.elementId)):c={x:parseInt(d.point.x/gameSurface.PIXEL_BY_NODE),y:parseInt(d.point.y/gameSurface.PIXEL_BY_NODE)},this.sendOrder(c.x,c.y))},sendOrder:function(a,b){0<=a&&(0<=b&&a<gameContent.map.size.x&&b<gameContent.map.size.y)&&gameManager.sendOrderToEngine(order.TYPES.action,[gameContent.selected,a,b])},onEnterKey:function(){this.isChatWindowOpen?($("#chat").addClass("hide"),
""!=$("input","#chat").val()&&gameManager.sendOrderToEngine(order.TYPES.chat,[gameContent.myArmy,$("input","#chat").val()]),$("input","#chat").val("")):($("#chat").css("top",(window.innerHeight-$("#chat").height())/2),$("#chat").css("left",(window.innerWidth-$("#chat").width())/2),$("#chat").removeClass("hide"));this.isChatWindowOpen=!this.isChatWindowOpen}};userInput.clickToSelect=function(a,b){if(!(a>window.innerWidth-GUI.MINIMAP_SIZE&&b>window.innerHeight-GUI.MINIMAP_SIZE)){this.leaveConstructionMode();gameSurface.unselectAll();gameContent.selected=[];gameContent.selectionRectangle=[];var c=gameSurface.getFirstIntersectObject(a,b);null!=c&&(null!=c.object.elementId&&(gameContent.selected.push(c.object.elementId),gameSurface.selectElement(c.object.elementId)),gameContent.selectionRectangle[0]=c.point.x,gameContent.selectionRectangle[1]=c.point.y,gameSurface.updateSelectionRectangle(-1,
-1,-1,-1))}};
userInput.selectGroup=function(a,b){if(0<gameContent.selectionRectangle.length){gameSurface.unselectAll();gameContent.selected=[];var c=!1,d=gameSurface.getFirstIntersectObject(a,b).point;if(!(0>d.x||0>d.y)){gameContent.selectionRectangle[2]=d.x;gameContent.selectionRectangle[3]=d.y;gameSurface.updateSelectionRectangle(gameContent.selectionRectangle[0],gameContent.selectionRectangle[1],gameContent.selectionRectangle[2],gameContent.selectionRectangle[3]);var e=gameSurface.convertScenePositionToGamePosition({x:gameContent.selectionRectangle[0],y:gameContent.selectionRectangle[1]}),
d=gameSurface.convertScenePositionToGamePosition(d),d=[e.x,e.y,d.x,d.y],f;for(f in gameContent.gameElements)if(e=gameContent.gameElements[f].s,rank.isAlly(gameContent.players,gameContent.myArmy,e)&&e.f!=gameData.FAMILIES.terrain&&(0>d[0]-d[2]&&e.p.x<=d[2]&&e.p.x>=d[0]||e.p.x>=d[2]&&e.p.x<=d[0])&&(0>d[1]-d[3]&&e.p.y<=d[3]&&e.p.y>=d[1]||e.p.y>=d[3]&&e.p.y<=d[1]))gameContent.selected.push(e.id),gameSurface.selectElement(e.id),e.f==gameData.FAMILIES.unit&&(c=!0);if(c)for(c=gameContent.selected.length;c--;)e=
gameContent.gameElements[gameContent.selected[c]].s,e.f==gameData.FAMILIES.building&&(gameContent.selected.splice(c,1),gameSurface.unselectElement(e.id))}}};userInput.removeSelectionRectangle=function(){gameContent.selectionRectangle=[];gameSurface.updateSelectionRectangle(-1,-1,-1,-1)};
userInput.doubleClickToSelect=function(){if(0<gameContent.selected.length&&rank.isAlly(gameContent.players,gameContent.myArmy,gameContent.gameElements[gameContent.selected[0]].s)){var a=gameContent.gameElements[gameContent.selected[0]].s,b;for(b in gameContent.gameElements){var c=gameContent.gameElements[b].s;c.f==a.f&&(rank.isAlly(gameContent.players,gameContent.myArmy,c)&&c.t==a.t)&&(gameContent.selected.push(c.id),gameSurface.selectElement(c.id))}}};