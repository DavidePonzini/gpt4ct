from task import Task, decompose

root_task = Task('Solve the whole problem', 'Design a bicycle from scratch')
sub = decompose(root_task, [
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

sub1 = decompose(sub[1], [
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

sub10 = decompose(sub1[0], [
  {
    "name": "Define frame dimensions and geometry",
    "description": "Determine the appropriate dimensions (length, height, width) and geometry (e.g., angles, tube shapes) for the bicycle frame based on research findings and ergonomic considerations."
  },
  {
    "name": "Select frame material",
    "description": "Research and choose the most suitable material for the bicycle frame, considering factors such as strength, weight, durability, and cost."
  }
])

sub11 = decompose(sub1[1], [
  {
    "name": "Select bicycle wheel components",
    "description": "Research and choose the appropriate rims, spokes, hubs, and tires for the bicycle wheel assembly based on factors such as intended use, rider weight, terrain, and budget."
  },
  {
    "name": "Determine wheel assembly specifications",
    "description": "Define the specifications for the construction of the bicycle wheels, including spoke count, lacing pattern, rim width, hub compatibility, and tire size/type, based on the selected components and design requirements."
  }
])

sub12 = decompose(sub1[2], [
  {
    "name": "Identify component locations on the bicycle frame",
    "description": "Determine the optimal positions for integrating components such as gears, brakes, pedals, and handlebars onto the bicycle frame, ensuring functionality and ergonomic comfort."
  },
  {
    "name": "Plan attachment methods for integrating components",
    "description": "Develop a strategy for securely attaching components to the bicycle frame, considering factors such as strength, stability, and ease of assembly and disassembly."
  }
])

sub121 = decompose(sub12[1], [
  {
    "name": "Identify attachment points on the bicycle frame",
    "description": "Examine the bicycle frame design plan to locate suitable areas for attaching components such as the handlebars, saddle, brakes, and drivetrain."
  },
  {
    "name": "Select appropriate attachment methods",
    "description": "Research and decide on the most suitable methods for attaching components to the bicycle frame, considering factors such as stability, weight distribution, ease of assembly, and potential for adjustments."
  }
])

sub1211 = decompose(sub121[1], [
  {
    "name": "Identify attachment points on the bicycle frame",
    "description": "Determine locations on the bicycle frame where components need to be attached. This includes areas such as the frame tubes, fork, handlebars, seatpost, and rear dropouts."
  },
  {
    "name": "Research suitable attachment methods",
    "description": "Investigate various methods for attaching components to the identified attachment points on the bicycle frame. This may include methods such as welding, brazing, bolting, riveting, clamping, or adhesive bonding."
  }
])

