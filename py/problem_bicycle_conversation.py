from task import Task, decompose

root_task = Task('Design a bicycle from scratch', 'Design a bicycle from scratch')
sub = decompose(root_task, [
  {
    "name": "Frame Design",
    "description": "Design the main structure of the bicycle including dimensions, materials, and geometry."
  },
  {
    "name": "Component Selection",
    "description": "Select appropriate components such as wheels, handlebars, brakes, gears, and pedals."
  },
  {
    "name": "Assembly Plan",
    "description": "Create a step-by-step plan for assembling the bicycle including instructions for each component."
  }
]
)

sub0 = decompose(sub[0], [
  {
    "name": "Frame Geometry",
    "description": "Define the shape and dimensions of the frame, including tube lengths, angles, and positions."
  },
  {
    "name": "Material Selection",
    "description": "Choose suitable materials for the frame considering factors such as strength, weight, and durability."
  },
  {
    "name": "Structural Analysis",
    "description": "Perform analysis to ensure the frame design can withstand typical loads and stresses experienced during use."
  }
]
)

sub00 = decompose(sub0[0], [
  {
    "name": "Frame Type Selection",
    "description": "Choose the type of frame, such as diamond, step-through, or recumbent, based on intended use and rider preferences."
  },
  {
    "name": "Frame Dimensions",
    "description": "Determine the specific measurements for various parts of the frame, including tube lengths, angles, and distances between components."
  },
  {
    "name": "Geometry Optimization",
    "description": "Optimize the frame geometry for factors like stability, agility, and comfort, considering rider biomechanics and intended use."
  }
]
)

sub1 = decompose(sub[1], [
  {
    "name": "Wheel Selection",
    "description": "Choose appropriate wheels based on factors such as size, material, weight, and intended use (road, mountain, hybrid, etc.)."
  },
  {
    "name": "Handlebar and Stem Selection",
    "description": "Select handlebars and stem according to rider preferences, riding style, and bike geometry."
  },
  {
    "name": "Brake and Gear System Selection",
    "description": "Choose suitable brake and gear systems considering factors such as performance, maintenance, and compatibility with other components."
  },
  {
    "name": "Pedal Selection",
    "description": "Select pedals based on rider preference, riding style, and compatibility with the chosen shoes and drivetrain system."
  }
]
)

sub2 = decompose(sub[2], [
  {
    "name": "Preparation",
    "description": "Gather all necessary tools and components required for assembly, ensuring everything is organized and easily accessible."
  },
  {
    "name": "Frame Assembly",
    "description": "Begin by assembling the frame, including attaching the various tubes, joints, and fittings according to the design specifications."
  },
  {
    "name": "Component Installation",
    "description": "Install each selected component onto the frame following the manufacturer's instructions and ensuring proper alignment and adjustment."
  },
  {
    "name": "Quality Check",
    "description": "Inspect the assembled bicycle thoroughly to ensure all components are securely fastened, aligned correctly, and functioning properly."
  },
  {
    "name": "Testing",
    "description": "Conduct a series of tests such as a safety check, brake test, and gear adjustment to verify the bicycle's performance and safety."
  },
  {
    "name": "Final Adjustment and Tuning",
    "description": "Make any necessary final adjustments and tuning to optimize the bicycle's performance, comfort, and functionality according to rider preferences."
  }
]
)

sub21 = decompose(sub2[1], [
  {
    "name": "Preparation of Frame Components",
    "description": "Ensure all frame components such as tubes, joints, and fittings are cleaned, inspected, and prepared for assembly."
  },
  {
    "name": "Alignment and Jig Setup",
    "description": "Use a frame alignment jig to ensure proper alignment of frame components before welding or brazing."
  },
  {
    "name": "Welding or Brazing",
    "description": "Join frame components together using welding or brazing techniques according to the chosen frame construction method."
  },
  {
    "name": "Post-Assembly Inspection",
    "description": "Inspect the welded or brazed joints to ensure they are strong, clean, and free from defects."
  },
  {
    "name": "Finishing Touches",
    "description": "Remove any excess material, smooth out welds, and apply any necessary protective coatings or finishes to the frame."
  }
]
)

sub22 = decompose(sub2[2], [
  {
    "name": "Handlebar and Stem Installation",
    "description": "Attach the handlebar and stem to the fork and adjust them to the desired position and angle."
  },
  {
    "name": "Wheel Installation",
    "description": "Mount the wheels onto the frame, ensuring they are properly aligned and securely fastened."
  },
  {
    "name": "Brake and Gear System Installation",
    "description": "Install the brakes, shifters, derailleurs, and cables, ensuring proper routing and adjustment for optimal performance."
  },
  {
    "name": "Pedal Installation",
    "description": "Attach the pedals to the crank arms, ensuring they are tightened securely and aligned properly."
  },
  {
    "name": "Saddle Installation",
    "description": "Mount the saddle onto the seat post and adjust its position and angle to the rider's preference."
  },
  {
    "name": "Accessories Installation",
    "description": "Install any additional accessories such as bottle cages, fenders, racks, or lights according to the rider's needs."
  }
]
)

sub01 = decompose(sub0[1], [
  {
    "name": "Frame Material Selection",
    "description": "Choose the material for the frame considering factors such as strength, weight, durability, and cost. Common materials include steel, aluminum, carbon fiber, and titanium."
  },
  {
    "name": "Component Material Selection",
    "description": "Select appropriate materials for components such as wheels, handlebars, brakes, gears, and pedals based on their specific requirements and performance characteristics."
  },
  {
    "name": "Material Compatibility",
    "description": "Ensure compatibility of materials used throughout the bicycle to avoid issues such as galvanic corrosion or structural mismatch."
  }
]
)

