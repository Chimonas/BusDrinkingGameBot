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
		var suits = ['♤','♡','♢','♧'];
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
