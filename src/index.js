import { getCanvas, getContext, init, Sprite, GameLoop } from 'kontra';

const game = document.querySelector('canvas')

// const g = game.getContext("2d")
// g.fillStyle = 'yellow'
// g.fillRect(10, 10, 100, 100)


let { canvas, context } = init(game);
// console.log(canvas)
// console.log(context)

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
  }
})


const gravity = 0.5
const spriteImage = new Image()
spriteImage.src = 'img/knight.png'

const backgroundImg = new Image()
backgroundImg.src = 'img/background.png'

const grailImage = new Image()
grailImage.src = 'img/grail.png'

const enemyKnightImage = new Image()
enemyKnightImage.src = 'img/enemyknight.png'



const player = Sprite({
  x: 100,        // starting x,y position of the sprite
  y: 100,
  // color: 'yellow',  // fill color of the sprite rectangle
  // width: image.width,     // width and height of the sprite rectangle
  // height: image.height,
  dx: 2,          // move the sprite 2px to the right every frame
  dy: 2,
  image: spriteImage
});


const holyGrail = Sprite({
  x: 375,        // starting x,y position of the sprite
  y: 300,
  // color: 'yellow',  // fill color of the sprite rectangle
  // width:  50,     // width and height of the sprite rectangle
  // height: 50,
  // dx: 2,          // move the sprite 2px to the right every frame
  // dy: 2,
  image: grailImage
});



const enemy = Sprite({
  x: 100,        // starting x,y position of the sprite
  y: 50,
  // color: 'green',  // fill color of the sprite rectangle
  // width:  50,     // width and height of the sprite rectangle
  // height: 50,
  dx: 2,          // move the sprite 2px to the right every frame
  dy: 2,
  image: enemyKnightImage
});

const background = Sprite({
  x: 0,        // starting x,y position of the sprite
  y: 0,
  // color: 'yellow',  // fill color of the sprite rectangle
  // width: image.width,     // width and height of the sprite rectangle
  // height: image.height,
  // dx: 2,          // move the sprite 2px to the right every frame
  // dy: 2,
  image: backgroundImg
});

spriteImage.onload= () => {
  player.width = spriteImage.width
  player.height = spriteImage.height + player.dy
  // player.render()
}

enemyKnightImage.onload= () => {
  enemy.width = enemyKnightImage.width
  enemy.height = enemyKnightImage.height + enemyKnightImage.dy
  // player.render()
}

backgroundImg.onload= () => {
  context.fillStyle = '#071733'
  context.fillRect(0, 0, canvas.width, canvas.height)
  // background.render()
}


const loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    // background.update()
    enemy.update();
    player.update();
  
    
    player.dx = 0
    if (keys.d.pressed) player.dx = 10
    else if (keys.a.pressed) player.dx = -10

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

    const holyGrailBottom = holyGrail.y + holyGrail.height
    const holyGrailTop = holyGrail.y
    const holyGrailLeft = holyGrail.x
    const holyGrailRight = holyGrail.x + holyGrail.width


    //needs to be before gravity logic
    //working ish
    // if(playerBottom >= holyGrailTop && playerTop <= holyGrailBottom && playerLeft <= holyGrailRight && playerRight >= holyGrailLeft){
    //   // if(playerBottom <= holyGrailTop && playerBottom + player.dy >= holyGrailTop){
    //     if(player.dy > 0){
    //       player.dy = 0
    //       player.y = holyGrail.y - player.height - 0.01
    //     }
    //     if(player.dy < 0){
    //       player.dy = 0
    //       player.y = holyGrail.y + holyGrail.height + 0.01
    //     }
    //     // moving to the right
    //     // if(player.dx > 0){
    //     //   player.dx = 0
    //     //   player.x = holyGrail.x - player.width - 0.01
    //     //   // player.x = 0
    //     // }
    //     // //moving to the left
    //     //   if(player.dx < 0){
    //     //   player.dx = 0
    //     //   // player.x = holyGrail.x + holyGrail.width + 0.01
    //     // }
    // }

        //beginning gravity logic
        if(player.y + player.height + player.dy < canvas.height) {
          // console.log('i\'m in the air')
          player.dy += gravity
        } else {
          player.dy = 0
        }
    

  },
  render: function() { // render the game state
    background.render()
    holyGrail.render()
    player.render();
    enemy.render()
   
    
  }
});

loop.start();    // start the game
