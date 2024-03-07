import ete3

def draw_node_face(node: ete3.Tree):
    # node style
    ns = ete3.NodeStyle()
    ns['size'] = 3 if node.is_leaf() else 0
    node.set_style(ns)

    # face style
    face = ete3.TextFace(node.name, tight_text=True)
    
    face.margin_left = 5
    face.margin_right = 5
    face.margin_top = 5
    face.margin_bottom = 5
    
    if node.is_leaf():
        face.inner_background.color = 'yellow'
    
    ete3.add_face_to_node(face, node, column=0, position='branch-top')

def show_tree(tree, filename=None):
    ts = ete3.TreeStyle()
    ts.show_scale = False
    ts.show_leaf_name = False
    ts.draw_guiding_lines = True

    if filename is None:
        tree.show(tree_style=ts, layout=draw_node_face)
    else:
        tree.render(filename, tree_style=ts, layout=draw_node_face)

def add_nodes_to_tree(tree, node, max_depth):
    tree.name = node.name
    tree.size = 10

    if node.lvl + 1 < max_depth:
        for subtask in node.tasks:
            child = tree.add_child()
            add_nodes_to_tree(child, subtask, max_depth)

def build_tree(root, depth=100):
    tree = ete3.Tree()
    add_nodes_to_tree(tree, root, max_depth=depth)

    return tree