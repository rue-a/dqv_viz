
/* 
global variable initialization

Variables that are used by more than one of 
the P5JS functions preload(), setup() and 
draw(), need to be initialzied globally.
*/
let canvas;
let inconsolata;
let open_sans_light_italic;
let left_clicked_x;
let left_clicked_y;
let coords_old = {};
let clicked_node;
let strg_pressed = false;

const width = window.innerWidth;
const height = window.innerHeight - 0.1;
const horizontal_margin = width / 5;
const vertical_margin = height / 5;

const node_model = new Model();
const view = new View();

// P5JS method that is executed before setup()
function preload() {
  /* load fonts */
  inconsolata = loadFont('./assets/Inconsolata.otf');
  open_sans_light_italic = loadFont('./assets/OpenSans-LightItalic.ttf')
  open_sans_light = loadFont('./assets/OpenSans-Light.ttf')
}

// P5JS method that is executed at program start
function setup() {
  /* 
  - create canvas 
  - initialize view
  - initialize model
  - calc initial view (view.update_data())
  */
  canvas = createCanvas(width, height);
  view.init(
    node_model,
    width,
    height,
    horizontal_margin,
    vertical_margin,
    config.style.radius,
    config.style.node_colors,
    inconsolata,
    open_sans_light,
    config.style.label_color,
    config.style.label_container_color,
    config.style.description_color,
    config.style.description_container_color,
    config.style.label_container_width,
    config.style.description_container_width
  );

  node_model.init(
    config.content.endpoint,
    config.content.initial_node,
    config.content.prefixes,
    config.content.predicates,
    config.content.labels,
    config.content.descriptions,

  ).then(() => {
    view.update_data();
  })

  // view.switch_mode()
}

// P5JS method that is called in a loop and draws on canvas
function draw() {
  /* 
  - reset drawing pane
  - draw current view
  - draw hover content, if hover is enabled
  - draw controls
  */
  background('white');
  view.update_canvas();
  if (config.style.hover) {
    for (let p5node of view.get_nodes()) {
      p5node.hover();
    }
  };
  print_controls();
}



function print_controls() {
  textFont(inconsolata);
  let controls = `Double left click on a node: Expand this node
  Left click and hold a node: Drag this node
  Strg plus left click on a node: Open this this node\'s IRI in a new tab
  Wheel click on a node: Remove this node from the visualization`
  textAlign(RIGHT, BOTTOM)
  text(controls, width - 8, height - 8)
  fill(150)
  line(0, 0, width, 0)
  line(width, 0, width, height)
  line(width, height, 0, height)
  line(0, 0, 0, height)
}
