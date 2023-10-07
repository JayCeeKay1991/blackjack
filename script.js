"use strict";

// ELEMENTS
// containers
const start = $(".start");
const app = $(".app");
const dealerContainer = $(".dealer");
const playerContainer = $(".player");

// start panel
const btnPlayer = $(".btn--player");
const namePlayer = $(".name--player");
const inputName = $(".input--player");

// game buttons
const btnNew = $(".btn--new");
const btnHit = $(".btn--hit");
const btnStand = $(".btn--stand");
const btnSupport = $(".btn--modal");
const btnCloseSupport = $(".btn--close-modal");

// cards
const cardDealer1 = $(".card--dealer1");
const cardDealer2 = $(".card--dealer2");
const cardInit1 = $(".card--init1");
const cardInit2 = $(".card--init2");
const cardCurrent = $(".card--current");

// scores
const scoreDealerElem = $(".score--dealer");
const scorePlayerElem = $(".score--player");

// other elements
const timerElem = $(".timer");
const modal = $(".modal");

// banners
const bannerWon = $(".banner--won");
const bannerLost = $(".banner--lost");
const bannerTie = $(".banner--tie");

// VARIABLES
let scoreDealer = 0;
let scorePlayer = 0;

////////////////////
////////////////////

// FUNCTIONS

// 1. disabling hit& stand buttons
const disableButtons = () => btnHit.add(btnStand).attr("disabled", true);

// 2. reset game UI for a new game
const reset = function () {
  // activate dealer, deactivate player
  dealerContainer.addClass("active");
  playerContainer.removeClass("active");

  // reset scores
  scoreDealerElem.text("0");
  scorePlayerElem.text("0");
  scoreDealer = 0;
  scorePlayer = 0;

  // hide card elements
  const cards = [cardDealer1, cardDealer2, cardInit1, cardInit2, cardCurrent];
  for (const card of cards) {
    card.addClass("hidden");
  }

  // disabling hit and stand button
  disableButtons();

  // remove banner form previous game
  bannerLost.add(bannerWon).add(bannerTie).addClass("hidden");
};

// 3. creating the card deck
const createDeck = function () {
  const cards = [
    { name: "2", value: 2 },
    { name: "3", value: 3 },
    { name: "4", value: 4 },
    { name: "5", value: 5 },
    { name: "6", value: 6 },
    { name: "7", value: 7 },
    { name: "8", value: 8 },
    { name: "9", value: 9 },
    { name: "10", value: 10 },
    { name: "jack", value: 10 },
    { name: "queen", value: 10 },
    { name: "king", value: 10 },
    { name: "ace", value: 11 }, // 11 or 1??
  ];
  const colors = ["hearts", "diamonds", "clubs", "spades"];
  let deck = [];
  // array with an object for each cars, containing card name and value
  for (const color of colors) {
    for (const card of cards) {
      deck.push({ name: `${card.name}_of_${color}`, value: card.value });
    }
  }
  return deck;
};

const deck = createDeck();

// 4. picking a card (image & value)

const pickCard = function (deck) {
  // picking a random image from the card deck and returning an object with file name and value
  const index = Math.floor(Math.random() * deck.length);
  return {
    cardImage: `Images/${deck[index].name}.png`,
    cardValue: deck[index].value,
  };
};

// 5. ace value logic

const aceValue = function (cardValue, score) {
  if (cardValue === 11) {
    if (score + 11 > 21) {
      return 1;
    }
  }
  return cardValue;
};

// 6. Timer

const startTimer = function () {
  timerElem.removeClass("hidden");
  let sec = 3;
  timerElem.text(`Dealer serves in ${sec} seconds...`);

  const timerInterval = setInterval(function () {
    sec--;
    timerElem.text(`Dealer serves in ${sec} seconds...`);

    // reset & hide the timer
    if (sec < 0) {
      clearInterval(timerInterval);
      timerElem.addClass("hidden");
    }
  }, 1000);
};

