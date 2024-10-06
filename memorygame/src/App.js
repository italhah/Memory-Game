import React, { useState, useEffect } from "react";
import "./App.css";

// Import the back image
import backImage from './backpic.PNG'; // Adjust the path if needed

// Import all card images
import angular from './card/angular.PNG';
import bootstrap from './card/bootstrap.PNG';
import github from './card/github.PNG';
import next from './card/next.PNG';
import react from './card/react.PNG';
import vue from './card/vue.PNG';

// The card data (each card has a duplicate to form pairs)
const cardImages = [
  { src: angular, matched: false },
  { src: bootstrap, matched: false },
  { src: github, matched: false },
  { src: next, matched: false },
  { src: react, matched: false },
  { src: vue, matched: false },
];

function App() {
  const [cards, setCards] = useState([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);

  // Function to shuffle cards and start a new game
  const shuffleCards = () => {
    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, id: Math.random() }));

    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffledCards);
    setTurns(0);
  };

  // Handle a card click
  const handleChoice = (card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
  };

  // Compare two selected cards
  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);
      if (choiceOne.src === choiceTwo.src) {
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.src === choiceOne.src ? { ...card, matched: true } : card
          )
        );
        resetTurn();
      } else {
        setTimeout(() => resetTurn(), 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  // Reset choices & increment turn count
  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns((prevTurns) => prevTurns + 1);
    setDisabled(false);
  };

  // Start a new game automatically when the component mounts
  useEffect(() => {
    shuffleCards();
  }, []);

  return (
    <div className="App">
      <div className="head"><h1>MEMORY GAME</h1></div>
      <button onClick={shuffleCards}>New Game</button>

      <div className="card-grid">
        {cards.map((card) => (
          <SingleCard
            key={card.id}
            card={card}
            handleChoice={handleChoice}
            flipped={card === choiceOne || card === choiceTwo || card.matched}
            disabled={disabled}
          />
        ))}
      </div>

      <p>Turns: {turns}</p>
      <p className="ref">  Developed by Talha Rahman  </p>
    </div>
  );
}

function SingleCard({ card, handleChoice, flipped, disabled }) {
  const handleClick = () => {
    if (!disabled) {
      handleChoice(card);
    }
  };

  return (
    <div className="card" onClick={handleClick}>
      <div className={flipped ? "flipped" : ""}>
        <img className="front" src={card.src} alt="card front" /> {/* Use the card's src */}
        <img
          className="back"
          src={backImage} // Use the imported back image here
          alt="card back"
        />
      </div>
    </div>
  );
}

export default App;
