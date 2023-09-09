import { getCanvas, getContext, init, Sprite, GameLoop } from 'kontra';

console.log('hello world')
const game = document.querySelector('canvas')

const g = game.getContext("2d")
g.fillStyle = 'red'
g.fillRect(10, 10, 100, 100)


let { canvas, context } = init(game);
console.log(canvas)
console.log(context)

canvas.height = innerHeight
canvas.width = innerWidth

context.fillStyle = '#156464'
context.fillRect(0, 0, canvas.width, canvas.height)

let sprite = Sprite({
  x: 100,        // starting x,y position of the sprite
  y: 80,
  color: 'blue',  // fill color of the sprite rectangle
  width: 20,     // width and height of the sprite rectangle
  height: 40,
  dx: 2          // move the sprite 2px to the right every frame
});

let loop = GameLoop({  // create the main game loop
  update: function() { // update the game state
    sprite.update();
context.fillStyle = '#156464'
context.fillRect(0, 0, canvas.width, canvas.height)
    // wrap the sprites position when it reaches
    // the edge of the screen
    if (sprite.x > canvas.width) {
      sprite.x = -sprite.width;
    }
  },
  render: function() { // render the game state
    context.fillStyle = '#156464'
    context.fillRect(0, 0, canvas.width, canvas.height)
    sprite.render();
  }
});

loop.start();    // start the game