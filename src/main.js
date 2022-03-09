import App from './App.svelte';
import interact from 'interactjs';

const app = new App({
	target: document.body,
	props: {
		activePlayer: 1,
		damage: 0,
		money: 0,
		players: 3,
		initialHealth: 50,
		maxTime: 0,
		optionBoard: false
	}
});

navigator.wakeLock.request('screen');

export default app;