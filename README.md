# RDFViz

The repository allows to generate an interactive visualization of a subset of an RDF-Graph. The visualization starts from a single, predefined node. Any node can be expanded with double-click. Expansion is only triggered for certain, predefined edges.

Each node is attached with its English label and description. The description is only shown on hover. The nodes can be colorized based on their class.

## Visualization settings

The visualization is controlled by various settings that are defined in `config.js`.

```js
const config = {
    "content": {
        "endpoint": "https://geokur-dmp2.geo.tu-dresden.de/fuseki/geokur_quality_register/sparql",
        "initial_node": "https://geokur-dmp.geo.tu-dresden.de/quality-register#qualityRegister",
        "prefixes": {
            "dqv": "http://www.w3.org/ns/dqv#",
            "dct": "http://purl.org/dc/terms/",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "skos": "http://www.w3.org/2004/02/skos/core#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "prov": "http://www.w3.org/ns/prov#",
            "gkq": "https://geokur-dmp.geo.tu-dresden.de/quality-register#"
        },
        "predicates": [
            "dqv:inDimension",
            "dqv:inCategory",
            "gkq:inRegister"
        ],
        "labels": [
            "rdfs:label",
            "skos:prefLabel",
            "dct:title"
        ],
        "descriptions": [
            "rdfs:comment",
            "skos:definition",
            "dct:description"
        ],

    },
    "style": {
        "hover": true,
        "node_colors": {
            "http://www.w3.org/ns/dqv#Category": 'rgb(123, 169, 255)',
            "http://www.w3.org/ns/dqv#Dimension": 'rgb(255, 167, 132)',
            "http://www.w3.org/ns/dqv#Metric": 'rgb(76, 240, 166)'
        },
        "radius": 25,
        "label_color": 'black',
        "label_container_color": 'rgba(255,255,255,0.8)',
        "description_color": 'white',
        "description_container_color": 'rgba(130,130,130,0.9)',
        "label_container_width": 300,
        "description_container_width": 300,
    }

}
```

## Source Code

`sketch.js`: Program entry point
`config.js`: Visualization configurations
`Model.js`: Content and layout management
`View.js`: Visualization management (brings model content to canvas)
`Controller.js`: Definition of user interactions
`P5Node.js`: Node class, used by `View.js` and `Contoller.js`
`P5Edge.js`: Edge class, used by `View.js` and `Contoller.js`

## Used Libraries

- P5: <https://github.com/processing/p5.js>
  - GNU Lesser General Public License

- Dagre: <https://github.com/dagrejs/dagre>
  - MIT License
  