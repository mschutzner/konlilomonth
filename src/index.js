//reset save
//localStorage.setItem("lifBetaGameState1", null);

// Initialization
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

var ditherCanvas = document.createElement("canvas");
var ditherCtx = ditherCanvas.getContext("2d");
ditherCtx.imageSmoothingEnabled = false;
ditherCanvas.width = canvas.width * 8;
ditherCanvas.height = canvas.height;

var roomCanvas = document.createElement("canvas");
var roomCtx = roomCanvas.getContext("2d");
roomCtx.imageSmoothingEnabled = false;

var roomCanvas1 = document.createElement("canvas");
var roomCtx1 = roomCanvas1.getContext("2d");
roomCtx1.imageSmoothingEnabled = false;

var controlsCanvas = document.getElementById("controlsCanvas");
var controlsCtx = controlsCanvas.getContext("2d");
controlsCtx.clearRect(0, 0, controlsCanvas.width, controlsCanvas.height);
controlsCtx.imageSmoothingEnabled = false;

var attackCanvas = document.createElement("canvas");
var attackCtx = attackCanvas.getContext("2d");
attackCtx.imageSmoothingEnabled = false;

//init constants
var FRAME_DURATION = 1000 / 12;

//Variables
var paused = false;
var dying = false;
var dead = false;
var resting = false;

var lastFrameTime = Date.now();

var camera = {};
var rooms = [];
var roomIndex = 120;
var loading = false;
var moved = false;

var interactions = [];
var interactable = false;
var interacting = false;
var interaction;
var selection = 0;

var buying = false;
var buyingTitle;
var buyingDesc;
var buyingPrice;

var selling = false;
var sellingSelection = false;

var npcPortraitX = 0;
var playerPortraitX = 0;

var ditherFrame = 0;
var fading = false;

var player = {};
var characters = [];
var currChar = 0;
var inventory = {};
var itemStart = Date.now();
var gold = 50;
var exp = 13;
var movingItem;
var movingItemIndex;
var expRate = [2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

var projectiles = [];
var attacks = [];
var particles = [];
var texts = [];
var enemies = [];

var slimeSplatOffset = [
  0,
  0,
  0,
  0,
  0,
  0,
  2,
  5,
  19,
  21,
  22,
  22,
  21,
  20,
  6,
  0,
  0,
  0,
  0,
  0,
  0,
  0
];

var itemsList = {
  bolt: {
    name: "bolt",
    maxStack: 9,
    sX: 0,
    sY: 0,
    price: 2
  },
  acidBolt: {
    name: "acid bolt",
    maxStack: 9,
    sX: 30,
    sY: 0,
    price: 3
  },
  eye: {
    name: "eyeball",
    maxStack: 6,
    sX: 6,
    sY: 0,
    price: 1
  },
  ignite: {
    name: "ignite",
    maxStack: 1,
    sX: 12,
    sY: 0,
    scroll: true,
    price: 0
  },
  firebolt: {
    name: "firebolt",
    maxStack: 1,
    sX: 18,
    sY: 0,
    scroll: true,
    price: 75
  },
  burningHands: {
    name: "burningHands",
    maxStack: 1,
    sX: 24,
    sY: 0,
    scroll: true,
    price: 100
  },
  pole: {
    name: "pole",
    maxStack: 1,
    sX: 36,
    sY: 0,
    pole: true,
    price: 0
  },
  halberd: {
    name: "halberd",
    maxStack: 1,
    sX: 42,
    sY: 0,
    pole: true,
    price: 300
  },
  exp: {
    name: "exp",
    maxStack: 1,
    sX: 0,
    sY: 6
  },
  exp2: {
    name: "exp",
    maxStack: 1,
    sX: 6,
    sY: 6
  },
  cheese: {
    name: "cheese",
    maxStack: 1,
    sX: 12,
    sY: 6,
    price: 3,
    consumable: true,
    affect() {
      var char = characters[currChar];
      char.hp += 2;
      if (char.hp > char.maxHp) char.hp = char.maxHp;
    }
  },
  greenJelly: {
    name: "green jelly",
    maxStack: 5,
    sX: 18,
    sY: 6,
    price: 2
  },
  coin: {
    name: "coin",
    maxStack: 9,
    sX: 24,
    sY: 6
  },
  coins: {
    name: "coins",
    maxStack: 1,
    sX: 30,
    sY: 6
  },
  cache: {
    name: "cache",
    maxStack: 1,
    sX: 36,
    sY: 6
  },
  torc: {
    name: "bronze torc",
    maxStack: 1,
    sX: 42,
    sY: 6,
    price: 40
  },
  ring: {
    name: "ruby ring",
    maxStack: 1,
    sX: 0,
    sY: 12,
    price: 50
  },
  crutch: {
    name: "crutch",
    maxStack: 1,
    sX: 6,
    sY: 12,
    price: 3
  },
  ashes: {
    name: "ashes",
    maxStack: 1,
    sX: 12,
    sY: 12,
    price: 1
  },
  healingPotion: {
    name: "healing potion",
    maxStack: 1,
    sX: 18,
    sY: 12,
    price: 30,
    consumable: true,
    affect() {
      var char = characters[currChar];
      char.hp = char.maxHp;
      pickupItem(new Item(0, 0, 0, 0, "vial", 1));
    }
  },
  vial: {
    name: "vial",
    maxStack: 1,
    sX: 24,
    sY: 12,
    price: 5
  },
  water: {
    name: "water",
    maxStack: 1,
    sX: 30,
    sY: 12,
    price: 7
  }
};

var sprites = [
  { src: "https://sprites.losingisfun.org/controller.png", name: "controller" },
  { src: "https://sprites.losingisfun.org/inventory.png", name: "inventory" },
  { src: "https://sprites.losingisfun.org/icons.png", name: "charIcons" },
  { src: "https://sprites.losingisfun.org/portraits.png", name: "portraits" },
  {
    src: "https://sprites.losingisfun.org/player-portraits.png",
    name: "bigPortraits"
  },
  { src: "https://sprites.losingisfun.org/dither.png", name: "dither" },
  { src: "https://sprites.losingisfun.org/font.png", name: "text" },
  { src: "https://sprites.losingisfun.org/numbers.png", name: "numbers" },
  { src: "https://sprites.losingisfun.org/noi.png", name: "noi" },
  { src: "https://sprites.losingisfun.org/edi.png", name: "edi" },
  { src: "https://sprites.losingisfun.org/jeff.png", name: "jeff" },
  { src: "https://sprites.losingisfun.org/urist.png", name: "urist" },
  { src: "https://sprites.losingisfun.org/urist-pole.png", name: "uristPole" },
  {
    src: "https://sprites.losingisfun.org/urist-halberd.png",
    name: "uristHalberd"
  },
  { src: "https://sprites.losingisfun.org/polearm.png", name: "polearm" },
  { src: "https://sprites.losingisfun.org/items.png", name: "items" },
  {
    src: "https://sprites.losingisfun.org/projectiles.png",
    name: "projectiles"
  },
  { src: "https://sprites.losingisfun.org/particles.png", name: "particles" },
  { src: "https://sprites.losingisfun.org/ignite.png", name: "ignite" },
  {
    src: "https://sprites.losingisfun.org/burning-hands-sprite.png",
    name: "burningHands"
  },
  { src: "https://sprites.losingisfun.org/sawblade.png", name: "sawblade" },
  { src: "https://sprites.losingisfun.org/dead.png", name: "dead" },
  { src: "https://sprites.losingisfun.org/splats.png", name: "splats" },
  { src: "https://sprites.losingisfun.org/slime.png", name: "slime" },
  { src: "https://sprites.losingisfun.org/slime-mask.png", name: "slimeMask" },
  {
    src: "https://sprites.losingisfun.org/interaction.png",
    name: "interaction"
  },
  { src: "https://sprites.losingisfun.org/item-shop.png", name: "itemShop" },
  {
    src: "https://sprites.losingisfun.org/item-shop-items.png",
    name: "itemShopItems"
  },
  { src: "https://sprites.losingisfun.org/selling.png", name: "selling" },
  { src: "https://sprites.losingisfun.org/litast-sheet.png", name: "litast" },
  {
    src: "https://sprites.losingisfun.org/litast-portrait.png",
    name: "litastPortrait"
  },
  { src: "https://sprites.losingisfun.org/froge.png", name: "froge" },
  {
    src: "https://sprites.losingisfun.org/froge-portrait.png",
    name: "frogePortrait"
  },
  { src: "https://sprites.losingisfun.org/fire.png", name: "fire" },
  { src: "https://sprites.losingisfun.org/pot.png", name: "pot" },
  { src: "https://sprites.losingisfun.org/pot-mask.png", name: "potMask" },
  {
    src: "https://sprites.losingisfun.org/goblin-sprite-sheet.png",
    name: "goblin"
  },
  { src: "https://sprites.losingisfun.org/goblin-mask.png", name: "goblinMask" }
];

var totalSprites = sprites.length;
var loadedSprites = 0;

var ditherSprite = sprites.find((s) => s.name === "dither");
var inventorySprite = sprites.find((s) => s.name === "inventory");
var itemsSprite = sprites.find((s) => s.name === "items");
var projectilesSprite = sprites.find((s) => s.name === "projectiles");
var particlesSprite = sprites.find((s) => s.name === "particles");
var polearmSprite = sprites.find((s) => s.name === "polearm");
var igniteSprite = sprites.find((s) => s.name === "ignite");
var burningHandsSprite = sprites.find((s) => s.name === "burningHands");
var textSprite = sprites.find((s) => s.name === "text");
var numbersSprite = sprites.find((s) => s.name === "numbers");
var interactionSprite = sprites.find((s) => s.name === "interaction");
var deadSprite = sprites.find((s) => s.name === "dead");
var splatsSprite = sprites.find((s) => s.name === "splats");
var itemShop = sprites.find((s) => s.name === "itemShop");
var itemShopItems = sprites.find((s) => s.name === "itemShopItems");
var sellingSprite = sprites.find((s) => s.name === "selling");
var fireSprite = sprites.find((s) => s.name === "fire");
var potSprite = sprites.find((s) => s.name === "pot");
var potMaskSprite = sprites.find((s) => s.name === "potMask");
var potAnimations = [
  { name: "idle", startFrame: 0, endFrame: 0 },
  { name: "dying", startFrame: 1, endFrame: 4, once: true }
];

var slimeSprite = sprites.find((s) => s.name === "slime");
var slimeMaskSprite = sprites.find((s) => s.name === "slimeMask");
var slimeAnimations = [
  { name: "idle", startFrame: 0, endFrame: 5 },
  { name: "jumping", startFrame: 6, endFrame: 16 },
  { name: "dying", startFrame: 17, endFrame: 21, once: true }
];

var goblinSprite = sprites.find((s) => s.name === "goblin");
var goblinMaskSprite = sprites.find((s) => s.name === "goblinMask");
var goblinAnimations = [
  { name: "idle", startFrame: 0, endFrame: 7 },
  { name: "walking", startFrame: 7, endFrame: 14 },
  { name: "shooting", startFrame: 15, endFrame: 20 },
  { name: "dying", startFrame: 21, endFrame: 24, once: true }
];

var litastSprite = sprites.find((s) => s.name === "litast");
var litastPortrait = sprites.find((s) => s.name === "litastPortrait");

var frogeSprite = sprites.find((s) => s.name === "froge");
var frogePortrait = sprites.find((s) => s.name === "frogePortrait");

var noiSprite = sprites.find((s) => s.name === "noi");
var noiAnimations = [
  { name: "idle", startFrame: 0, endFrame: 5 },
  { name: "walking", startFrame: 6, endFrame: 13 },
  {
    name: "attacking",
    startFrame: 14,
    endFrame: 25
  }
];

var ediSprite = sprites.find((s) => s.name === "edi");
var ediAnimations = [
  { name: "idle", startFrame: 0, endFrame: 5 },
  { name: "walking", startFrame: 6, endFrame: 13 },
  {
    name: "attacking",
    startFrame: 14,
    endFrame: 25
  }
];

var jeffSprite = sprites.find((s) => s.name === "jeff");
var jeffAnimations = [
  { name: "idle", startFrame: 0, endFrame: 5 },
  { name: "walking", startFrame: 6, endFrame: 13 },
  {
    name: "attacking",
    startFrame: 14,
    endFrame: 25
  }
];

var uristSprite = sprites.find((s) => s.name === "urist");
var uristAnimations = [
  { name: "idle", startFrame: 0, endFrame: 5 },
  { name: "walking", startFrame: 6, endFrame: 13 }
];

var uristPoleSprite = sprites.find((s) => s.name === "uristPole");
var uristHalberdSprite = sprites.find((s) => s.name === "uristHalberd");
var uristPoleAnimations = [
  { name: "idle", startFrame: 0, endFrame: 5 },
  { name: "walking", startFrame: 6, endFrame: 13 },
  {
    name: "attacking",
    startFrame: 14,
    endFrame: 17
  }
];

var controllerSprite = sprites.find((s) => s.name === "controller");
var charIconsSprite = sprites.find((s) => s.name === "charIcons");
var portraitsSprite = sprites.find((s) => s.name === "portraits");
var bigPortraitsSprite = sprites.find((s) => s.name === "bigPortraits");

// Key and controlsTouches
var directionTimeout;
var keys = {};
var keys2 = {};
var keyLock = false;
var controlsTouches = [];
var mouseX;
var mouseY;

//Controlls variables
var thumbpadRadius = 18;
var thumbpadX = 0;
var thumbpadY = 0;
var thumbpadXOffset = 0;
var thumbpadYOffset = 0;
var thumbpadIndex = null;
var thumbpadDir = -1;

var aiming = false;

var buttonRadius = 8;

var isMobile = isMobileDeviceWithTouch();

// Class Definitions
class Camera {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Character {
  constructor(
    name,
    width,
    height,
    xOffset,
    yOffset,
    sprite,
    animations,
    radius,
    maxHp,
    hp,
    damage,
    luck,
    item
  ) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.radius = radius;
    this.sprite = sprite;
    this.animations = animations;
    this.maxHp = maxHp;
    this.hp = hp;
    this.damage = damage;
    this.luck = luck;
    this.item = item;
    if (this.item.count > itemsList[this.item.name].maxStack) {
      this.item.count = itemsList[this.item.name].maxStack;
    }
  }

  takeDamage(dmg, knockback, lock) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      dying = true;
      setTimeout(() => {
        fadeOut().then(() => {
          dead = true;
          dying = false;
          for (var char of characters) {
            char.hp = char.maxHp;
          }
        });
      }, 1000);
    }

    if (knockback !== -1) {
      if (knockback === 8) knockback = Math.floor(Math.random() * 8);
      switch (knockback) {
        case 0:
        default:
          player.vX += -6;
          player.vY += -2;
          break;
        case 1:
          player.vX += -6;
          break;
        case 2:
          player.vX += 4;
          player.vY += -6;
          break;
        case 3:
          player.vX += 6;
          break;
        case 4:
          player.vX += 2;
          player.vY += 6;
          break;
        case 5:
          player.vY += 6;
          break;
        case 6:
          player.vX += -4;
          player.vY += 6;
          break;
        case 7:
          player.vX += -6;
          break;
      }
    }

    if (lock) {
      keyLock = true;
      keys = {};
      keys2 = {};
      thumbpadDir = -1;
    }
  }

  serialize() {
    return {
      name: this.name,
      width: this.width,
      height: this.height,
      xOffset: this.xOffset,
      yOffset: this.yOffset,
      radius: this.radius,
      sprite: this.sprite.name,
      animations: this.animations,
      maxHp: this.maxHp,
      hp: this.hp,
      damage: this.damage,
      luck: this.luck,
      item: this.item
    };
  }
}

class Text {
  constructor(str, x, y, width, lines, color, sprite, lineHeight) {
    this.str = str;
    this.x = x;
    this.y = y;
    this.width = width;
    this.lines = lines;
    this.color = color;
    this.sprite = sprite;
    this.lineHeight = lineHeight || 8;
    this.breakUp();
  }

  breakUp() {
    var lastBreak = -1;
    var numberOfBreaks = 0;
    var offset = 0;
    var code;
    loop1: for (var i = 0; i < this.str.length; i++) {
      if (numberOfBreaks >= this.lines) {
        this.str = this.str.substring(0, lastBreak);
        break;
      }
      code = this.str.charCodeAt(i);
      if (code === 10) {
        lastBreak = i;
        offset = 0;
        numberOfBreaks++;
        continue;
      } else {
        offset += charWidth(code);
      }
      if (offset > this.width) {
        for (var j = i; j > lastBreak + 1; j--) {
          if (this.str.charCodeAt(j) === 32) {
            this.str = splice(this.str, j, 1, "\n");
            lastBreak = j;
            offset = 0;
            numberOfBreaks++;
            i = j + 1;
            continue loop1;
          }
        }
        this.str = splice(this.str, i, 0, "\n");
        lastBreak = i;
        offset = 0;
        numberOfBreaks++;
      }
    }
  }

  draw() {
    var offset = 0;
    var linesDrawn = 0;
    var code;
    for (var i = 0; i < this.str.length; i++) {
      code = this.str.charCodeAt(i);
      switch (code) {
        case 10:
          linesDrawn++;
          offset = 0;
          break;
        case 32:
        case 160:
          offset += charWidth(code);
          break;
        case 8226:
          ctx.drawImage(
            this.sprite.image,
            105,
            45 + this.color * 42,
            charWidth(8226),
            7,
            this.x + offset,
            this.y + this.lineHeight * linesDrawn,
            charWidth(8226),
            7
          );
          offset += charWidth(8226);
          break;
        case 9788:
          ctx.drawImage(
            this.sprite.image,
            0,
            this.color * 42,
            charWidth(9788),
            7,
            this.x + offset,
            this.y + this.lineHeight * linesDrawn,
            charWidth(9788),
            7
          );
          offset += charWidth(9788);
          break;
        default:
          if (code > 32 && code < 127) {
            ctx.drawImage(
              this.sprite.image,
              (code % 16) * 7,
              Math.floor(code / 16) * 7 + this.color * 42 - 14,
              charWidth(code),
              7,
              this.x + offset,
              this.y + this.lineHeight * linesDrawn,
              charWidth(code),
              7
            );
            offset += charWidth(code);
          }
          break;
      }
    }
  }
}

class GameObject {
  constructor(x, y, width, height, xOffset, yOffset, sX, sY) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.sX = sX;
    this.sY = sY;
  }

  update() {}

  draw() {
    ctx.drawImage(
      rooms[roomIndex].room.objectsImage,
      this.sX,
      this.sY,
      this.width,
      this.height,
      Math.round(this.x - this.xOffset - camera.x),
      Math.round(this.y - this.yOffset - camera.y),
      this.width,
      this.height
    );

    if (rooms[roomIndex].room.objectsMaskImage) {
      roomCtx.drawImage(
        rooms[roomIndex].room.objectsMaskImage,
        this.sX,
        this.sY,
        this.width,
        this.height,
        Math.round(this.x) - this.xOffset,
        Math.round(this.y) - this.yOffset,
        this.width,
        this.height
      );
    }
  }

  serialize() {
    return {
      npc: false,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      xOffset: this.xOffset,
      yOffset: this.yOffset,
      sX: this.sX,
      sY: this.sY
    };
  }
}

