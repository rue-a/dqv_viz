
// // --------------------
// // PROPERTIES


// // config = get_config("config.json");
// // console.log(config)


// // used prefixes
// const PREFIXES = {
//   'dqv': 'http://www.w3.org/ns/dqv#',
//   'dct': 'http://purl.org/dc/terms/',
//   'xsd': 'http://www.w3.org/2001/XMLSchema#',
//   'skos': 'http://www.w3.org/2004/02/skos/core#',
//   'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
//   'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
//   'prov': 'http://www.w3.org/ns/prov#',
//   'gkq': 'https://geokur-dmp.geo.tu-dresden.de/quality-register#',
// };


// const ENDPOINT = "https://geokur-dmp2.geo.tu-dresden.de/fuseki/geokur_quality_register/sparql";
// const INITIAL_NODE = 'https://geokur-dmp.geo.tu-dresden.de/quality-register#qualityRegister';


// // add list of labels that are used in visualization. Order of list determines 
// // fallback labels, i.e. if there is no rdfs:label, then dct:title is used and 
// // so on.
// const LABELS = [
//   'rdfs:label',
//   'skos:prefLabel',
//   'dct:title',
// ];

// const DESCRIPTIONS = [
//   'rdfs:comment',
//   'skos:definition',
//   'dct:description'
// ];

// // edges that are used for node expansion
// const PREDICATES = [
//   'dqv:inDimension',
//   'dqv:inCategory',
//   'gkq:inRegister'
// ];



// // style ----
// let hover = true;
// // full IRIs has to be used to refer to node classes (no prefixes)
// const node_colors = {
//   "http://www.w3.org/ns/dqv#Category": 'rgb(123, 169, 255)',
//   "http://www.w3.org/ns/dqv#Dimension": 'rgb(255, 167, 132)',
//   "http://www.w3.org/ns/dqv#Metric": 'rgb(76, 240, 166)'
// };
// const radius = 25;
// const label_color = 'black';
// const label_container_color = 'rgba(255,255,255,0.8)';
// const description_color = 'white';
// const description_container_color = 'rgba(130,130,130,0.9)';
// const label_container_width = 300;
// const description_container_width = 300;


// ----------------------
// global setup
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


function preload() {
  inconsolata = loadFont('./assets/Inconsolata.otf');
  open_sans_light_italic = loadFont('./assets/OpenSans-LightItalic.ttf')
  open_sans_light = loadFont('./assets/OpenSans-Light.ttf')
}

function setup() {
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

function draw() {
  background('white');
  view.update_canvas();
  if (config.style.hover) {
    for (let p5node of view.get_nodes()) {
      p5node.hover();
    }
  };
  print_controls();
}

function doubleClicked() {
  for (let p5node of view.get_nodes()) {
    let node_id = p5node.double_clicked();
    if (node_id) {
      node_model.expand_node(node_id).then(() => {
        // view.update_data(exclude_node_id = node_id);
        view.update_data();
      })
    }
  }
}

keyPressed = function () {
  // strg pressed
  if (keyCode === 17) {
    strg_pressed = true;
  }
}
keyReleased = function () {
  strg_pressed = false;
}

function mousePressed() {
  hover = false;
  if (mouseButton === LEFT) {
    clicked_node = false;
    for (let p5node of view.get_nodes()) {
      if (p5node.left_clicked()) clicked_node = true;
    }
    if (strg_pressed) {
      strg_pressed = false;

      for (let p5node of view.get_nodes()) {
        p5node.strg_plus_left_clicked();
      }
    }
    left_clicked_x = mouseX;
    left_clicked_y = mouseY;
    for (let p5node of view.get_nodes()) {
      coords_old[p5node.get_id()] = {
        'x': p5node.get_x(),
        'y': p5node.get_y()
      }
    }

  }
  if (mouseButton === RIGHT) { }
  if (mouseButton === CENTER) {
    // delete node and in- and outgoing edges
    for (let p5node of view.get_nodes()) {
      let node_id = p5node.right_clicked();
      if (node_id) {
        let edges = node_model.get_edges()

        for (let i = edges.length - 1; i >= 0; i--) {
          let edge = edges[i]
          if (
            (edge.from == node_id)
            ||
            (edge.to == node_id)
          ) {
            node_model.remove_edge(edge);
          }
        }
        node_model.remove_node(node_id);
        view.remove_node(node_id);
        view.update_data();
      }
    }
  }
}

function mouseReleased() {
  // stop dragging
  hover = true;
  for (let p5node of view.get_nodes()) {
    p5node.released();
  }
}

function mouseDragged() {
  // drag node or canvas
  for (let p5node of view.get_nodes()) {
    p5node.dragged()
  }
  if (!(clicked_node)) {
    view.translate_nodes(left_clicked_x, left_clicked_y, coords_old)
  }
}

function mouseWheel(event) {
  // zoom in or out
  if (event.delta < 0) {
    view.zoom_in()
  }
  else {
    view.zoom_out()
  }
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
