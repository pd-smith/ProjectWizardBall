//var TextConfigurer = require('../util/text_configurer');
var WizardBall = WizardBall || {};

WizardBall.pendinggame = function() {}



var xOffset = 40;
var yOffset = 50;

var buttonYOffset = 30;
var startGameButtonXOffset = 1000;
var leaveButtonXOffset = 1100;

var characterSquareStartingX = 125;
var characterSquareStartingY = 500;
var characterSquareXDistance = 250;
var characterSquareYDistance = 0;

var buttonAngle = 17;

var characterOffsetX = 4.5;
var characterOffsetY = 4.5;

var minPlayerMessageOffsetX = 80;
var minPlayerMessageOffsetY = 300;

var numCharacterSquares = 4;

//var repeatingBombTilesprite;

WizardBall.pendinggame.prototype = {
	init: function(tilemapName, gameID) {
		this.tilemapName = tilemapName;
		this.gameID = gameID;
	//	repeatingBombTilesprite = rbts;
	},

	create: function() {
		
		socket.emit("enter pending game", {gameID: this.gameID});
		background = this.game.add.sprite(0,0,'redBar');
		accent1 = this.game.add.sprite(600,0,'pendingYellowBar');
		accent2 = this.game.add.sprite(470,0,'pendingGreenBar');

		//var backdrop = this.game.add.image(xOffset, yOffset, 'background', "/public/images/ball.png"); // TEXTURE, backdrop image
		this.startGameButton = this.game.add.button(startGameButtonXOffset, buttonYOffset, 'StartButton', null, this, //TEXTURE
			1, 1); //Start game button 3 both times
		this.startGameButton.angle = buttonAngle;
		this.leaveGameButton = this.game.add.button(leaveButtonXOffset,600, 'LeaveButton', this.leaveGameAction, null, // TEXTURES
			1, 2); // leave game button 2, 1
		this.leaveGameButton.angle = 0;

		//this.leaveGameButton.setDownSound(buttonClickSound);
		
		this.characterSquares = this.drawCharacterSquares(4);
		this.characterImages = [];
		this.numPlayersInGame = 0;

		var style = { font: "40px Arial", fill: "#000000", align: "left"};
		this.minPlayerMessage = this.game.add.text(minPlayerMessageOffsetX, minPlayerMessageOffsetY, "Waiting for players...",style);
	//	TextConfigurer.configureText(this.minPlayerMessage, "red", 17);
		this.minPlayerMessage.visible = false;

		socket.on("show current players", this.populateCharacterSquares.bind(this));
		socket.on("player joined", this.playerJoined.bind(this));
		socket.on("player left", this.playerLeft.bind(this));
		socket.on("start game on client", this.startGame);
	},

	update: function() {
	//	repeatingBombTilesprite.tilePosition.x++;
	//	repeatingBombTilesprite.tilePosition.y--;
	},

	drawCharacterSquares: function(numOpenings) {
		var characterSquares = [];
		var yOffset = characterSquareStartingY;
		var xOffset = characterSquareStartingX;

		for(var i = 0; i < numCharacterSquares; i++) {
			var frame = i < numOpenings ? 2 : 1; //character square 1 , 2
			characterSquares[i] = this.game.add.sprite(xOffset, yOffset, 'CharacterSlot', frame); //Textures
			
			xOffset += characterSquareXDistance;
			yOffset += characterSquareYDistance;
			
		}

		return characterSquares;
	},

	populateCharacterSquares: function(data) {
		this.numPlayersInGame = 0;
		for(var playerId in data.players) {
		//	var color = data.players[playerId].color;
			this.characterImages[playerId] = this.game.add.image(this.characterSquares[this.numPlayersInGame].position.x + characterOffsetX, 
				this.characterSquares[this.numPlayersInGame].position.y + characterOffsetY, 'CharacterSlot', 1 ); // Texture, head+color+.png
			this.numPlayersInGame++;
		}

		if(this.numPlayersInGame > 1) {
			this.activateStartGameButton();
		} else {
			this.minPlayerMessage.visible = true;
		}
	},

	playerJoined: function(data) {
		this.numPlayersInGame++;
		var index = this.numPlayersInGame - 1;
		//DATA CAHNGED TO CAP id to ID
		this.characterImages[data.id] = this.game.add.image(this.characterSquares[index].position.x + characterOffsetX,
		 this.characterSquares[index].position.y + characterOffsetY, 'CharacterSlot', 1); // Texture, head+color+.png

		// Activate start game button if this is the second player to join the this.game.
		if(this.numPlayersInGame == 2) {
			this.activateStartGameButton();
		}
	},

	activateStartGameButton: function() {
		this.minPlayerMessage.visible = false;
		this.startGameButton.setFrames(2, 3); //Start button 2 , 1
		this.startGameButton.onInputUp.removeAll();
		this.startGameButton.onInputUp.add(this.startGameAction, this);
	//	this.startGameButton.setDownSound(buttonClickSound);
	},

	deactivateStartGameButton: function() {
		this.minPlayerMessage.visible = true;
		this.startGameButton.setFrames(1, 1); //Start button 3 for both
		this.startGameButton.onInputUp.removeAll();
	//	this.startGameButton.setDownSound(null);
	},

	playerLeft: function(data) {
		this.numPlayersInGame--;

		if(this.numPlayersInGame == 1) {
			this.deactivateStartGameButton();
		}

		for(var playerId in this.characterImages) {
			this.characterImages[playerId].destroy();
		}

		this.populateCharacterSquares(data);
	},

	// When the "start" button is clicked, send a message to the server to initialize the this.game.
	startGameAction: function() {
		socket.emit("start game on server");

	},

	leaveGameAction: function() {
		socket.emit("leave pending game");
		socket.removeAllListeners();
		this.game.state.start("Lobby", true, false); //4th parameter rtbs
	},

	startGame: function(data) {
	//	repeatingBombTilesprite.doNotDestroy = false;
		socket.removeAllListeners();
		console.log(data.players);
		WizardBall.game.state.start("Play", true, false, data.mapID, data.players, this.id);
	}
}