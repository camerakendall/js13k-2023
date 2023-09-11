import { init, Sprite, GameLoop } from 'kontra';

const game = document.querySelector('canvas')

// const g = game.getContext("2d")
// g.fillStyle = 'yellow'
// g.fillRect(10, 10, 100, 100)


let { canvas, context } = init(game);
// console.log(canvas)


canvas.height = 700
canvas.width = 800

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  },
  spacebar: {
    pressed: false
  }
}

window.addEventListener('keydown', (event) => {
  
  switch (event.key) {
    case 'w':
     player.dy = -10
    break
    case 'a':
      keys.a.pressed = true
    break
    case 'd':
      keys.d.pressed = true
    break
    case ' ':
      keys.spacebar.pressed = true
    break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'a':
      keys.a.pressed = false
    break
    case 'd': 
      keys.d.pressed = false
    break
    case ' ': 
      keys.spacebar.pressed = false
    break
  }

})


const spriteImage = new Image()
spriteImage.src = 'img/knight.png'

const backgroundImg = new Image()
backgroundImg.src = 'img/background.png'

const holyGrailImage = new Image()
holyGrailImage.src = 'img/grail.png'

const enemyKnightImage = new Image()
enemyKnightImage.src = 'img/enemyknight.png'



const player = Sprite({
  x: 100,        // starting x,y position of the sprite
  y: 100,
  dx: 1,          // move the sprite 2px to the right every frame
  dy: 1,
  image: spriteImage,
  // render: function() {
  //   this.context.rect(this.x, this.y, 50, 50)
  //   this.context.fill();
  // }
  attacking: false 
  // () => {
  //   console.log('in attack method')
  //   console.log(player.x)
     
  //   context.fillStyle = 'red'
  //   context.fillRect(player.x, player.y, 100, 50)
    

  // }
});


const holyGrail = Sprite({
  x: 375,    
  y: 300,
  image: holyGrailImage
});

const enemy = Sprite({
  x: 700,        // starting x,y position of the sprite
  y: 10,
  // color: 'green',  // fill color of the sprite rectangle
  // width:  50,     // width and height of the sprite rectangle
  // height: 50,
  dx: -1,          // move the sprite 2px to the right every frame
  dy: 1,
  image: enemyKnightImage,
  location: {
    x: 0,
    y: 0
  }
});

const background = Sprite({
  x: 0,        // starting x,y position of the sprite
  y: 0,
  image: backgroundImg
});

spriteImage.onload= () => {
  player.width = spriteImage.width
  player.height = spriteImage.height + player.dy
  // player.render()
}

holyGrailImage.onload= () => {
  holyGrail.width = holyGrailImage.width
  holyGrail.height = holyGrailImage.height
  // player.render()
}

enemyKnightImage.onload= () => {
  enemy.width = enemyKnightImage.width
  enemy.height = enemyKnightImage.height
  // player.render()
}

backgroundImg.onload= () => {
  context.fillStyle = '#071733'
  context.fillRect(0, 0, canvas.width, canvas.height)
  // background.render()
}


const gravity = 0.5

/* 
**************************
GAME LOOP
**************************
*/
const loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    enemy.update();
    player.update();
  

    
    player.dx = 0
    if (keys.d.pressed) {
      player.dx = 10 
    } else if (keys.a.pressed) player.dx = -10

    //attack logic?
    if(keys.spacebar.pressed){
      console.log('pressed spacebar')
      player.attacking = true
      // player.attack().update()
  
      // player.attack()

      //when the space bar is pressed I want to
      //create an attackbox on the player
      //check is the attack box is colliding with enemy knight
      //render animation for player attack
    }


    if(enemy)

    // wrap the sprites position when it reaches
    // the edge of the screend
    // right wrapping
    if (player.x > canvas.width ) {
      player.x = 0;
    }
    if (player.x < 0 ) {
      player.x = canvas.width;
    }
    if (player.y < 0 ) {
      player.dy = 0
      player.y = 0
    }
  

    //beginning collision logic
    const playerBottom = player.y + player.height
    const playerTop = player.y
    const playerLeft = player.x
    const playerRight = player.x + player.width

    const enemyBottom = enemy.y + enemy.height
    const enemyTop = enemy.y
    const enemyLeft = enemy.x
    const enemyRight = enemy.x + enemy.width

    const holyGrailBottom = holyGrail.y + holyGrail.height
    const holyGrailTop = holyGrail.y
    const holyGrailLeft = holyGrail.x
    const holyGrailRight = holyGrail.x + holyGrail.width

    //collision detection needs to be before gravity logic
    //player and holyGrail collision detection
    if(playerLeft <= enemyRight && playerRight >= enemyLeft && playerBottom >= enemyTop && playerTop <= enemyBottom ){
      console.log('collidingenemy')
    }
    // enemy and holyGrail collision detection
    //when triggered need to end game/show end game screen and points
    if(enemyLeft <= holyGrailRight && enemyRight >= holyGrailLeft && enemyBottom >= holyGrailTop && enemyTop <= holyGrailBottom ){
      console.log('colliding')
    }

  



/* 
**************************
GRAVITY
**************************
*/
        if(player.y + player.height + player.dy < canvas.height) {
          player.dy += gravity
        } else {
          player.dy = 0
        }
  },


/* 
**************************
RENDER
**************************
*/
  render: function() { // render the game state
    background.render()
    holyGrail.render()
    player.render();
    enemy.render()
   
    
  }
});

loop.start();    // start the game