// 7. start the game
// dealer serves first cards
const dealerServes = function () {

  // DISCLAIMER: I developed the solution using this loop with the help of ChatGPT3.5.
  const cardsToServe = [cardDealer1, cardInit1, cardInit2];

  for (const card of cardsToServe) {
    const cardInfo = pickCard(deck);
    card.attr("src", cardInfo.cardImage).removeClass("hidden");

    // dynamic ace value only for the player here, as the dealer only gets one initial card:
    cardInfo.cardValue = aceValue(cardInfo.cardValue, scorePlayer);

    // Add the card values to the scores
    if (card === cardDealer1) {
      scoreDealer += cardInfo.cardValue;
    } else {
      scorePlayer += cardInfo.cardValue;
    }
  }
  // show the back side of the second dealer card
  cardDealer2.attr("src", "Images/back.png").removeClass("hidden");

  // Update the (displayed) scores
  scoreDealerElem.text(scoreDealer);
  scorePlayerElem.text(scorePlayer);

  if (scorePlayer === 21) {
    //disable hit & stand button
    disableButtons();
    // display banner
    bannerWon.removeClass("hidden");
  } else {
    // enabling hit and stand button
    btnHit.add(btnStand).attr("disabled", false);
  }
  // activate player, deactivate dealer
  playerContainer.addClass("active");
  dealerContainer.removeClass("active");
};

// 8. dealer reveals their second card (and hits further cards if necessary)
// DISCLAIMER: I developed the solution using async/await with the help of ChatGPT3.5

const dealerPicks = async function () {
  while (scoreDealer < 21 && scoreDealer < scorePlayer) {
    await new Promise((resolve) => {
      setTimeout(() => {
        const cardInfo = pickCard(deck);
        // Check if ace should be 11 or 1
        cardInfo.cardValue = aceValue(cardInfo.cardValue, scoreDealer);
        cardDealer2.attr("src", cardInfo.cardImage);
        scoreDealer += cardInfo.cardValue;
        scoreDealerElem.text(scoreDealer);
        resolve();
      }, 1000);
    });
  }
  if (scoreDealer > 21) {
    bannerWon.removeClass("hidden");
  } else if (scoreDealer === scorePlayer) {
    bannerTie.removeClass("hidden");
  } else {
    bannerLost.removeClass("hidden");
  }
};

// EVENT LISTENERS

// 1. start initial game
btnPlayer.click(function (e) {
  e.preventDefault();

  // start timer
  startTimer();

  // show input name in interface
  namePlayer.text(inputName.val());

  // reset UI
  reset();

  // hide start panel, show app panel
  start.addClass("hidden");
  app.removeClass("hidden");
  btnNew.removeClass("hidden");

  // start game after 4 sec
  setTimeout(dealerServes, 4000);
});

// 2. start new game with 'NEW GAME' button

btnNew.click(function (e) {
  e.preventDefault();
  reset();
  startTimer();
  setTimeout(dealerServes, 4000);
});

// 3. pick another card with HIT button

btnHit.click(function (e) {
  e.preventDefault();

  const cardInfo = pickCard(deck);
  cardCurrent.attr("src", cardInfo.cardImage).removeClass("hidden");
  // Check if ace should be 11 or 1
  cardInfo.cardValue = aceValue(cardInfo.cardValue, scorePlayer);

  scorePlayer += cardInfo.cardValue;
  scorePlayerElem.text(scorePlayer);

  if (scorePlayer === 21) {
    // display banner
    bannerWon.removeClass("hidden");
    // disabling hit and stand button
    disableButtons();
  }

  if (scorePlayer > 21) {
    // display banner
    bannerLost.removeClass("hidden");
    // disabling hit and stand button
    disableButtons();
  }
});

// 4. STAND button

btnStand.click(function (e) {
  e.preventDefault();
  // activate dealer, deactivate player
  dealerContainer.addClass("active");
  playerContainer.removeClass("active");

  // disabling hit and stand button
  disableButtons();

  // dealer hitting until score is above player's
  dealerPicks();
});

// 5. Opening and closing the support text

btnSupport.click(function (e) {
  e.preventDefault();
  // display modal window
  modal.removeClass("hidden");
});

btnCloseSupport.click(function (e) {
  e.preventDefault();
  // hide modal window
  modal.addClass("hidden");
});
