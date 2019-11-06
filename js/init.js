// Global Variable
let players = qa('.player')
let cards = qa('.card')
let pokers = players.map(p => p.querySelectorAll('.card'))
let stagePokers = qa('.stage >.card')
let bidBoard = q('.bidBoard')
let bidOptions = qa('.bidBoardOption')
let scoreA = q('.teamAScore')
let scoreB = q('.teamBScore')
let stats = qa('.stat')

// easier select
function q(el) {
	return document.querySelector(el)
}

function qa(el) {
	return [...document.querySelectorAll(el)]
}