class Player extends GameObject {
  constructor(x, y, character, direction) {
    super(
      x,
      y,
      character.width,
      character.height,
      character.xOffset,
      character.yOffset,
      0,
      0
    );
    this.sprite = character.sprite;
    this.animations = character.animations;
    this.state = this.animations[0].name;
    this.frame = this.animations[0].startFrame;
    this.firstFrame = true;
    this.radius = character.radius;
    this.direction = direction;
    this.vX = 0;
    this.vY = 0;
  }

  switchChar(character) {
    if (this.state === "idle" || this.state === "walking") {
      this.width = character.width;
      this.height = character.height;
      this.xOffset = character.xOffset;
      this.yOffset = character.yOffset;
      this.sprite = character.sprite;
      this.animations = character.animations;
      this.state = this.animations[0].name;
      this.frame = this.animations[0].startFrame;
      this.radius = character.radius;
    }
  }

  setState(state) {
    if (this.state !== state) {
      this.firstFrame = true;
      var animation = this.animations.find((a) => a.name === state);
      if (animation) {
        this.state = state;
        this.frame = animation.startFrame;
      } else {
        console.warn(
          `Animation ${state} not defined for ${this.constructor.name}`
        );
      }
    }
  }

  detect() {
    attackCanvas.width = polearmSprite.image.width;
    attackCanvas.height = polearmSprite.image.height;
    attackCtx.clearRect(0, 0, attackCanvas.width, attackCanvas.height);
    attackCtx.drawImage(polearmSprite.image, 0, 0);
    for (var i = 0; i < 64; i++) {
      for (var j = 0; j < 32; j++) {
        var color = attackCtx.getImageData(
          i + (this.direction % 4) * 64,
          j + Math.floor(this.direction / 4) * 32,
          1,
          1
        ).data;
        if (color[3] !== 0) {
          var color1 = roomCtx1.getImageData(
            this.x - 32 + i,
            this.y - 16 + j,
            1,
            1
          ).data;
          if (color1[3] !== 0 && rooms[roomIndex].room.traps[color1[0]]) {
            rooms[roomIndex].room.traps[color1[0]].detect();
          }
        }
      }
    }
  }

  update(framesElapsed) {
    var dX = 0;
    var dY = 0;
    var majorAxis = this.radius;
    var minorAxis = this.radius / 2;
    var i, j, k, inRadius, color, color1, color2;
    var distance = framesElapsed * 1.5;
    interactable = false;

    if (this.state !== "attacking") {
      //Add movment
      if (
        keys[65] ||
        thumbpadDir === 6 ||
        thumbpadDir === 7 ||
        thumbpadDir === 0
      ) {
        dX = -3;
      }
      if (
        keys[68] ||
        thumbpadDir === 2 ||
        thumbpadDir === 3 ||
        thumbpadDir === 4
      ) {
        dX = 3;
      }
      if (
        keys[87] ||
        thumbpadDir === 0 ||
        thumbpadDir === 1 ||
        thumbpadDir === 2
      ) {
        dY = -3;
      }
      if (
        keys[83] ||
        thumbpadDir === 4 ||
        thumbpadDir === 5 ||
        thumbpadDir === 6
      ) {
        dY = 3;
      }

      //scale movment to isometric plane
      if (dX < 0 && dY < 0) {
        dY = -2;
        dX = -2;
        this.direction = 0;
      } else if (dX === 0 && dY < 0) {
        this.direction = 1;
      } else if (dX > 0 && dY < 0) {
        dY = -2;
        dX = 2;
        this.direction = 2;
      } else if (dX > 0 && dY === 0) {
        this.direction = 3;
      } else if (dX > 0 && dY > 0) {
        dY = 2;
        dX = 2;
        this.direction = 4;
      } else if (dX === 0 && dY > 0) {
        this.direction = 5;
      } else if (dX < 0 && dY > 0) {
        dY = 2;
        dX = -2;
        this.direction = 6;
      } else if (dX < 0 && dY === 0) {
        this.direction = 7;
      }

      if ((dX || dY) && !aiming) {
        this.setState("walking");
      } else {
        this.setState("idle");
      }
    } else {
      var char = characters[currChar];
      var edi = char.name === "edi";
      var nX = 0;
      var nY = 0;
      var pYOffset = edi ? 13 : 15;
      var y,
        yOffset,
        angle,
        startAngle,
        endAngle,
        startFrame,
        projectile,
        modifier,
        enemy,
        dist,
        vector;
      if (char.name === "noi" || char.name === "edi") {
        if (char.item && char.item.name === "bolt") {
          if (!this.attacked && this.frame >= 17) {
            this.attacked = true;

            switch (this.direction) {
              case 0:
              default:
                nX = -2;
                nY = -2;
                startFrame = 0;
                break;
              case 1:
                nX = 0;
                nY = -3;
                startFrame = 1;
                break;
              case 2:
                nX = 2;
                nY = -2;
                startFrame = 2;
                break;
              case 3:
                nX = 3;
                nY = 0;
                startFrame = 3;
                break;
              case 4:
                nX = 2;
                nY = 2;
                startFrame = 0;
                break;
              case 5:
                nX = 0;
                nY = 3;
                startFrame = 1;
                break;
              case 6:
                nX = -2;
                nY = 2;
                startFrame = 2;
                break;
              case 7:
                nX = -3;
                nY = 0;
                startFrame = 3;
                break;
            }

            projectile = new Projectile(
              this.x,
              this.y - 1,
              3,
              pYOffset,
              projectilesSprite,
              startFrame,
              startFrame,
              nX,
              nY,
              5,
              char.damage,
              false
            );
            projectiles.push(projectile);

            char.item.count--;
            if (char.item.count <= 0) char.item = null;
          }
        } else if (char.item && char.item.name === "acidBolt") {
          if (!this.attacked && this.frame >= 17) {
            this.attacked = true;

            switch (this.direction) {
              case 0:
              default:
                nX = -2;
                nY = -2;
                startFrame = 4;
                break;
              case 1:
                nX = 0;
                nY = -3;
                startFrame = 5;
                break;
              case 2:
                nX = 2;
                nY = -2;
                startFrame = 6;
                break;
              case 3:
                nX = 3;
                nY = 0;
                startFrame = 7;
                break;
              case 4:
                nX = 2;
                nY = 2;
                startFrame = 8;
                break;
              case 5:
                nX = 0;
                nY = 3;
                startFrame = 9;
                break;
              case 6:
                nX = -2;
                nY = 2;
                startFrame = 10;
                break;
              case 7:
                nX = -3;
                nY = 0;
                startFrame = 11;
                break;
            }
            projectile = new Projectile(
              this.x + nX,
              this.y - 1 + nY,
              3,
              pYOffset,
              projectilesSprite,
              startFrame,
              startFrame,
              nX,
              nY,
              5,
              char.damage,
              false
            );
            projectiles.push(projectile);

            char.item.count--;
            if (char.item.count <= 0) char.item = null;
          }
        }
      } else if (char.name === "jeff") {
        if (char.item && char.item.name === "ignite") {
          //deal damage
          if (this.frame >= 18) {
            for (enemy of enemies) {
              dist = vectorLength(enemy.x - player.x, (enemy.y - player.y) * 2);
              vector = resizeVector(enemy.x - player.x, enemy.y - player.y, 5);
              if (Math.abs(dist) < 20 + enemy.width / 2) {
                enemy.takeDamage(
                  char.damage,
                  vector.x,
                  vector.y,
                  1,
                  false,
                  characters[currChar].luck
                );
              }
            }
          }

          if (!this.attacked && this.frame >= 17) {
            this.attacked = true;
            attacks.push(
              new Attack(
                this.x,
                this.y - 1,
                48,
                24,
                24,
                23,
                0,
                igniteSprite,
                this.frame - 17,
                4,
                true,
                () => {
                  player.attacked = false;
                }
              )
            );
            attacks.push(
              new Attack(
                this.x,
                this.y + 1,
                48,
                24,
                24,
                25,
                24,
                igniteSprite,
                this.frame - 17,
                4,
                true,
                () => {
                  player.attacked = false;
                }
              )
            );
          }
        } else if (char.item && char.item.name === "firebolt") {
          if (!this.attacked && this.frame >= 17) {
            this.attacked = true;

            switch (this.direction) {
              case 0:
              default:
                nX = -2;
                nY = -2;
                break;
              case 1:
                nX = 0;
                nY = -3;
                break;
              case 2:
                nX = 2;
                nY = -2;
                break;
              case 3:
                nX = 3;
                nY = 0;
                break;
              case 4:
                nX = 2;
                nY = 2;
                break;
              case 5:
                nX = 0;
                nY = 3;
                break;
              case 6:
                nX = -2;
                nY = 2;
                break;
              case 7:
                nX = -3;
                nY = 0;
                break;
            }

            projectile = new Projectile(
              this.x + nX,
              this.y - 1 + nY,
              3,
              15,
              projectilesSprite,
              12,
              13,
              nX,
              nY,
              3,
              char.damage,
              false
            );
            projectiles.push(projectile);
          }
        } else if (char.item && char.item.name === "burningHands") {
          switch (this.direction) {
            case 0:
            default:
              y = -1;
              yOffset = 38;
              startAngle = 202.5;
              endAngle = 292.5;
              break;
            case 1:
              y = -1;
              yOffset = 38;
              startAngle = 225;
              endAngle = 315;
              break;
            case 2:
              y = -1;
              yOffset = 38;
              startAngle = 292.5;
              endAngle = 382.5;
              break;
            case 3:
              y = 0;
              yOffset = 39;
              startAngle = 315;
              endAngle = 405;
              break;
            case 4:
              y = 1;
              yOffset = 40;
              startAngle = 337.5;
              endAngle = 427.5;
              break;
            case 5:
              y = 1;
              yOffset = 40;
              startAngle = 45;
              endAngle = 135;
              break;
            case 6:
              y = 1;
              yOffset = 40;
              startAngle = 67.5;
              endAngle = 112.5;
              break;
            case 7:
              y = 0;
              yOffset = 39;
              startAngle = 135;
              endAngle = 225;
              break;
          }

          //deal damage
          if (this.frame >= 18) {
            for (enemy of enemies) {
              dist = vectorLength(enemy.x - player.x, (enemy.y - player.y) * 2);

              vector = resizeVector(enemy.x - player.x, enemy.y - player.y, 5);

              angle = angleFromVector(
                enemy.x - player.x,
                (enemy.y - player.y) * 2
              );
              if (angle < 71.2) angle += 360;

              if (
                angle > startAngle &&
                angle < endAngle &&
                Math.abs(dist) < 48 + enemy.width / 2
              ) {
                enemy.takeDamage(
                  char.damage,
                  vector.x,
                  vector.y,
                  1,
                  false,
                  characters[currChar].luck
                );
              }
            }
          }

          if (!this.attacked && this.frame >= 17) {
            this.attacked = true;

            attacks.push(
              new Attack(
                this.x,
                this.y + y,
                96,
                48,
                48,
                yOffset,
                this.direction * 48,
                burningHandsSprite,
                this.frame - 17,
                4,
                true,
                () => {
                  player.attacked = false;
                }
              )
            );
          }
        } else player.setState("idle");
      } else if (char.name === "urist") {
        if (
          char.item &&
          (char.item.name === "pole" || char.item.name === "halberd")
        ) {
          this.detect();

          switch (this.direction) {
            case 0:
            default:
              startAngle = 202.5;
              endAngle = 292.5;
              break;
            case 1:
              startAngle = 225;
              endAngle = 315;
              break;
            case 2:
              startAngle = 292.5;
              endAngle = 382.5;
              break;
            case 3:
              startAngle = 315;
              endAngle = 405;
              break;
            case 4:
              startAngle = 337.5;
              endAngle = 427.5;
              break;
            case 5:
              startAngle = 45;
              endAngle = 135;
              break;
            case 6:
              startAngle = 67.5;
              endAngle = 112.5;
              break;
            case 7:
              startAngle = 135;
              endAngle = 225;
              break;
          }

          //deal damage
          if (this.frame >= 15) {
            for (enemy of enemies) {
              dist = vectorLength(enemy.x - player.x, (enemy.y - player.y) * 2);

              vector = resizeVector(enemy.x - player.x, enemy.y - player.y, 5);

              angle = angleFromVector(
                enemy.x - player.x,
                (enemy.y - player.y) * 2
              );
              if (angle < 71.2) angle += 360;

              if (
                angle > startAngle &&
                angle < endAngle &&
                Math.abs(dist) < 32 + enemy.width / 2
              ) {
                modifier = char.item.name === "halberd" ? 2 : 0;
                enemy.takeDamage(
                  char.damage + modifier,
                  vector.x,
                  vector.y,
                  0,
                  false,
                  characters[currChar].luck
                );
              }
            }
          }
        } else player.setState("idle");
      }
    }

    if (!aiming) {
      upperloop: for (i = 0; i < distance; i++) {
        this.vX *= 0.8;
        this.vY *= 0.8;
        if (vectorLength(this.vX, this.vY) < 1) {
          this.vX = 0;
          this.vY = 0;
        }

        for (j = 0; j < majorAxis * 2; j++) {
          for (k = 0; k < minorAxis * 2; k++) {
            inRadius = isPixelInsideEllipse(
              j + 0.5,
              k + 0.5,
              majorAxis,
              minorAxis,
              majorAxis,
              minorAxis
            );
            if (inRadius) {
              color = roomCtx.getImageData(
                Math.round(this.x + dX + this.vX) - majorAxis + j,
                Math.round(this.y + dY + this.vY) - minorAxis + k,
                1,
                1
              ).data;
              if (color[0] !== 255) {
                break upperloop;
              }
            }
          }
        }

        //apply movement
        this.x += dX + this.vX;
        this.y += dY + this.vY;

        //move camera if at edges of screen
        if (this.x - camera.x < canvas.width / 4 && dX < 0) {
          camera.x += dX + this.vX;
        } else if (this.x - camera.x > (canvas.width * 3) / 4 && dX > 0) {
          camera.x += dX + this.vX;
        }
        if (this.y - this.yOffset - camera.y < canvas.height / 4 && dY < 0) {
          camera.y += dY + this.vY;
        } else if (this.y - camera.y > (canvas.height * 3) / 4 && dY > 0) {
          camera.y += dY + this.vY;
        }
      }
    }

    if (!interacting && !paused && !buying && !selling && !resting) {
      //check for gameObjects and exits
      firsloop: for (i = 0; i < majorAxis * 2; i++) {
        for (j = 0; j < minorAxis * 2; j++) {
          inRadius = isPixelInsideEllipse(
            i + 0.5,
            j + 0.5,
            majorAxis,
            minorAxis,
            majorAxis,
            minorAxis
          );
          if (inRadius) {
            color1 = roomCtx1.getImageData(
              this.x - majorAxis + i,
              this.y - minorAxis + j,
              1,
              1
            ).data;

            if (
              color1[1] !== 255 &&
              fading === false &&
              typeof rooms[color1[1]] !== "undefined"
            ) {
              keyLock = true;
              fadeOut().then(() => {
                loadRoom(color1[1]).then(() => {
                  fadeIn().then(() => {
                    if (rooms[color1[1]].interaction) {
                      interaction = rooms[color1[1]].interaction;
                      interact();
                    }
                    loading = false;
                  });
                });
              });
              break firsloop;
            }

            if (color1[0] !== 0 && rooms[roomIndex].room.traps[color1[0] - 1]) {
              rooms[roomIndex].room.traps[color1[0] - 1].trigger();
              break firsloop;
            }

            color2 = roomCtx.getImageData(
              this.x - majorAxis + i,
              this.y - minorAxis + j,
              1,
              1
            ).data;

            if (color2[2] !== 0 && interactions[color2[2] - 1]) {
              interaction = color2[2] - 1;
              interactable = true;
              break firsloop;
            }
          }
        }
      }
    }
    if (!interactable) interaction = false;
  }

  draw(framesElapsed) {
    var animation = this.animations.find((a) => a.name === this.state);
    if (animation) {
      //update the animation
      if (!this.firstFrame) this.frame += framesElapsed;
      this.firstFrame = false;
      if (
        this.frame < animation.startFrame ||
        this.frame > animation.endFrame
      ) {
        this.frame = animation.startFrame;
        if (this.state === "attacking") {
          player.setState("idle");
          player.attacked = false;
        }
      }

      this.sX = this.frame * this.width;
      this.sY = this.direction * this.height;
      ctx.drawImage(
        this.sprite.image,
        this.sX,
        this.sY,
        this.width,
        this.height,
        Math.round(this.x - this.xOffset - camera.x),
        Math.round(this.y - this.yOffset - camera.y),
        this.width,
        this.height
      );

      if (interactable && !interacting) {
        var yOffset = currChar === 2 ? 34 : 30;
        if (isMobile) {
          ctx.drawImage(
            controllerSprite.image,
            150,
            41,
            7,
            9,
            Math.round(this.x - 3 - camera.x),
            Math.round(this.y - yOffset - 2 - camera.y),
            7,
            9
          );
        } else {
          ctx.drawImage(
            controllerSprite.image,
            134,
            42,
            16,
            5,
            Math.round(this.x - 8 - camera.x),
            Math.round(this.y - yOffset - camera.y),
            16,
            5
          );
        }
      }
    } else {
      console.warn(
        `Animation ${this.state} not defined for ${this.constructor.name}`
      );
    }
  }
}

class Attack extends GameObject {
  constructor(
    x,
    y,
    width,
    height,
    xOffset,
    yOffset,
    sY,
    sprite,
    startFrame,
    endFrame,
    fire,
    callback
  ) {
    super(x, y, width, height, xOffset, yOffset, 0, sY);
    this.sprite = sprite;
    this.frame = startFrame;
    this.endFrame = endFrame;
    this.fire = fire;
    this.firstFrame = true;
    this.callback = callback;
  }

  update(framesElapsed) {
    if (!this.firstFrame) this.frame += framesElapsed;
    this.firstFrame = false;

    if (this.fire) {
      var width = this.sprite.image.width;
      var height = this.sprite.image.height;

      attackCanvas.width = width;
      attackCanvas.height = height;
      attackCtx.clearRect(0, 0, width, height);
      attackCtx.drawImage(this.sprite.image, 0, 0, width, height);

      for (var i = 0; i < this.width; i++) {
        for (var j = 0; j < this.height; j++) {
          var color = attackCtx.getImageData(
            i + this.frame * this.width,
            j + this.sY,
            1,
            1
          ).data;

          if (color[3] !== 0) {
            var color1 = roomCtx1.getImageData(
              this.x - this.width / 2 + i,
              this.y - this.height / 2 + j,
              1,
              1
            ).data;

            if (color1[0] !== 0) {
              var trap = rooms[roomIndex].room.traps[color1[0] - 1];
              if (trap && trap.flammable) trap.ignite();
            }
          }
        }
      }
    }

    if (this.frame > this.endFrame)
      return attacks.splice(attacks.indexOf(this), 1);
  }

