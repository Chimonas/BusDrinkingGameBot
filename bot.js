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
		state = admin_commands(state, args, cmd, bot, user, userID, channelID, message, evt)
     }
});

fuck_you_list = ['Papayia!', 'Ginger']

admin_commands = function(state, args, cmd, bot, user, userID, channelID, message, evt) {
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
			case 'pyr':
				deck = new Deck(1);
				players = state.players[user] = []
				return new Pyramid(new Deck(1), players, bot, channelID);
				break;
			case 'init':
				return new Init_state();
				break;
			case 'b_r':
				return new Black_Red();
				break;
		
			case 'h_l':
				return new High_Low();
				break;
			case 'bus':
				deck = new Deck(1);
				players = {'tatatos': [deck.draw(), deck.draw(), deck.draw(), deck.draw()], 'fail': [deck.draw(),  deck.draw()]};
				
				return new Bus(players, bot, channelID);
				break;
		}
	}
	index = fuck_you_list.indexOf(user);
	if (index != -1) {
		bot.sendMessage({
			to: channelID,
			message: 'Fuck you ' + user + '!'
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
				message: 'Pyramid Bitcheees' + '\n'
						+ '▢ ▢ ▢ ▢ x2 shots' + '\n'
						+ '   ▢ ▢ ▢   x4 shots' + '\n'
						+ '     ▢ ▢     x6 shots' + '\n'
						+ '        ▢        x8 shots'
			});
			return new Pyramid(this.deck, this.players, bot, channelID);
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

function Pyramid(deck, players, bot, channelID) {
		console.log("Creating Pyramid");

	this.deck = deck;
	this.players = players;
	this.pyramid_list = ["▢", "▢", "▢", "▢", "▢", "▢", "▢", "▢", "▢", "▢"];
	this.pyramid_index = 0;
	this.current_card_owners = [];
	console.log()
	for (const key of Object.keys(players)) {
		var player = key;
		console.log(this.players[player][0].get_number() + ' ' + this.players[player][1].get_number() + ' ' 
					+ this.players[player][2].get_number() + ' ' + this.players[player][3].get_number());
		bot.sendMessage({
		to: channelID,
		message: player + ' has: ' + this.players[player][0].get_number() + ' ' + this.players[player][0].get_suit() + ', '
								+ this.players[player][1].get_number() + ' ' + this.players[player][1].get_suit() + ', '
								+ this.players[player][2].get_number() + ' ' + this.players[player][2].get_suit() + ', '
								+ this.players[player][3].get_number() + ' ' + this.players[player][3].get_suit() + '\n'
	});
	
	}
	
	this.update_pyramid = function(channelID) {
		for (var i = 0; i < 10; i++) {
			if (i == this.pyramid_index) {
				this.card = this.deck.draw();
				this.pyramid_list[i] = this.card.get_number() + this.card.get_suit();
				this.pyramid_index += 1;
				break;
			}
		}
		bot.sendMessage({
			to: channelID,
			message: this.pyramid_list[0] + ' ' + this.pyramid_list[1] + ' ' + this.pyramid_list[2] + ' ' + this.pyramid_list[3] + ' x2 shots' + '\n'
					+ '   ' + this.pyramid_list[4] + ' ' + this.pyramid_list[5] + ' ' + this.pyramid_list[6] + '   x4 shots' + '\n'
					+ '     ' + this.pyramid_list[7] + ' ' + this.pyramid_list[8] + '    x6 shots' + '\n'
					+ '        ' + this.pyramid_list[9] + '        x8 shots'
		});
		return this.card;
	}
	
	this.has_the_card = function(channelID, card) {
		for (const key of Object.keys(this.players)) {
			if (this.pyramid_index < 10) {
				console.log(current_card.get_number());
				if ((current_card.get_number() == this.players[key][0].get_number()) 
					|| (current_card.get_number() == this.players[key][1].get_number()) 
					|| (current_card.get_number() == this.players[key][2].get_number()) 
					|| (current_card.get_number() == this.players[key][3].get_number())) {
					this.current_card_owners.push(key);
					console.log('Found ' + key);
				}
			}
		}
		owners_string = '';
		if (this.current_card_owners.length != 0) {
			for (var i=0; i < this.current_card_owners.length; i++) {
				if (i == this.current_card_owners.length - 1) {
					owners_string += ' and ' + this.current_card_owners[i];
				} if (i == 0) {
					owners_string = this.current_card_owners[i];
				} else {
					owners_string += ', ' + this.current_card_owners[i];
				}
				
			}
		}
		console.log('Owners: ' + owners_string);
		if (owners_string != '') {
			bot.sendMessage({
				to: channelID,
				message: owners_string + ' spread your shots!'
			});
		} else {
			bot.sendMessage({
				to: channelID,
				message: 'Nobody drinks!'
			});
		}
		return owners_string;
	}
	/*
	current_card = this.update_pyramid(channelID);
	owners = this.has_the_card(channelID, current_card);
	*/
	var owners = '';
	while ((owners == '') && (this.pyramid_index < 10)) {
		current_card = this.update_pyramid(channelID);
		owners = this.has_the_card(channelID, current_card);
	}
	console.log(this.pyramid_list[0] + ' ' + this.pyramid_list[1] + ' ' + this.pyramid_list[2] + ' ' + this.pyramid_list[3] + ' ' + this.pyramid_list[4] + ' '
		+ this.pyramid_list[5] + ' ' + this.pyramid_list[6] + ' ' + this.pyramid_list[7] + ' ' + this.pyramid_list[8] + ' ' + this.pyramid_list[9]);
	
	this.execute = function(cmd, bot, user, userID, channelID, message, evt) {
		console.log(this.current_card_owners + user);
		var index = this.current_card_owners.indexOf(user);
		if (index > -1) {
			this.current_card_owners.splice(index, 1);
			console.log(this.current_card_owners);
		}
		if (this.current_card_owners.length == 0) {
			owners = '';
			while ((owners == '') && (this.pyramid_index < 10)) {
				current_card = this.update_pyramid(channelID);
				var check = false;
				for (var i=0; i < this.pyramid_index; i++) {
					if ((current_card.get_number()) == this.pyramid_list[i].charAt(0)) {
						check = true;
					}
				}
				if (check == false) {
					owners = this.has_the_card(channelID, current_card);
				}
				
				console.log(this.pyramid_list[0] + ' ' + this.pyramid_list[1] + ' ' + this.pyramid_list[2] + ' ' + this.pyramid_list[3] + ' ' + this.pyramid_list[4] + ' '
		+ this.pyramid_list[5] + ' ' + this.pyramid_list[6] + ' ' + this.pyramid_list[7] + ' ' + this.pyramid_list[8] + ' ' + this.pyramid_list[9]);
			}
			if (this.pyramid_index == 10) {
				return new Bus(this.players, bot, channelID);
			}
		}
		return this;
	}
}


cards_sum = function(cards) {
	sum = 0;
	for (var card of cards) {
		sum += card.get_real_value();
	}
	return sum;
}
 make_bus_text = function(bus, index, reveal) {
	 res = 'Up (+U) or Down (+D)' + '\n';
	 bus_text = '';
	 index_text = '';
	for (var i = 0; i < bus.length; i++) {
		if (reveal[i]) {
			bus_text += bus[i].get_number() + '' + bus[i].get_suit() + ' ';
		} else {
			bus_text += '▢ ';
		}
		if (index < 6) {
			if (index == i) {
				index_text += '↑';
			} else {
				index_text += '       ';
			}
		}
	}
	res += bus_text + '\n' + index_text;
	return res;
 }
 
 cards2string = function(cards) {
	res = '';
	for (var card of cards) {
		res += card.get_number() + card.get_suit();
	}
	return res;
 }
 
function Bus(players, bot, channelID) {
	message = '';
	max = 0;
	
	for (const key of Object.keys(players)) {
		if (cards_sum(players[key]) > max) {
			max = cards_sum(players[key]);
			this.player = key;
		}
		message += key + ": " + cards_sum(players[key]) + '\n';
	}
	message += 'LOSER: ' + this.player + ' with: ' + cards2string(players[this.player]) + ' = ' + max + ' points.' 
			+ '\n' + 'Έλα στο κόκκινο λεωφορείο!';
	bot.sendMessage({
		to: channelID,
		message: message
	});
	
	
	this.deck = new Deck(1);
	this.bus = [this.deck.draw(), this.deck.draw(), this.deck.draw(), this.deck.draw(), this.deck.draw()];
	this.index = 0;
	this.reveal = [false, false, false, false, false];
	
	this.update_message = function(channelID, bus, index, reveal) {
		return {
			to: channelID,
			message: make_bus_text(bus, index, reveal)
		}
	}
	this.success_message = function(channelID, card) {
		return {
			to: channelID,
			message: 'Congratulations! You drew: ' + card.get_number() + '' + card.get_suit()  + '\n'
			+ 'You advance to the next level'
		}
	}
	this.fail_message = function(channelID, card, shots) {
		return {
			to: channelID,
			message: 'Haha! You drew: ' + card.get_number() + '' + card.get_suit()  + '\n'
			+ 'Go back to the beggining. Να κάτσεις πάνω! Πίνε ' + shots + ' shots'
		}
	}
	this.equal_message = function(channelID, card) {
		return {
			to: channelID,
			message: 'Τράβησες: ' + card.get_number() + '' + card.get_suit()  + '\n' +'Μένεις στάσιμος. Χοχο'
		}
	}
	bot.sendMessage(this.update_message(channelID, this.bus, this.index, this.reveal));
	
	this.execute = function(cmd, bot, user, userID, channelID, message, evt) {
		if (user == this.player) {
			if (!this.reveal[this.index]) {
				this.reveal[this.index] = true;
				bot.sendMessage({
					to: channelID,
					message: 'The card underneath was: ' + this.bus[this.index].get_number() + '' + this.bus[this.index].get_suit()
				});
			}
			switch (cmd) {
				case 'U':
					card = this.deck.draw();
					ind = this.index;
					
					if (card.get_real_value() > this.bus[this.index].get_real_value()) {
						this.index += 1;
						bot.sendMessage(this.success_message(channelID, card));
					} else {
						if (card.get_real_value() < this.bus[this.index].get_real_value()) {
						this.index = 0;
						bot.sendMessage(this.fail_message(channelID, card, ind+1));
						} else {
						bot.sendMessage(this.equal_message(channelID, card));
						}
					}
					this.bus[ind] = card;

				break;
				case 'D':
					card = this.deck.draw();
					ind = this.index;

					if (card.get_real_value() < this.bus[this.index].get_real_value()) {
						this.index += 1;
						bot.sendMessage(this.success_message(channelID, card));
					} else {
						if (card.get_real_value() > this.bus[this.index].get_real_value()) {
							this.index = 0;
							bot.sendMessage(this.fail_message(channelID, card, ind+1));
						} else {
							bot.sendMessage(this.equal_message(channelID, card));
						}
					}
					this.bus[ind] = card;

				break;
				default:
					bot.sendMessage({
						to: channelID,
						message: 'Έκαμες τα πούττους!'
					});
				break;
			}
			bot.sendMessage(this.update_message(channelID, this.bus, this.index, this.reveal));
			console.log(this.index);
			if (this.index == 5) {
				bot.sendMessage({
					to: channelID,
					message: 'Congratulations! You made it out the bus. You sly dog'
				});
				return new Init_state();
			} else {
				return this;
			}
		}
	}
}

var state = new Init_state();
var order_list = [];
