require('./deck.js');

function init_state() {
	return new Init_state();
}

function Init_state() {
	this.deck = new Deck(0)
	this.players = {}
	this.execute = function(cmd, bot, user, userID, channelID, message, evt) {
		switch(cmd) {
		// !ping
			case 'ping':
				bot.sendMessage({
					to: channelID,
					message: 'Pong!'
				});
				break;
			case 'join':
				this.players[user] = []
				bot.sendMessage({
					to: channelID,
					message: user + ' joined the brawl'
				});
				return this;
				break;
			case 'start':
				player_num = Object.keys(players).length
				bot.sendMessage({
					to: channelID,
					message: 'Creating Deck for '+ player_num+ ' players'
				});
				deck = new Deck(player_num);
				break;
		}
	}

}