  draw(framesElapsed) {
    ctx.drawImage(
      this.sprite.image,
      this.frame * this.width,
      this.sY,
      this.width,
      this.height,
      Math.round(this.x - this.xOffset - camera.x),
      Math.round(this.y - this.yOffset - camera.y),
      this.width,
      this.height
    );
  }
}

class Projectile extends GameObject {
  constructor(
    x,
    y,
    xOffset,
    yOffset,
    sprite,
    startFrame,
    endFrame,
    vX,
    vY,
    speed,
    damage,
    enemy
  ) {
    super(x, y, 6, 6, xOffset, yOffset, 0, 0);
    this.sprite = sprite;
    this.startFrame = startFrame;
    this.endFrame = endFrame;
    this.frame = startFrame;
    this.firstFrame = true;
    this.vX = vX;
    this.vY = vY;
    this.speed = speed;
    this.damage = damage;
    this.enemy = enemy;
  }

  update(framesElapsed) {
    if (this.enemy !== false) {
      //check if enemy projectile hit player
      var distance = vectorLength(player.x - this.x, player.y - this.y);
      if (distance <= 9) {
        var angle = angleFromVector(this.vX, this.vY);
        var knockback;

        if (angle < 22.5 || angle > 337.5) {
          knockback = 3;
        } else if (angle < 337.5 && angle > 292.5) {
          knockback = 2;
        } else if (angle < 292.5 && angle > 247.5) {
          knockback = 1;
        } else if (angle < 247.5 && angle > 202.5) {
          knockback = 0;
        } else if (angle < 202.5 && angle > 157.5) {
          knockback = 7;
        } else if (angle < 157.5 && angle > 112.5) {
          knockback = 6;
        } else if (angle < 112.5 && angle > 67.5) {
          knockback = 5;
        } else if (angle < 67.5 && angle > 22.5) {
          knockback = 4;
        }

        characters[currChar].takeDamage(this.damage, knockback);
        projectiles.splice(projectiles.indexOf(this), 1);
        return;
      }
    }

    upperloop: for (var i = 0; i < framesElapsed * this.speed; i++) {
      for (var j = 0; j < 4; j++) {
        for (var k = 0; k < 4; k++) {
          var color = roomCtx.getImageData(
            this.x + this.vX - 2 + j,
            this.y + this.vY - 2 + k,
            1,
            1
          ).data;
          if (color[1] - 1 !== this.enemy && enemies[color[1] - 1]) {
            var type = this.startFrame >= 4 && this.startFrame ? 2 : 0;
            if (this.startFrame === 12) type = 1;
            enemies[color[1] - 1].takeDamage(
              this.damage,
              this.vX,
              this.vY,
              type,
              false,
              characters[currChar].luck
            );
            if (
              enemies[color[1] - 1] instanceof Slime ||
              (this.startFrame > 3 && this.startFrame <= 11)
            ) {
              enemies[color[1] - 1].acidBolt++;
            } else if (this.startFrame <= 3) {
              enemies[color[1] - 1].bolt++;
            }
            projectiles.splice(projectiles.indexOf(this), 1);
            break upperloop;
          }

          if (color[0] === 0 && color[1] === 0) {
            if (this.startFrame <= 3) {
              rooms[roomIndex].room.items.push(
                new Item(
                  this.x,
                  this.y,
                  this.xOffset,
                  this.yOffset,
                  "bolt",
                  1,
                  0,
                  0,
                  0
                )
              );
            } else if (this.startFrame >= 4 && this.startFrame <= 11) {
              rooms[roomIndex].room.items.push(
                new Item(
                  this.x,
                  this.y,
                  this.xOffset,
                  this.yOffset,
                  "acidBolt",
                  1,
                  0,
                  0,
                  0
                )
              );
            } else if (this.startFrame === 12) {
              particles.push(
                new Particle(this.x, this.y, 2, 15, 0, 1, 2, 0, 0)
              );
            }
            projectiles.splice(projectiles.indexOf(this), 1);
            break upperloop;
          }
        }
      }
      this.x += this.vX;
      this.y += this.vY;
    }
  }

  draw(framesElapsed) {
    if (!this.firstFrame) this.frame += framesElapsed;
    this.firstFrame = false;
    if (this.frame > this.endFrame) {
      this.frame = this.startFrame;
    }
    var sX = this.frame * 6;
    var sY = 0;

    ctx.drawImage(
      this.sprite.image,
      sX,
      sY,
      this.width,
      this.height,
      Math.round(this.x - this.xOffset - camera.x),
      Math.round(this.y - this.yOffset - camera.y),
      this.width,
      this.height
    );
  }
}

class Item extends GameObject {
  constructor(x, y, xOffset, yOffset, name, count, vX, vY, vZ) {
    var itemDesc = itemsList[name];
    super(x, y, 6, 6, xOffset, yOffset, itemDesc.sX, itemDesc.sY);
    this.name = name;
    this.count = count;
    this.vX = vX || 0;
    this.vY = vY || 0;
    this.vZ = vZ || 0;
  }

  update(framesElapsed) {
    if (this.yOffset > 3) {
      var g = 2.67;

      upperloop: for (var i = 0; i < framesElapsed; i++) {
        for (var j = 0; j < 6; j++) {
          for (var k = 0; k < 6; k++) {
            var color = roomCtx.getImageData(
              this.x + this.vX - 3 + j,
              this.y + this.vY - 3 + k,
              1,
              1
            ).data;
            if (color[0] !== 255) {
              break upperloop;
            }
          }
        }
        this.x += this.vX;
        this.y += this.vY;
      }

      this.yOffset +=
        Math.floor(this.vZ) * framesElapsed - g * framesElapsed * framesElapsed;
      this.vZ -= g * framesElapsed;

      if (this.yOffset <= 3) {
        this.yOffset = 3;
        var extra = this.count;
        for (var item of rooms[roomIndex].room.items) {
          if (this === item) continue;

          if (item.yOffset === 3 && this.name === item.name) {
            var itemDesc = itemsList[this.name];
            var y = Math.abs(this.y - item.y);
            var x = Math.abs(this.x - item.x);
            if (x < 6 && y < 6) {
              var newCount = extra + item.count;
              if (newCount > itemDesc.maxStack) {
                extra = newCount - itemDesc.maxStack;
                newCount = itemDesc.maxStack;
              } else {
                rooms[roomIndex].room.items.splice(
                  rooms[roomIndex].room.items.indexOf(this),
                  1
                );
              }
              item.count = newCount;
            }
          }
        }

        if (extra > 0) {
          this.count = extra;
        }
      }
    }
  }

  draw(framesElapsed) {
    if (this.name === "exp" && framesElapsed) {
      this.sX = 6;
      this.name = "exp2";
    } else if (this.name === "exp2" && framesElapsed) {
      this.sX = 0;
      this.name = "exp";
    }
    ctx.drawImage(
      itemsSprite.image,
      this.sX,
      this.sY,
      6,
      6,
      Math.round(this.x - Math.round(this.xOffset) - camera.x),

      Math.round(this.y - Math.round(this.yOffset) - camera.y),
      6,
      6
    );
    if (this.count > 1 || this.name === "bolt" || this.name === "acidBolt") {
      ctx.drawImage(
        numbersSprite.image,
        this.count * 5,
        0,
        5,
        5,
        Math.round(this.x - this.xOffset - camera.x + 2),
        Math.round(this.y - this.yOffset - camera.y + 2),
        5,
        5
      );
    }
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      name: this.name,
      count: this.count
    };
  }
}

class Particle extends GameObject {
  constructor(x, y, xOffset, yOffset, startFrame, endFrame, life, vX, vY) {
    super(x, y, 4, 4, xOffset, yOffset, 0, 0);
    this.sprite = particlesSprite;
    this.startFrame = startFrame;
    this.endFrame = endFrame;
    this.frame = startFrame;
    this.firstFrame = true;
    this.lifeFrame = startFrame;
    this.life = life;
    this.vX = vX;
    this.vY = vY;

    ctx.drawImage(
      this.sprite.image,
      this.frame * this.width,
      0,
      this.width,
      this.height,
      Math.round(this.x - this.xOffset - camera.x),
      Math.round(this.y - this.yOffset - camera.y),
      this.width,
      this.height
    );
  }

  update(framesElapsed) {
    this.x += this.vX;
    this.y += this.vY;

    this.lifeFrame += framesElapsed;
    if (this.lifeFrame > this.life) {
      particles.splice(particles.indexOf(this), 1);
    }
  }

  draw(framesElapsed) {
    if (!this.firstFrame) this.frame += framesElapsed;
    this.firstFrame = false;
    if (this.frame > this.endFrame) {
      this.frame = this.startFrame;
    }

    ctx.drawImage(
      this.sprite.image,
      this.frame * this.width,
      0,
      this.width,
      this.height,
      Math.round(this.x - this.xOffset - camera.x),
      Math.round(this.y - this.yOffset - camera.y),
      this.width,
      this.height
    );
  }
}

class Room {
  constructor(
    name,
    mapPath,
    mask0Path,
    mask1Path,
    objectsPath,
    objectsMaskPath,
    objects,
    items,
    traps,
    enemies
  ) {
    this.name = name;
    this.mapPath = mapPath;
    this.mask0Path = mask0Path;
    this.mask1Path = mask1Path || false;
    this.objectsPath = objectsPath || false;
    this.objectsMaskPath = objectsMaskPath || false;
    this.objects = objects || [];
    this.items = items || [];
    this.traps = traps || [];
    this.enemies = enemies || [];
    this.loaded = false;
  }

  async load() {
    if (!this.loaded) {
      return new Promise(async (resolve) => {
        this.mapImage = await loadImage(this.mapPath);

        this.mask0Image = await loadImage(this.mask0Path);
        roomCanvas.width = this.mapImage.width;
        roomCanvas.height = this.mapImage.height;

        if (this.mask1Path) {
          this.mask1Image = await loadImage(this.mask1Path);
        }
        roomCanvas1.width = this.mapImage.width;
        roomCanvas1.height = this.mapImage.height;

        if (this.objectsPath) {
          this.objectsImage = await loadImage(this.objectsPath);
        }

        if (this.objectsMaskPath) {
          this.objectsMaskImage = await loadImage(this.objectsMaskPath);
        }

        this.loaded = true;
        console.log(`Room ${this.name} loaded.`);
        resolve();
      });
    } else {
      roomCanvas.width = this.mapImage.width;
      roomCanvas.height = this.mapImage.height;

      roomCanvas1.width = this.mapImage.width;
      roomCanvas1.height = this.mapImage.height;

      console.log(`Room ${this.name} loaded.`);
      return Promise.resolve();
    }
  }

  draw() {
    ctx.drawImage(this.mapImage, Math.round(-camera.x), Math.round(-camera.y));

    roomCtx.drawImage(
      this.mask0Image,
      0,
      0,
      this.mask0Image.width,
      this.mask0Image.height
    );

    if (this.mask1Path) {
      roomCtx1.drawImage(
        this.mask1Image,
        0,
        0,
        this.mask1Image.width,
        this.mask1Image.height
      );
    }
  }

  serialize() {
    //serialize objects
    var objects = [];
    for (var object of this.objects) {
      objects.push(object.serialize());
    }

    //serialize items
    var items = [];
    for (var item of this.items) {
      items.push(item.serialize());
    }

    //serialize objects
    var traps = [];
    for (var trap of this.traps) {
      traps.push(trap.serialize());
    }

    //serialize objects
    var enemies1 = [];
    for (var enemy of this.enemies) {
      enemies1.push(enemy.serialize());
    }

    //return serialzied rooom
    return {
      name: this.name,
      mapPath: this.mapPath,
      mask0Path: this.mask0Path,
      mask1Path: this.mask1Path,
      objectsPath: this.objectsPath,
      objectsMaskPath: this.objectsMaskPath,
      objects: objects,
      items: items,
      traps: traps,
      enemies: enemies1
    };
  }
}

class Interaction {
  constructor(text, next, callbacks, npcSprite, npc, player, inv) {
    this.text = text;
    this.next = next || [];
    this.callbacks = callbacks || [];
    this.npcSprite = npcSprite || false;
    this.npc = npc || false;
    this.player = player || false;
    this.inv = inv || false;
  }

  draw(framesElapsed) {
    var text0 = new Text(this.text[0], 13, 86, 94, 3, 1, textSprite);
    text0.draw();

    if (this.text.length > 1) {
      var text1 = new Text(this.text[1], 13, 99, 94, 3, 1, textSprite);
      text1.draw();

      var yOffset = selection ? 13 : 0;
      ctx.drawImage(
        controllerSprite.image,
        139,
        36,
        3,
        5,
        8,
        86 + yOffset,
        3,
        5
      );
    }

    if (this.npc) {
      npcPortraitX += framesElapsed * 8;
      if (npcPortraitX > 40) npcPortraitX = 40;

      var npcOffset = Math.floor(lastFrameTime % (1000 / 4)) % 2 === 0 ? 0 : 40;
      ctx.drawImage(
        this.npcSprite.image,
        0 + npcOffset,
        0,
        40,
        80,
        120 - npcPortraitX,
        0,
        40,
        80
      );
    } else if (npcPortraitX) {
      npcPortraitX += framesElapsed * 8;
      if (npcPortraitX > 40) npcPortraitX = 40;

      ctx.drawImage(
        this.npcSprite.image,
        0,
        0,
        40,
        80,
        120 - npcPortraitX,
        0,
        40,
        80
      );
    }

    if (this.player) {
      playerPortraitX += framesElapsed * 8;
      if (playerPortraitX > 40) playerPortraitX = 40;

      var playerOffset =
        Math.floor(lastFrameTime % (1000 / 4)) % 2 === 0 ? 0 : 40;
      ctx.drawImage(
        bigPortraitsSprite.image,
        currChar * 80 + playerOffset,
        0,
        40,
        80,
        playerPortraitX - 40,
        0,
        40,
        80
      );
    } else if (playerPortraitX) {
      playerPortraitX += framesElapsed * 8;
      if (playerPortraitX > 40) playerPortraitX = 40;

      ctx.drawImage(
        bigPortraitsSprite.image,
        currChar * 80,
        0,
        40,
        80,
        playerPortraitX - 40,
        0,
        40,
        80
      );
    }
  }
}

class Trap extends GameObject {
  constructor(
    x,
    y,
    width,
    height,
    xOffset,
    yOffset,
    sprite,
    animations,
    damage,
    knockback,
    parent,
    reset,
    flammable,
    detected
  ) {
    super(x, y, width, height, xOffset, yOffset, 0, 0);
    this.sprite = sprite;
    this.animations = animations;
    this.state = this.animations[0].name;
    this.frame = this.animations[0].startFrame;
    this.firstFrame = true;
    this.damage = damage;
    this.knockback = knockback;
    this.parent = parent;
    this.reset = reset || false;
    this.flammable = flammable || false;
    this.detected = detected || false;
    this.damaging = false;
  }

  setState(state) {
    if (this.state !== state) {
      this.firstFrame = true;
      var animation = this.animations.find((a) => a.name === state);
      if (animation) {
        this.state = state;
        this.frame = animation.startFrame;
      } else {
        console.warn(
          `Animation ${state} not defined for ${this.constructor.name}`
        );
      }
    }
  }

  ignite() {
    if (this.flammable && this.state !== "burning" && this.state !== "burnt") {
      if (typeof this.parent === "number") {
        this.setState("burning");
        rooms[roomIndex].room.traps[this.parent].setState("burning");
      } else {
        this.setState("burning");
      }
    }
  }

  detect() {
    this.setState("default");
    this.detected = true;
    if (typeof this.parent === "number")
      rooms[roomIndex].room.traps[this.parent].detected = true;
  }

  trigger() {
    if (this.state === "burning" || this.state === "burnt") return;

    if (this.detected && this.frame === 0) return;

    if (this.damaging) return;

    this.damaging = true;
    setTimeout(() => {
      this.damaging = false;
    }, 1000);
    characters[currChar].takeDamage(this.damage, this.knockback, true);
    var animation = this.animations.find((a) => a.name === "trigger");
    if (animation && this.state !== "triggered") this.setState("trigger");
  }

  draw(framesElapsed) {
    var animation = this.animations.find((a) => a.name === this.state);
    if (animation) {
      //update the animation
      if (!this.firstFrame) this.frame += framesElapsed;
      this.firstFrame = false;
      if (
        this.frame < animation.startFrame ||
        this.frame > animation.endFrame
      ) {
        this.frame = animation.startFrame;
        if (this.state === "trigger") {
          this.setState("triggered");
        }
        if (this.state === "burning") {
          this.setState("burnt");
        }
      }

      this.sX = this.frame * this.width;
      this.sY = this.detected ? this.height : 0;

      ctx.drawImage(
        this.sprite.image,
        this.sX,
        this.sY,
        this.width,
        this.height,
        Math.round(this.x - this.xOffset - camera.x),
        Math.round(this.y - this.yOffset - camera.y),
        this.width,
        this.height
      );
    } else {
      console.warn(
        `Animation ${this.state} not defined for ${this.constructor.name}`
      );
    }
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      xOffset: this.xOffset,
      yOffset: this.yOffset,
      sprite: this.sprite.name,
      animations: this.animations,
      damage: this.damage,
      knockback: this.knockback,
      parent: this.parent,
      reset: this.reset,
      flammable: this.flammable,
      detected: this.detected
    };
  }
}

class NPC extends GameObject {
  constructor(x, y, width, height, xOffset, yOffset, sprite, frames) {
    super(x, y, width, height, xOffset, yOffset, 0, 0);
    this.sprite = sprite;
    this.frames = frames;
    this.frame = 0;
  }

  draw(framesElapsed) {
    //update the animation
    this.frame += framesElapsed;

    if (this.frame >= this.frames) {
      this.frame = 0;
    }

    ctx.drawImage(
      this.sprite.image,
      this.frame * this.width,
      0,
      this.width,
      this.height,
      Math.round(this.x - this.xOffset - camera.x),
      Math.round(this.y - this.yOffset - camera.y),
      this.width,
      this.height
    );
  }

  serialize() {
    return {
      npc: true,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      xOffset: this.xOffset,
      yOffset: this.yOffset,
      sprite: this.sprite.name,
      frames: this.frames
    };
  }
}

