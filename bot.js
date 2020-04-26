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
		state = admin_commands(state, cmd, bot, user, userID, channelID, message, evt)
     }
});

admin_commands = function(state, cmd, bot, user, userID, channelID, message, evt) {
	if (user == auth.admin) {
		switch(cmd) {
		// !ping
			case 'ping':
				bot.sendMessage({
					to: channelID,
					message: 'Pong!'
				});
				return state;
				break;
			case 'say_the_truth':
				bot.sendMessage({
					to: channelID,
					message: 'Ο Αναστάσιος είναι για τον πούτσο!'
				});
				return state;
				break;

			case 'init':
				return new Init_state();
				break;
			case 'b_r':
				return new Black_Red();
				break;
		
			case 'h_l':
				return new High_Low;
				break;
		}
	}
	if (user == 'Papayia!') {
		bot.sendMessage({
			to: channelID,
			message: 'Fuck you Papayia'
		});
	}
return state;
}


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
	get_real_value() {
		if (typeof(this.number) == 'number') {
			return this.number;
		} else {
			switch(this.number) {
				case 'J':
					return 11;
					break;
				case 'Q':
					return 12;
					break;
				case 'K':
					return 13;
					break;
				default:
					console.log("FUCKED UP CARD VALUE");
					console.log(typeof(this.number));
					break;
			}
		}
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
success_message = function(channelID, player, card) {
	return {
			to: channelID,
			message: 'Cheers μαλάκα. Ήβρες το: ' + card.get_number() + '' + card.get_suit() + 
			'\n' + 'Δεν πίνεις! 😊️'
		}
}
fail_message = function(channelID, player, card) {
	return {
			to: channelID,
			message: 'Cheers μαλάκα. Εν το ήβρες: ' + card.get_number() + '' + card.get_suit() + 
			'\n' + 'Πίννε μαλάκα! 😊️'
		}
}

function Black_Red(deck, players, bot, channelID) {
	console.log("Creating Black - Red");

	this.deck = deck;
	this.players = players;
	this.index = 0;
	this.order_list = [];
	for (const key of Object.keys(players)) {
		this.order_list.push(key);
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

	this.update_player = function(channelID) {
		if (this.order_list.length > this.index) {
			this.player = this.order_list[this.index];
			this.index += 1;
			bot.sendMessage(this.message(channelID, this.player));
			return this;
		} else {
			return new High_Low(this.deck, this.players, this.order_list, bot, channelID);
		}
	}		
	this.update_player(channelID);
 	
	this.execute = function(cmd, bot, user, userID, channelID, message, evt) {
		state = this;
		if (user == this.player) {
			switch(cmd) {
			// !ping
				case 'B':
					card = this.deck.draw();
					if ((card.get_suit() == '♤') || (card.get_suit() =='♧')) {
						bot.sendMessage(success_message(channelID, this.player, card));
					} else {
						bot.sendMessage(fail_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
					
				case 'R':
					card = this.deck.draw();
					if ((card.get_suit() == '♤') || (card.get_suit() =='♧')) {
						bot.sendMessage(fail_message(channelID, this.player, card));
					} else {
						bot.sendMessage(success_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
					
				default:
					bot.sendMessage({
						to: channelID,
						message: 'Έκαμες τα πούττους!'
					});
					break;
			}
		}
		return state;
	}
}

function High_Low(deck, players, order_list, bot, channelID) {
	console.log("Creating High - Low");
	this.deck = deck;
	this.players = players;
	this.order_list = order_list;
	this.index = 0;
	this.update_message = function(channelID, player) {
		return {
		to: channelID,
		message: player + ' choose Higher (+H) or Lower (+L)'
		+ '\n' + ' Cards: [' + this.players[player][0].get_number() +']' 
		}
	}
	this.update_player = function(channelID) {
		if (this.order_list.length > this.index) {
			this.player = this.order_list[this.index];
			this.index += 1;
			bot.sendMessage(this.update_message(channelID, this.player));
			return this;
		} else {
			return new In_Out(this.deck, this.players, this.order_list, bot, channelID);
		}
	}
	this.update_player(channelID);
	
	this.execute = function(cmd, bot, user, userID, channelID, message, evt) {
		state = this;

		if (user == this.player) {
			switch(cmd) {
			// !ping
				case 'H':
					card = this.deck.draw();
					if (card.get_real_value() > this.players[user][0].get_real_value()) {
						bot.sendMessage(success_message(channelID, this.player, card));
					} else {
						bot.sendMessage(fail_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state = this.update_player(channelID);
					break;
					
				case 'L':
					card = this.deck.draw();
					if (card.get_real_value() < this.players[user][0].get_real_value()) {
						bot.sendMessage(success_message(channelID, this.player, card));
					} else {
						bot.sendMessage(fail_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
					
				default:
					bot.sendMessage({
						to: channelID,
						message: 'Έκαμες τα πούττους!'
					});
					break;
			}
		} 
		return state;
	}
}

is_between = function(cards, card) {
	if ((Math.max([cards[0].get_real_value(), cards[1].get_real_value()]) > card.get_real_value()) 
		&& (Math.min([cards[0].get_real_value(), cards[1].get_real_value()]) < card.get_real_value())) {
		return true;
	}
	return false;
}

function In_Out(deck, players, order_list, bot, channelID) {
		console.log("Creating Inside-Outside");

	this.deck = deck;
	this.players = players;
	this.order_list = order_list;
		this.index = 0;

	this.update_message = function(channelID, player) {
		return {
		to: channelID,
		message: player + ' choose Inside (+I) or Outside (+O)'
		+ '\n' + ' Cards: [' + this.players[player][0].get_number() + ' ' + this.players[player][1].get_number() + ']' 
		}
	}
	this.update_player = function(channelID) {
		if (this.order_list.length > this.index) {
			this.player = this.order_list[this.index];
			this.index += 1;
			bot.sendMessage(this.update_message(channelID, this.player));
			return this;
		} else {
			return new Suit(this.deck, this.players, this.order_list, bot, channelID);
		}
	}
	console.log(order_list)
	this.update_player(channelID);
	
	this.execute = function(cmd, bot, user, userID, channelID, message, evt) {
		state = this;
		if (user == this.player) {
			switch(cmd) {
			// !ping
				case 'I':
					card = this.deck.draw();
					if (is_between(this.players[user],card)) {
						bot.sendMessage(success_message(channelID, this.player, card));
					} else {
						bot.sendMessage(fail_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
				case 'O':
					card = this.deck.draw();
					if (is_between(this.players[user],card)) {
						bot.sendMessage(fail_message(channelID, this.player, card));
					} else {
						bot.sendMessage(success_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
				default:
					bot.sendMessage({
						to: channelID,
						message: 'Έκαμες τα πούττους!'
					});
					break;
			}
		} 
		return state;
	}
}

is_rainbow = function(cards,card) {
	var suits = ['♤', // pikka
				'♧', // spathi
				'♡', // kouppas
				'♢' // karo
				]
	cards.push(card);	
	
	for (var i = 0; i < 4; i++) {
		var index = suits.indexOf(cards[i].get_suit())
		if (index == -1) {
			return false;
		} else {
			suits.splice(index,1);
		}
	}
	return true;
}

function Suit(deck, players, order_list, bot, channelID) {
		console.log("Creating Suit");

	this.deck = deck;
	this.players = players;
	this.order_list = order_list;
		this.index = 0;

	this.update_message = function(channelID, player) {
		return {
		to: channelID,
		message: player +  '♤ (+P), ♧ (+S), ♡ (+K), ♢ (+D), or rainbow (+R)'
		+ '\n' + ' Cards: [' + this.players[player][0].get_suit() + ' ' + this.players[player][1].get_suit() + ' ' + this.players[player][2].get_suit() +']' 
		}
	}
	this.update_player = function(channelID) {
		if (this.order_list.length > this.index) {
			this.player = this.order_list[this.index];
			this.index += 1;
			bot.sendMessage(this.update_message(channelID, this.player));
			return this;
		} else {
			bot.sendMessage({
				to: channelID,
				message: 'State = Suit. DAME PREPEI NA MPEI return NEW_STATE'
			});
			return this;
		}
	}
	console.log(order_list)
	this.update_player(channelID);
	
	this.execute = function(cmd, bot, user, userID, channelID, message, evt) {
		state = this;
		if (user == this.player) {
			switch(cmd) {
			// !ping
				case 'P':
					card = this.deck.draw();
					if (card.get_suit() == '♤') {
						bot.sendMessage(success_message(channelID, this.player, card));
					} else {
						bot.sendMessage(fail_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
				case 'S':
					card = this.deck.draw();
					if (card.get_suit() == '♧') {
						bot.sendMessage(success_message(channelID, this.player, card));
					} else {
						bot.sendMessage(fail_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
				case 'K':
					card = this.deck.draw();
					if (card.get_suit() == '♡') {
						bot.sendMessage(success_message(channelID, this.player, card));
					} else {
						bot.sendMessage(fail_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
				case 'D':
					card = this.deck.draw();
					if (card.get_suit() == '♢') {
						bot.sendMessage(success_message(channelID, this.player, card));
					} else {
						bot.sendMessage(fail_message(channelID, this.player, card));
					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
				case 'R':
					card = this.deck.draw();
					if (is_rainbow(this.players[user], card)) {
						bot.sendMessage({
							to: channelID,
							message: 'Cheers μαλάκα. Ήβρες το: ' + card.get_number() + '' + card.get_suit() + 
							'\n' + 'Πίννουν ούλλοι! 😊️'
						});
					} else {
						bot.sendMessage({
							to: channelID,
							message: 'Cheers μαλάκα. Εν το ήβρες: ' + card.get_number() + '' + card.get_suit() + 
							'\n' + 'Πίννεις μόνος σου! 😊️'
						});					}
					this.players[this.player].push(card);
					state =  this.update_player(channelID);
					break;
				default:
					bot.sendMessage({
						to: channelID,
						message: 'Έκαμες τα πούττους!'
					});
					break;
			}
		} 
		return state;
	}
}

var state = new Init_state();
var order_list = [];
