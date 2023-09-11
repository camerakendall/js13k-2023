import {collides, SpriteClass, randInt, init, Sprite, GameLoop } from 'kontra';

const game = document.querySelector('canvas')

// const g = game.getContext("2d")
// g.fillStyle = 'yellow'
// g.fillRect(10, 10, 100, 100)


let { canvas, context } = init(game);
// console.log(canvas)


canvas.height = 600
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
  x: 100,       
  y: 450,
  dx: 2,          
  dy: 2,
  image: spriteImage,
  
});


const holyGrail = Sprite({
  x: 10,    
  y: 520,
  image: holyGrailImage
});

// const enemy = Sprite({
//   x: randInt(300, 800),
//   y: -randInt(0, 100),
//   dx: -1, 
//   dy: 1,
//   image: enemyKnightImage,
//   damage: false,
//   spawnTime: 200,
//   timer: 0,
//   draw: () => context.drawImage(enemyKnightImage, 500, 500)
// });


class enemy extends SpriteClass {
  constructor(){
    super()
  this.x = randInt(300, 800),
  this.y = -randInt(0, 100),
  this.dx = -2, 
  this.dy = 2,
  this.image = enemyKnightImage,
  this.spawnTime = 100,
  this.timer = 0,
  this.height = enemyKnightImage.height,
  this.width = enemyKnightImage.width
  }
};

const enemyInstance = new enemy

const background = Sprite({
  x: 0,
  y: 0,
  image: backgroundImg
});

spriteImage.onload= () => {
  player.width = spriteImage.width
  player.height = spriteImage.height + player.dy
}

holyGrailImage.onload= () => {
  holyGrail.width = holyGrailImage.width
  holyGrail.height = holyGrailImage.height
}

// enemyKnightImage.onload= () => {
//   enemy.width = enemyKnightImage.width
//   enemy.height = enemyKnightImage.height
// }

backgroundImg.onload= () => {
  context.fillStyle = '#071733'
  context.fillRect(0, 0, canvas.width, canvas.height)
}


const gravity = 0.5
let points = 0
const enemyArray = []


/* 
**************************
GAME LOOP
**************************
*/
const loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    // console.log(enemyInstance)
    // enemyInstance.update()
    player.update();

    const playerBottom = player.y + player.height
    const playerTop = player.y
    const playerLeft = player.x
    const playerRight = player.x + player.width

    // const enemyInstanceBottom = enemyInstance.y + enemyInstance.height
    // const enemyInstanceTop = enemyInstance.y
    // const enemyInstanceLeft = enemyInstance.x
    // const enemyInstanceRight = enemyInstance.x + enemyInstance.width

    const holyGrailBottom = holyGrail.y + holyGrail.height
    const holyGrailTop = holyGrail.y
    const holyGrailLeft = holyGrail.x
    const holyGrailRight = holyGrail.x + holyGrail.width
   
   
    enemyArray.forEach( enemy => { enemy.update()
      if(collides(enemy, player) ){
        // enemy.damage = true
        console.log(enemy.height, enemy.width)
        enemy.x = -500
        points += 1
        console.log(points)
      }
      if(collides(enemy, holyGrail)){
        console.log('colliding grail')
      }
    
    
    })
    


    if (enemyInstance.timer <enemyInstance.spawnTime){
     enemyInstance.timer += 1
    } else {
      enemyArray.push(new enemy)
      // enemyArray.forEach( enemy => enemy.update())
      // enemy.render()
     enemyInstance.timer  = 0

    }

    
    player.dx = 0
    if (keys.d.pressed) {
      player.dx = 10 
    } else if (keys.a.pressed) player.dx = -10

    //attack logic?
    if(keys.spacebar.pressed){
      console.log('pressed spacebar')
    }

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
  

  

    //collision detection needs to be before gravity logic
    //player and enemy collision detection
    // if(playerLeft <= enemyInstanceRight && playerRight >= enemyInstanceLeft && playerBottom >= enemyInstanceTop && playerTop <= enemyInstanceBottom ){
    //   // enemy.damage = true
    //   enemyInstance.x = -500
    //   points += 1
    //   console.log(points)
    // }


    // enemy and holyGrail collision detection
    //when triggered need to end game/show end game screen and points
    // if(enemyInstanceLeft <= holyGrailRight && enemyInstanceRight >= holyGrailLeft && enemyInstanceBottom >= holyGrailTop && enemyInstanceTop <= holyGrailBottom ){
    //   console.log('colliding')
    // }


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
    player.render()
 
    // enemyInstance.render()
    
    enemyArray.forEach( enemy => enemy.render())
 
  
    
  }
});

loop.start();    // start the game