class Enemy extends GameObject {
  constructor(
    type,
    locations,
    width,
    height,
    xOffset,
    yOffset,
    sprite,
    mask,
    animations,
    direction,
    hp,
    items
  ) {
    //get random index from loactions array to set random location
    var index = Math.floor(Math.random() * locations.length);
    super(
      locations[index].x,
      locations[index].y,
      width,
      height,
      xOffset,
      yOffset,
      0,
      0
    );
    this.locations = locations;
    this.type = type;
    this.sprite = sprite;
    this.mask = mask;
    this.animations = animations;
    this.state = this.animations[0].name;
    this.frame = this.animations[0].startFrame;
    this.firstFrame = true;
    this.direction = direction;
    this.maxHp = hp;
    this.hp = hp;
    this.items = items;
    this.vX = 0;
    this.vY = 0;
    this.bolt = 0;
    this.acidBolt = 0;
    this.agro = false;
    this.attacked = false;
    this.dying = false;
  }

  setState(state) {
    if (this.state !== state) {
      this.firstFrame = true;
      var animation = this.animations.find((a) => a.name === state);
      if (animation) {
        this.state = state;
        this.frame = animation.startFrame;
      } else {
        console.warn(
          `Animation ${state} not defined for ${this.constructor.name}`
        );
      }
    }
  }

  takeDamage(dmg, vX, vY, type, secondary, luck) {
    this.agro = true;

    if (!this.invulnerable) {
      this.invulnerable = true;
      setTimeout(() => {
        this.invulnerable = false;
      }, 500);

      var vector = resizeVector(vX, vY, 8);

      this.vX += vector.x;
      this.vY += vector.y;

      this.hp -= dmg;

      if (this.hp < 0) dmg += this.hp;

      if (type === 2 && !secondary) {
        this.splat = { dmg, type: 0 };
      } else {
        this.splat = { dmg, type };
      }

      setTimeout(() => {
        this.splat = false;
      }, 500);

      if (type !== 0 && !secondary)
        setTimeout(() => {
          if (this && this.hp > 0) this.takeDamage(1, 0, 0, type, true, luck);
        }, 1100);

      if (this.hp <= 0) {
        this.dying = true;
        var delay;
        if (this.type === "pot") {
          delay = 0;
        } else if (secondary) {
          delay = 500;
        } else {
          delay = 1000;
        }
        setTimeout(() => {
          this.setState("dying");

          setTimeout(() => {
            var angle, vector, i, existingAngle;
            var angles = [];
            enemies.splice(enemies.indexOf(this), 1); //drop exp
            if (this.maxHp) {
              for (i = 0; i < this.maxHp; i++) {
                angle = checkAngles(angles);
                angles.push(angle);
                vector = vectorFromAngle(angle);
                vector = resizeVector(vector.x, vector.y, 3);

                rooms[roomIndex].room.items.push(
                  new Item(
                    this.x,
                    this.y,
                    3,
                    8,
                    "exp",
                    1,
                    vector.x,
                    vector.y,
                    5
                  )
                );
              }
            }

            //drop random items based on luck stat
            var index = Math.floor(Math.random() * luck + 2);
            if (this.items[index]) {
              if (this.items[index].name === "coin") {
                for (i = 0; i < this.items[index].count; i++) {
                  angle = Math.random() * 360;
                  vector = vectorFromAngle(angle);
                  vector = resizeVector(vector.x, vector.y, 3);
                  rooms[roomIndex].room.items.push(
                    new Item(
                      this.x,
                      this.y,
                      3,
                      8,
                      "coin",
                      1,
                      vector.x,
                      vector.y,
                      5
                    )
                  );
                }
              } else {
                angle = checkAngles(angles);
                angles.push(angle);
                vector = vectorFromAngle(angle);
                vector = resizeVector(vector.x, vector.y, 3);
                rooms[roomIndex].room.items.push(
                  new Item(
                    this.x,
                    this.y,
                    3,
                    8,
                    this.items[index].name,
                    this.items[index].count,
                    vector.x,
                    vector.y,
                    5
                  )
                );
              }
            }

            //drop bolts
            angle = checkAngles(angles);
            angles.push(angle);
            vector = vectorFromAngle(angle);
            vector = resizeVector(vector.x, vector.y, 3);
            if (this.bolt > 0) {
              rooms[roomIndex].room.items.push(
                new Item(
                  this.x,
                  this.y,
                  3,
                  8,
                  "bolt",
                  this.bolt,
                  vector.x,
                  vector.y,
                  5
                )
              );
            }

            //drop acid bolts
            angle = checkAngles(angles);
            angles.push(angle);
            vector = vectorFromAngle(angle);
            vector = resizeVector(vector.x, vector.y, 3);
            if (this.acidBolt > 0) {
              rooms[roomIndex].room.items.push(
                new Item(
                  this.x,
                  this.y,
                  3,
                  8,
                  "acidBolt",
                  this.acidBolt,
                  vector.x,
                  vector.y,
                  5
                )
              );
            }
          }, 250);
        }, delay);
      }
    }
  }

  draw(framesElapsed) {
    var animation = this.animations.find((a) => a.name === this.state);
    if (animation) {
      //update the animation
      if (!this.firstFrame) this.frame += framesElapsed;
      this.firstFrame = false;
      if (
        this.frame < animation.startFrame ||
        this.frame > animation.endFrame
      ) {
        if (animation.once) {
          this.frame = animation.endFrame;
        } else {
          this.frame = animation.startFrame;
        }
        if (this.state === "jumping") {
          this.setState("idle");
          this.jumping = false;
        } else if (this.state === "shooting") {
          this.setState("idle");
          this.attacked = false;
          setTimeout(() => {
            if (!this.dying) this.setState("walking");
          }, 1200);
        }
      }

      this.sX = this.frame * this.width;
      this.sY = this.direction * this.height;
      ctx.drawImage(
        this.sprite.image,
        this.sX,
        this.sY,
        this.width,
        this.height,
        Math.round(this.x - this.xOffset - camera.x),
        Math.round(this.y - this.yOffset - camera.y),
        this.width,
        this.height
      );

      var splatOffset =
        this.state === "jumping" ? slimeSplatOffset[this.frame] : 0;
      if (this.splat) {
        ctx.drawImage(
          splatsSprite.image,
          (this.splat.dmg - 1) * 7,
          this.splat.type * 9,
          7,
          9,
          Math.round(this.x - camera.x - 4),
          Math.round(this.y - camera.y - 13 - splatOffset),
          7,
          9
        );
      }

      roomCtx.drawImage(
        this.mask.image,
        enemies.indexOf(this) * this.width,
        0,
        this.width,
        this.height,
        Math.round(this.x) - this.xOffset,
        Math.round(this.y) - this.yOffset,
        this.width,
        this.height
      );
    } else {
      console.warn(
        `Animation ${this.state} not defined for ${this.constructor.name}`
      );
    }
  }

  serialize() {
    return {
      type: this.type,
      locations: this.locations,
      width: this.width,
      height: this.height,
      xOffset: this.xOffset,
      yOffset: this.yOffset,
      sprite: this.sprite.name,
      mask: this.mask.name,
      animations: this.animations,
      direction: this.direction,
      hp: this.hp,
      items: this.items
    };
  }
}

class Slime extends Enemy {
  update(framesElapsed) {
    if (this.state === "idle" && !this.set) {
      this.set = true;
      this.hit = false;

      setTimeout(() => {
        if (!this.dying) {
          this.setState("jumping");

          var vector = resizeVector(player.x - this.x, player.y - this.y, 5);

          this.vX += vector.x;
          this.vY += vector.y;
        }
      }, 1500);
    }

    var dX = 0;
    var dY = 0;

    if (this.state === "jumping") {
      this.set = false;
    }

    upperloop: for (var i = 0; i < framesElapsed; i++) {
      this.vX *= 0.8;
      this.vY *= 0.8;
      if (vectorLength(this.vX, this.vY) < 1) {
        this.vX = 0;
        this.vY = 0;
      }

      for (var j = 0; j < 18; j++) {
        for (var k = 0; k < 8; k++) {
          var color = roomCtx.getImageData(
            this.x + dX + this.vX - 9 + j,
            this.y + dY + this.vY - 4 + k,
            1,
            1
          ).data;
          if (color[1] - 1 !== enemies.indexOf(this) && color[3] === 0) {
            break upperloop;
          }
        }
      }

      //attack player
      if (
        this.state === "jumping" &&
        vectorLength(player.x - this.x, (player.y - this.y) * 2) <= 16
      ) {
        if (!this.hit) {
          this.hit = true;
          characters[currChar].takeDamage(1, this.direction);
        }
      } else {
        //apply movement
        this.x += dX + this.vX;
        this.y += dY + this.vY;
      }
    }

    var angle = angleFromVector(player.x - this.x, player.y - this.y);

    if (angle < 22.5 || angle > 337.5) {
      this.direction = 3;
    } else if (angle < 337.5 && angle > 292.5) {
      this.direction = 2;
    } else if (angle < 292.5 && angle > 247.5) {
      this.direction = 1;
    } else if (angle < 247.5 && angle > 202.5) {
      this.direction = 0;
    } else if (angle < 202.5 && angle > 157.5) {
      this.direction = 7;
    } else if (angle < 157.5 && angle > 112.5) {
      this.direction = 6;
    } else if (angle < 112.5 && angle > 67.5) {
      this.direction = 5;
    } else if (angle < 67.5 && angle > 22.5) {
      this.direction = 4;
    }
  }
}

class Goblin extends Enemy {
  update(framesElapsed) {
    if (this.vX || this.vY) {
      this.setState("idle");
    } else if (!this.dying) {
      var distance = vectorLength(player.x - this.x, player.y - this.y);
      var angle = angleFromVector(player.x - this.x, player.y - this.y);
      if (!this.agro && moved) {
        if (distance <= 45) {
          //face player
          if (angle < 22.5 || angle > 337.5) {
            this.direction = 3;
          } else if (angle < 337.5 && angle > 292.5) {
            this.direction = 2;
          } else if (angle < 292.5 && angle > 247.5) {
            this.direction = 1;
          } else if (angle < 247.5 && angle > 202.5) {
            this.direction = 0;
          } else if (angle < 202.5 && angle > 157.5) {
            this.direction = 7;
          } else if (angle < 157.5 && angle > 112.5) {
            this.direction = 6;
          } else if (angle < 112.5 && angle > 67.5) {
            this.direction = 5;
          } else if (angle < 67.5 && angle > 22.5) {
            this.direction = 4;
          }

          setTimeout(() => {
            if (!this.dying) {
              this.agro = true;
              this.setState("walking");
            }
          }, 400);
        } else {
          this.setState("idle");
        }
      } else if (this.state === "shooting") {
        if (!this.attacked && this.frame >= 17) {
          var nX, nY, startFrame;

          this.attacked = true;

          switch (this.direction) {
            case 0:
            default:
              nX = -2;
              nY = -2;
              startFrame = 0;
              break;
            case 1:
              nX = 0;
              nY = -3;
              startFrame = 1;
              break;
            case 2:
              nX = 2;
              nY = -2;
              startFrame = 2;
              break;
            case 3:
              nX = 3;
              nY = 0;
              startFrame = 3;
              break;
            case 4:
              nX = 2;
              nY = 2;
              startFrame = 0;
              break;
            case 5:
              nX = 0;
              nY = 3;
              startFrame = 1;
              break;
            case 6:
              nX = -2;
              nY = 2;
              startFrame = 2;
              break;
            case 7:
              nX = -3;
              nY = 0;
              startFrame = 3;
              break;
          }
          var projectile = new Projectile(
            this.x,
            this.y - 1,
            3,
            13,
            projectilesSprite,
            startFrame,
            startFrame,
            nX,
            nY,
            5,
            1,
            enemies.indexOf(this)
          );
          projectiles.push(projectile);
        }
      } else if (this.state === "walking") {
        if (this.cornered) {
          //shoot at the player if cornered
          if (distance < 20) {
            if (angle < 22.5 || angle > 337.5) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 337.5 && angle > 292.5) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 292.5 && angle > 247.5) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 247.5 && angle > 202.5) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 202.5 && angle > 157.5) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 157.5 && angle > 112.5) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 112.5 && angle > 67.5) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 67.5 && angle > 22.5) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            }
          } else {
            //shoot at player if they are lined up
            if (angle < 5 || angle > 355) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 315 && angle > 305) {
              this.direction = 2;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 275 && angle > 265) {
              this.direction = 1;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 230 && angle > 220) {
              this.direction = 0;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 185 && angle > 175) {
              this.direction = 7;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 140 && angle > 130) {
              this.direction = 6;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 95 && angle > 85) {
              this.direction = 5;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 50 && angle > 40) {
              this.direction = 4;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else {
              //walk toward player if run into wall and they are not lined up
              if (angle < 22.5 || angle > 337.5) {
                this.direction = 3;
              } else if (angle < 337.5 && angle > 292.5) {
                this.direction = 2;
              } else if (angle < 292.5 && angle > 247.5) {
                this.direction = 1;
              } else if (angle < 247.5 && angle > 202.5) {
                this.direction = 0;
              } else if (angle < 202.5 && angle > 157.5) {
                this.direction = 7;
              } else if (angle < 157.5 && angle > 112.5) {
                this.direction = 6;
              } else if (angle < 112.5 && angle > 67.5) {
                this.direction = 5;
              } else if (angle < 67.5 && angle > 22.5) {
                this.direction = 4;
              }
            }
          }
        } else {
          //move away from player if they are too close
          if (distance < 20) {
            if (angle < 22.5 || angle > 337.5) {
              this.direction = 7;
            } else if (angle < 337.5 && angle > 292.5) {
              this.direction = 6;
            } else if (angle < 292.5 && angle > 247.5) {
              this.direction = 5;
            } else if (angle < 247.5 && angle > 202.5) {
              this.direction = 4;
            } else if (angle < 202.5 && angle > 157.5) {
              this.direction = 3;
            } else if (angle < 157.5 && angle > 112.5) {
              this.direction = 2;
            } else if (angle < 112.5 && angle > 67.5) {
              this.direction = 1;
            } else if (angle < 67.5 && angle > 22.5) {
              this.direction = 0;
            }
          } else {
            //shoot at player if they are lined up
            if (angle < 5 || angle > 355) {
              this.direction = 3;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 315 && angle > 305) {
              this.direction = 2;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 275 && angle > 265) {
              this.direction = 1;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 230 && angle > 220) {
              this.direction = 0;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 185 && angle > 175) {
              this.direction = 7;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 140 && angle > 130) {
              this.direction = 6;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 95 && angle > 85) {
              this.direction = 5;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else if (angle < 50 && angle > 40) {
              this.direction = 4;
              this.setState("idle");
              setTimeout(() => {
                if (!this.dying) this.setState("shooting");
              }, 400);
            } else {
              //walk perpindicular to player if they are not lined up
              if (angle < 22.5 || angle > 337.5) {
                this.direction = 5;
              } else if (angle < 337.5 && angle > 292.5) {
                this.direction = 4;
              } else if (angle < 292.5 && angle > 247.5) {
                this.direction = 3;
              } else if (angle < 247.5 && angle > 202.5) {
                this.direction = 2;
              } else if (angle < 202.5 && angle > 157.5) {
                this.direction = 1;
              } else if (angle < 157.5 && angle > 112.5) {
                this.direction = 0;
              } else if (angle < 112.5 && angle > 67.5) {
                this.direction = 7;
              } else if (angle < 67.5 && angle > 22.5) {
                this.direction = 6;
              }
            }
          }
        }
      }
    }

    var dX = 0;
    var dY = 0;

    if (this.state === "walking") {
      switch (this.direction) {
        case 0:
        default:
          dX = -2;
          dY = -2;
          break;
        case 1:
          dY = -3;
          break;
        case 2:
          dX = 2;
          dY = -2;
          break;
        case 3:
          dX = 3;
          break;
        case 4:
          dX = 2;
          dY = 2;
          break;
        case 5:
          dY = 3;
          break;
        case 6:
          dX = -2;
          dY = 2;
          break;
        case 7:
          dX = -3;
          break;
      }
    }

    upperloop: for (var i = 0; i < framesElapsed; i++) {
      this.vX *= 0.8;
      this.vY *= 0.8;
      if ((this.vX || this.vY) && vectorLength(this.vX, this.vY) < 1) {
        this.vX = 0;
        this.vY = 0;
        if (!this.dying) this.setState("walking");
      }

      for (var j = 0; j < 18; j++) {
        for (var k = 0; k < 8; k++) {
          var color = roomCtx.getImageData(
            this.x + dX + this.vX - 9 + j,
            this.y + dY + this.vY - 4 + k,
            1,
            1
          ).data;
          if (color[1] - 1 !== enemies.indexOf(this) && color[3] === 0) {
            this.cornered = true;
            setTimeout(() => (this.cornered = false), 400);
            break upperloop;
          }
        }
      }

      //apply movement
      this.x += dX + this.vX;
      this.y += dY + this.vY;
    }
  }
}

// Helper Functions
function splice(str, index, count, add) {
  return str.slice(0, index) + (add || "") + str.slice(index + count);
}

function charWidth(code) {
  switch (code) {
    case 10:
      return 0;
    case 33:
    case 39:
    case 46:
    case 58:
    case 91:
    case 93:
    case 96:
    case 105:
    case 106:
    case 108:
    case 114:
    case 115:
    case 122:
    case 124:
      return 3;
    case 32:
    case 36:
    case 42:
    case 43:
    case 44:
    case 45:
    case 48:
    case 49:
    case 50:
    case 51:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 65:
    case 66:
    case 67:
    case 68:
    case 70:
    case 71:
    case 72:
    case 73:
    case 74:
    case 75:
    case 76:
    case 80:
    case 83:
    case 84:
    case 85:
    case 86:
    case 88:
    case 89:
    case 94:
    case 97:
    case 98:
    case 99:
    case 100:
    case 101:
    case 103:
    case 104:
    case 107:
    case 110:
    case 111:
    case 112:
    case 113:
    case 116:
    case 117:
    case 118:
    case 120:
    case 121:
    case 123:
    case 125:
    default:
      return 4;
    case 31:
    case 38:
    case 40:
    case 41:
    case 69:
    case 78:
    case 79:
    case 82:
    case 90:
    case 52:
    case 95:
    case 102:
    case 126:
      return 5;
    case 9788:
    case 34:
    case 37:
    case 47:
    case 64:
    case 77:
    case 81:
    case 87:
    case 92:
    case 109:
    case 119:
      return 6;
    case 35:
      return 7;
  }
}

function isMobileDeviceWithTouch() {
  const userAgent = window.navigator.userAgent;

  // Check for mobile device keywords in the user agent
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );

  // Check for touch support
  const hasTouchSupport =
    "ontouchstart" in window || window.TouchEvent !== undefined;

  // Check for iPadOS 13+ devices
  const isIpadOS = userAgent.includes("Macintosh") && "ontouchstart" in window;

  return (isMobileDevice || isIpadOS) && hasTouchSupport;
}

function drawLoadingBar(percentage) {
  // Clear previous loading bar
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the outer rectangle (border of the loading bar)
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, canvas.height / 2 - 10, canvas.width - 20, 20);

  // Draw the inner rectangle (fill of the loading bar)
  ctx.fillStyle = "green";
  ctx.fillRect(12, canvas.height / 2 - 8, (canvas.width - 24) * percentage, 16);
}

