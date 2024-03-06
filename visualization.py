import ete3

def draw_node_face(node):
    face = ete3.TextFace(node.name, tight_text=True)
    
    face.margin_left = 5
    face.margin_right = 5
    face.margin_top = 5
    face.margin_bottom = 5
    
    if node.is_leaf():
        face.inner_background.color = 'yellow'
    
    ete3.add_face_to_node(face, node, column=0, position='branch-bottom')

def show_tree(root, filename=None):
    tree = ete3.Tree()
    add_nodes_to_tree(tree, root)

    ts = ete3.TreeStyle()
    ts.show_scale = False
    ts.show_leaf_name = False
    ts.draw_guiding_lines = True

    if filename is None:
        tree.show(tree_style=ts, layout=draw_node_face)
    else:
        tree.render(filename, tree_style=ts, layout=draw_node_face)

def add_nodes_to_tree(tree, node):
    tree.name = node.name

    for subtask in node.tasks:
        child = tree.add_child()
        add_nodes_to_tree(child, subtask)

