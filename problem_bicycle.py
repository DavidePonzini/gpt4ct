from task import Task

root_task = Task('Solve the whole problem', 'Design a bicycle from scratch')
sub = root_task.decompose(j = [
  {
    "name": "Research bicycle components and design principles",
    "description": "Gather information on various bicycle components such as frame, wheels, gears, brakes, etc. Study design principles and considerations related to bicycle engineering and ergonomics."
  },
  {
    "name": "Create a detailed design plan",
    "description": "Based on the research, develop a comprehensive plan outlining the specifications, dimensions, materials, and assembly process for each component of the bicycle."
  },
  {
    "name": "Prototype construction",
    "description": "Construct a prototype of the bicycle according to the design plan. This involves fabricating or acquiring the necessary components and assembling them into a functional bicycle."
  }
])

sub1 = sub[1].decompose(j = [
  {
    "name": "Specify bicycle frame design",
    "description": "Define the dimensions, geometry, and material specifications for the bicycle frame based on research and ergonomic considerations."
  },
  {
    "name": "Design bicycle wheel assembly",
    "description": "Develop a detailed plan for the construction of bicycle wheels, including selecting appropriate rims, spokes, and hubs, and determining the optimal tire size and type."
  },
  {
    "name": "Plan bicycle component integration",
    "description": "Outline how the various components such as gears, brakes, pedals, and handlebars will be integrated into the bicycle frame, ensuring functionality and ergonomic comfort."
  }
])

sub10 = sub1[0].decompose(j = [
  {
    "name": "Define frame dimensions and geometry",
    "description": "Determine the appropriate dimensions (length, height, width) and geometry (e.g., angles, tube shapes) for the bicycle frame based on research findings and ergonomic considerations."
  },
  {
    "name": "Select frame material",
    "description": "Research and choose the most suitable material for the bicycle frame, considering factors such as strength, weight, durability, and cost."
  }
])

sub11 = sub1[1].decompose(j = [
  {
    "name": "Select bicycle wheel components",
    "description": "Research and choose the appropriate rims, spokes, hubs, and tires for the bicycle wheel assembly based on factors such as intended use, rider weight, terrain, and budget."
  },
  {
    "name": "Determine wheel assembly specifications",
    "description": "Define the specifications for the construction of the bicycle wheels, including spoke count, lacing pattern, rim width, hub compatibility, and tire size/type, based on the selected components and design requirements."
  }
])

sub12 = sub1[2].decompose(j = [
  {
    "name": "Identify component locations on the bicycle frame",
    "description": "Determine the optimal positions for integrating components such as gears, brakes, pedals, and handlebars onto the bicycle frame, ensuring functionality and ergonomic comfort."
  },
  {
    "name": "Plan attachment methods for integrating components",
    "description": "Develop a strategy for securely attaching components to the bicycle frame, considering factors such as strength, stability, and ease of assembly and disassembly."
  }
])
