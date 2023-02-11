
		class Asteroid
		{
			/*
				Use to represent the asteroid objects
			*/
			constructor()
			{
				this.x;
				this.asteroidSpeed;
				this.y;
				
				this.exploded = false;
				
				this.minSpeed = 6;
				this.maxSpeed = 12;
				
				this.image = asteroidImage;
				this.explosionSound = createAudio("game-assets/explosion-05.wav");
				this.explosionImage = loadImage("game-assets/explosion-2.png");
				this.load();
			}
			
			load()
			{
				/*
					Asteroids are re-used
					When an asteroid falls of the screen (see if in display()) load() is called
				*/
				this.x = Math.floor(Math.random() * 1270); // random X position
				this.asteroidSpeed = Math.floor(Math.random() * (this.maxSpeed - this.minSpeed + 1) + this.minSpeed); // random speed between min and max speed
				this.y = 0;
				
				this.image = asteroidImage;
				this.exploded = false;
			}
			
			display() 
			{
				image(this.image, this.x, this.y+= this.asteroidSpeed); // each time an asteroid is displyed its position is updated (asteroids fall [y is increased])
				if (this.y > 591) // asteroid is dissappeared and load() is called to load again the asteroid 
				{
					this.load();
					return true;
				}
			}
			
			explode()
			{
				if (!this.exploded) // each asteroid can explode only once
				{
					this.exploded = true;
					this.image = this.explosionImage; // change the asteroid image with explosion
					//this.explosionSound.play(); // explosion sound
					this.explosionSoundPD();
					
					return true; // if explode returns true player loses a life
				}
			}
			
			detonate()
			{
				if (!this.exploded) // each asteroid can explode/detonate only once
				{
					this.exploded = true;
					this.image = this.explosionImage; // change the asteroid image with explosion
					//this.explosionSound.play(); // explosion sound
					this.explosionSoundPD();
					
					return true; 
				}
			}
			
			explosionSoundPD()
			{
				Pd.send('explosion', []);
			}
		}
		
		class MissilePack
		{
			//missilePacks = [];
			loadSound = "";
			
			constructor()
			{
				this.x = 0;
				this.y = 0;
				this.image = loadImage("game-assets/Powerup.png");
				//this.loadSound = createAudio("game-assets/load-missiles.wav");
			}
			
			newMissilePack(score)
			{
				if (score > 0 && this.y == 0) // y == 0 means that there is no other pack in the screen
				{
					let xR = Math.floor(Math.random() * 100);
					if ( xR == 1 )
					{
						console.log('Create a missile pack');
						this.x = Math.floor(Math.random() * 1270); // random X position
						this.y = 0;
						image(this.image, this.x, this.y++);
					}
				}
			}
			
			display()
			{
				if (this.y > 0) // when a missilePack is created this.y is increased - so if a missilePack exists then it will be displayed
				{
					image(this.image, this.x, this.y+= 5);
					if (this.y > 591) // pack is lost
					{
						this.y = 0;
					}
				}
			}
			
			checkForCollection(spaceship) // if a missilepack collides with the spaceship is collected
			{
				// taken by asteroid.checkForCollision() -- not very precise yet 
				if (Math.abs(this.x - spaceship.x) < 50 && this.y >= 480)
				{
					spaceship.addMissiles(3);
					this.y = 0; // missilepack is taken - new missilePack may be created
					//console.log('Missile pack is collected!');
					//this.loadSound.play();
					
					Pd.send('powerup', []);
					
				}

				
				
			}
		}
		
		class Missile
		{
			x = 0;
			y = 0;
			exploded = false;
			
			constructor()
			{
				this.y = 500;
				this.image = missileImage;
			}
			
			fire(spaceship)
			{
				this.x = spaceship.x+25;
			}
			
			display() 
			{
				if (this.exploded)
					return false;
				
				image(this.image, this.x, this.y-=10); // missiles move forward (y is decreased)
				if (this.y < 0) // missile is dissappeared 
				{
					return false; 
				}
				return true;
			}
			
			explode()
			{
				this.exploded = true;
			}
		}
		
		class AsteroidSwarm
		{
			/*
				This class handles the asteroid objects
			*/
			constructor()
			{
				this.increaseDifficulty = 0; // as difficulty is increased more asteroids will be coming
				this.asteroids = []; // keeps the Asteroid instances
				this.asteroidsPassed = 0; // it is also used for score
			}
			
			reset()
			{
				this.asteroids.length = 0;
				this.asteroidsPassed = 0;
				this.increaseDifficulty = 0;
			}
			
			addNewAsteroids(howMany)
			{
				for (let i = 0; i < howMany; i++)
				{
					let asteroid = new Asteroid();
					this.asteroids.push(asteroid);
				}
			}
			
			handleAsteroids()
			{
				for (let i = 0; i < this.asteroids.length; i++)
				{
					if (this.asteroids[i].display()) // display() returns true if an asteroid falls of the canvas
					{
						this.asteroidsPassed++; // and the asteroid's passage is completed
					}
				}
				
				this.handleDifficulty();
			}
			
			handleDifficulty()
			{
				// add asteroids as difficulty increases
				if (this.asteroids.length < (this.asteroidsPassed/20))
					this.addNewAsteroids(1);
			}
			
			checkForCollision(spaceship)
			{
				// not very precise yet 
				for (let i = 0; i < this.asteroids.length; i++)
				{
					if (Math.abs(this.asteroids[i].x - spaceship.x) < 50 && this.asteroids[i].y >= 460)
					{
						return this.asteroids[i].explode();
					}
				}
			}

			checkForDetonation(missiles)
			{
				// not very precise yet 
				for (let i = 0; i < this.asteroids.length; i++)
				{
					for (let z = 0; z < missiles.length; z++)
					{
						if (Math.abs(this.asteroids[i].x - missiles[z].x) < 40  && Math.abs(this.asteroids[i].y - missiles[z].y) < 20 )
						{
							missiles[z].explode();
							return this.asteroids[i].detonate();
						}
					}
				}
			}	
		}
		
		class SpaceShip
		{
			x = 640; // X position
			y = 490; // Y position
			engineSound = "";
			startSound = "";
			monsterSound = "";
			
			missiles = 0;
			
			constructor()
			{
				this.image = loadImage("game-assets/Player.png");
				this.engineSound = createAudio("game-assets/Background.wav");
				this.startSound = createAudio("game-assets/starting.wav");
				this.endSound = createAudio("game-assets/dying.wav");
				
				this.monsterSound
				$.get('game-assets/pure-data-patches/monster.pd', function(patchStr) {
				  this.monsterSound = Pd.loadPatch(patchStr);
				  //Pd.start();
				})
			}
			
			
			display()
			{
				image(this.image, this.x, this.y);
			}
			
			move(move)
			{
				if (this.x > 40 && move < 0) // chech that will not get out of the left barrier
				{
					this.x += (move*10);
				}

				if (this.x < 1160 && move > 0) // chech that will not get out of the right barrier
				{
					this.x += (move*10);
				}
			}
			
			startEngineSound()
			{
				this.engineSound.play();
				this.engineSound.loop();
			}
			
			startMonsterSound()
			{
				//this.monsterSound.play();
				//this.monsterSound.loop();
			}
			
			startStartingSound()
			{
				this.startSound.play();
			}
			
			startEndSound()
			{
			     this.endSound.play();
			}
			
			stopEngineSound()
			{
				this.engineSound.stop();
			}
			
			stopMonsterSound()
			{
				//this.monsterSound.stop();
			}
			
			stopStartingSound()
			{
				this.startSound.stop();
			}
			
			stopEndSound()
			{
				this.endSound.stop();
			}
			
			addMissiles(howMany)
			{
				this.missiles+= howMany;
			}
			
			fireMissile()
			{
				if (this.missiles > 0)
				{
					let missile = new Missile();
					missile.fire(this);
					this.missiles--;
					return missile;
				}
			}
		}
		
		class SpaceShipLives
		{	
			/*
				Show how many lives are left
			*/
			constructor()
			{
				this.lives = [];
				this.livesLeft = 5; // initial number of lives
				
				for (let i = 0; i < this.livesLeft; i++)
				{
					let live = loadImage("game-assets/Life.png");
					this.lives[i] = live;
				}
			}
			
			display()
			{
				this.showLives(this.livesLeft);
			}
			
			showLives(livesLeft)
			{
				for (let i = 0; i < livesLeft; i++)
				{
					image(this.lives[i], (i*40+10), 20); // defining the position of displayed objects
				}
			}
			
			reduceOneLive()
			{
				this.livesLeft--;
			}
			
			reset()
			{
				this.livesLeft = 5;
			}
		}
		
		/*
			Global variables to be used by our game
		*/
		let spaceShipLives; // object of class SpaceShipLives
		let background; // background-image
		let spaceship; // object of class SpaceShip
		let asteroidImage; // load the image once
		let asteroidSwarm; // object of class AsteroidSwarm
		let startGame = false;
		let startOnce = true;
		let gameOver = false;
		let paused = false;
		let counter=0;
		
		let missileImage;
		let missiles = [];
		let missilePack;
		
		let gameSounds;
		
		/*
			P5 functions preload(), setup(), draw() and keyPressed() are used
		*/
		function preload() 
		{
			background = loadImage("game-assets/Cave.jpg");		// load the background-image
			asteroidImage = loadImage("game-assets/Enemy.png"); // load once and the pass to Asteroid so that will not load each time an Asteroid is created
			spaceship = new SpaceShip();
			
			missileImage = loadImage("game-assets/Attack.png");
			missilePack = new MissilePack();
			
			gameSounds
				//$.get('game-assets/pure-data-patches/empire-begins-2.pd', function(patchStr) {
				$.get('game-assets/pure-data-patches/sound.pd', function(patchStr) {
				  gameSounds = Pd.loadPatch(patchStr);
				})
		}
		
		function setup() 
		{
			spaceShipLives = new SpaceShipLives();
			createCanvas(1280, 591); // canvas size tied to the background-image
			asteroidSwarm = new AsteroidSwarm(); // it is going to handle the asteroids
			
			setupTouchScreenControls();
		}
		
		function draw() 
		{
			/*
				Checking game state, drawing our game's frames, getting input
			*/
			
			image(background, 0, 0);
			spaceship.display();
			spaceShipLives.display();
						
			showMessages(); // displays messages (if needed) depending on the game state
			
			drawTouchScreenControls();
			
			if (startGame && !gameOver && startOnce) // begin a new game
			{
				Pd.start();
				asteroidSwarm.reset();
				asteroidSwarm.addNewAsteroids(2);
				spaceship.startEngineSound();
				spaceship.startMonsterSound();
				spaceship.startStartingSound();
				spaceship.stopEndSound();
				spaceShipLives.reset();
				startOnce = false;
			}
			
			if (gameOver) // game over
			{
				spaceship.stopEngineSound();
				spaceship.stopMonsterSound();
				spaceship.stopStartingSound();
				spaceship.startEndSound();
				spaceship.missiles = 0;
				Pd.send('gameover', []);
			}
			
			if (!gameOver && startGame && !paused) // while the game is played
			{
				asteroidSwarm.handleAsteroids(); // handle the asteroids
				
				if (asteroidSwarm.checkForCollision(spaceship)) // check for collisions - if any then reduceOneLive
				{	
					spaceShipLives.reduceOneLive();
				}
				
				if (asteroidSwarm.checkForDetonation(missiles)) // check for collisions - if any then reduceOneLive
				{	
					//spaceShipLives.reduceOneLive();
				}
				
				if (spaceShipLives.livesLeft == 0) // defines the player loses 
					gameOver = true;
				
				if (keyIsDown(37)) // left arrow is pressed
				{
					spaceship.move(-1);
				}
				
				if (keyIsDown(39)) // right arrow is pressed
				{
					spaceship.move(1);
				}
				
				spaceship.move(getTouchDirectionControl()); // get the touch controls - if any
				
				/*
				if (keyIsDown(32)) // space is pressed
				{
					missiles.push(spaceship.fireMissile());
				}
				*/
				
				missilePack.newMissilePack(asteroidSwarm.asteroidsPassed);
				missilePack.display();
				missilePack.checkForCollection(spaceship);
				
				for (let i = 0; i < missiles.length; i++)
				{
					//onsole.log('Check missile['+i+']');
					if(!missiles[i].display())
					{
						//console.log('Missile ' + i + ' out of screen');
						missiles.splice(i,1);
						i--;
					}
				}
				
			}
		}
				
		function keyPressed()
		{
			if (keyIsDown(70)) // f is pressed - fire a missile
			{
				let temp = spaceship.fireMissile();
				if (temp != undefined)
					missiles.push(temp);
			}
			
			if (keyCode == 78) // n is pressed - New game
			{
				startGame = true;
				startOnce = true;
				gameOver = false;
				counter++;
				if (counter>=2)
					Pd.send('soundoperator', []);
			}
			
			if (keyCode == 80) // p for pause is pressed
			{
				if (startGame && !gameOver && !paused)
					paused = true;
				else if (startGame && !gameOver && paused)
					paused = false;
					
				if (paused)
					spaceship.stopEngineSound();
				    spaceship.stopStartingSound();
					spaceship.stopMonsterSound();
					Pd.send('soundoperator', []);
					
					
				if (!paused)
					spaceship.startEngineSound();
				    spaceship.startMonsterSound();
			}
		}

		function showMessages()
		{
			rect(20, 110, 160, 30);
			textSize(30);
			text("Score: " + asteroidSwarm.asteroidsPassed, 30, 135); // Score is shown
			
			rect(1107, 35, 160, 33);
			text("Magic: " + spaceship.missiles, 1120, 60); // Score is shown
		
		    
			if (!startGame)
				rect(280, 280, 680, 140); // rectangle (window) to show the message to start game
				
			if (gameOver)
				rect(280, 220, 680, 200); // rectangle (window) to show the message game over and start game
		
			textSize(50);
			if (!startGame || gameOver) // provide instructions
			{
				text('Press N to start a new game.', 300, 300, 800, 200);
				textSize(25);
				text('Use the left and right arrows to avoid the enemies.', 340, 360, 800, 200);
				text('Get thunderstones and fire by pressing the F-button!', 340, 390, 800, 200);
			}
			
			if (gameOver)
			{
				textSize(50);
				text('Game over!', 500, 280);
			}
			
			if (paused)
			{
				textSize(50);
				text('Game paused!', 500, 280);
			}
		}
	
