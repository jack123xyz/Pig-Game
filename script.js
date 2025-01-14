'use strict';

const gameState = {
  scores: [0, 0],
  currentScore: 0,
  activePlayer: 0,
  diceRoll: 0,
  playing: true,
  winningProbability: [50, 50],
};

const elements = {
  score: [
    document.getElementById('score--0'),
    document.getElementById('score--1'),
  ],
  current: [
    document.getElementById('current--0'),
    document.getElementById('current--1'),
  ],
  players: [
    document.querySelector('.player--0'),
    document.querySelector('.player--1'),
  ],
  dice: document.querySelector('.dice'),
  buttons: {
    new: document.querySelector('.btn--new'),
    hold: document.querySelector('.btn--hold'),
    roll: document.querySelector('.btn--roll'),
    confirm: document.querySelector('.btn--confirm'),
    closeModal: document.querySelector('.btn--close-modal'),
    changePlayer: document.querySelector('.btn--change-player'),
    newGame: document.querySelector('.btn--new-game'),
  },
  probability: [
    document.querySelector('.player--0 .probability-value--0'),
    document.querySelector('.player--1 .probability-value--1'),
  ],
  playerInputs: [
    document.querySelector('.input-name--0'),
    document.querySelector('.input-name--1'),
  ],
  playerNames: [
    document.querySelector('.player--0 .name'),
    document.querySelector('.player--1 .name'),
  ],
  modal: document.querySelector('.modal'),
  overlay: document.querySelector('.overlay'),
  // banner: document.querySelector('.banner h1'),
};

const closeModal = () => {
  elements.modal.classList.add('hidden');
  elements.overlay.classList.add('hidden');
};

const updatePlayerNames = () => {
  elements.playerInputs.forEach((input, i) => {
    const name = input.value.trim();
    elements.playerNames[i].textContent = name || `Player ${i + 1}`;
  });
};

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    updatePlayerNames();
    closeModal();
  } else if (e.key === 'Escape') {
    closeModal();
  }
});

elements.buttons.confirm.addEventListener('click', () => {
  updatePlayerNames();
  closeModal();
});

elements.buttons.closeModal.addEventListener('click', closeModal);
elements.overlay.addEventListener('click', closeModal);

const updateScore = (type, player, value) => {
  const target = type === 'current' ? elements.current : elements.score;
  target[player].textContent = value;
};

const toggleClass = (element, className, add = true) => {
  element.classList[add ? 'add' : 'remove'](className);
};

const switchPlayer = () => {
  updateScore('current', gameState.activePlayer, 0);
  gameState.currentScore = 0;
  gameState.activePlayer = gameState.activePlayer === 0 ? 1 : 0;
  elements.players.forEach(player => player.classList.toggle('player--active'));
};

const displayDice = dice => {
  elements.dice.src = `dice-${dice}.png`;
  elements.dice.classList.remove('hidden');
};

const calculateWinningProbability = () => {
  const targetScore = 100;
  const totalScore = gameState.scores[0] + gameState.scores[1];

  const playerTotals = [
    gameState.activePlayer === 0
      ? gameState.scores[0] + gameState.currentScore
      : gameState.scores[0],
    gameState.activePlayer === 1
      ? gameState.scores[1] + gameState.currentScore
      : gameState.scores[1],
  ];

  if (playerTotals[0] >= targetScore) return [100, 0];
  if (playerTotals[1] >= targetScore) return [0, 100];

  if (totalScore === 0) return [50, 50];

  const [player0Prob, player1Prob] = playerTotals.map(
    score => (score / targetScore) * 100
  );

  const totalProb = player0Prob + player1Prob;
  return [
    Math.round((player0Prob / totalProb) * 100),
    Math.round((player1Prob / totalProb) * 100),
  ];
};

const updateProbability = () => {
  gameState.winningProbability = calculateWinningProbability();
  elements.probability.forEach((el, i) => {
    el.textContent = `Win Probability: ${gameState.winningProbability[i]}%`;
  });
};

const resetGame = () => {
  Object.assign(gameState, {
    scores: [0, 0],
    currentScore: 0,
    activePlayer: 0,
    playing: true,
    winningProbability: [50, 50],
  });

  gameState.scores.forEach((_, i) => {
    updateScore('main', i, 0);
    updateScore('current', i, 0);
    toggleClass(elements.players[i], 'player--winner', false);
    toggleClass(elements.players[i], 'player--active', i === 0);
  });

  elements.dice.classList.add('hidden');
  updateProbability();
  // elements.banner.textContent = 'Pig Game';
};

elements.buttons.roll.addEventListener('click', () => {
  if (!gameState.playing) return;

  gameState.diceRoll = Math.trunc(Math.random() * 6) + 1;
  displayDice(gameState.diceRoll);

  if (gameState.diceRoll !== 1) {
    gameState.currentScore += gameState.diceRoll;
    updateScore('current', gameState.activePlayer, gameState.currentScore);
  } else {
    switchPlayer();
  }

  updateProbability();
});

elements.buttons.hold.addEventListener('click', () => {
  if (!gameState.playing) return;

  gameState.scores[gameState.activePlayer] += gameState.currentScore;
  updateScore(
    'main',
    gameState.activePlayer,
    gameState.scores[gameState.activePlayer]
  );

  if (gameState.scores[gameState.activePlayer] >= 100) {
    gameState.playing = false;
    elements.dice.classList.add('hidden');
    const winnerName = elements.playerNames[gameState.activePlayer].textContent;
    showWinnerModal(winnerName);
    elements.players[gameState.activePlayer].classList.add('player--winner');
    elements.players[gameState.activePlayer].classList.remove('player--active');
  } else {
    switchPlayer();
  }
});

elements.buttons.new.addEventListener('click', resetGame);

resetGame();
updateProbability();

const showWinnerModal = function (winnerName) {
  const winnerModal = document.querySelector('.winner-modal');
  const winnerOverlay = document.querySelector('.winner-overlay');
  const winnerMessage = document.querySelector('.winner-message');
  const samePlayers = document.querySelector('.btn--same-players');
  const changePlayers = document.querySelector('.btn--change-players');

  winnerMessage.textContent = `${winnerName} Wins! 🎉`;
  winnerModal.classList.remove('hidden');
  winnerOverlay.classList.remove('hidden');

  samePlayers.addEventListener('click', function () {
    winnerModal.classList.add('hidden');
    winnerOverlay.classList.add('hidden');
    resetGame();
  });

  changePlayers.addEventListener('click', function () {
    winnerModal.classList.add('hidden');
    winnerOverlay.classList.add('hidden');
    elements.modal.classList.remove('hidden');
    elements.overlay.classList.remove('hidden');
    resetGame();
  });
};
