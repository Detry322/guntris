import {Engine, Render, Body, Bodies, World, Mouse, MouseConstraint, Events, Runner, Query} from "matter-js";

var engine = Engine.create({});
engine.world.gravity.y = 0.1;

const HEIGHT = 200;
const WIDTH = 100;
var render = Render.create({
    element: document.getElementById("viewport"),
    engine: engine,
    options: {
        width: WIDTH*2.5,
        height: HEIGHT*2.5,
        background: '#222',
        wireframes: false
    }
});
const WALL_THICKNESS = WIDTH;
World.add(engine.world, [
  // walls
  Bodies.rectangle(-WALL_THICKNESS/2, HEIGHT/2, WALL_THICKNESS, HEIGHT*2, { isStatic: true }), // left
  Bodies.rectangle(WIDTH + WALL_THICKNESS/2, HEIGHT/2, WALL_THICKNESS, HEIGHT*2, { isStatic: true }), // right
  Bodies.rectangle(WIDTH/2, -WALL_THICKNESS/2, WIDTH * 2, WALL_THICKNESS, { isStatic: true }), // top
  Bodies.rectangle(WIDTH/2, HEIGHT + WALL_THICKNESS/2, WIDTH * 2, WALL_THICKNESS, { isStatic: true }), // bottom
]);

var sideLength = WIDTH/10;
var randomPiece = function() {
  var centerX = WIDTH/4 + WIDTH/2 * Math.random();
  var centerY = 2 * sideLength;
  var type = Math.floor(7 * Math.random());
  var parts;
  if (type == 0) {
    // T-block
    var options = {render: {fillStyle: 'purple'}};
    parts = [
      Bodies.polygon(centerX, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX-sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX, centerY - sideLength, 4, sideLength / Math.sqrt(2), options),
    ]
  } else if (type == 1) {
    // Line piece
    var options = {render: {fillStyle: 'cyan'}};
    parts = [
      Bodies.polygon(centerX-1.5*sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX-0.5*sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+0.5*sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+1.5*sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
    ]
  } else if (type == 2) {
    // L-block
    var options = {render: {fillStyle: 'orange'}};
    parts = [
      Bodies.polygon(centerX, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX-sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+sideLength, centerY - sideLength, 4, sideLength / Math.sqrt(2), options),
    ]
  } else if (type == 3) {
    // Reverse L-block
    var options = {render: {fillStyle: 'blue'}};
    parts = [
      Bodies.polygon(centerX, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX-sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX-sideLength, centerY - sideLength, 4, sideLength / Math.sqrt(2), options),
    ]
  } else if (type == 4) {
    // S-block
    var options = {render: {fillStyle: 'green'}};
    parts = [
      Bodies.polygon(centerX, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX-sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+sideLength, centerY - sideLength, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX, centerY - sideLength, 4, sideLength / Math.sqrt(2), options),
    ]
  } else if (type == 5) {
    // Reverse S-block
    var options = {render: {fillStyle: 'red'}};
    parts = [
      Bodies.polygon(centerX, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX-sideLength, centerY - sideLength, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX, centerY - sideLength, 4, sideLength / Math.sqrt(2), options),
    ]
  } else if (type == 6) {
    // Square
    var options = {render: {fillStyle: 'yellow'}};
    parts = [
      Bodies.polygon(centerX-0.5*sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+0.5*sideLength, centerY, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX-0.5*sideLength, centerY - sideLength, 4, sideLength / Math.sqrt(2), options),
      Bodies.polygon(centerX+0.5*sideLength, centerY - sideLength, 4, sideLength / Math.sqrt(2), options),
    ]
  }
  return Body.create({
    parts: parts,
    frictionAir: 0.02
  });
}

var keys = [];
document.body.addEventListener("keydown", function(e) {
  keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
  keys[e.keyCode] = false;
});


var player = Bodies.rectangle(WIDTH/2, HEIGHT - sideLength * 1.5, sideLength, sideLength, {
  collisionFilter: {
    group: -1,
    category: 2,
    mask: 0,
  },
  render: {
    fillStyle: 'white'
  },
})
World.add(engine.world, player);
var bullets = [];
var pieces = [];
var lastTimestamp = 0;
var lastBullet = 0;
Events.on(engine, 'tick', function(e) {
  var delta = (e.timestamp - lastTimestamp) / 1000;
  lastTimestamp = e.timestamp;
  var newX = player.position.x;
  var newY = player.position.y;
  if (keys[37]) {
    newX -= 80 * delta;
  }
  if (keys[39]) {
    newX += 80 * delta;
  }
  if (keys[38]) {
    newY -= 80 * delta;
  }
  if (keys[40]) {
    newY += 80 *  delta;
  }
  if ((keys[32] && e.timestamp - lastBullet > 40)) {
    lastBullet = e.timestamp;
    var newBullet = Bodies.rectangle(newX, newY, 2, 5, {
      render: {
        fillStyle: 'white'
      },
      frictionAir: 0,
      collisionFilter: {
        group: -1,
        category: 1,
        mask: 1,
      }
    }) 
    Body.setVelocity(newBullet, {
      x: 0,
      y: -3
    });
    Body.setMass(newBullet, 25)
    bullets.push(newBullet);
    World.add(engine.world, newBullet);
  }
  Body.setPosition(player, {
    x: Math.min(Math.max(newX, sideLength/2), WIDTH - sideLength/2),
    y: Math.min(Math.max(newY, sideLength/2), HEIGHT - sideLength/2)
  });
  var grav = engine.world.gravity;
  Body.applyForce(player, player.position, {
    x: -grav.x * grav.scale * player.mass,
    y: -grav.y * grav.scale * player.mass
  });
  bullets.forEach(function(bullet) {
    Body.applyForce(bullet, bullet.position, {
      x: -grav.x * grav.scale * bullet.mass,
      y: -grav.y * grav.scale * bullet.mass
    });
  })
})

Events.on(engine, 'collisionStart', function(e) {
  e.pairs.forEach(function(pair) {
    var bulletIndex = bullets.indexOf(pair.bodyA);
    if (bulletIndex == -1) {
      bulletIndex = bullets.indexOf(pair.bodyB);
    }
    if (bulletIndex == -1) {
      return;
    }
    World.remove(engine.world, bullets[bulletIndex]);
    var popped = bullets.pop();
    if (bulletIndex != bullets.length) {
      bullets[bulletIndex] = popped;
    }
  });
})

Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: WIDTH, y: HEIGHT }
})
Render.run(render);

var runner = Runner.create();
Runner.run(runner, engine);

var interval = setInterval(function() {
  var newPiece = randomPiece();
  pieces.push(newPiece);
  if (pieces.length == 20) {
    clearInterval(interval);
  }
  World.add(engine.world, newPiece);
  World.remove(engine.world, player)
  World.add(engine.world, player);
}, 2000)
