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
// console.log(image.src)
// console.log(image)

const player = Sprite({
  x: 200,        // starting x,y position of the sprite
  y: 200,
  // color: 'yellow',  // fill color of the sprite rectangle
  // width: image.width,     // width and height of the sprite rectangle
  // height: image.height,
  dx: 2,          // move the sprite 2px to the right every frame
  dy: 2,
  image: spriteImage
});


const holyGrail = Sprite({
  x: 375,        // starting x,y position of the sprite
  y: 325,
  color: 'yellow',  // fill color of the sprite rectangle
  width:  50,     // width and height of the sprite rectangle
  height: 50,
  // dx: 2,          // move the sprite 2px to the right every frame
  // dy: 2,
  // image: spriteImage
});



const enemy = Sprite({
  x: 100,        // starting x,y position of the sprite
  y: 50,
  color: 'green',  // fill color of the sprite rectangle
  width:  50,     // width and height of the sprite rectangle
  height: 50,
  dx: 2,          // move the sprite 2px to the right every frame
  dy: 2,
  // image: spriteImage
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
    if (player.x > canvas.width) {
      player.x = -player.width;
    }

    //how to wrap in other direction?
    if (player.x < canvas.width - canvas.width) {
      player.x = -player.width + canvas.width ;
    }

    //beginning gravity logic
    if(player.y + player.height + player.dy < canvas.height) {
      // console.log('i\'m in the air')
      player.dy += gravity
    } else {
      player.dy = 0
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



    if(playerBottom >= holyGrailTop && playerTop <= holyGrailBottom && playerLeft <= holyGrailRight && playerRight >= holyGrailLeft){
        if(player.dy > 0){
          player.dy = 0
        }
    }

  },
  render: function() { // render the game state
    background.render()
    player.render();
    enemy.render()
    holyGrail.render()
    
  }
});

loop.start();    // start the game
