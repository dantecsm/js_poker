let Game = {
	init() {
		this.cards = new Cards()
		this.p1 = new Player()
		this.p2 = new Player()
		this.p3 = new Player()
		this.p4 = new Player()
		this.teamA = new Team(this.p1, this.p3)
		this.teamB = new Team(this.p2, this.p4)
		this.bidBoard = new BidBoard()
		this.players = [this.p1, this.p2, this.p3, this.p4]
		this.table = this.players.map(p => p.stage)

		this.curPlayer = 0
		this.fstPlayer = this.p1
		this.gameOver = false
		this.spadeBreak = false
		this.isNewTurn = false

		this._seperateCards()
		this.loop()
		this.listen()
		this.activateAI()
	},

	loop() {
		this.update()
		this.draw()
		this.gameOver ? this.endGame() : requestAnimationFrame(this.loop.bind(this))
	},

	update() {
	  // Handle if one hand is over
	  if (this._isHandOver()) {
	  	this._HandleHandOverEvent()
	  }

	  // Handle the regular routine
	  if (this._isPlayable()) {
	  	this._HandleCardPlayedEvent()
	  }

	  // Handle if one turn is over
	  if (this._isTurnOver()) {
	  	this._HandleTurnOverEvent()
	  }
	},

	draw() {
	  // hide cards
	  cards.forEach(card => card.classList.add('hide'))

	  // Draw hands
	  this.players.forEach((player, pid) => player.hands.forEach((hand, hid) => {
	  	let {
	  		flower, num
	  	} = hand
	  	pokers[pid][hid].classList.remove('hide')
	  	pokers[pid][hid].dataset.flower = flower
	  	pokers[pid][hid].dataset.num = num
	  }))
	  // Highlight current player
	  players.forEach((player, pid) => {
	  	let action = this.curPlayer === pid ? 'add' : 'remove'
	  	player.classList[action]('cur')
	  })

	  // Draw stage
	  this.table.forEach((t, idx) => {
	  	let {
	  		flower, num
	  	} = t
	  	if (flower && num) {
	  		stagePokers[idx].classList.remove('hide')
	  		stagePokers[idx].dataset.flower = flower
	  		stagePokers[idx].dataset.num = num
	  	}
	  })

	  // Draw bidBoard
	  let bidShow = this.players.some(p => p.bidState)
	  if(bidShow) {
	  	bidBoard.classList.remove('hide')
	  	stagePokers.map(s => s.classList.add('hide'))
	  } else {
	  	bidBoard.classList.add('hide')
	  }
	  

	  // Draw bid & gain
	  this.players.forEach((p, pid) => {
	  	stats[pid].innerHTML = `${p.gain}/${p.bid}`
	  })

	  // Draw score
	  scoreA.innerText = this.teamA.score
	  scoreB.innerText = this.teamB.score
	},

	listen() {
	  // Modify player.playedCardIdx
	  pokers.forEach((player, pid) => player.forEach(hand => hand.addEventListener('click', e => {
	  	let t = e.currentTarget
	  	let idx = [...t.parentNode.children].indexOf(t)
	  	this.players[pid].playedCardIdx = t.classList.contains('clicked') && this.curPlayer === pid ? idx : -1
	  })))

	  // Modify player.bid
	  bidOptions.forEach((b, idx) => b.addEventListener('click', e => {
	  	this.players[this.curPlayer].bid = this.bidBoard.options[idx]
	  	this.players[this.curPlayer].bidState = false
	  	this.curPlayer = (this.curPlayer + 1) % 4
	  }))

	  // Add other listeners
	  pokers.forEach(player => player.forEach(hand => hand.addEventListener('click', e => {
	  	e.stopPropagation()
	  	let t = e.currentTarget
	  	if (t.classList.contains('clicked')) {
	  		return t.classList.remove('clicked')
	  	}
	  	this._removeCardFocus(player)
	  	t.classList.add('clicked')
	  })))

	  document.addEventListener('click', this._removeCardFocus(null))
	},

	endGame() {
		let winner = this.teamA.score > this.teamB.score ? 'N & S' : 'W & E'
		alert(`
			游戏结束
			${this.teamA.score} : ${this.teamB.score}
			${winner} 获胜！
			`)
		if (window.confirm('再玩一局?')) {
			game = Object.assign({}, Game)
			game.init()
		}
	},

	_removeCardFocus(els) {
		let targets = els || cards
		targets.forEach(card => card.classList.remove('clicked'))
	},

	_seperateCards() {
		this.cards.shuffle()
		let cardCopy = JSON.parse(JSON.stringify(this.cards.cardArr))
		this.players.forEach(p => p.hands = cardCopy.splice(0, 13).sort((x, y) => {
			return x.flower === y.flower ?
			y.num - x.num :
			game.cards.flowerArr.indexOf(x.flower) - game.cards.flowerArr.indexOf(y.flower)
		}))
	},

	_isHandOver() {
		return this.players.every(p => p.stage.flower)
	},

	_isTurnOver() {
		let q1 = this.players.every(p => p.hands.length === 0)
		let q2 = this.players.some(p => p.gain !== 0)
		return q1 && q2
	},

	_HandleCardPlayedEvent() {
		let player = this.players[this.curPlayer]
		player.play()
		this.table[this.curPlayer] = player.stage
		if (!this.spadeBreak && player.stage.flower === 'spade') {
			this.spadeBreak = true
			alert('spadeBreak!')
		}
		player.playedCardIdx = -1
		this.curPlayer = (this.curPlayer + 1) % 4

		this.sleep(200)
	},

	_HandleHandOverEvent() {
		this.fstPlayer = this.players.reduce((p, winner) =>
			p.reportValue() > winner.reportValue() ? p : winner, this.p1)
		if(this.isNewTurn) {
			this.isNewTurn = false
		} else {
			this.fstPlayer.gain += 1
		}
		this.curPlayer = this.players.indexOf(this.fstPlayer)
		this.players.forEach((p, pid) => this.table[pid] = p.stage = {})
		this._removeCardFocus()

		this.sleep(500)
	},

	_HandleTurnOverEvent() {
	  // Update the score
	  this.teamA.updateScore()
	  this.teamB.updateScore()
	  this.spadeBreak = false
	  this.isNewTurn = true

	  // Analyse if the game is over
	  if ((this.teamA.score > this.teamB.score) && (this.teamA.score > 500 || this.teamB.score < -200)) {
	  	this.gameOver = true
	  } else if ((this.teamB.score > this.teamA.score) && (this.teamB.score > 500 || this.teamA.score < -200)) {
	  	this.gameOver = true
	  } else {

	    // Clear all bids&gains
	    this.players.forEach(p => p.bid = p.gain = p.bag = 0)

	    // Shuffle and Give out cards
	    this._seperateCards()

	    // Arise bid selection mode
	    this.players.forEach(p => p.bidState = true)
	  }
	},

	_isPlayable() {
		let player = this.players[this.curPlayer]
		let idx = player.playedCardIdx

	  // Logic rule
	  if (player.playedCardIdx < 0 || player.bidState) {
	  	player.playedCardIdx = -1
	  	return false
	  }

	  // Game rule
	  let isFstPlayer = player === this.fstPlayer
	  let curFlower = player.hands[idx].flower

	  if (isFstPlayer) {
	  	let isSpade = curFlower === 'spade'
	  	let spadeBreak = this.spadeBreak
	  	let onlySpade = player.hands.every(card => card.flower === 'spade')

	  	if (isSpade && !spadeBreak && !onlySpade) {
	  		player.playedCardIdx = -1
	      // only notificate when player is not computer
	      if(game.curPlayer === 0) {
	      	alert('NG!(No Spade First)')
	      }
	      return false
	    }
	  } else {
	  	let isSameFlower = curFlower === this.fstPlayer.stage.flower
	  	let hasSameFlower = player.hands.some(card => card.flower === this.fstPlayer.stage.flower)

	  	if (!isSameFlower && hasSameFlower) {
	  		player.playedCardIdx = -1
	      // only notificate when player is not computer
	      if(game.curPlayer === 0) {
	      	alert('NG!(Should Follow Flower)')
	      }
	      return false
	    }
	  }
	  return true
	},

	sleep(t) {
		let lastTime = + new Date
		while(+new Date - lastTime <= t) {}
	},

	activateAI() {
		let handTimer = setInterval(() => {
			let bidLock = game.players.some(p => p.bidState)
			game.players.forEach((p, i) => {
				if(!bidLock && 0 !== i && i === game.curPlayer) {
					let leftHands = p.hands.length
					p.playedCardIdx = parseInt(Math.random() * leftHands)
				}
			})
		}, 1000 / 15)

		let bidTimer = setInterval(() => {
			game.players.forEach((p, i) => {
				if(p.bidState && 0 !== i && i === game.curPlayer) {
					p.bid = 3
					p.bidState = false
					game.curPlayer = (game.curPlayer + 1) % 4
				}
			})
		}, 1000)
	}
}

let game = Object.assign({}, Game)
game.init()