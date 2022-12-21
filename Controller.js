/*
overloaded P5JS methods that control user interactions.

The functions are triggered when the user performs the 
according action, e.g. user presses mouse -> mousePressed()
is called.

Most of the functions then iterate through all nodes and check
if the mouse is over a node currently (this check is done by
the node itself) and perform an action if this is true. 
    E.g. in the function doubleClicked(); if the user double 
clicks on the canvas, for each node, the node's class method 
<node>.double_clicked() is called. This method checks if the 
mouse pointer's position is inside the radius of the node. If 
that is true, the node returns it's id, otherwise it returns 
false. 
    Then, if a node returned an id, the model is instructed to 
expand this node (node_model.expand_node(node_id)). Afterwards, 
the view is instructed to update itself accordingly 
(view.update_data()).
*/

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

function keyPressed() {
    // strg pressed
    if (keyCode === 17) {
        strg_pressed = true;
    }
}
function keyReleased() {
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