function loadImage(src, msg) {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
}

function fadeIn() {
  return new Promise((resolve) => {
    fading = true;
    ditherFrame = 7;
    var interval = setInterval(() => {
      ditherFrame--;
      if (ditherFrame <= 0) {
        ditherFrame = 0;
        clearInterval(interval);
        fading = false;
        resolve();
      }
    }, FRAME_DURATION);
  });
}

function fadeOut() {
  return new Promise((resolve) => {
    fading = true;
    ditherFrame = 0;
    var interval = setInterval(() => {
      ditherFrame++;
      if (ditherFrame >= 7) {
        ditherFrame = 7;
        clearInterval(interval);
        fading = false;
        resolve();
      }
    }, FRAME_DURATION);
  });
}

function clientToCanvasCoords(clientX, clientY, canvasElement) {
  const canvasRect = canvasElement.getBoundingClientRect();
  const scaleX = canvasElement.width / canvasRect.width;
  const scaleY = canvasElement.height / canvasRect.height;

  const canvasX = (clientX - canvasRect.left) * scaleX;
  const canvasY = (clientY - canvasRect.top) * scaleY;

  return { x: canvasX, y: canvasY };
}

function resizeVector(x, y, newLength) {
  //return unchanged if 0, 0;
  if (x === 0 && y === 0) return { x: 0, y: 0 };

  // Calculate the current length of the vector
  var currentLength = Math.sqrt(x * x + y * y);

  // Calculate the new unit vector
  var unitVectorX = x / currentLength;
  var unitVectorY = y / currentLength;

  // Multiply the new unit vector by the new length
  var newX = unitVectorX * newLength;
  var newY = unitVectorY * newLength;

  // Return the new vector
  return { x: newX, y: newY };
}

function vectorLength(x, y) {
  //return unchanged if 0, 0;
  if (x === 0 && y === 0) return 0;

  // Calculate the current length of the vector
  return Math.sqrt(x * x + y * y);
}

function angleFromVector(x, y) {
  // Calculate the angle in radians using Math.atan2()
  var angleRadians = Math.atan2(y, x);

  // Convert the angle from radians to degrees
  var angleDegrees = angleRadians * (180 / Math.PI);

  // Normalize the angle to be in the range of 0 to 360 degrees
  if (angleDegrees < 0) {
    angleDegrees += 360;
  }

  return angleDegrees;
}

function vectorFromAngle(angleDegrees) {
  // Convert angle from degrees to radians
  const angleRadians = angleDegrees * (Math.PI / 180);

  // Calculate x and y components using trigonometric functions
  const x = Math.cos(angleRadians);
  const y = Math.sin(angleRadians);

  return { x, y };
}

function isPixelInsideEllipse(
  x,
  y,
  centerX,
  centerY,
  semiMajorAxis,
  semiMinorAxis
) {
  const xComponent = Math.pow(x - centerX, 2) / Math.pow(semiMajorAxis, 2);
  const yComponent = Math.pow(y - centerY, 2) / Math.pow(semiMinorAxis, 2);
  const result = xComponent + yComponent;

  return result <= 1;
}

function pickupItem(item) {
  if (item.name === "exp" || item.name === "exp2") {
    exp++;
    return 0;
  } else if (item.name === "coin") {
    addGold(item.count);
    return 0;
  }
  var itemDesc = itemsList[item.name];
  if (itemDesc) {
    var extra = item.count;
    var newCount;
    var i;
    var char = characters[currChar];
    if (char.name === "noi" || char.name === "edi") {
      if (item.name === "bolt" && (!char.item || char.item.name === "bolt")) {
        newCount = char.item ? char.item.count + item.count : item.count;
        if (newCount > itemDesc.maxStack) {
          extra = newCount - itemDesc.maxStack;
          newCount = itemDesc.maxStack;
        } else extra = 0;

        char.item = { name: "bolt", count: newCount };
      } else if (
        item.name === "acidBolt" &&
        (!char.item || char.item.name === "acidBolt")
      ) {
        newCount = char.item ? char.item.count + item.count : item.count;
        if (newCount > itemDesc.maxStack) {
          extra = newCount - itemDesc.maxStack;
          newCount = itemDesc.maxStack;
        } else extra = 0;

        char.item = { name: "acidBolt", count: newCount };
      }
    } else if (char.name === "jeff") {
      if (!char.item && itemDesc.scroll) {
        char.item = { name: item.name, count: 1 };
        extra = 0;
      }
    } else if (char.name === "urist") {
      if (!char.item) {
        if (item.name === "pole") {
          char.item = { name: "pole", count: 1 };
          extra = 0;

          //change urist Sprite
          char.sprite = uristPoleSprite;
          player.sprite = uristPoleSprite;
          char.animation = uristPoleAnimations;
          player.animation = uristPoleAnimations;
        } else if (item.name === "halberd") {
          char.item = { name: "halberd", count: 1 };
          extra = 0;

          //change urist Sprite
          char.sprite = uristHalberdSprite;
          player.sprite = uristHalberdSprite;
          char.animation = uristPoleAnimations;
          player.animation = uristPoleAnimations;
        }
      }
    }

    for (i = 0; i < 18; i++) {
      if (extra > 0) {
        if (
          inventory[i] &&
          inventory[i].name === item.name &&
          inventory[i].count < itemDesc.maxStack
        ) {
          newCount = inventory[i].count + item.count;
          if (newCount > itemDesc.maxStack) {
            extra = newCount - itemDesc.maxStack;
            newCount = itemDesc.maxStack;
          } else extra = 0;
          inventory[i].count = newCount;
        }
      } else break;
    }

    for (i = 0; i < 18; i++) {
      if (extra > 0) {
        newCount = extra;
        if (!inventory[i]) {
          if (newCount > itemDesc.maxStack) {
            extra = newCount - itemDesc.maxStack;
            newCount = itemDesc.maxStack;
          } else extra = 0;
          inventory[i] = {
            name: item.name,
            count: newCount
          };
        }
      } else break;
    }

    return extra;
  } else {
    console.warn(`Item ${item.name} not found in itemList.`);
  }
}

function endPause() {
  if (movingItem) {
    if (movingItemIndex === -1) {
      characters[currChar].item = movingItem;
      movingItem = null;
    } else {
      inventory[movingItemIndex] = movingItem;
      movingItem = null;
    }
  }

  lastFrameTime = Date.now();
  paused = false;
}

function endBuying() {
  buying = false;
  selection = 0;
  texts[0].y += 40;
}

function endSelling() {
  selling = false;
  sellingSelection = false;
}

function nextInteraction() {
  if (
    interactions[interaction].callbacks &&
    interactions[interaction].callbacks[selection]
  ) {
    interactions[interaction].callbacks[selection]();
  }

  if (
    interactions[interaction].next &&
    typeof interactions[interaction].next[selection] === "number"
  ) {
    if (Array.isArray(interactions[interaction].next[selection])) {
      interaction = interactions[interaction].next[selection][currChar];
    } else {
      interaction = interactions[interaction].next[selection];
    }
  } else {
    endInteract();
  }
  selection = 0;
}

function controlsTouchStartHandler(event) {
  event.preventDefault();

  if (dying) return;

  var touchIndex = event.touches.length - 1;
  var pos = clientToCanvasCoords(
    event.touches[touchIndex].clientX,
    event.touches[touchIndex].clientY,
    controlsCanvas
  );
  controlsTouches.push({
    x: pos.x,
    y: pos.y
  });
  if (
    thumbpadIndex === null &&
    Math.sqrt(
      Math.pow(pos.x - 10 - thumbpadRadius, 2) +
        Math.pow(pos.y - 7 - thumbpadRadius, 2)
    ) < thumbpadRadius
  ) {
    thumbpadIndex = controlsTouches.length - 1;
    thumbpadXOffset = pos.x - 10;
    thumbpadYOffset = pos.y - 7;
  } else if (
    Math.sqrt(
      Math.pow(pos.x - 90 - buttonRadius, 2) +
        Math.pow(pos.y - 8 - buttonRadius, 2)
    ) < buttonRadius
  ) {
    if (dead) {
      dead = false;
      keyLock = true;
      loadRoom(120);

      fadeIn().then(() => {
        if (rooms[roomIndex].interaction) {
          interaction = rooms[roomIndex].interaction;
          interact();
        }
        loading = false;
      });
    } else if (buying) {
      var itemDesc;
      switch (selection) {
        case 0:
        default:
          itemDesc = itemsList["cheese"];
          break;
        case 1:
          itemDesc = itemsList["firebolt"];
          break;
        case 2:
          itemDesc = itemsList["halberd"];
          break;
      }

      if (gold >= itemDesc.price) {
        var extra = pickupItem(new Item(0, 0, 0, 0, itemDesc.name, 1));
        if (extra <= 0) addGold(-itemDesc.price);
      }
    } else if (selling && sellingSelection !== false) {
      itemDesc = itemsList[inventory[sellingSelection].name];
      var price = itemDesc.price * inventory[sellingSelection].count;
      inventory[sellingSelection] = null;
      sellingSelection = false;
      addGold(price);
    } else if (
      !interacting &&
      !paused &&
      !resting &&
      !selling &&
      !buying &&
      player.vX === 0 &&
      player.vY === 0
    ) {
      player.setState("attacking");
    }

    if (interacting) {
      if (
        interactions[interaction].callbacks &&
        interactions[interaction].callbacks[selection]
      ) {
        interactions[interaction].callbacks[selection]();
      }

      if (
        interactions[interaction].next &&
        typeof interactions[interaction].next[selection] === "number"
      ) {
        if (Array.isArray(interactions[interaction].next[selection])) {
          interaction = interactions[interaction].next[selection][currChar];
        } else {
          interaction = interactions[interaction].next[selection];
        }
      } else {
        endInteract();
      }

      selection = 0;
    }
  } else if (
    Math.sqrt(
      Math.pow(pos.x - 70 - buttonRadius, 2) +
        Math.pow(pos.y - 26 - buttonRadius, 2)
    ) < buttonRadius
  ) {
    // B
    if (paused) {
      endPause();
    } else if (buying) {
      endBuying();
    } else if (selling) {
      endSelling();
    } else {
      if (!interacting) {
        aiming = true;

        if (interactable) interact();
      } else {
        endInteract();
      }
    }
  }
}

function addGold(amt) {
  gold += amt;
  texts[0].str = `☼${gold}`;
}

function invFull() {
  for (var i = 0; i < 18; i++) {
    if (!inventory[i]) {
      return false;
    }
  }
  return true;
}

function interact() {
  if (interactions[interaction].inv && invFull()) {
    interaction = 25;
  }
  if (typeof interaction === "number") {
    if (Array.isArray(interactions[interaction]))
      interaction = interactions[interaction][currChar];
    interacting = true;
  }
}

function endInteract() {
  interacting = false;
  selection = 0;
  playerPortraitX = 0;
  npcPortraitX = 0;
}

function saveGame() {
  var index;

  //serialize characters
  var newCharacters = [];
  for (index in characters) {
    newCharacters[index] = characters[index].serialize();
  }

  //serialize rooms
  var newRooms = [];
  for (index in rooms) {
    if (!rooms[index]) continue;

    if (rooms[index].room) {
      newRooms[index] = {
        room: rooms[index].room.serialize(),
        x: rooms[index].x,
        y: rooms[index].y,
        dir: rooms[index].dir,
        cameraX: rooms[index].cameraX,
        cameraY: rooms[index].cameraY
      };
    } else {
      newRooms[index] = rooms[index];
    }
  }

  // Prepare game state object
  var gameState = {
    characters: newCharacters,
    currChar: currChar,
    inventory: inventory,
    gold: gold,
    exp: exp,
    rooms: newRooms
  };

  // Convert game state object to JSON
  var gameStateJson = JSON.stringify(gameState);

  // Store in localStorage
  localStorage.setItem("lifBetaGameState1", gameStateJson);

  console.log("Game saved!");
}

function copyEnemy(enemy) {
  //serialize the enemy
  if (typeof enemy.serialize === "function") enemy = enemy.serialize();

  switch (enemy.type) {
    default:
      return new Enemy(
        enemy.type,
        enemy.locations,
        enemy.width,
        enemy.height,
        enemy.xOffset,
        enemy.yOffset,
        sprites.find((s) => s.name === enemy.sprite),
        sprites.find((s) => s.name === enemy.mask),
        enemy.animations,
        enemy.direction,
        enemy.hp,
        enemy.items
      );
    case "slime":
      return new Slime(
        enemy.type,
        enemy.locations,
        enemy.width,
        enemy.height,
        enemy.xOffset,
        enemy.yOffset,
        sprites.find((s) => s.name === enemy.sprite),
        sprites.find((s) => s.name === enemy.mask),
        enemy.animations,
        enemy.direction,
        enemy.hp,
        enemy.items
      );
    case "goblin":
      return new Goblin(
        enemy.type,
        enemy.locations,
        enemy.width,
        enemy.height,
        enemy.xOffset,
        enemy.yOffset,
        sprites.find((s) => s.name === enemy.sprite),
        sprites.find((s) => s.name === enemy.mask),
        enemy.animations,
        enemy.direction,
        enemy.hp,
        enemy.items
      );
  }
}

function checkAngles(angles) {
  var newAngle = Math.random() * 360;
  if (!angles) return newAngle;

  for (var angle of angles) {
    if (Math.abs(angle - newAngle) < 15) return checkAngles(angles);
  }
  return newAngle;
}

//input functions
function controlsTouchMoveHandler(event) {
  event.preventDefault();

  if (keyLock) return;

  if (event.touches.length !== controlsTouches.length) return;

  for (var i = 0; i < controlsTouches.length; i++) {
    var pos = clientToCanvasCoords(
      event.touches[i].clientX,
      event.touches[i].clientY,
      controlsCanvas
    );
    controlsTouches[i].x = pos.x;
    controlsTouches[i].y = pos.y;
    if (thumbpadIndex === i) {
      thumbpadX = pos.x - 10 - thumbpadXOffset;
      thumbpadY = pos.y - 7 - thumbpadYOffset;
      let dist = Math.sqrt(thumbpadX * thumbpadX + thumbpadY * thumbpadY);
      if (dist > 4) {
        moved = true;
        var angle = angleFromVector(thumbpadX, thumbpadY);
        if (angle < 22.5 || angle > 337.5) {
          if (buying && thumbpadDir !== 3) {
            selection--;
            if (selection < 0) selection = 2;
          }

          thumbpadDir = 3;
        } else if (angle < 337.5 && angle > 292.5) {
          thumbpadDir = 2;
        } else if (angle < 292.5 && angle > 247.5) {
          if (interacting && thumbpadDir !== 1) selection = selection ? 0 : 1;

          thumbpadDir = 1;
        } else if (angle < 247.5 && angle > 202.5) {
          thumbpadDir = 0;
        } else if (angle < 202.5 && angle > 157.5) {
          if (buying && thumbpadDir !== 7) {
            selection++;
            if (selection > 2) selection = 0;
          }

          thumbpadDir = 7;
        } else if (angle < 157.5 && angle > 112.5) {
          thumbpadDir = 6;
        } else if (angle < 112.5 && angle > 67.5) {
          if (interacting && thumbpadDir !== 5) selection = selection ? 0 : 1;

          thumbpadDir = 5;
        } else if (angle < 67.5 && angle > 22.5) {
          thumbpadDir = 4;
        }
      }
    }
  }
}

function controlsTouchEndHandler(event) {
  event.preventDefault();
  if (event.touches.length === 0) {
    controlsTouches = [];
    thumbpadIndex = null;
    thumbpadDir = -1;
    thumbpadX = 0;
    thumbpadY = 0;
    keyLock = false;
    aiming = false;
  } else {
    var newcontrolsTouches = [];
    var thumbpadEnd = true;
    var aimingEnd = true;
    for (var touch of event.touches) {
      //check if thumbpad is still held
      var pos = clientToCanvasCoords(
        touch.clientX,
        touch.clientY,
        controlsCanvas
      );

      newcontrolsTouches.push({
        x: pos.x,
        y: pos.y
      });

      if (
        thumbpadIndex &&
        Math.sqrt(
          Math.pow(pos.x - 20 - thumbpadX - thumbpadRadius, 2) +
            Math.pow(pos.y - 7 - thumbpadY - thumbpadRadius, 2)
        ) < thumbpadRadius
      ) {
        thumbpadEnd = false;
        thumbpadIndex = newcontrolsTouches.length - 1;
        thumbpadX = pos.x - 20 - thumbpadXOffset;
        thumbpadY = pos.y - 7 - thumbpadYOffset;
      } else if (
        Math.sqrt(
          Math.pow(pos.x - 70 - buttonRadius, 2) +
            Math.pow(pos.y - 26 - buttonRadius, 2)
        ) < thumbpadRadius
      ) {
        aimingEnd = false;
        aiming = true;
      }
    }

    if (thumbpadEnd) {
      thumbpadIndex = null;
      thumbpadDir = -1;
      thumbpadX = 0;
      thumbpadY = 0;
    }

    if (aimingEnd) {
      aiming = false;
    }

    controlsTouches = newcontrolsTouches;
  }
}