sub02 = decompose(sub0[2], [
  {
    "name": "Load Analysis",
    "description": "Analyze the expected loads and stresses that the bicycle frame will undergo during typical use, considering factors such as rider weight, terrain, and riding style."
  },
  {
    "name": "Finite Element Analysis (FEA)",
    "description": "Perform computer simulations using FEA software to assess the structural integrity of the frame design under various loading conditions."
  },
  {
    "name": "Safety Factor Calculation",
    "description": "Calculate the safety factor of the frame design to ensure it meets or exceeds industry standards for strength and durability."
  }
]
)

sub020 = decompose(sub02[0], [
  {
    "name": "Static Load Analysis",
    "description": "Analyze the static loads acting on the bicycle frame, including the weight of the rider and any additional cargo, to determine the maximum stress points."
  },
  {
    "name": "Dynamic Load Analysis",
    "description": "Evaluate the dynamic loads experienced during cycling, such as impacts from bumps, jumps, or sudden braking, to assess their effects on the frame's structural integrity."
  },
  {
    "name": "Fatigue Load Analysis",
    "description": "Consider the repetitive loads and cycles experienced by the frame during long-term use, accounting for potential fatigue failure due to material degradation."
  }
]
)

sub2020 = decompose(sub020[0], [
  {
    "name": "Rider Weight Analysis",
    "description": "Calculate the weight of the rider and any additional cargo carried on the bicycle to determine the overall static load exerted on the frame."
  },
  {
    "name": "Distribution Analysis",
    "description": "Assess the distribution of static loads across different parts of the frame, considering factors such as rider position, frame geometry, and load-bearing components."
  },
  {
    "name": "Stress Analysis",
    "description": "Analyze the stress distribution within the frame structure under static loading conditions to identify areas of high stress concentration and potential weak points."
  }
]
)

sub20201 = decompose(sub2020[1], [
  {
    "name": "Center of Mass Calculation",
    "description": "Calculate the center of mass of the rider and any cargo to determine how the load is distributed along the bicycle frame."
  },
  {
    "name": "Frame Geometry Consideration",
    "description": "Evaluate how the frame geometry affects the distribution of the static load, including factors such as frame angles, tube lengths, and frame stiffness."
  },
  {
    "name": "Load Transfer Analysis",
    "description": "Analyze how the static load is transferred from the rider through the bicycle frame, considering factors such as frame material properties and joint configurations."
  }
]
)

sub202010 = decompose(sub20201[0], [
  {
    "name": "Rider Position Assessment",
    "description": "Assess the position of the rider on the bicycle, including factors such as height, weight distribution, and posture."
  },
  {
    "name": "Cargo Placement Consideration",
    "description": "Consider the placement and distribution of any cargo or accessories carried on the bicycle, such as panniers or baskets."
  },
  {
    "name": "Mathematical Calculation",
    "description": "Use mathematical formulas or computational methods to calculate the center of mass based on the combined weight and distribution of the rider and any cargo."
  }
]
)

sub2020102 = decompose(sub202010[2], [
  {
    "name": "Individual Component Analysis",
    "description": "Calculate the center of mass for each individual component of the bicycle, such as the frame, wheels, and rider, considering their respective weights and positions."
  },
  {
    "name": "Combined Center of Mass Calculation",
    "description": "Combine the individual center of mass calculations to determine the overall center of mass for the entire bicycle system, taking into account the relative positions and weights of each component."
  }
]
)

sub20201020 = decompose(sub2020102[0], [
  {
    "name": "Frame Center of Mass Calculation",
    "description": "Calculate the center of mass for the bicycle frame, considering its geometry, material distribution, and weight."
  },
  {
    "name": "Wheel Center of Mass Calculation",
    "description": "Compute the center of mass for each wheel, taking into account factors such as rim weight, tire weight, and hub weight."
  },
  {
    "name": "Rider Center of Mass Calculation",
    "description": "Determine the center of mass for the rider, considering factors such as body weight distribution, position on the bike, and any additional gear."
  }
]
)

sub202010200 = decompose(sub20201020[0], [
  {
    "name": "Weight Distribution Assessment",
    "description": "Evaluate the distribution of the rider's weight between the upper body, lower body, and extremities, considering factors such as posture and riding position."
  },
  {
    "name": "Positional Analysis",
    "description": "Analyze the rider's position on the bicycle, including factors such as seat height, handlebar position, and foot placement, to determine the center of mass location."
  }
]
)

sub2020102000 = decompose(sub202010200[0], [
  {
    "name": "Body Segment Weight Analysis",
    "description": "Break down the rider's weight into segments such as torso, arms, legs, and head, considering the proportional contribution of each segment to the total weight."
  },
  {
    "name": "Dynamic Weight Shift Consideration",
    "description": "Account for dynamic weight shifts during cycling, such as leaning into turns or standing on pedals, to assess how the rider's weight distribution changes with different riding conditions."
  }
]
)

sub20201020000 = decompose(sub2020102000[0], [
  {
    "name": "Anthropometric Data Utilization",
    "description": "Utilize anthropometric data to estimate the weight distribution of different body segments based on typical ratios and proportions."
  },
  {
    "name": "Individual Rider Assessment",
    "description": "Tailor the weight distribution analysis to the specific characteristics of the individual rider, considering factors such as body composition, muscle mass, and fitness level."
  }
]
)

sub202010200001 = decompose(sub20201020000[1], [
  {
    "name": "Biomechanical Analysis",
    "description": "Analyze the rider's biomechanics to understand how their unique body composition and muscle distribution affect weight distribution while cycling."
  },
  {
    "name": "Weight Distribution Measurement",
    "description": "Use techniques such as body composition analysis or pressure mapping to directly measure the rider's weight distribution while seated on the bicycle."
  }
]
)