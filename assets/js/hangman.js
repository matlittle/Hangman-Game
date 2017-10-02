

var hangmanGame = {
	curr: {
		// object that keeps track of the game's state. 
		gameType: "",
		wins: 0,
		losses: 0,
		wordToGuess: "",
		displayWord: "",
		alphabet: [
			["A","B","C","D","E","F","G","H","I","J","K","L","M"],
			["N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
		],
		numGuesses: 0,
		currGuess: "",
		missedGuesses: [], 
		correctGuess: {
			char: "",
			positions: [],
			previous: []
		}
	},
	init: function() {
		//function to initialize starting variables and display
		// DO NOT USE "var". Excluding the var keyword will create Global variables
		MaxGuesses = 6;

		// get the game type
		this.gameType();
		// get a word
		this.curr.wordToGuess = this.chooseWord();
		// build the initial display word
		this.curr.displayWord = this.initDisplayWord(this.curr.wordToGuess);
		// build the alphabet display
		this.buildAlphaDisplay(this.curr.alphabet);

	},
	gameType: function() {
		// determines whether the game is vs computer or human
		let typePrompt = confirm("Are you playing with another person?");
		if(typePrompt) {
			this.curr.gameType = "vsHuman"
		} else {
			this.curr.gameType = "vsComputer";
		}

		console.log("gameType function: " + this.curr.gameType);
	},
	chooseWord: function() {
		// function to get word. Random if vs comp, input if pvp.
		if(this.curr.gameType === "vsComputer") {
			// set random word length betweeen 4 and 12
			let ranWordLen = (Math.floor(Math.random() * 9) + 4);
			// initialize new http request variable
			let xhttpReq = new XMLHttpRequest();

				/*	// function that runs when state of API call changes
					xhttpReq.onReadyStateChange = function() {
						if (this.readyState === 4 && this.status === 200) {
							hangmanGame.curr.wordToGuess = xhttpReq.responseText;
						}
					};	*/

			// configure GET request from random word generator.
			xhttpReq.open("GET", "http://randomword.setgetgo.com/randomword/get.php?len=" + 
							ranWordLen.toString(), false);
			// make web service call
			xhttpReq.send();

			return xhttpReq.responseText;

		} else {
			// ask player for input word
			let playerWord = "";
			do {
				playerWord = prompt("Enter a word between 4 and 12 characters for the next game.");
			} while (playerWord.length < 4 || playerWord.length > 12)

			return playerWord;
		}
	},
	initDisplayWord: function(word) {
		let tempWord = "";

		for (var i = 0; i < word.length; i += 1) {
			tempWord += "_";
		}

		return tempWord;
	},
	checkGuess: function(guess) {
		// function that's called when a user makes a guess
		if(this.curr.wordToGuess.indexOf(guess) === -1) {
			// if incorrect guess, increment incorrect guesses by 1
			this.curr.numGuesses += 1;
			// add incorrect guess to missed guesses array
			this.curr.missedGuesses.push(guess);
			return false;
		} else {
			// set return obj array to empty array
			this.curr.correctGuess.positions = [];
			// loop through correct word, building array of correct index locations
			for(var i = 0; i < this.curr.wordToGuess.length; i += 1){
				if(guess === this.curr.wordToGuess[i]){
				// add location of correct guess to obj index array
				this.curr.correctGuess.positions.push(i);
				}
			}

			this.curr.correctGuess.char = guess;

			return this.curr.correctGuess;
		}
	},
	buildAlphaDisplay: function(alphaArr) {
		var alphabetDiv = document.getElementById("alphabet");

		var table = document.createElement("table");
		var tableBody = document.createElement("tbody");

		alphaArr.forEach( function(rowData) {
			var row = document.createElement("tr");

			rowData.forEach(function(cellData) {
				var cell = document.createElement("td");
				cell.appendChild(document.createTextNode(cellData));
				cell.id = "letter-"+cellData;
				row.appendChild(cell);
			});

			tableBody.appendChild(row);
		});

		table.appendChild(tableBody);
		alphabetDiv.appendChild(table);
		
		return true;
	},
	updateDisplay: function() {
		// function to update display based on any changes
		return true;
	}
};


document.onkeyup = function(event) {
	userGuess = event.key;

	console.log(userGuess);

	console.log(hangmanGame.checkGuess(userGuess));

	if(hangmanGame.checkGuess(userGuess)) {
		//guess was wrong
		console.log("correct guess");
	} else {
		//guess was correct
		console.log("wrong guess");
	}
};


hangmanGame.init();

console.log(hangmanGame.curr);

console.log(hangmanGame.curr.wordToGuess);



