const config = {
    "content": {
        // SPARQL endpoint that is queried
        "endpoint": "https://geokur-dmp2.geo.tu-dresden.de/fuseki/ckan_mirror/sparql",
        // node on which the vizualization starts
        "initial_node": "https://geokur-dmp.geo.tu-dresden.de/dataset/a98cfcf3-3e2a-4afd-84d0-5f1208a4d03a",
        // prefixes that are used by the program and content descriptions
        "prefixes": {
            "dqv": "http://www.w3.org/ns/dqv#",
            "dct": "http://purl.org/dc/terms/",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "skos": "http://www.w3.org/2004/02/skos/core#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "prov": "http://www.w3.org/ns/prov#",
            "gkq": "https://geokur-dmp.geo.tu-dresden.de/quality-register#",
            "dcat": "http://www.w3.org/ns/dcat#",
            "adms": "http://www.w3.org/ns/adms#"
        },
        // edges that should be visualized (this also determines the vizualized nodes)
        "predicates": [
            "prov:used",
            "prov:wasGeneratedBy"
        ],
        // labels that are queried for, and order of visualization (if no rdfs:label, then show skos:prefLabel. if no skos:prefLabel, then ...)
        "labels": [
            "dct:title",
            "rdfs:label",
            "skos:prefLabel",

        ],
        // same as labels
        "descriptions": [
            "dct:description",
            "rdfs:comment",
            "skos:definition",
        ],
        // predicates that describe a node's metadata (only prefixed predicates are allowed here)
        // nested things cannont be parsed currently
        "metadata_predicates": [
            "dct:title",
            "dct:description",
            "rdf:type",
            "dcat:theme",
            "dct:conformsTo",
            "dcat:keyword",
            "adms:identifier",
            "dqv:hasQualityMeasurement"
        ],
    },
    "style": {
        // does anything happen when the user hovers a node
        "hover": true,
        // node colors for specific RDF classes (the prefixes from above are not allow here, only use full IRIs)
        "node_colors": {
            "http://www.w3.org/ns/prov#Activity": 'rgb(123, 169, 255)',
            "http://www.w3.org/ns/prov#Entity": 'rgb(255, 167, 132)',
            "http://www.w3.org/ns/prov#Agent": 'rgb(76, 240, 166)'
        },
        // node radius in px 
        "radius": 25,
        "label_color": 'black',
        "label_container_color": 'rgba(255,255,255,0.8)',
        "description_color": 'white',
        "description_container_color": 'rgba(130,130,130,0.9)',
        "label_container_width": 300,
        "description_container_width": 300,
    }

}