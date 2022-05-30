class Model {
    constructor() {
        this.graph_meta = {}
        this.graph_layout = {}
        this.graph_edges = []
    }

    async init(prefixes, endpoint, predicates, exclude_predicates, labels, descriptions, initial_node) {
        this.prefixes_dict = prefixes;
        this.prefixes = [];
        for (let key of Object.keys(prefixes)) {
            this.prefixes = this.prefixes.concat('PREFIX ' + key + ': <' + prefixes[key] + '>')
        }
        this.endpoint = endpoint;
        this.labels = labels;
        this.descriptions = descriptions;
        this.predicates = predicates;

        if (this.predicates == null) {
            this.predicates = await this.get_all_predicates();
        }

        for (let predicate of exclude_predicates) {
            this.predicates = this.predicates.filter(v => v !== predicate);
        }
        console.log(this.predicates)

        await this.add_node(initial_node);
    }

    async sparql(query) {
        const url = this.endpoint +
            '?query=' + encodeURIComponent(query) +
            '&format=json';
        const response = await fetch(url);
        return response.json();
    }

    build_filter(variable, values, logic) {
        let filter = ['FILTER ('];
        for (let value of values) {
            filter = filter.concat(variable + ' = ' + value);
            filter = filter.concat(logic);
        }
        filter[filter.length - 1] = ')';
        filter = filter.join(' ');
        return filter
    }

    async get_all_predicates() {
        let predicates = [];
        let query = 'SELECT DISTINCT ?predicate WHERE { ?a ?predicate ?b }';
        const response = await this.sparql(query);
        for (let binding of response.results.bindings) {
            let predicate = binding.predicate.value
            for (let key of Object.keys(this.prefixes_dict)) {
                if (predicate.includes(this.prefixes_dict[key])) {
                    predicate = predicate.replace(this.prefixes_dict[key], key + ':')
                }
            }
            predicates = predicates.concat(predicate);
        }


        return predicates;
    }

    async get_node_label(node) {
        let filter = this.build_filter('?predicate', this.labels, '||');
        let select = [
            'SELECT ?label WHERE {',
            'OPTIONAL {<' + node + '> ?predicate ?label. }',
            filter,
            '}'
        ]
        select = this.prefixes.concat(select).join(' ');
        const response = await this.sparql(select)
        let label = null
        for (let binding of response.results.bindings) {
            label = binding.label.value
        }
        return label;
    }


    async get_node_description(node) {
        let filter = this.build_filter('?predicate', this.descriptions, '||');
        let select = [
            'SELECT ?description WHERE {',
            'OPTIONAL {<' + node + '> ?predicate ?description. }',
            filter,
            '}'
        ]
        select = this.prefixes.concat(select).join(' ');
        const response = await this.sparql(select)
        let node_description = null
        for (let binding of response.results.bindings) {
            if (binding.description) node_description = binding.description.value
        }

        return node_description;
    }

    async get_node_class(node) {
        let select = [
            'SELECT ?class WHERE {',
            'OPTIONAL {<' + node + '> a ?class. }',
            '}'
        ]
        select = this.prefixes.concat(select).join(' ');
        const response = await this.sparql(select)
        let node_class = []
        for (let binding of response.results.bindings) {
            if (binding.class) node_class.push(binding.class.value)
        }
        return node_class;
    }

    async get_parents(node, predicate) {
        const nodes = []
        let select = [
            'SELECT ?newNode WHERE {',
            '?newNode ' + predicate + ' <' + node + '>.',
            '}'
        ];
        select = this.prefixes.concat(select).join(' ');
        const response = await this.sparql(select)
        for (let binding of response.results.bindings) {
            let json = {}
            json.id = binding.newNode.value
            json.label = await this.get_node_label(json.id)
            json.description = await this.get_node_description(json.id)
            json.class = await this.get_node_class(json.id)
            nodes.push(json)
        }
        return nodes
    }

    async get_children(node, predicate) {
        const nodes = []
        let select = [
            'SELECT ?newNode WHERE {',
            '<' + node + '> ' + predicate + ' ?newNode.',
            '}'
        ];
        select = this.prefixes.concat(select).join(' ');
        const response = await this.sparql(select)
        for (let binding of response.results.bindings) {
            let json = {}
            json.id = binding.newNode.value
            json.label = await this.get_node_label(json.id)
            json.description = await this.get_node_description(json.id)
            json.class = await this.get_node_class(json.id)
            nodes.push(json)
        }
        return nodes
    }

    async expand_node(node_id) {
        for (let predicate of this.predicates) {
            let parents = await this.get_parents(node_id, predicate)
            let children = await this.get_children(node_id, predicate)
            let expanded_nodes_ids = [];
            let reference = {};
            let edges = [];

            let node_label = await this.get_node_label(node_id)
            if (!node_label) node_label = node_id
            reference[node_id] = {
                'id': node_id,
                'label': node_label,
                'description': await this.get_node_description(node_id),
                'class': await this.get_node_class(node_id)
            }

            let edge_label = await this.get_node_label(predicate)
            if (!edge_label) edge_label = predicate

            for (let parent of parents) {
                edges.push({ from: parent.id, to: node_id, label: edge_label })
                reference[parent.id] = {}
                reference[parent.id].id = parent.id;
                let parent_label = parent.label
                if (!parent_label) parent_label = parent.id
                reference[parent.id].label = parent_label;
                reference[parent.id].description = parent.description;
                reference[parent.id].class = parent.class;
                expanded_nodes_ids.push(parent.id)
            }
            for (let child of children) {
                edges.push({ from: node_id, to: child.id, label: edge_label })
                reference[child.id] = {}
                reference[child.id].id = child.id;
                let child_label = child.label
                if (!child_label) child_label = child.id
                reference[child.id].label = child_label;
                reference[child.id].description = child.description;
                reference[child.id].class = child.class;
                expanded_nodes_ids.push(child.id)
            }

            this.add_data(reference, edges);
            this.calc_layout();
        }



        // return expanded_nodes_ids
    }

    async add_node(node_id) {
        let reference = {};
        let node_label = await this.get_node_label(node_id)
        if (!node_label) node_label = node_id
        reference[node_id] = {
            'id': node_id,
            'label': node_label,
            'description': await this.get_node_description(node_id),
            'class': await this.get_node_class(node_id)
        }
        this.add_data(reference, []);
        this.calc_layout();

    }

    add_data(reference, edges) {
        for (let key of Object.keys(reference)) {
            this.graph_meta[key] = reference[key]
        }
        for (let edge of edges) {
            this.remove_edge(edge)
        }
        this.graph_edges = this.graph_edges.concat(edges)
    }

    calc_layout() {

        const dagre_graph = new dagre.graphlib.Graph();
        // Set an object for the graph label
        dagre_graph.setGraph({})
        // Default to assigning a new object as a label for each new edge.
        dagre_graph.setDefaultEdgeLabel(function () { return {}; });

        // console.log(this.graph_meta)
        // console.log(this.graph_edges)




        for (let node_id of Object.keys(this.graph_meta)) {
            dagre_graph.setNode(node_id, {})
        }

        for (let edge of this.graph_edges) {
            dagre_graph.setEdge(edge.from, edge.to, { label: edge.label })
        }

        dagre.layout(dagre_graph)

        let max_x = 0;
        let max_y = 0;
        for (let node_id of dagre_graph.nodes()) {
            if (dagre_graph.node(node_id).x > max_x) max_x = dagre_graph.node(node_id).x
            if (dagre_graph.node(node_id).y > max_y) max_y = dagre_graph.node(node_id).y
        }

        for (let node_id of dagre_graph.nodes()) {

            this.graph_layout[node_id] = {}
            if (max_x > 0) this.graph_layout[node_id].x = dagre_graph.node(node_id).x / max_x
            else this.graph_layout[node_id].x = dagre_graph.node(node_id).x
            if (max_y > 0) this.graph_layout[node_id].y = dagre_graph.node(node_id).y / max_y
            else this.graph_layout[node_id].y = dagre_graph.node(node_id).y

        }
        if (Object.keys(this.graph_layout).length == 1) {
            Object.values(this.graph_layout)[0].x = 0.5
            Object.values(this.graph_layout)[0].y = 0.5

        }

    }

    remove_edge(edge) {
        let edge_index = null;
        for (let i in this.graph_edges) {
            if (
                (edge.from == this.graph_edges[i].from)
                &&
                (edge.to == this.graph_edges[i].to)
                &&
                (edge.label == this.graph_edges[i].label)
            ) {
                edge_index = i
            }
        }
        if (edge_index) this.graph_edges.splice(edge_index, 1);
    }

    remove_node(node) {
        delete this.graph_layout[node];
        delete this.graph_meta[node];
    }

    get_meta() { return (this.graph_meta) };
    get_layout() { return (this.graph_layout) };
    get_edges() { return (this.graph_edges) };

}
