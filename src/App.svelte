<script>
	import {dndzone} from "svelte-dnd-action";

	export let activePlayer, initialHealth, damage, money, maxTime, players, optionBoard;

	let color = getColor();

	let time = maxTime;

	let p1health = initialHealth;
	let p2health = initialHealth;
	let p3health = initialHealth;
	let p4health = initialHealth;

	timer();

	let counts = document.querySelectorAll('.count');

	document.addEventListener('long-press', function(e) {
		switch (e.target.id) {
			case 'count1':
				p1health -= damage;
				damage = 0;
				break;

			case 'count2':
				p2health -= damage;
				damage = 0;
				break;

			case 'count3':
				p3health -= damage;
				damage = 0;
				break;

			case 'count4':
				p4health -= damage;
				damage = 0;
				break;

			default:
				break;
		}
	})

	function setPlayerNumber(number) {
		players = number;
	}

	function toggleOptionBoard() {
		optionBoard = !optionBoard;
	}

	function incrementP1() {
		p1health += 1;
	}

	function decrementP1() {
		p1health -= 1;
	}

	function incrementP2() {
		p2health += 1;
	}

	function decrementP2() {
		p2health -= 1;
	}

	function incrementP3() {
		p3health += 1;
	}

	function decrementP3() {
		p3health -= 1;
	}

	function incrementP4() {
		p4health += 1;
	}

	function decrementP4() {
		p4health -= 1;
	}

	function incrementDamage() {
		damage += 1;
	}

	function decrementDamage() {
		damage -= 1;
	}

	function incrementMoney() {
		money += 1;
	}

	function decrementMoney() {
		money -= 1;
	}

	function endTurn() {
		money = 0;
		damage = 0;

		activePlayer = getActivePlayer(activePlayer);
		color = getColor();
		time = maxTime;
	}

	function getActivePlayer(currentAP) {
		let aP = currentAP == players ? 1 : currentAP + 1;
		switch (currentAP) {
			case 4:
				if (p1health <= 0) return getActivePlayer(aP)
				break;
			case 1:
				if (p2health <= 0) return getActivePlayer(aP)
				break;
			case 2:
				if (p3health <= 0) return getActivePlayer(aP)
				break;
			case 3:
				if (p4health <= 0) return getActivePlayer(aP)
				break;

			default:
				break;
		}

		return aP;
	}

	function getColor() {
		return activePlayer == 1 ? 'blue' : activePlayer == 2 ? 'pink' : activePlayer == 3 ? 'orange' : 'green';
	}

	function timer() {
			setTimeout(() => {
				if (maxTime > 0) time--;
				timer();
			}, 1000);
		}
</script>

