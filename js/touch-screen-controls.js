let controllerPad;
let story;
let controllerLeft;
let controllerRight;
let controllerNew;
let controllerPause;
let fire;

let leftIsPressed;
let rightIsPressed;

document.addEventListener('contextmenu', event => event.preventDefault()); // disable context menu that would appear on long taps

function setupTouchScreenControls()
{
	controllerPad = createImg("./game-assets/game-controller-2.png");
	controllerLeft = createImg("./game-assets/arrow-left.png");
	controllerRight = createImg("./game-assets/arrow-right.png");
	controllerNew = createImg("./game-assets/n-button.png");
	controllerPause = createImg("./game-assets/p-button.png");
	fire = createImg("./game-assets/fire-button.png");
	story = createImg("./game-assets/story.png"); 

	
	controllerLeft.touchStarted(touchLeftPressed);
	controllerLeft.mouseReleased(releasedTouchControls);
	
	controllerRight.touchStarted(touchRightPressed);
	controllerRight.mouseReleased(releasedTouchControls);
	
	controllerNew.mousePressed(newGameTouchPressed);
	controllerPause.mousePressed(pauseGameTouchPressed);
	fire.mousePressed(fireTouchPressed);
}

function drawTouchScreenControls()
{
	controllerPad.position(100,600);
	controllerLeft.position(120,700);
	controllerRight.position(870,700);
	controllerNew.position(380, 700);
	controllerPause.position(640, 700);
	fire.position(450, 950);
	story.position(180, 1300);
}

function releasedTouchControls()
{
	leftIsPressed = false;
	rightIsPressed = false;
}

function touchLeftPressed()
{
	leftIsPressed = true;
	rightIsPressed = false;
}

function touchRightPressed()
{
	leftIsPressed = false;
	rightIsPressed = true;
}

function getTouchDirectionControl()
{
	if (leftIsPressed)
	{
		return -1;
	}
	
	if (rightIsPressed)
	{
		return 1;
	}
}

function newGameTouchPressed()
{
	startGame = true;
	startOnce = true;
	gameOver = false;
	counter++;
	if (counter>=2)
		Pd.send('soundoperator', []);
}

function pauseGameTouchPressed()
{
	if (startGame && !gameOver && !paused)
					paused = true;
				else if (startGame && !gameOver && paused)
					paused = false;
					
				if (paused)
					spaceship.stopEngineSound();
				    spaceship.stopMonsterSound();
					Pd.send('soundoperator', []);
				
					
				if (!paused)
					spaceship.startEngineSound();
				    spaceship.startMonsterSound();
}

function fireTouchPressed()
{
				let temp = spaceship.fireMissile();
				if (temp != undefined)
					missiles.push(temp);
}