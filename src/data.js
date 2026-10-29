import { sitePath } from "./paths.js";
// Illustrative product selection. Replace with BAULIPA's confirmed catalog before commercial launch.
export const products = [
  {
    id: "cleaner",
    name: "Cordless pool cleaner",
    category: "Cleaning",
    image: sitePath("/images/product-cleaner.webp"),
    description:
      "Make less work of pool days. Explore automatic cleaning options for a pool that is always inviting.",
    details: [
      "Automatic pool cleaning",
      "Options for different pool surfaces",
      "Model and compatibility advice",
    ],
    note: "We will help you choose a cleaner for your pool shape, surface and size.",
  },
  {
    id: "care",
    name: "Water care essentials",
    category: "Water care",
    image: sitePath("/images/product-care.webp"),
    description:
      "Clear water starts with the right balance. Find a water care routine that suits your pool.",
    details: [
      "Water treatment essentials",
      "Testing and balancing options",
      "Advice for your water system",
    ],
    note: "The right treatment depends on your water test and pool system. Always follow the chosen product label.",
  },
  {
    id: "pump",
    name: "Pool circulation pump",
    category: "Equipment",
    image: sitePath("/images/product-pump.webp"),
    description:
      "The heart of a well-considered pool. Explore circulation equipment matched to your filtration system.",
    details: [
      "Pool circulation equipment",
      "System compatibility guidance",
      "Selection for new and existing pools",
    ],
    note: "Pump sizing and installation requirements are confirmed for your individual pool.",
  },
  {
    id: "tools",
    name: "Everyday maintenance set",
    category: "Cleaning",
    image: sitePath("/images/product-tools.webp"),
    description:
      "A little attention goes a long way. Keep the essentials close for the everyday care of your pool.",
    details: [
      "Pool skimmers and brushes",
      "Tools for routine maintenance",
      "Surface-appropriate options",
    ],
    note: "Choose tools that suit your pool finish. Ask us about the available range.",
  },
];

export const pools = [
  {
    id: "white",
    title: "A softer kind of summer.",
    type: "White stone pools",
    image: sitePath("/images/pool-white.webp"),
    thumbnail: sitePath("/images/pool-white-thumb.webp"),
    description:
      "Sculptural curves, bright mineral finishes and pale blue water. A lighter direction for a pool that feels part of the architecture.",
    features: [
      "Explore white and pale stone finishes",
      "Curved forms and generous steps",
      "Materials selected for your setting",
    ],
  },
  {
    id: "black",
    title: "A different depth.",
    type: "Black basalt pools",
    image: sitePath("/images/pool-black.webp"),
    thumbnail: sitePath("/images/pool-black-thumb.webp"),
    description:
      "Dark stone. Reflective water. A quieter, more architectural pool with a connection to the surrounding landscape.",
    features: [
      "Explore charcoal and dark stone palettes",
      "Strong architectural proportions",
      "Discuss suitable finishes and equipment",
    ],
  },
  {
    id: "rooftop",
    title: "Above the everyday.",
    type: "Rooftop pools",
    image: sitePath("/images/pool-rooftop.webp"),
    thumbnail: sitePath("/images/pool-rooftop-thumb.webp"),
    description:
      "A new perspective on a day by the pool. Open views, clean edges and a design considered around its setting.",
    features: [
      "Explore an elevated pool concept",
      "Structural feasibility assessed first",
      "Scope and requirements discussed individually",
    ],
  },
  {
    id: "indoor",
    title: "Your own quiet world.",
    type: "Indoor & spa pools",
    image: sitePath("/images/pool-indoor.webp"),
    thumbnail: sitePath("/images/pool-indoor-thumb.webp"),
    description:
      "Deep green mosaic, natural light and warm stone. An indoor pool can become a space to pause, in every season.",
    features: [
      "Explore indoor pool possibilities",
      "Lighting, finishes and atmosphere",
      "Ventilation and systems planned together",
    ],
  },
  {
    id: "mosaic",
    title: "Summer, in full colour.",
    type: "Blue mosaic pools",
    image: sitePath("/images/pool-mosaic.webp"),
    thumbnail: sitePath("/images/pool-mosaic-thumb.webp"),
    description:
      "Blue mosaic and a softer outline bring a familiar joy to the garden. A pool with colour, character and room to unwind.",
    features: [
      "Explore mosaic colours and textures",
      "Oval shapes and Roman-inspired steps",
      "A finish palette connected to your garden",
    ],
  },
  {
    id: "natural",
    title: "A little closer to nature.",
    type: "Natural swimming pools",
    image: sitePath("/images/pool-natural.webp"),
    thumbnail: sitePath("/images/pool-natural-thumb.webp"),
    description:
      "Reflective green water, timber and soft planting. A landscape-led direction for a different kind of swimming space.",
    features: [
      "Explore a natural pool concept",
      "Planting and landscape considered together",
      "Water systems and feasibility discussed first",
    ],
  },
];

export const processSteps = [
  {
    title: "First, your idea.",
    text: "Tell us how you imagine using your pool. We look at your space, your priorities and the practical details together.",
    tag: "A conversation that shapes everything",
  },
  {
    title: "Then, every detail.",
    text: "Shape, finish, water and surroundings. We bring the choices together in a considered plan, with the scope and budget agreed before building.",
    tag: "A clear plan before construction",
  },
  {
    title: "Built from the ground up.",
    text: "From the structure to the pool equipment, the build follows the agreed design. You know what is happening and what comes next.",
    tag: "Thoughtful construction, throughout",
  },
  {
    title: "Yours to dive into.",
    text: "With the pool ready, we walk you through its equipment and everyday care. Then comes the best part: making it your own.",
    tag: "Ready for everyday life",
  },
];
