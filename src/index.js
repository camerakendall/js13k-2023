import { getCanvas, getContext, init, Sprite, GameLoop } from 'kontra';

const game = document.querySelector('canvas')

// const g = game.getContext("2d")
// g.fillStyle = 'yellow'
// g.fillRect(10, 10, 100, 100)


let { canvas, context } = init(game);
// console.log(canvas)
// console.log(context)

canvas.height = 576
canvas.width = 1024

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
const image = new Image()
image.src = 'img/knight.png'
console.log(image.src)
console.log(image)

const player = Sprite({
  x: 200,        // starting x,y position of the sprite
  y: 200,
  // color: 'yellow',  // fill color of the sprite rectangle
  // width: image.width,     // width and height of the sprite rectangle
  // height: image.height,
  dx: 2,          // move the sprite 2px to the right every frame
  dy: 2,
  image: image

});

image.onload= () => {
  player.width = image.width
  player.height = image.height + player.dy
  player.render()
}


const loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    player.update();
    context.fillStyle = '#156464'
    context.fillRect(0, 0, canvas.width, canvas.height)
    // wrap the sprites position when it reaches
    // the edge of the screend
    player.dx = 0
    if (keys.d.pressed) player.dx = 10
    else if (keys.a.pressed) player.dx = -10

    if (player.x > canvas.width) {
      player.x = -player.width;
    }
    //beginning gravity logic
    if(player.y + player.height + player.dy < canvas.height) {
      // console.log('i\'m in the air')
      player.dy += gravity
    } else {
      player.dy = 0
    }


  },
  render: function() { // render the game state
    context.fillStyle = '#052318'
    context.fillRect(0, 0, canvas.width, canvas.height)
    player.render();
    
  }
});

loop.start();    // start the game