function touchStartHandler(event) {
  var x, y;

  event.preventDefault();

  if (event.touches.length === 1) {
    var pos = clientToCanvasCoords(
      event.touches[0].clientX,
      event.touches[0].clientY,
      canvas
    );

    if (!interacting && !buying && !selling) {
      if (pos.x < 18 && pos.y > 102) paused = !paused;

      if (pos.x > 32 && pos.x < 88 && pos.y > 104 && pos.y < 118) {
        if (player.state !== "attacking") {
          currChar = Math.floor((pos.x - 32) / 14);
          player.switchChar(characters[currChar]);
        }
      }

      if (paused) {
        var hpArrow =
          characters[currChar].maxHp < 9 &&
          exp >= expRate[characters[currChar].maxHp];
        var dmgArrow =
          characters[currChar].damage < 9 &&
          exp >= expRate[characters[currChar].damage];
        var luckArrow =
          characters[currChar].luck < 9 &&
          exp >= expRate[characters[currChar].luck];

        if (pos.x > 84 && pos.x < 97 && pos.y > 20 && pos.y < 33) {
          endPause();
        } else if (pos.x > 24 && pos.x < 96 && pos.y > 60 && pos.y < 96) {
          x = Math.floor((pos.x - 24) / 12);
          y = Math.floor((pos.y - 60) / 12);
          var index = y * 6 + x;
          if (inventory[index]) {
            movingItem = inventory[index];
            movingItemIndex = index;
            inventory[index] = null;
            itemStart = Date.now();
          }
        } else if (pos.x > 84 && pos.x < 96 && pos.y > 39 && pos.y < 51) {
          if (characters[currChar].item) {
            movingItem = characters[currChar].item;
            movingItemIndex = -1;
            characters[currChar].item = null;
            itemStart = Date.now();
          }
        } else if (
          pos.x > 21 &&
          pos.x < 32 &&
          pos.y > 22 &&
          pos.y < 30 &&
          hpArrow
        ) {
          exp -= expRate[characters[currChar].maxHp];
          characters[currChar].hp++;
          characters[currChar].maxHp++;
        } else if (
          pos.x > 21 &&
          pos.x < 32 &&
          pos.y > 22 + 8 &&
          pos.y < 30 + 8 &&
          dmgArrow
        ) {
          exp -= expRate[characters[currChar].damage];
          characters[currChar].damage++;
        } else if (
          pos.x > 21 &&
          pos.x < 32 &&
          pos.y > 22 + 16 &&
          pos.y < 30 + 16 &&
          luckArrow
        ) {
          exp -= expRate[characters[currChar].luck];
          characters[currChar].luck++;
        }
      }
    }

    if (selling) {
      if (pos.x > 84 && pos.x < 97 && pos.y > 20 && pos.y < 33) {
        endSelling();
      } else if (pos.x > 24 && pos.x < 96 && pos.y > 60 && pos.y < 96) {
        x = Math.floor((pos.x - 24) / 12);
        y = Math.floor((pos.y - 60) / 12);
        sellingSelection = y * 6 + x;
        if (inventory[sellingSelection]) {
          var itemDesc = itemsList[inventory[sellingSelection].name];
          if (!itemDesc.price) sellingSelection = false;
        }
      }
    }

    if (buying) {
      if (pos.x > 69 && pos.x < 86 && pos.y > 35 && pos.y < 57) {
        selection = 0;
      } else if (pos.x > 53 && pos.x < 67 && pos.y > 35 && pos.y < 57) {
        selection = 1;
      } else if (pos.x > 31 && pos.x < 52 && pos.y > 35 && pos.y < 57) {
        selection = 2;
      }
    }
  }
}

function touchMoveHandler(event) {
  event.preventDefault();

  var pos = clientToCanvasCoords(
    event.touches[0].clientX,
    event.touches[0].clientY,
    canvas
  );
  mouseX = pos.x;
  mouseY = pos.y;
}

function touchEndHandler(event) {
  event.preventDefault();

  if (event.touches.length === 0) {
    var pos = { x: mouseX - 8, y: mouseY - 8 };
    if (movingItem) {
      var itemDesc = itemsList[movingItem.name];

      //check if item is activated
      if (Date.now() - itemStart < 200) {
        if (itemDesc.affect) {
          if (!itemDesc.consumable) {
            if (movingItemIndex === -1) {
              characters[currChar].item = movingItem;
            } else {
              inventory[movingItemIndex] = movingItem;
            }
          }
          movingItem = null;
          itemDesc.affect();
          return;
        }
      }

      if (pos.x < 20 || pos.x > 100 || pos.y < 20 || pos.y > 100) {
        var angle = Math.random() * 180;
        var vector = vectorFromAngle(angle);
        vector = resizeVector(vector.x, vector.y, 7);
        vector.y = vector.y / 2;
        rooms[roomIndex].room.items.push(
          new Item(
            player.x,
            player.y,
            3,
            8,
            movingItem.name,
            movingItem.count,
            vector.x,
            vector.y,
            5
          )
        );
        movingItem = null;
      } else if (pos.x > 24 && pos.x < 96 && pos.y > 60 && pos.y < 96) {
        var x = Math.floor((pos.x - 24) / 12);
        var y = Math.floor((pos.y - 60) / 12);
        var index = y * 6 + x;
        if (!inventory[index]) {
          inventory[index] = movingItem;
          movingItem = null;
        } else if (
          inventory[index].name === movingItem.name &&
          itemDesc.maxStack > 1
        ) {
          var extra = 0;
          var newCount = inventory[index].count + movingItem.count;
          if (newCount > itemDesc.maxStack) {
            extra = newCount - itemDesc.maxStack;
            newCount = itemDesc.maxStack;
          }
          inventory[index].count = newCount;
          if (extra) {
            movingItem.count = extra;
            if (movingItemIndex === -1) {
              characters[currChar].item = movingItem;
            } else {
              inventory[movingItemIndex] = movingItem;
            }
          }

          movingItem = null;
        } else {
          if (movingItemIndex === -1) {
            characters[currChar].item = inventory[index];
            inventory[index] = movingItem;
            movingItem = null;
          } else {
            inventory[movingItemIndex] = inventory[index];
            inventory[index] = movingItem;
            movingItem = null;
          }
        }
      } else if (pos.x > 84 && pos.x < 96 && pos.y > 39 && pos.y < 51) {
        if (!characters[currChar].item) {
          characters[currChar].item = movingItem;
          movingItem = null;
        } else if (
          characters[currChar].item.name === movingItem.name &&
          itemDesc.maxStack > 1
        ) {
          extra = 0;
          newCount = characters[currChar].item.count + movingItem.count;
          if (newCount > itemDesc.maxStack) {
            extra = newCount - itemDesc.maxStack;
            newCount = itemDesc.maxStack;
          }
          characters[currChar].item.count = newCount;
          if (extra) {
            movingItem.count = extra;
            inventory[movingItemIndex] = movingItem;
          }
          movingItem = null;
        } else {
          inventory[movingItemIndex] = characters[currChar].item;
          characters[currChar].item = movingItem;
          movingItem = null;
        }
      } else {
        if (movingItemIndex === -1) {
          characters[currChar].item = movingItem;
          movingItem = null;
        } else {
          inventory[movingItemIndex] = movingItem;
          movingItem = null;
        }
      }
    }
  }

  //change urist Sprite
  if (characters[currChar].name === "urist") {
    if (
      characters[currChar].item &&
      characters[currChar].item.name === "pole"
    ) {
      characters[3].sprite = uristPoleSprite;
      player.sprite = uristPoleSprite;
      characters[3].animation = uristPoleAnimations;
      player.animation = uristPoleAnimations;
    } else if (
      characters[currChar].item &&
      characters[currChar].item.name === "halberd"
    ) {
      characters[3].sprite = uristHalberdSprite;
      player.sprite = uristHalberdSprite;
      characters[3].animation = uristPoleAnimations;
      player.animation = uristPoleAnimations;
    } else {
      characters[3].sprite = uristSprite;
      player.sprite = uristSprite;
      characters[3].animation = uristAnimations;
      player.animation = uristAnimations;
    }
  }
}

function mouseDownHandler(e) {
  var x, y;
  var pos = clientToCanvasCoords(e.clientX, e.clientY, canvas);
  var hpArrow =
    characters[currChar].maxHp < 9 &&
    exp >= expRate[characters[currChar].maxHp];
  var dmgArrow =
    characters[currChar].damage < 9 &&
    exp >= expRate[characters[currChar].damage];
  var luckArrow =
    characters[currChar].luck < 9 && exp >= expRate[characters[currChar].luck];

  if (paused) {
    if (pos.x > 84 && pos.x < 97 && pos.y > 20 && pos.y < 33) {
      endPause();
    } else if (pos.x > 26 && pos.x < 94 && pos.y > 62 && pos.y < 94) {
      x = Math.floor((pos.x - 26) / 12);
      y = Math.floor((pos.y - 62) / 12);
      if (pos.x - 26 - x * 12 <= 10 && pos.y - 62 - y * 12 <= 10) {
        var index = y * 6 + x;
        if (inventory[index]) {
          movingItem = inventory[index];
          movingItemIndex = index;
          inventory[index] = null;
          itemStart = Date.now();
        }
      }
    } else if (pos.x > 84 && pos.x < 96 && pos.y > 39 && pos.y < 51) {
      if (characters[currChar].item) {
        movingItem = characters[currChar].item;
        movingItemIndex = -1;
        characters[currChar].item = null;
        itemStart = Date.now();
        if (characters[currChar].name === "urist") {
          characters[3].sprite = uristSprite;
          player.sprite = uristSprite;
          characters[3].animation = uristAnimations;
          player.animation = uristAnimations;
        }
      }
    } else if (
      pos.x > 26 &&
      pos.x < 35 &&
      pos.y > 23 &&
      pos.y < 30 &&
      hpArrow
    ) {
      exp -= expRate[characters[currChar].maxHp];
      characters[currChar].hp++;
      characters[currChar].maxHp++;
    } else if (
      pos.x > 26 &&
      pos.x < 35 &&
      pos.y > 23 + 8 &&
      pos.y < 30 + 8 &&
      dmgArrow
    ) {
      exp -= expRate[characters[currChar].damage];
      characters[currChar].damage++;
    } else if (
      pos.x > 26 &&
      pos.x < 35 &&
      pos.y > 23 + 16 &&
      pos.y < 30 + 16 &&
      luckArrow
    ) {
      exp -= expRate[characters[currChar].luck];
      characters[currChar].luck++;
    }
  }

  if (selling) {
    if (pos.x > 84 && pos.x < 97 && pos.y > 20 && pos.y < 33) {
      endSelling();
    } else if (pos.x > 26 && pos.x < 94 && pos.y > 62 && pos.y < 94) {
      x = Math.floor((pos.x - 26) / 12);
      y = Math.floor((pos.y - 62) / 12);
      if (pos.x - 26 - x * 12 <= 10 && pos.y - 62 - y * 12 <= 10) {
        sellingSelection = y * 6 + x;
        if (inventory[sellingSelection]) {
          var itemDesc = itemsList[inventory[sellingSelection].name];
          if (!itemDesc.price) sellingSelection = false;
        }
      }
    }
  }

  if (buying) {
    if (pos.x > 69 && pos.x < 86 && pos.y > 35 && pos.y < 57) {
      selection = 0;
    } else if (pos.x > 53 && pos.x < 67 && pos.y > 35 && pos.y < 57) {
      selection = 1;
    } else if (pos.x > 31 && pos.x < 52 && pos.y > 35 && pos.y < 57) {
      selection = 2;
    }
  }
}

function mouseMoveHandler(e) {
  var pos = clientToCanvasCoords(e.clientX, e.clientY, canvas);

  mouseX = pos.x;
  mouseY = pos.y;
}

function mouseUpHandler(e) {
  var pos = clientToCanvasCoords(e.clientX, e.clientY, canvas);

  if (movingItem) {
    var itemDesc = itemsList[movingItem.name];

    //check if item is activated
    if (Date.now() - itemStart < 200) {
      if (itemDesc.affect) {
        itemDesc.affect();
        if (!itemDesc.consumable) {
          if (movingItemIndex === -1) {
            characters[currChar].item = movingItem;
          } else {
            inventory[movingItemIndex] = movingItem;
          }
        }
        movingItem = null;
        return;
      }
    }

    if (pos.x < 20 || pos.x > 100 || pos.y < 20 || pos.y > 100) {
      var angle = Math.random() * 180;
      var vector = vectorFromAngle(angle);
      vector = resizeVector(vector.x, vector.y, 7);
      vector.y = vector.y / 2;
      rooms[roomIndex].room.items.push(
        new Item(
          player.x,
          player.y,
          3,
          8,
          movingItem.name,
          movingItem.count,
          vector.x,
          vector.y,
          5
        )
      );
      movingItem = null;
    } else if (pos.x > 26 && pos.x < 94 && pos.y > 62 && pos.y < 94) {
      var x = Math.floor((pos.x - 26) / 12);
      var y = Math.floor((pos.y - 62) / 12);
      if (pos.x - 26 - x * 12 <= 8 && pos.y - 62 - y * 12 <= 8) {
        var index = y * 6 + x;
        if (!inventory[index]) {
          inventory[index] = movingItem;
          movingItem = null;
        } else if (
          inventory[index].name === movingItem.name &&
          itemDesc.maxStack > 1
        ) {
          var extra = 0;
          var newCount = inventory[index].count + movingItem.count;
          if (newCount > itemDesc.maxStack) {
            extra = newCount - itemDesc.maxStack;
            newCount = itemDesc.maxStack;
          }
          inventory[index].count = newCount;
          if (extra) {
            movingItem.count = extra;
            if (movingItemIndex === -1) {
              characters[currChar].item = movingItem;
            } else {
              inventory[movingItemIndex] = movingItem;
            }
          }

          movingItem = null;
        } else {
          if (movingItemIndex === -1) {
            characters[currChar].item = inventory[index];
            inventory[index] = movingItem;
            movingItem = null;

            //change urist Sprite
            if (characters[currChar].name === "urist") {
              if (characters[currChar].item.name === "pole") {
                characters[3].sprite = uristPoleSprite;
                player.sprite = uristPoleSprite;
                characters[3].animation = uristPoleAnimations;
                player.animation = uristPoleAnimations;
              } else if (characters[currChar].item.name === "halberd") {
                characters[3].sprite = uristHalberdSprite;
                player.sprite = uristHalberdSprite;
                characters[3].animation = uristPoleAnimations;
                player.animation = uristPoleAnimations;
              }
            }
          } else {
            inventory[movingItemIndex] = inventory[index];
            inventory[index] = movingItem;
            movingItem = null;
          }
        }
      } else {
        if (movingItemIndex === -1) {
          characters[currChar].item = movingItem;
          movingItem = null;
        } else {
          inventory[movingItemIndex] = movingItem;
          movingItem = null;
        }
      }
    } else if (pos.x > 86 && pos.x < 94 && pos.y > 41 && pos.y < 49) {
      if (!characters[currChar].item) {
        characters[currChar].item = movingItem;
        movingItem = null;

        //change urist Sprite
        if (characters[currChar].name === "urist") {
          if (characters[currChar].item.name === "pole") {
            characters[3].sprite = uristPoleSprite;
            player.sprite = uristPoleSprite;
            characters[3].animation = uristPoleAnimations;
            player.animation = uristPoleAnimations;
          } else if (characters[currChar].item.name === "halberd") {
            characters[3].sprite = uristHalberdSprite;
            player.sprite = uristHalberdSprite;
            characters[3].animation = uristPoleAnimations;
            player.animation = uristPoleAnimations;
          }
        }
      } else if (
        characters[currChar].item.name === movingItem.name &&
        itemDesc.maxStack > 1
      ) {
        extra = 0;
        newCount = characters[currChar].item.count + movingItem.count;
        if (newCount > itemDesc.maxStack) {
          extra = newCount - itemDesc.maxStack;
          newCount = itemDesc.maxStack;
        }
        characters[currChar].item.count = newCount;

        if (extra) {
          movingItem.count = extra;
          inventory[movingItemIndex] = movingItem;
        }

        movingItem = null;
      } else {
        inventory[movingItemIndex] = characters[currChar].item;
        characters[currChar].item = movingItem;
        movingItem = null;

        //change urist Sprite
        if (characters[currChar].name === "urist") {
          if (characters[currChar].item.name === "pole") {
            characters[3].sprite = uristPoleSprite;
            player.sprite = uristPoleSprite;
            characters[3].animation = uristPoleAnimations;
            player.animation = uristPoleAnimations;
          } else if (characters[currChar].item.name === "halberd") {
            characters[3].sprite = uristHalberdSprite;
            player.sprite = uristHalberdSprite;
            characters[3].animation = uristPoleAnimations;
            player.animation = uristPoleAnimations;
          }
        }
      }
    } else {
      if (movingItemIndex === -1) {
        characters[currChar].item = movingItem;
        movingItem = null;

        //change urist Sprite
        if (characters[currChar].name === "urist") {
          if (characters[currChar].item.name === "pole") {
            characters[3].sprite = uristPoleSprite;
            player.sprite = uristPoleSprite;
            characters[3].animation = uristPoleAnimations;
            player.animation = uristPoleAnimations;
          } else if (characters[currChar].item.name === "halberd") {
            characters[3].sprite = uristHalberdSprite;
            player.sprite = uristHalberdSprite;
            characters[3].animation = uristPoleAnimations;
            player.animation = uristPoleAnimations;
          }
        }
      } else {
        inventory[movingItemIndex] = movingItem;
        movingItem = null;
      }
    }
  }
}

function keyDownHandler(e) {
  var itemDesc;

  e.preventDefault();

  if (keyLock || dying) return;

  if (!keys[e.keyCode]) {
    keys[e.keyCode] = true;
    keys2[e.keyCode] = true;

    if (
      e.keyCode === 65 ||
      e.keyCode === 68 ||
      e.keyCode === 83 ||
      e.keyCode === 87
    ) {
      // W,A,S,D
      moved = true;
    }

    if (e.keyCode === 16) {
      //shift
      aiming = true;
    }

    if (dead) {
      dead = false;
      keyLock = true;
      loadRoom(120);

      fadeIn().then(() => {
        if (rooms[roomIndex].interaction) {
          interaction = rooms[roomIndex].interaction;
          interact();
        }
        loading = false;
      });
    } else if (paused) {
      if (e.keyCode === 16 || e.keyCode === 73 || e.keyCode === 27) {
        //shift esc or I
        endPause();
      }

      if (e.keyCode === 81) {
        //Q
        currChar--;
        if (currChar < 0) currChar = characters.length - 1;
        player.switchChar(characters[currChar]);
      }

      if (e.keyCode === 69) {
        //E
        currChar++;
        if (currChar > characters.length - 1) currChar = 0;
        player.switchChar(characters[currChar]);
      }
    } else if (interacting) {
      if (e.keyCode === 32) {
        //shift
        nextInteraction();
      }

      if (e.keyCode === 16) {
        //shift
        endInteract();
      }

      if (e.keyCode === 87 || e.keyCode === 83) selection = selection ? 0 : 1;
    } else if (buying) {
      if (e.keyCode === 16 || e.keyCode === 27) {
        //shift and esc
        endBuying();
      }

      if (e.keyCode === 65) {
        //A
        selection++;
        if (selection > 2) selection = 0;
      }

      if (e.keyCode === 68) {
        // D
        selection--;
        if (selection < 0) selection = 2;
      }

      if (e.keyCode === 32 || e.keyCode === 13) {
        //space and enter
        switch (selection) {
          case 0:
          default:
            itemDesc = itemsList["cheese"];
            break;
          case 1:
            itemDesc = itemsList["firebolt"];
            break;
          case 2:
            itemDesc = itemsList["halberd"];
            break;
        }

        if (gold >= itemDesc.price) {
          var extra = pickupItem(new Item(0, 0, 0, 0, itemDesc.name, 1));
          if (extra <= 0) addGold(-itemDesc.price);
        }
      }
    } else if (selling) {
      if (e.keyCode === 16 || e.keyCode === 27) {
        //shift and esc
        endSelling();
      }

      if (e.keyCode === 32 || e.keyCode === 13) {
        //space and enter
        if (sellingSelection !== false) {
          itemDesc = itemsList[inventory[sellingSelection].name];
          var price = itemDesc.price * inventory[sellingSelection].count;
          inventory[sellingSelection] = null;
          sellingSelection = false;
          addGold(price);
        }
      }
    } else if (player.state !== "attacking") {
      if (e.keyCode === 32) {
        //space
        if (!interacting && !paused && !resting && !selling && !buying)
          player.setState("attacking");
      }

      if (e.keyCode === 81) {
        //Q
        currChar--;
        if (currChar < 0) currChar = characters.length - 1;
        player.switchChar(characters[currChar]);
      }

      if (e.keyCode === 69) {
        //E
        currChar++;
        if (currChar > characters.length - 1) currChar = 0;
        player.switchChar(characters[currChar]);
      }

      if (e.keyCode === 16) {
        //shift
        if (interactable) interact();
      }

      if (e.keyCode === 73 || e.keyCode === 27) {
        // esc or I
        paused = true;
      }
    }
  }
}

