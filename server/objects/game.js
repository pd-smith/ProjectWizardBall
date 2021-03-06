var DEFAULT_NUM_ROUNDS = 3;

var Game = function() {
	this.players = {};
	this.map = {};
	this.won = false;
	this.winnerID = 0;
	this.gameID = 0;
	this.numPlayersAlive = 0;
    this.ballsThrown = 0;
	this.roundReadyAcknowledgements = [];
	this.awaitingAcknowledgements = false;

	this.numRounds = DEFAULT_NUM_ROUNDS;
	this.currentRound = 1;
};

Game.prototype = {
	get numPlayers() {
		return Object.keys(this.players).length;
	},

	get numRoundReadinessAcknowledgements() {
		return this.roundReadyAcknowledgements.length;
	},

	acknowledgeRoundReadinessForPlayer: function(playerId) {
		if(this.roundReadyAcknowledgements.indexOf(playerId) == -1) {
			this.roundReadyAcknowledgements.push(playerId);
		}
	},

	/*calculateRoundWinner: function() {
		for(var i in this.players) {
			if(this.players[i].alive) {
				return this.players[i];
			}
		}
	},*/

	/*calculateGameWinners: function() {
		var winningPlayers = [];
		var maxWinCount = 0;

		for(var i in this.players) {
			if(this.players[i].wins > maxWinCount) {
				winningPlayers = [this.players[i]];
				maxWinCount = this.players[i].wins;
			} else if (this.players[i].wins == maxWinCount) {
				winningPlayers.push(this.players[i]);
			}
		}

		return winningPlayers;
	},*/


	resetPlayers: function() {
		for(var i in this.players) {
			var player = this.players[i];
			player.resetForNewRound();
		}
	},

	resetForNewRound: function() {
		this.resetPlayers();
		this.roundReadyAcknowledgements = [];
		this.numPlayersAlive = Object.keys(this.players).length;
	}
};

module.exports = Game;