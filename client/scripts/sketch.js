let images = [];
let displacedImages = [];
let selectedImages = [];

function preload() {
  for (let i = 1; i <= 183; i++) {
    let imageName = "img_" + ("00000" + i).slice(-5) + ".png";
    let imageURL = "data/inputs/" + imageName;
    images.push(loadImage(imageURL));
  }
}

function generateComposition() {
  background(255);

  selectedImages = [];
  let numImages = Math.floor(random(5, 10));

  for (let i = 0; i < numImages; i++) {
    let imgIndex = Math.floor(random(images.length));
    let img = images[imgIndex];
    let x = random(width);
    let y = random(height);
    let angle = random(TWO_PI);
    let scaleValue = random(0.05, 1);

    push();
    translate(x, y);
    rotate(angle);
    scale(scaleValue);
    imageMode(CENTER);
    image(img, 0, 0);
    pop();

    selectedImages.push({ img, x, y, angle, scaleValue });
  }
}

function displaceImages() {
  displacedImages = [];

  for (let i = 0; i < selectedImages.length; i++) {
    let { img, x, y, angle, scaleValue } = selectedImages[i];

    let newX = random(width);
    let newY = random(height);
    let newAngle = random(TWO_PI);
    let newScaleValue = random(0.05, 1);

    displacedImages.push({ img, x: newX, y: newY, angle: newAngle, scaleValue: newScaleValue });
  }
}

function setup() {
  createCanvas(1280, 720);
  generateComposition();
}

function draw() {
  for (let i = 0; i < selectedImages.length; i++) {
    let { img, x, y, angle, scaleValue } = selectedImages[i];
    push();
    translate(x, y);
    rotate(angle);
    scale(scaleValue);
    imageMode(CENTER);
    image(img, 0, 0);
    pop();
  }

  for (let i = 0; i < displacedImages.length; i++) {
    let { img, x, y, angle, scaleValue } = displacedImages[i];
    push();
    translate(x, y);
    rotate(angle);
    scale(scaleValue);
    imageMode(CENTER);
    image(img, 0, 0);
    pop();
  }
}

function keyPressed() {
  if (key === 'x') {
    displaceImages();
  }
  if (key === 's') {
    saveCanvas('composition', 'png');
  }
}

function mouseClicked() {
  if (mouseButton === LEFT) {
    generateComposition();
    displacedImages = [];
  }
}