function keyUpHandler(e) {
  keyLock = false;
  keys2[e.keyCode] = false;

  switch (e.keyCode) {
    case 65:
    case 68:
    case 83:
    case 87:
      if (keys2[87] || keys2[68] || keys2[83] || keys2[65]) {
        directionTimeout = setTimeout(() => {
          keys[e.keyCode] = false;
        }, 100);
      } else {
        keys[87] = false;
        keys[68] = false;
        keys[83] = false;
        keys[65] = false;
        if (directionTimeout) clearTimeout(directionTimeout);
      }
      break;
    case 16:
      aiming = false;
      keys[16] = false;
      break;
    default:
      keys[e.keyCode] = false;
      break;
  }
}

//load from last save
async function loadRoom(index) {
  return new Promise(async (resolve) => {
    keys = {};
    keys2 = {};
    thumbpadDir = -1;
    loading = true;
    moved = false;

    for (var trap of rooms[roomIndex].room.traps) {
      if (trap.reset) trap.setState("default");
    }

    enemies = [];

    for (var i = index; i >= 0; i--) {
      if (rooms[i] && rooms[i].room) {
        await rooms[i].room.load();

        roomIndex = i;

        for (var enemy of rooms[roomIndex].room.enemies) {
          enemies.push(copyEnemy(enemy));
        }

        player.x = rooms[index].x;
        player.y = rooms[index].y;
        player.direction = rooms[index].dir;
        player.vX = 0;
        player.vY = 0;
        camera.x = rooms[index].cameraX;
        camera.y = rooms[index].cameraY;

        break;
      }
    }

    resolve();
  });
}

// Game Loop Functions
function update(framesElapsed) {
  if (dead) {
    var sX = isMobile ? 120 : 0;
    ctx.drawImage(deadSprite.image, sX, 0, 120, 120, 0, 0, 120, 120);
    return;
  }

  for (var enemy of enemies) {
    enemy.update(framesElapsed);
  }

  player.update(framesElapsed);

  for (var projectile of projectiles) {
    projectile.update(framesElapsed);
  }

  for (var item of rooms[roomIndex].room.items) {
    item.update(framesElapsed);
    if (item.yOffset === 3) {
      var x = Math.abs(player.x - item.x);
      var y = Math.abs(player.y - item.y);
      if (x < player.radius && y < player.radius) {
        var extra = pickupItem(item);
        if (extra <= 0) {
          rooms[roomIndex].room.items.splice(
            rooms[roomIndex].room.items.indexOf(item),
            1
          );
        } else {
          item.count = extra;
        }
      }
    }
  }

  for (var attack of attacks) {
    attack.update(framesElapsed);
  }

  for (var particle of particles) {
    particle.update(framesElapsed);
  }
}

