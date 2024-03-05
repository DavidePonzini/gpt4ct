import ete3

def my_layout(node):
    face = ete3.TextFace(node.name, tight_text=True)
    face.margin_left = 5
    face.margin_right = 5
    face.margin_top = 5
    ete3.add_face_to_node(face, node, column=0, position='branch-bottom')

def show_tree(root):
    tree = ete3.Tree()

    show_tree_rec(tree, root)

    ts = ete3.TreeStyle()
    ts.show_scale = False
    ts.show_leaf_name = False
    ts.layout_fn = my_layout
    tree.show(tree_style=ts)

def show_tree_rec(tree, node):
    tree.name = node.name

    for subtask in node.tasks:
        child = tree.add_child()
        show_tree_rec(child, subtask)

