# RDFViz

The repository allows to generate an interactive visualization of a subset of an RDF-Graph. The visualization starts from a single, predefined node. Any node can be expanded with double-click. Expansion is only triggered for certain, predefined edges.

Each node is attached with its English label and description. The description is only shown on hover. The nodes can be colorized based on their class.

## Visualization settings

The visualization is controlled by various settings that are defined in the top part of `Controller.js`.

```js
// --------------------
// PROPERTIES

// used prefixes
const PREFIXES = {
  'dqv': 'http://www.w3.org/ns/dqv#',
  'dct': 'http://purl.org/dc/terms/',
  'xsd': 'http://www.w3.org/2001/XMLSchema#',
  'skos': 'http://www.w3.org/2004/02/skos/core#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'prov': 'http://www.w3.org/ns/prov#',
  'gkq': 'https://geokur-dmp.geo.tu-dresden.de/quality-register#',
};


const ENDPOINT = "https://geokur-dmp2.geo.tu-dresden.de/fuseki/geokur_quality_register/sparql";
const INITIAL_NODE = 'https://geokur-dmp.geo.tu-dresden.de/quality-register#qualityRegister';

// add list of labels that are used in visualization. Order of list determines fallback labels, i.e. if there is no rdfs:label, then dct:title is used and so on.
const LABELS = [
  'rdfs:label',
  'skos:prefLabel',
  'dct:title',
];

// same as for labels
const DESCRIPTIONS = [
  'rdfs:comment',
  'skos:definition',
  'dct:description'
];

// edges that are used for node expansion
const PREDICATES = [
  'dqv:inDimension',
  'dqv:inCategory',
  'gkq:inRegister'
];
const EXCLUDE_PREDICATES = null;

// style ----
let hover = true;

// full IRIs has to be used to refer to node classes (no prefixes)
const node_colors = {
  "http://www.w3.org/ns/dqv#Category": 'rgb(123, 169, 255)',
  "http://www.w3.org/ns/dqv#Dimension": 'rgb(255, 167, 132)',
  "http://www.w3.org/ns/dqv#Metric": 'rgb(76, 240, 166)'
};
const radius = 25;
const label_color = 'black';
const label_container_color = 'rgba(255,255,255,0.8)';
const description_color = 'white';
const description_container_color = 'rgba(130,130,130,0.9)';
const label_container_width = 300;
const description_container_width = 300;
// ----------------------
```

## Used Libraries

- P5: <https://github.com/processing/p5.js>
  - GNU Lesser General Public License

- Dagre: <https://github.com/dagrejs/dagre>
  - MIT License
  