<main class="h-screen flex flex-col border-blue-800 border-pink-800 border-orange-800 border-green-800">
	<div class="flex-1 flex">
		<div class="{activePlayer == 1 || activePlayer == 3 ? 'rotate-180' : ''} {players <= 2 ? 'w-full' : 'w-1/2'} player bg-blue-800 text-white relative flex justify-center items-center">
			<div id="count1" class="count text-5xl font-black p-3 z-10 flex justify-center items-center">
				{p1health}
			</div>
			<div class="{p1health <= 0 ? 'flex' : 'hidden'} justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]">X</div>
			<div on:click={incrementP1} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
			<div on:click={decrementP1} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
		</div>
		<div class="{activePlayer == 1 || activePlayer == 3 ? 'rotate-180' : ''} {players >= 3 ? 'flex' : 'hidden'} player bg-orange-800 text-white w-1/2 relative justify-center items-center">
			<div id="count3" class="count text-5xl font-black p-3 z-10 flex justify-center items-center">
				{p3health}
			</div>
			<div class="{p3health <= 0 ? 'flex' : 'hidden'} justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]">X</div>
			<div on:click={incrementP3} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
			<div on:click={decrementP3} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
		</div>
	</div>
	<div class="bg-red-500 border-b border-t border-black flex-col {activePlayer == 1 || activePlayer == 3 ? 'rotate-180' : ''}">
		<div class="flex">
			<div class="dmg-counter flex justify-center items-center w-1/2 h-56 p-2">
				<div class="counter relative flex justify-center items-center">
					<div class="count text-5xl font-black p-3 my-10 z-10">
						{damage}
					</div>
					<div on:click={incrementDamage} class=" absolute top-0 bottom-1/2 left-0 right-0"></div>
					<div on:click={decrementDamage} class=" absolute top-1/2 bottom-0 left-0 right-0"></div>
				</div>
			</div>
			<div class="money-counter flex justify-center w-1/2 p-2 h-56 bg-yellow-300">
				<div class="counter relative flex justify-center items-center">
					<div class="count text-5xl font-black p-3 w-full z-10">
						{money}
					</div>
					<div on:click={incrementMoney} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
					<div on:click={decrementMoney} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
				</div>
			</div>
		</div>
		<div class="flex justify-between items-center bg-{color}-800 text-3xl font-black px-4 text-white">
			<div on:click={toggleOptionBoard} class="config w-1/5 text-xl p-3">⚙️</div>
			<div on:click={endTurn} class="end-button flex justify-center items-center py-4">
				END TURN
			</div>
			<div class="timer w-1/5 text-xl text-right p-3 {time < 0 && 'text-red-300'}">{maxTime > 0 ? time : ''}</div>
		</div>
	</div>
	<div class="flex-1 flex">
		<div class="{activePlayer == 1 || activePlayer == 3 ? 'rotate-180' : ''} {players >= 2 ? 'flex' : 'hidden'} {players <= 3 ? 'w-full' : 'w-1/2'} player bg-pink-800 text-white relative flex justify-center items-center">
			<div id="count2" class="count text-5xl font-black  p-3 z-10 flex justify-center items-center">
				{p2health}
			</div>
			<div class="{p2health <= 0 ? 'flex' : 'hidden'} justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]">X</div>
			<div on:click={incrementP2} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
			<div on:click={decrementP2} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
		</div>
		<div class="{activePlayer == 1 || activePlayer == 3 ? 'rotate-180' : ''} {players >= 4 ? 'flex' : 'hidden'} player bg-green-800 text-white w-1/2 relative justify-center items-center">
			<div id="count4" class="count text-5xl font-black p-3 z-10 flex justify-center items-center">
				{p4health}
			</div>
			<div class="{p4health <= 0 ? 'flex' : 'hidden'} justify-center items-center absolute top-0 bottom-0 left-0 right-0 bg-black bg-opacity-60 text-red-500 text-[220px]">X</div>
			<div on:click={incrementP4} class="absolute top-0 bottom-1/2 left-0 right-0"></div>
			<div on:click={decrementP4} class="absolute top-1/2 bottom-0 left-0 right-0"></div>
		</div>
	</div>

	<div class="option-board {activePlayer == 1 || activePlayer == 3 ? 'rotate-180' : ''} {optionBoard ? 'block' : 'hidden'} z-50 text-white absolute top-0 bottom-0 left-0 right-0 bg-black p-5 flex flex-col justify-center">
		<div on:click={toggleOptionBoard} class="absolute top-3 right-3 p-4 text-3xl">X</div>
		<div class="player-number flex flex-col space-y-2">
			<div on:click={() => setPlayerNumber(2)} class="players-2 {players == 2 ? 'bg-gray-800' : 'bg-black'} p-3 border rounded text-center">2 PLAYERS</div>
			<div on:click={() => setPlayerNumber(3)} class="players-3 {players == 3 ? 'bg-gray-800' : 'bg-black'} p-3 border rounded text-center">3 PLAYERS</div>
			<div on:click={() => setPlayerNumber(4)} class="players-4 {players == 4 ? 'bg-gray-800' : 'bg-black'} p-3 border rounded text-center">4 PLAYERS</div>
		</div>
		<div class="timer-option my-6">
			CHRONO :
			<input bind:value={maxTime} class="bg-black w-32">
		</div>
	</div>
</main>


