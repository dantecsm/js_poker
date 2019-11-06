// Cards
function Cards() {
	this.flowerArr = ['diamond', 'club', 'heart', 'spade']
	this.numArr = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

	this.cardArr = []
	this.flowerArr.forEach(flower => this.numArr.forEach(num => {
		this.cardArr.push({
			flower, num
		})
	}))
}
// shuffle the cards
Cards.prototype.shuffle = function () {
	//     this.cardArr.shuffle()
	// this.cardArr = this.cardArr.sort((x, y) => Math.random() > 0.5)
	let tempArr = JSON.parse(JSON.stringify(this.cardArr))
	this.cardArr = []
	while (tempArr.length > 0) {
		let randIdx = parseInt(Math.random() * tempArr.length)
		this.cardArr.push(tempArr[randIdx])
		tempArr.splice(randIdx, 1)
	}
}

// Player
function Player() {
	this.stage = {}
	this.bid = 0
	this.gain = 0
	this.playedCardIdx = -1
	this.bidState = true
	this.hands = []
}
// report card value
Player.prototype.reportValue = function () {
	let {
		flower, num
	} = this.stage
	let isSpade = flower === 'spade'
	let isFstFlower = flower === game.players[game.curPlayer].stage.flower

	return num + (isSpade ? 100 : (isFstFlower ? 50 : 0))
}
// play card
Player.prototype.play = function () {
	this.stage = this.hands.splice(this.playedCardIdx, 1)[0]
}

// Team
function Team(p1, p2) {
	this.score = 0
	this.bag = 0
	this.p = [p1, p2]
}
// update score
Team.prototype.updateScore = function () {
	let p1 = this.p[0]
	let p2 = this.p[1]
	let score = 0

	// Check nil and dblNil bid
	this.p.forEach(p => {
		if (p.bid === 0) {
			score += (p.gain === 0) ? 100 : -100
		} else if (p.bid < 0) {
			score += (p.gain === 0) ? 200 : -200
			p.bid = 0
		}
	})

	// Regular bid
	if (p1.bid > 0 || p2.bid > 0) {
		let bids = p1.bid + p2.bid
		score += (p1.gain + p2.gain >= bids ? bids : -bids) * 10
	}

	// Handle the bags
	let bags = p1.gain + p2.gain - (p1.bid + p2.bid)
	bags = bags > 0 ? bags : 0
	score += bags

	this.bag += bags
	if (this.bag >= 10) {
		score -= 100
		this.bag = this.bag % 10
	}

	return this.score += score
}

// BidBoard
function BidBoard() {
	this.options = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, -1]
}