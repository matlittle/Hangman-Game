var hangmanGame = {
	init: function() {
		//function to initialize starting variables and display
		// DO NOT USE "var". Excluding the var keyword will create Global variables
		const MaxGuesses = 6;

		this.gameType();
	},
	gameType: function() {
		// determines whether the game is vs computer or human
		let typePrompt = confirm("Are you playing with another person?");
		if(typePrompt) {
			this.currentState.gameType = "vsHuman"
		} else {
			this.currentState.gameType = "vsComputer";
		}

		console.log("gameType function: " + this.currentState.gameType);
	},
	currentState: {
		// object that keeps track of the game's state. 
		gameType: "",
		wins: 0,
		losses: 0,
		wordToGuess: "",
		numGuesses: 0,
		currGuess: "",
		missedGuesses: [], 
		correctGuess: {
			char: "",
			positions: []
		}
	},
	chooseWord: function() {
		// function to get word. Random if vs comp, input if pvp.
		if(this.currentState.gameType === "vsComputer") {
			// set random word length betweeen 3 and 12
			let ranWordLen = (Math.floor(Math.random() * 10) + 3);
			// initialize new http request variable
			let xhttpReq = new XMLHttpRequest();
			// configure GET request from random word generator. Async call.
			xhttpReq.open("GET", "http://randomword.setgetgo.com/get.php?Id=matlittle&Name=matlittle&Value=matlittle&len=" + ranWordLen.toString(), false);
			// make web service call
			xhttpReq.send();
			// return random word
			return xhttpReq.responseText;

		} else {
			// ask player for input word
			let playerWord = "";
			do {
				playerWord = prompt("Enter a word between 3 and 12 characters for the next game.");
			} while (playerWord.length < 3 || playerWord.length > 15)

			return playerWord;
		}
	},
	checkGuess: function() {
		// function that's called when a user makes a guess
		if(wordToGuess.indexOf(guess) === -1) {
			// if incorrect guess, increment incorrect guesses by 1
			numGuesses += 1;
			// add incorrect guess to missed guesses array
			missedGuesses.push(guess);
			return false;
		} else {
			// set return obj array to empty array
			correctGuess.index = [];
			// loop through correct word, building array of correct index locations
			for(i=0; i < wordToGuess.length; i+=1){
				if(guess === wordToGuess[i]){
				// add location of correct guess to obj index array
				correctGuess.index.push(i);
				}
			}

			correctGuess.char = guess;

			return correctGuess;
		}
	},
	updateDisplay: function() {
		// function to update display based on any changes
		return true;
	}
}



hangmanGame.init();

console.log(hangmanGame.currentState);

hangmanGame.currentState.wordToGuess = hangmanGame.chooseWord();

console.log(hangmanGame.currentState.wordToGuess);



document.onkeyup = function(event) {
	userGuess = event.key;

	console.log(userGuess);

/*
	console.log(checkGuess(userGuess));

	if(!checkGuess(userGuess)) {
		//guess was wrong
		console.log("wrong guess");
	} else {
		//guess was correct
		console.log("correct guess");
	}
*/

};