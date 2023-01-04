
//=============================================================================
// constants
//=============================================================================
const HOME_KEY = 'home';
const VISITOR_KEY = 'visitor';
const NUM_SCORE_DIGITS = 3;

//=============================================================================
// global data
//=============================================================================
const sbmodel = {};


//=============================================================================
// utility/init
//=============================================================================
// initialize the data model for the scoreboard
function initModel() {
	function emptyTeamInfo() {
		return {
			score: 0,
			targetScore: 0,		// future
			readouts: [],
		}
	};

	// setup a basic info blob for each team
	sbmodel.teams = {};
	sbmodel.teams[HOME_KEY] = emptyTeamInfo();
	sbmodel.teams[VISITOR_KEY] = emptyTeamInfo();

	// are scores counting up or down?
	sbmodel.incrementing = true;
}

// initialize the score views for each team
// each view is dynamically created at runtime using html templating
function initTeamScoreboards() {
	document.querySelectorAll('.score-unit').forEach((unit) => {
		const team = unit.dataset.team;
		const teamInfo = sbmodel.teams[team];

		if (!teamInfo) {
			alert(`No info for team '${team}'`);
			return;
		}

		if ('content' in document.createElement('template')) {
			const template = document.querySelector('#score-digit');
			const parent = unit.querySelector('.team-score');

			for (let i = 0; i < NUM_SCORE_DIGITS; ++i) {
				const clone = template.content.cloneNode(true);

				teamInfo.readouts.unshift(clone.querySelector('.score-digit'));
				parent.appendChild(clone);
			}
		}
		else {
			alert(`No templating browser support!`);
			return;
		}
	});
}

// update the view for a team's score
function displayTeamScore(teamId = HOME_KEY) {
	const teamInfo = sbmodel.teams[teamId];
	const readouts = teamInfo.readouts;
	let score = teamInfo.score;

	for (let i = 0; i < NUM_SCORE_DIGITS; ++i) {
		const digit = score % 10;
		score = Math.floor(score / 10);

		readouts[i].dataset.d = (digit || score || (i == 0)) ? digit : '';
	}
}

// set the model and view state to either incrementing or decrementing
function setIncrDecrState(incr = true) {
	document.querySelectorAll('.delta-indicator').forEach((el) => {
		el.classList.remove('fa-square-plus', 'fa-square-minus');
		el.classList.add(incr ? 'fa-square-plus' : 'fa-square-minus');
	});

	sbmodel.incrementing = incr;
}

// reset team scores and update view
function reset() {
	sbmodel.teams[HOME_KEY].score =
	sbmodel.teams[HOME_KEY].targetScore =
	sbmodel.teams[VISITOR_KEY].score =
	sbmodel.teams[VISITOR_KEY].targetScore = 0;

	setIncrDecrState(true);

	displayTeamScore(HOME_KEY);
	displayTeamScore(VISITOR_KEY);
	displayTeamLeading();
}

// update the score for a team
function updateScore(teamId, delta) {
	const teamInfo = sbmodel.teams[teamId];
	if (teamInfo) {
		teamInfo.score = Math.max(teamInfo.score + delta, 0);
	}
}

// update the leading team indicator display
function displayTeamLeading() {
	let high = 0; // assumes 0 is lowest score possible
	let highTeam = undefined;
	Object.keys(sbmodel.teams).forEach((teamId) => {
		const teamInfo = sbmodel.teams[teamId];
		const score = teamInfo.score;
		if (score > high) {
			high = score;
			highTeam = teamId;
		}
		else if (score == high) {
			highTeam = undefined;
		}
	});

	document.querySelectorAll('.score-unit').forEach((unit) => {
		unit.classList.remove('team-leading');

		if (highTeam && (unit.dataset.team == highTeam)) {
			unit.classList.add('team-leading');
		}
	});
}

//=============================================================================
// setup UI event listeners
//=============================================================================
// score buttons
document.querySelectorAll('.score-btn').forEach((btn) => {
	btn.addEventListener('click', (ev) => {
		const b = ev.currentTarget;

		const teamId = b.dataset.team;
		const delta = +b.dataset.delta * (sbmodel.incrementing ? 1 : -1);

		updateScore(teamId, delta)
		displayTeamScore(teamId);
		displayTeamLeading();
	});
});

// reset button
document.getElementById('reset-btn').addEventListener('click', (ev) => {
	reset();
});

// keyboard events, down
document.addEventListener('keydown', (ev) => {
	if (ev.key == 'Shift') {
		setIncrDecrState(false);
	}
});

// keyboard events, up
document.addEventListener('keyup', (ev) => {
	if (ev.key == 'Shift') {
		setIncrDecrState(true);
	}
});

//=============================================================================
// do it
//=============================================================================
// init internals
initModel();
initTeamScoreboards();

// init UI
reset();