function draw(framesElapsed) {
  var itemDesc, i;

  if (isMobile) {
    controlsCtx.clearRect(0, 0, controlsCanvas.width, controlsCanvas.height);

    controlsCtx.drawImage(controllerSprite.image, 0, 0, 120, 50, 0, 0, 120, 50);

    let dist = Math.sqrt(thumbpadX * thumbpadX + thumbpadY * thumbpadY);
    if (dist > 7) {
      var newVector = resizeVector(thumbpadX, thumbpadY, 5);
      controlsCtx.drawImage(
        controllerSprite.image,
        120,
        0,
        36,
        36,
        10 + Math.round(newVector.x),
        7 + Math.round(newVector.y),
        36,
        36
      );
    } else {
      controlsCtx.drawImage(
        controllerSprite.image,
        120,
        0,
        36,
        36,
        10 + Math.round(thumbpadX),
        7 + Math.round(thumbpadY),
        36,
        36
      );
    }

    controlsCtx.drawImage(
      controllerSprite.image,
      156,
      0,
      16,
      16,
      90,
      8,
      16,
      16
    );

    controlsCtx.drawImage(
      controllerSprite.image,
      156,
      16,
      16,
      16,
      70,
      26,
      16,
      16
    );
  }

  if (dead) {
    return;
  }

  //clear the game canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  roomCtx.clearRect(0, 0, roomCanvas.width, roomCanvas.height);
  roomCtx1.clearRect(0, 0, roomCanvas.width, roomCanvas.height);

  if (rooms[roomIndex].room && rooms[roomIndex].room.loaded) {
    rooms[roomIndex].room.draw();
  }

  var objects = [player, ...projectiles, ...attacks, ...particles];

  if (rooms[roomIndex].room.items) objects.push(...rooms[roomIndex].room.items);

  if (rooms[roomIndex].room.objects)
    objects.push(...rooms[roomIndex].room.objects);

  if (rooms[roomIndex].room.traps) objects.push(...rooms[roomIndex].room.traps);

  objects.push(...enemies);

  objects.sort((a, b) => a.y - b.y);

  for (var object of objects) {
    object.draw(framesElapsed);
  }

  if (isMobile) {
    ctx.drawImage(controllerSprite.image, 120, 36, 14, 14, 2, 104, 14, 14);

    ctx.drawImage(charIconsSprite.image, 0, 0, 56, 14, 32, 104, 56, 14);
  }

  if (paused) {
    ctx.drawImage(inventorySprite.image, 20, 20);

    ctx.drawImage(
      portraitsSprite.image,
      currChar * 16,
      0,
      16,
      24,
      63,
      26,
      16,
      24
    );

    var hpArrow =
      characters[currChar].maxHp < 9 &&
      exp >= expRate[characters[currChar].maxHp];
    var dmgArrow =
      characters[currChar].damage < 9 &&
      exp >= expRate[characters[currChar].damage];
    var luckArrow =
      characters[currChar].luck < 9 &&
      exp >= expRate[characters[currChar].luck];

    var hpSY = hpArrow ? 0 : 3;
    var dmgSY = dmgArrow ? 0 : 3;
    var luckSY = luckArrow ? 0 : 3;

    ctx.drawImage(controllerSprite.image, 134, 36 + hpSY, 5, 3, 28, 25, 5, 3);
    ctx.drawImage(
      controllerSprite.image,
      134,
      36 + dmgSY,
      5,
      3,
      28,
      25 + 8,
      5,
      3
    );
    ctx.drawImage(
      controllerSprite.image,
      134,
      36 + luckSY,
      5,
      3,
      28,
      25 + 16,
      5,
      3
    );

    var hpText = new Text(
      characters[currChar].maxHp.toString(),
      36,
      24,
      1000,
      1,
      1,
      textSprite
    );
    hpText.draw();

    var dmgText = new Text(
      characters[currChar].damage.toString(),
      36,
      24 + 8,
      1000,
      1,
      1,
      textSprite
    );
    dmgText.draw();

    var luckText = new Text(
      characters[currChar].luck.toString(),
      36,
      24 + 16,
      1000,
      1,
      1,
      textSprite
    );
    luckText.draw();

    var expText = new Text(exp.toString(), 42, 48, 1000, 1, 1, textSprite);
    expText.draw();

    if (characters[currChar].item) {
      itemDesc = itemsList[characters[currChar].item.name];
      ctx.drawImage(
        itemsSprite.image,
        itemDesc.sX,
        itemDesc.sY,
        6,
        6,
        87,
        42,
        6,
        6
      );
      if (
        characters[currChar].item.count > 1 ||
        characters[currChar].item.name === "bolt" ||
        characters[currChar].item.name === "acidBolt"
      ) {
        ctx.drawImage(
          numbersSprite.image,
          characters[currChar].item.count * 5,
          0,
          5,
          5,
          90,
          45,
          5,
          5
        );
      }
    }

    for (i = 0; i < 18; i++) {
      if (inventory[i]) {
        itemDesc = itemsList[inventory[i].name];
        ctx.drawImage(
          itemsSprite.image,
          itemDesc.sX,
          itemDesc.sY,
          6,
          6,
          27 + 12 * (i % 6),
          63 + 12 * Math.floor(i / 6),
          6,
          6
        );
        if (
          inventory[i].count > 1 ||
          inventory[i].name === "bolt" ||
          inventory[i].name === "acidBolt"
        ) {
          ctx.drawImage(
            numbersSprite.image,
            inventory[i].count * 5,
            0,
            5,
            5,
            30 + 12 * (i % 6),
            66 + 12 * Math.floor(i / 6),
            5,
            5
          );
        }
      }
    }

    if (movingItem) {
      var xOffset = isMobile ? -8 : 0;
      var yOffset = isMobile ? -8 : 0;

      itemDesc = itemsList[movingItem.name];
      ctx.drawImage(
        itemsSprite.image,
        itemDesc.sX,
        itemDesc.sY,
        6,
        6,
        Math.floor(mouseX) - 3 + xOffset,
        Math.floor(mouseY) - 3 + yOffset,
        6,
        6
      );
      if (movingItem.count > 1 || movingItem.name === "bolt") {
        ctx.drawImage(
          numbersSprite.image,
          movingItem.count * 5,
          0,
          5,
          5,
          Math.floor(mouseX) + xOffset,
          Math.floor(mouseY) + yOffset,
          5,
          5
        );
      }
    }
  } //end paused

  if (ditherFrame > 0) {
    ctx.drawImage(
      ditherCanvas,
      ditherFrame * canvas.width,
      0,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  for (var j = 0; j < characters[currChar].maxHp; j++) {
    ctx.drawImage(controllerSprite.image, 165, 43, 7, 7, 2 + j * 8, 3, 7, 7);
  }

  for (var k = 0; k < characters[currChar].hp; k++) {
    ctx.drawImage(controllerSprite.image, 158, 43, 7, 7, 2 + k * 8, 3, 7, 7);
  }

  if (buying) {
    ctx.drawImage(itemShop.image, 0, 0, 120, 120);

    var cheeseOffset = 0;
    var boltOffset = 0;
    var halberdOffset = 0;

    switch (selection) {
      case 0:
      default:
        itemDesc = itemsList["cheese"];
        cheeseOffset = 6;

        buyingTitle = new Text("cheese", 49, 86, 94, 1, 1, textSprite);

        buyingDesc = new Text(
          "This cheese restores two hit points!",
          13,
          94,
          94,
          2,
          1,
          textSprite
        );
        break;
      case 1:
        itemDesc = itemsList["firebolt"];
        boltOffset = 6;

        buyingTitle = new Text("firebolt", 49, 86, 94, 1, 1, textSprite);

        buyingDesc = new Text(
          "This spell scroll does a ranged fire attack!",
          13,
          94,
          94,
          2,
          1,
          textSprite
        );
        break;
      case 2:
        itemDesc = itemsList["halberd"];
        halberdOffset = 6;

        buyingTitle = new Text("halberd", 49, 86, 94, 1, 1, textSprite);

        buyingDesc = new Text(
          "This polearm does two extra damage!",
          13,
          94,
          94,
          2,
          1,
          textSprite
        );
        break;
    }
    var priceColor = gold >= itemDesc.price ? 1 : 3;
    buyingPrice = new Text(
      `Price: ☼${itemDesc.price}`,
      65,
      111,
      94,
      3,
      priceColor,
      textSprite
    );

    ctx.drawImage(
      itemShopItems.image,
      35,
      0,
      17,
      16,
      69,
      41 - cheeseOffset,
      17,
      16
    );
    ctx.drawImage(
      itemShopItems.image,
      21,
      0,
      14,
      15,
      53,
      41 - boltOffset,
      14,
      15
    );
    ctx.drawImage(
      itemShopItems.image,
      0,
      0,
      21,
      23,
      31,
      37 - halberdOffset,
      21,
      23
    );

    ctx.drawImage(
      controllerSprite.image,
      134,
      39,
      5,
      3,
      77 - selection * 19,
      58,
      5,
      3
    );

    if (!invFull()) {
      buyingTitle.draw();
      buyingDesc.draw();
      buyingPrice.draw();
    } else {
      var invFullText = new Text(
        "Your inventory is full.",
        13,
        86,
        94,
        3,
        1,
        textSprite
      );
      invFullText.draw();
    }
  } //end buying

  if (selling) {
    ctx.drawImage(sellingSprite.image, 0, 0, 80, 80, 20, 20, 80, 80);

    for (i = 0; i < 18; i++) {
      if (inventory[i]) {
        itemDesc = itemsList[inventory[i].name];
        ctx.drawImage(
          itemsSprite.image,
          itemDesc.sX,
          itemDesc.sY,
          6,
          6,
          27 + 12 * (i % 6),
          63 + 12 * Math.floor(i / 6),
          6,
          6
        );

        if (
          inventory[i].count > 1 ||
          inventory[i].name === "bolt" ||
          inventory[i].name === "acidBolt"
        ) {
          ctx.drawImage(
            numbersSprite.image,
            inventory[i].count * 5,
            0,
            5,
            5,
            30 + 12 * (i % 6),
            66 + 12 * Math.floor(i / 6),
            5,
            5
          );
        }

        if (!itemDesc.price) {
          ctx.drawImage(
            sellingSprite.image,
            80,
            10,
            8,
            8,
            26 + 12 * (i % 6),
            62 + 12 * Math.floor(i / 6),
            8,
            8
          );
        }
      }
    }

    if (sellingSelection !== false && inventory[sellingSelection]) {
      itemDesc = itemsList[inventory[sellingSelection].name];
      var price = inventory[sellingSelection].count * itemDesc.price;

      ctx.drawImage(
        sellingSprite.image,
        80,
        0,
        10,
        10,
        25 + 12 * (sellingSelection % 6),
        61 + 12 * Math.floor(sellingSelection / 6),
        10,
        10
      );

      ctx.drawImage(
        itemsSprite.image,
        itemDesc.sX,
        itemDesc.sY,
        6,
        6,
        81,
        40,
        6,
        6
      );

      var itemNameText = new Text(itemDesc.name, 46, 31, 94, 1, 1, textSprite);
      var itemCountText = new Text(
        inventory[sellingSelection].count.toString(),
        48,
        39,
        94,
        1,
        1,
        textSprite
      );
      var itemPriceText = new Text(`☼${price}`, 58, 47, 94, 1, 1, textSprite);

      itemNameText.draw();
      itemCountText.draw();
      itemPriceText.draw();
    }
  } //end selling

  for (var text of texts) text.draw();
}

function gameLoop() {
  // Calculate the time elapsed since the last frame
  var currentTime = Date.now();
  var elapsedTime = currentTime - lastFrameTime;
  var framesElapsed = Math.floor(elapsedTime / FRAME_DURATION);
  lastFrameTime += framesElapsed * FRAME_DURATION;
  if (framesElapsed > 10) framesElapsed = 10;

  //update the state of all the GameObjects
  if (!paused && !loading && !interacting && !buying && !selling && !resting) {
    update(framesElapsed);
    // draw the environment and GameObjects
    draw(framesElapsed);
  } else {
    // draw the environment and GameObjects but frozen
    draw(0);
  }

  if (interacting) {
    var interactableOffset = isMobile ? 0 : 40;
    ctx.drawImage(
      interactionSprite.image,
      0,
      interactableOffset,
      120,
      40,
      0,
      80,
      120,
      40
    );
    interactions[interaction].draw(framesElapsed);
  }

  // Request the next frame of the game loop
  requestAnimationFrame(gameLoop);
}

// Initialize and Load
async function init() {
  const sawbladeSprite = sprites.find((s) => s.name === "sawblade");
  const sawbladeAnimations = [
    { name: "default", startFrame: 0, endFrame: 0 },
    { name: "trigger", startFrame: 1, endFrame: 2 },
    { name: "triggered", startFrame: 3, endFrame: 5 }
  ];

  //initialize interactions
  interactions.push(
    //0
    new Interaction(
      ["Pick the lock.", "Bash open the door."],
      [1, 2],
      [
        false,
        () => {
          rooms[roomIndex].room.objects.splice(7, 1);
        }
      ]
    )
  );

  interactions.push(
    //1
    new Interaction(
      ["The lock is too hard to pick. You will need keys in this dungeon."],
      [0]
    )
  );

  interactions.push(
    //2
    new Interaction(["You bash open the door!"])
  );

  interactions.push(
    //3
    new Interaction(
      ["Woe unto any who disturb the resting place of Godin Imagepure..."],
      [4]
    )
  );

  interactions.push(
    //4
    new Interaction(["The general watches still."])
  );

  interactions.push(
    //5
    new Interaction(["This is the end of the preview."])
  );

  interactions.push(
    //6
    new Interaction(
      ["Record my progress.", "Give me a tutorial."],
      [7, 9],
      [],
      litastPortrait,
      false,
      true
    )
  );

  interactions.push(
    //7
    new Interaction(
      ["Save Game: Never mind.", "Save Game: I'm sure."],
      [6, 8],
      [
        false,
        () => {
          saveGame();
        }
      ],
      litastPortrait,
      false,
      true
    )
  );

  interactions.push(
    //8
    new Interaction(["Game Saved!"], [], [], litastPortrait)
  );

  if (isMobile) {
    interactions.push(
      //9
      new Interaction(
        ["You can move using the D-pad. Attack with A."],
        [10],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //10
      new Interaction(
        ["Holding B lets you lock in place to aim without moving."],
        [11],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //11
      new Interaction(
        ["B also interacts with the environment and characters."],
        [12],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //12
      new Interaction(
        ["You can change between characters by tapping their icons."],
        [13],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //13
      new Interaction(
        ["Each character has their own stats and abilities."],
        [14],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //14
      new Interaction(
        ["Noi and Edi have crossbows for ranged attacks."],
        [15],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //15
      new Interaction(
        ["Jeff has fire magic that deals area of effect damage."],
        [16],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //16
      new Interaction(
        ["Urist's ten foot pole can detect and disable traps."],
        [17],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //17
      new Interaction(
        ["Tap the bag icon to manage inventory and stats."],
        [],
        [],
        litastPortrait,
        true
      )
    );
  } else {
    interactions.push(
      //9
      new Interaction(
        ["You can move using W,A,S,D on your keyboard. Attack with spacebar."],
        [10],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //10
      new Interaction(
        ["Holding shift lets you lock in place to aim without moving."],
        [11],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //11
      new Interaction(
        ["Shift also interacts with the environment and characters."],
        [12],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //12
      new Interaction(
        ["You can change between characters with E and Q."],
        [13],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //13
      new Interaction(
        ["Each character has their own stats and abilities."],
        [14],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //14
      new Interaction(
        ["Noi and Edi have crossbows for ranged attacks."],
        [15],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //15
      new Interaction(
        ["Jeff has fire magic that deals area of effect damage."],
        [16],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //16
      new Interaction(
        ["Urist's ten foot pole can detect and disable traps."],
        [17],
        [],
        litastPortrait,
        true
      )
    );

    interactions.push(
      //17
      new Interaction(
        ["Use Esc or I to manage inventory and stats."],
        [],
        [],
        litastPortrait,
        true
      )
    );
  }

  interactions.push(
    //18
    new Interaction(
      ["Welcome to Froge's adventuring supplies! I hope you enjoy my wares!"],
      [21],
      [],
      frogePortrait,
      true
    )
  );

  interactions.push(
    //19
    new Interaction(
      ["I'm excited about your adventure, but I'm too scared to follow."],
      [20],
      [],
      litastPortrait,
      true
    )
  );

  interactions.push(
    //20
    new Interaction(["How can I be of service?"], [6], [], litastPortrait, true)
  );

  interactions.push(
    //21
    new Interaction(
      ["I'd like to buy.", "I'd like to sell."],
      [22],
      [
        () => {
          if (!invFull()) {
            buying = true;
            selection = 0;
            texts[0].y -= 40;
            endInteract();
          }
        },
        () => {
          selling = true;
          endInteract();
        }
      ],
      frogePortrait,
      false,
      true
    )
  );

  interactions.push(
    //22
    new Interaction(
      ["I'd sell to you, but your inventory is full."],
      [],
      [],
      frogePortrait,
      true
    )
  );

  interactions.push(
    //23
    new Interaction(
      ["You open the chest and find a healing potion!"],
      [],
      [
        () => {
          rooms[roomIndex].room.objects[0] = new GameObject(
            103,
            115,
            31,
            29,
            0,
            19,
            31,
            0
          );
          pickupItem(new Item(0, 0, 0, 0, "healingPotion", 1));
        }
      ],
      false,
      false,
      false,
      true
    )
  );

  interactions.push(
    //24
    new Interaction(
      ["You sit by the fire and take a rest."],
      [],
      [
        () => {
          resting = true;
          fadeOut().then(() => {
            for (var i = 0; i < characters.length; i++) {
              characters[i].hp = characters[i].maxHp;
            }
            setTimeout(() => {
              fadeIn().then(() => (resting = false));
            }, 800);
          });
        }
      ]
    )
  );

  interactions.push(
    //25
    new Interaction(["Your inventory is full."], [], [])
  );

  // Retrieve from localStorage
  var gameStateJson = localStorage.getItem("lifBetaGameState1");

  // Convert JSON to game state object
  var gameState = JSON.parse(gameStateJson);

  // If there was a saved game state
  if (gameState) {
    var index;

    //deserialize characters
    for (index in gameState.characters) {
      var char = gameState.characters[index];
      characters[index] = new Character(
        char.name,
        char.width,
        char.height,
        char.xOffset,
        char.yOffset,
        sprites.find((s) => s.name === char.sprite),
        char.animations,
        char.radius,
        char.maxHp,
        char.hp,
        char.damage,
        char.luck,
        char.item
      );
    }
    currChar = gameState.currChar;

    //load inventory, gold, and exp
    inventory = gameState.inventory;
    gold = gameState.gold;
    exp = gameState.exp;

    //load rooms
    for (index in gameState.rooms) {
      if (!gameState.rooms[index]) continue;

      //set non class settings
      if (gameState.rooms[index].room) {
        var room = gameState.rooms[index].room;

        //deserialize game objects
        var objects = [];
        for (var object of room.objects) {
          if (object.npc) {
            objects.push(
              new NPC(
                object.x,
                object.y,
                object.width,
                object.height,
                object.xOffset,
                object.yOffset,
                sprites.find((s) => s.name === object.sprite),
                object.frames
              )
            );
          } else {
            objects.push(
              new GameObject(
                object.x,
                object.y,
                object.width,
                object.height,
                object.xOffset,
                object.yOffset,
                object.sX,
                object.sY
              )
            );
          }
        }

        //deserialize items
        var items = [];
        for (var item of room.items) {
          items.push(new Item(item.x, item.y, 3, 3, item.name, item.count));
        }

        //deserialize traps
        var traps = [];
        for (var trap of room.traps) {
          traps.push(
            new Trap(
              trap.x,
              trap.y,
              trap.width,
              trap.height,
              trap.xOffset,
              trap.yOffset,
              sprites.find((s) => s.name === trap.sprite),
              trap.animations,
              trap.damage,
              trap.knockback,
              trap.parent,
              trap.reset,
              trap.flammable,
              trap.detected
            )
          );
        }

        //deserialize enemies
        var enemies = [];
        for (var enemy of room.enemies) {
          enemies.push(copyEnemy(enemy));
        }

        //create room
        rooms[index] = {
          room: new Room(
            room.name,
            room.mapPath,
            room.mask0Path,
            room.mask1Path,
            room.objectsPath,
            room.objectsMaskPath,
            objects,
            items,
            traps,
            enemies
          ),
          x: gameState.rooms[index].x,
          y: gameState.rooms[index].y,
          dir: gameState.rooms[index].dir,
          cameraX: gameState.rooms[index].cameraX,
          cameraY: gameState.rooms[index].cameraY
        };
      } else {
        rooms[index] = gameState.rooms[index];
      }
    }
  } else {
    //initialize characters
    characters.push(
      new Character(
        "noi",
        24,
        24,
        12,
        22,
        noiSprite,
        noiAnimations,
        6,
        2,
        2,
        3,
        1,
        {
          name: "bolt",
          count: 9
        }
      )
    );

    characters.push(
      new Character(
        "edi",
        24,
        24,
        12,
        22,
        ediSprite,
        ediAnimations,
        6,
        1,
        1,
        3,
        2,
        {
          name: "bolt",
          count: 9
        }
      )
    );

    characters.push(
      new Character(
        "jeff",
        24,
        30,
        12,
        28,
        jeffSprite,
        jeffAnimations,
        6,
        2,
        2,
        1,
        3,
        {
          name: "ignite",
          count: 1
        }
      )
    );

    characters.push(
      new Character(
        "urist",
        64,
        42,
        32,
        36,
        uristPoleSprite,
        uristPoleAnimations,
        6,
        3,
        3,
        2,
        1,
        {
          name: "pole",
          count: 1
        }
      )
    );

    //initialize rooms
    rooms[24] = {
      room: new Room(
        `chest`,
        "https://sprites.losingisfun.org/24.png",
        "https://sprites.losingisfun.org/24-mask-0.png",
        "https://sprites.losingisfun.org/24-mask-1.png",
        "https://sprites.losingisfun.org/24-objects.png",
        "https://sprites.losingisfun.org/24-objects-mask.png",
        [new GameObject(103, 115, 31, 29, 0, 19, 0, 0)],
        [],
        [],
        []
      ),
      x: 95,
      y: 148,
      dir: 2,
      cameraX: 54,
      cameraY: 63
    };

    rooms[26] = {
      x: 95,
      y: 148,
      dir: 2,
      cameraX: 54,
      cameraY: 63
    };

    rooms[32] = {
      room: new Room(
        `pots`,
        "https://sprites.losingisfun.org/32.png",
        "https://sprites.losingisfun.org/36-mask-0.png",
        "https://sprites.losingisfun.org/36-mask-1.png",
        false,
        false,
        [],
        [],
        [],
        [
          new Enemy(
            "pot",
            [{ x: 153, y: 107 }],
            12,
            12,
            6,
            12,
            potSprite,
            potMaskSprite,
            potAnimations,
            0,
            0,
            [
              { name: "ashes", count: 1 },
              { name: "ashes", count: 1 },
              { name: "ashes", count: 1 },
              { name: "crutch", count: 1 },
              { name: "coin", count: 3 },
              { name: "coin", count: 5 },
              { name: "coin", count: 10 },
              { name: "coin", count: 20 },
              { name: "torc", count: 1 },
              { name: "torc", count: 1 },
              { name: "ring", count: 1 }
            ]
          ),
          new Enemy(
            "pot",
            [{ x: 141, y: 111 }],
            12,
            12,
            6,
            12,
            potSprite,
            potMaskSprite,
            potAnimations,
            0,
            0,
            [
              { name: "ashes", count: 1 },
              { name: "ashes", count: 1 },
              { name: "ashes", count: 1 },
              { name: "coin", count: 3 },
              { name: "coin", count: 3 },
              { name: "coin", count: 5 },
              { name: "coin", count: 10 },
              { name: "coin", count: 20 },
              { name: "torc", count: 1 },
              { name: "torc", count: 1 },
              { name: "ring", count: 1 }
            ]
          ),
          new Enemy(
            "pot",
            [{ x: 62, y: 128 }],
            12,
            12,
            6,
            12,
            potSprite,
            potMaskSprite,
            potAnimations,
            0,
            0,
            [
              { name: "ashes", count: 1 },
              { name: "ashes", count: 1 },
              { name: "ashes", count: 1 },
              { name: "coin", count: 3 },
              { name: "coin", count: 5 },
              { name: "coin", count: 5 },
              { name: "coin", count: 10 },
              { name: "coin", count: 20 },
              { name: "torc", count: 1 },
              { name: "torc", count: 1 },
              { name: "ring", count: 1 }
            ]
          ),
          new Enemy(
            "pot",
            [{ x: 96, y: 90 }],
            12,
            12,
            6,
            12,
            potSprite,
            potMaskSprite,
            potAnimations,
            0,
            0,
            [
              { name: "ashes", count: 1 },
              { name: "ashes", count: 1 },
              { name: "ashes", count: 1 },
              { name: "crutch", count: 1 },
              { name: "coin", count: 3 },
              { name: "coin", count: 5 },
              { name: "coin", count: 10 },
              { name: "coin", count: 20 },
              { name: "torc", count: 1 },
              { name: "torc", count: 1 },
              { name: "ring", count: 1 }
            ]
          )
        ]
      ),
      x: 95,
      y: 148,
      dir: 2,
      cameraX: 54,
      cameraY: 63
    };

    rooms[33] = {
      x: 153,
      y: 138,
      dir: 0,
      cameraX: 68,
      cameraY: 59
    };

    rooms[36] = {
      room: new Room(
        `cross way`,
        "https://sprites.losingisfun.org/36.png",
        "https://sprites.losingisfun.org/36-mask-0.png",
        "https://sprites.losingisfun.org/36-mask-1.png",
        "https://sprites.losingisfun.org/36-objects.png",
        false,
        [
          new GameObject(141, 96, 38, 59, 0, 46, 0, 0),
          new GameObject(42, 116, 18, 56, 0, 36, 38, 0)
        ],
        [],
        [],
        [
          new Slime(
            "slime",
            [
              { x: 115, y: 100 },
              { x: 130, y: 119 },
              { x: 121, y: 119 },
              { x: 80, y: 120 },
              { x: 130, y: 140 }
            ],
            24,
            40,
            12,
            37,
            slimeSprite,
            slimeMaskSprite,
            slimeAnimations,
            5,
            1,
            [
              false,
              false,
              { name: "greenJelly", count: 1 },
              { name: "greenJelly", count: 1 },
              { name: "greenJelly", count: 1 },
              { name: "greenJelly", count: 1 },
              { name: "greenJelly", count: 1 },
              { name: "greenJelly", count: 2 },
              { name: "greenJelly", count: 2 },
              { name: "greenJelly", count: 2 },
              { name: "greenJelly", count: 3 }
            ]
          )
        ]
      ),
      x: 128,
      y: 98,
      dir: 6,
      cameraX: 60,
      cameraY: 41
    };

    rooms[37] = {
      x: 153,
      y: 138,
      dir: 0,
      cameraX: 68,
      cameraY: 59
    };

    rooms[38] = {
      x: 95,
      y: 148,
      dir: 2,
      cameraX: 54,
      cameraY: 63
    };

    rooms[39] = {
      x: 73,
      y: 109,
      dir: 4,
      cameraX: 39,
      cameraY: 56
    };

    rooms[40] = {
      room: new Room(
        `goblin`,
        "https://sprites.losingisfun.org/40.png",
        "https://sprites.losingisfun.org/40-mask.png",
        "https://sprites.losingisfun.org/40-mask-1.png",
        "https://sprites.losingisfun.org/40-objects.png",
        false,
        [new GameObject(42, 116, 18, 56, 0, 36, 38, 0)],
        [],
        [],
        [
          new Goblin(
            "goblin",
            [
              { x: 130, y: 110 },
              { x: 121, y: 125 },
              { x: 100, y: 130 },
              { x: 130, y: 135 }
            ],
            27,
            27,
            13,
            26,
            goblinSprite,
            goblinMaskSprite,
            goblinAnimations,
            4,
            4,
            [
              { name: "eye", count: 1 },
              { name: "eye", count: 2 },
              { name: "bolt", count: 3 },
              { name: "eye", count: 2 },
              { name: "bolt", count: 3 },
              { name: "healingPotion", count: 1 },
              { name: "bolt", count: 5 },
              { name: "coin", count: 10 },
              { name: "bolt", count: 9 },
              { name: "healingPotion", count: 1 },
              { name: "ring", count: 1 }
            ]
          )
        ]
      ),
      x: 73,
      y: 109,
      dir: 4,
      cameraX: 39,
      cameraY: 56
    };

    rooms[43] = {
      x: 73,
      y: 109,
      dir: 4,
      cameraX: 39,
      cameraY: 56
    };

    rooms[48] = {
      room: new Room(
        "enterance",
        "https://sprites.losingisfun.org/48.png",
        "https://sprites.losingisfun.org/48-mask.png",
        "https://sprites.losingisfun.org/48-mask-1.png.png",
        "https://sprites.losingisfun.org/48-objects.png",
        false,
        [
          new GameObject(141, 96, 38, 59, 0, 46, 63, 0),
          new GameObject(92, 101, 9, 37, 0, 34, 0, 0),
          new GameObject(140, 117, 9, 37, 0, 34, 9, 0),
          new GameObject(122, 145, 9, 37, 0, 34, 18, 0),
          new GameObject(74, 128, 9, 37, 0, 34, 27, 0),
          new GameObject(97, 120, 27, 26, 0, 13, 36, 0)
        ],
        [],
        [
          new Trap(
            138,
            134,
            16,
            11,
            3,
            5,
            sawbladeSprite,
            sawbladeAnimations,
            2,
            0,
            1,
            true
          ),
          new Trap(
            138,
            134,
            16,
            11,
            3,
            5,
            sawbladeSprite,
            sawbladeAnimations,
            2,
            4,
            0,
            true
          )
        ]
      ),
      x: 128,
      y: 96,
      dir: 6,
      cameraX: 61,
      cameraY: 32
    };

    rooms[50] = {
      x: 95,
      y: 148,
      dir: 2,
      cameraX: 54,
      cameraY: 63
    };

    rooms[120] = {
      room: new Room(
        "outside",
        "https://sprites.losingisfun.org/120.png",
        "https://sprites.losingisfun.org/120-mask.png",
        "https://sprites.losingisfun.org/120-mask-1.png",
        "https://sprites.losingisfun.org/120-objects.png",
        "https://sprites.losingisfun.org/120-objects-mask.png",
        [
          new GameObject(222, 230, 94, 92, 0, 87, 336, 0),
          new GameObject(90, 303, 57, 158, 23, 155, 22, 0),
          new GameObject(103, 358, 52, 157, 17, 152, 79, 0),
          new GameObject(382, 379, 49, 139, 18, 136, 131, 0),
          new GameObject(452, 345, 56, 143, 20, 139, 180, 0),
          new GameObject(131, 428, 52, 140, 18, 140, 236, 0),
          new GameObject(167, 428, 48, 103, 0, 103, 288, 0),
          new GameObject(258, 200, 22, 40, 0, 0, 0, 0),
          new GameObject(308, 251, 20, 25, 4, 25, 430, 0),
          new NPC(233, 251, 24, 30, 12, 29, litastSprite, 8),
          new NPC(299, 251, 24, 24, 12, 21, frogeSprite, 6),
          new NPC(267, 275, 8, 11, 3, 8, fireSprite, 3)
        ]
      ),
      x: 270,
      y: 260,
      dir: 5,
      cameraX: 209,
      cameraY: 175
    };
  }

  // Create the player objectt
  player = new Player(
    rooms[roomIndex].x,
    rooms[roomIndex].y,
    characters[currChar],
    rooms[roomIndex].dir
  );

  //initialize the camera
  camera = new Camera(rooms[roomIndex].cameraX, rooms[roomIndex].cameraY);

  //load first room
  await loadRoom(roomIndex);

  //Add mobile controls if required
  if (isMobile) {
    //show the controls canvas
    controlsCanvas.style.display = "block";

    // Install event handlers for the given element
    controlsCanvas.addEventListener("touchstart", controlsTouchStartHandler);
    controlsCanvas.addEventListener("touchmove", controlsTouchMoveHandler);
    // Use same handler for touchcancel and touchend
    controlsCanvas.addEventListener("touchend", controlsTouchEndHandler);
    controlsCanvas.addEventListener("touchcancel", controlsTouchEndHandler);

    // Install event handlers for the given element
    canvas.addEventListener("touchstart", touchStartHandler);
    canvas.addEventListener("touchmove", touchMoveHandler);
    // Use same handler for touchcancel and touchend
    canvas.addEventListener("touchend", touchEndHandler);
    canvas.addEventListener("touchcancel", touchEndHandler);
  } else {
  }

  // Event listeners for keydown and keyup
  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);

  // Event listeners for click
  canvas.addEventListener("mousedown", mouseDownHandler);
  canvas.addEventListener("mousemove", mouseMoveHandler);
  canvas.addEventListener("mouseup", mouseUpHandler);

  canvas.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });
  controlsCanvas.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

  //give save game popup when attempting to leave page
  window.addEventListener("beforeunload", function (e) {
    // The message to be displayed in the confirmation dialog
    var message =
      "Are you sure you want to leave? Unsaved progress will be lost.";

    // Set the returnValue property of the event to the message
    e.returnValue = message;

    // Return the message
    return message;
  });

  texts.push(new Text(`☼${gold}`, 90, 113, 1000, 1, 4, textSprite));

  // Start the game loop
  gameLoop();

  fadeIn().then(() => {
    if (rooms[roomIndex].interaction) {
      interaction = rooms[roomIndex].interaction;
      interact();
    }
    loading = false;
  });
}

sprites.map((sprite) => {
  return loadImage(sprite.src).then((img) => {
    sprite.image = img;
    loadedSprites++;

    // Update the loading bar
    drawLoadingBar(loadedSprites / totalSprites);

    if (loadedSprites >= totalSprites) {
      console.log("All sprites loaded.");
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < canvas.width / 4; j++) {
          for (var k = 0; k < canvas.height / 4; k++) {
            ditherCtx.drawImage(
              ditherSprite.image,
              i * 4,
              0,
              4,
              4,
              i * canvas.width + j * 4,
              k * 4,
              4,
              4
            );
          }
        }
      }
      console.log("Dither loaded.");
      init();
    }
  });
});
