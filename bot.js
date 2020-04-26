var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '+') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		state = state.execute(cmd, bot, user, userID, channelID, message, evt)
        // switch(cmd) {
            // // !ping
            // case 'ping':
                // bot.sendMessage({
                    // to: channelID,
                    // message: 'Pong!'
                // });
				// break;
			// case 'join':
				// players[user] = []
				// bot.sendMessage({
					// to: channelID,
					// message: user + ' joined the brawl'
				// });
				// break;
			// case 'start':
				// player_num = Object.keys(players).length
				// bot.sendMessage({
					// to: channelID,
					// message: 'Creating Deck for '+ player_num+ ' players'
				// });
				// deck = new Deck(player_num);
				// break;
			// case 'draw':
				// var card = deck.draw();
				// players[user].push(card)
				// bot.sendMessage({
					// to: channelID,
					// message: user + ' drew '+ card.get_number() + ' ' + card.get_suit()
				// });
				
				// break;
            // Just add any case commands if you want to..
		// }
     }
});

class Deck {
	constructor(num_players) {
		this.deck = [];
		var deck_amount = Math.ceil((4 * num_players + 10)/52);
		for (var i = 0; i < deck_amount; i++) {
			this.deck = this.create_deck(this.deck);
		}
	}
	create_deck(deck) {
		var numbers = [1,2,3,4,5,6,7,8,9,10,'J','Q','K'];
		var suits = ['♤', // pikka
					'♧', // spathi
					'♡', // kouppas
					'♢' // karo
					]
		for (var i = 0; i < suits.length; i++) {
			for (var j = 0; j < numbers.length; j++) {
				deck.push(new Card(numbers[j],suits[i]));
			}
		}
		return deck
	}
	draw() {
		var index = Math.floor(Math.random() * Math.floor(this.deck.length));
		var card = this.deck[index]
		console.log(this.deck.length)
		this.deck.splice(index,1);
		return card
	}
}

class Card {
	constructor(number, suit) {
		this.number = number;
		this.suit = suit;
	}
	get_number() {
		return this.number;
	}
	get_suit() {
		return this.suit;
	}
}

var deck = new Deck(0);
var players = {};
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
				player_num = Object.keys(this.players).length
				bot.sendMessage({
					to: channelID,
					message: 'Creating Deck for '+ player_num+ ' players'
				});
				deck = new Deck(player_num);
				return new Black_Red(deck, this.players, bot, channelID)
				break;
		}
	return state;
	}

}

function Black_Red(deck, players, bot, channelID) {
	this.deck = deck;
	this.players = players;
	this.p_list = [];
	for (const key of Object.keys(players)) {
		this.p_list.push(key);
	}
	bot.sendMessage({
		to: channelID,
		message: 'Black (+B) or Red (+R)'
	});
	this.message = function message(channelID, player) {
		return {
		to: channelID,
		message: player + ' choose Black (+B) or Red (+R)'
	}
	}
	this.success_message = function(channelID, player, card) {
		return {
				to: channelID,
				message: 'Cheers μαλάκα. Ήβρες το: ' + card.get_number() + '' + card.get_suit() + 
				'\n' + 'Δεν πίνεις! 😊️'
			}
	}
	this.fail_message = function(channelID, player, card) {
		return {
				to: channelID,
				message: 'Cheers μαλάκα. Εν το ήβρες: ' + card.get_number() + '' + card.get_suit() + 
				'\n' + 'Πίννε μαλάκα! 😊️'
			}
	}
	this.update_player = function(channelID) {
		if (this.p_list.length > 0) {
			this.player = this.p_list.pop();
			bot.sendMessage(this.message(channelID, this.player));
		} else {
			bot.sendMessage({
				to: channelID,
				message: 'DAME PREPEI NA MPEI return NEW_STATE'
			});
		}
	}		
	this.update_player(channelID);
 	
	this.execute = function(cmd, bot, user, userID, channelID, message, evt) {
		if (user == this.player) {
			switch(cmd) {
			// !ping
				case 'B':
					card = this.deck.draw();
					if ((card.get_suit() == '♤') || (card.get_suit() =='♧')) {
						bot.sendMessage(this.success_message(channelID, this.player, card));
					} else {
						bot.sendMessage(this.fail_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					this.update_player(channelID);
					return this;
					break;
					
				case 'R':
					card = this.deck.draw();
					if ((card.get_suit() == '♤') || (card.get_suit() =='♧')) {
						bot.sendMessage(this.fail_message(channelID, this.player, card));
					} else {
						bot.sendMessage(this.success_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					this.update_player(channelID);
					return this;
					break;
					
				default:
					bot.sendMessage({
						to: channelID,
						message: 'Έκαμες τα πούττους!'
					});
					return this;
					break;
			}
		} 
	}
}

var state = new Init_state();
