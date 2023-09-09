import { getCanvas, getContext, init, Sprite, GameLoop } from 'kontra';

console.log('hello world')
const game = document.querySelector('canvas')

const g = game.getContext("2d")
g.fillStyle = 'yellow'
g.fillRect(10, 10, 100, 100)


let { canvas, context } = init(game);
console.log(canvas)
console.log(context)

canvas.height = 576
canvas.width = 1024

context.fillStyle = '#156464'
context.fillRect(0, 0, canvas.width, canvas.height)


const gravity = 0.5

const player = Sprite({
  x: 200,        // starting x,y position of the sprite
  y: 200,
  color: 'yellow',  // fill color of the sprite rectangle
  width: 20,     // width and height of the sprite rectangle
  height: 40,
  dx: 2,          // move the sprite 2px to the right every frame
  dy: 2
});

const loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    player.update();
context.fillStyle = '#156464'
context.fillRect(0, 0, canvas.width, canvas.height)
    // wrap the sprites position when it reaches
    // the edge of the screen
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
    context.fillStyle = '#156464'
    context.fillRect(0, 0, canvas.width, canvas.height)
    player.render();
  }
});

loop.start();    // start the game