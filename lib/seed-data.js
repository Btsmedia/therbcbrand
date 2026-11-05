// Starter catalogue, used to seed the database and as a fallback before Supabase is connected.
export const CATEGORIES=[
 {
  "slug": "beauty",
  "name": "Bath & beauty"
 },
 {
  "slug": "gadgets",
  "name": "Tech & gadgets"
 },
 {
  "slug": "kitchen",
  "name": "Kitchen"
 },
 {
  "slug": "lighting",
  "name": "Lighting"
 },
 {
  "slug": "storage",
  "name": "Storage"
 },
 {
  "slug": "decor",
  "name": "Decor"
 }
];

export const SEED_PRODUCTS=[
 {
  "id": "b1",
  "slug": "phone-led-fill-light",
  "name": "Phone LED Fill Light",
  "price": 5500,
  "compare_at": null,
  "category": "lighting",
  "categories": [
   "lighting",
   "gadgets"
  ],
  "tags": [
   "new"
  ],
  "badge": null,
  "description": "Slim rechargeable LED panel that clips onto your phone. Adjustable brightness for selfies, calls and live videos.",
  "care": "Charge fully before first use. Wipe with a dry cloth.",
  "image": "/img/7270.jpg",
  "variants": [
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 18
   }
  ],
  "position": 0
 },
 {
  "id": "b2",
  "slug": "z6-selfie-stick-tripod",
  "name": "Z6 Selfie Stick Tripod",
  "price": 12000,
  "compare_at": null,
  "category": "gadgets",
  "categories": [
   "gadgets"
  ],
  "tags": [
   "bestseller"
  ],
  "badge": null,
  "description": "Extendable selfie stick that opens into a tripod, with a Bluetooth remote. Fits most phones.",
  "care": "Fold gently. Keep the remote charged.",
  "image": "/img/7234.jpg",
  "variants": [
   {
    "colour": "Ink",
    "hex": "#34333A",
    "stock": 18
   }
  ],
  "position": 1
 },
 {
  "id": "b3",
  "slug": "l16-selfie-stick-tripod",
  "name": "L16 Selfie Stick Tripod",
  "price": 16500,
  "compare_at": null,
  "category": "gadgets",
  "categories": [
   "gadgets"
  ],
  "tags": [
   "new"
  ],
  "badge": "Trending",
  "description": "Tall extendable tripod with a stable base and Bluetooth remote. Good for content, calls and group photos.",
  "care": "Extend and fold section by section.",
  "image": "/img/7235.jpg",
  "variants": [
   {
    "colour": "Ink",
    "hex": "#34333A",
    "stock": 2
   }
  ],
  "position": 2
 },
 {
  "id": "b4",
  "slug": "sunset-projection-lamp",
  "name": "Sunset Projection Lamp",
  "price": 11500,
  "compare_at": null,
  "category": "lighting",
  "categories": [
   "lighting",
   "decor"
  ],
  "tags": [
   "new"
  ],
  "badge": null,
  "description": "LED atmosphere lamp that casts a warm sunset glow on your wall. Adjustable head, USB powered.",
  "care": "Do not look directly into the light. Dust with a dry cloth.",
  "image": "/img/7236.jpg",
  "variants": [
   {
    "colour": "Ink",
    "hex": "#34333A",
    "stock": 18
   }
  ],
  "position": 3
 },
 {
  "id": "b5",
  "slug": "rechargeable-hair-trimmer",
  "name": "Rechargeable Hair Trimmer",
  "price": 13500,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [],
  "badge": null,
  "description": "Cordless trimmer with guide combs for lining and touch-ups. USB rechargeable.",
  "care": "Brush out hair after each use. Oil the blade now and then.",
  "image": "/img/7237.jpg",
  "variants": [
   {
    "colour": "Ink",
    "hex": "#34333A",
    "stock": 18
   }
  ],
  "position": 4
 },
 {
  "id": "b6",
  "slug": "mini-wireless-speaker",
  "name": "Mini Wireless Speaker",
  "price": 9500,
  "compare_at": null,
  "category": "gadgets",
  "categories": [
   "gadgets"
  ],
  "tags": [
   "new",
   "bestseller"
  ],
  "badge": null,
  "description": "Pocket-size Bluetooth speaker with a carry strap. Rechargeable.",
  "care": "Keep away from water. Charge with the cable included.",
  "image": "/img/7242.jpg",
  "variants": [
   {
    "colour": "Blush",
    "hex": "#E2B9B9",
    "stock": 18
   },
   {
    "colour": "Mint",
    "hex": "#9ED3C3",
    "stock": 18
   }
  ],
  "position": 5
 },
 {
  "id": "b7",
  "slug": "glow-in-the-dark-star-stickers",
  "name": "Glow-in-the-Dark Star Stickers",
  "price": 3000,
  "compare_at": null,
  "category": "decor",
  "categories": [
   "decor"
  ],
  "tags": [],
  "badge": null,
  "description": "Peel-and-stick stars and moons that glow softly after the lights go off. Pack of assorted sizes.",
  "care": "Stick on clean, dry walls or ceilings.",
  "image": "/img/7243.jpg",
  "variants": [
   {
    "colour": "Mint",
    "hex": "#9ED3C3",
    "stock": 18
   }
  ],
  "position": 6
 },
 {
  "id": "b8",
  "slug": "digital-kitchen-scale",
  "name": "Digital Kitchen Scale",
  "price": 9000,
  "compare_at": null,
  "category": "kitchen",
  "categories": [
   "kitchen"
  ],
  "tags": [
   "bestseller"
  ],
  "badge": null,
  "description": "Electronic scale with a tare button, for baking and portioning. Battery powered.",
  "care": "Wipe clean. Do not immerse in water.",
  "image": "/img/7244.jpg",
  "variants": [
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 18
   }
  ],
  "position": 7
 },
 {
  "id": "b9",
  "slug": "heated-straightening-brush",
  "name": "Heated Straightening Brush",
  "price": 18000,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [
   "bestseller"
  ],
  "badge": "Trending",
  "description": "Brush-style straightener with temperature control. Smooths as you comb.",
  "care": "Unplug and let it cool before storing. Clean bristles gently.",
  "image": "/img/7246.jpg",
  "variants": [
   {
    "colour": "Ink",
    "hex": "#34333A",
    "stock": 18
   },
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 18
   }
  ],
  "position": 8
 },
 {
  "id": "b10",
  "slug": "foldable-1000w-hair-dryer",
  "name": "Foldable 1000W Hair Dryer",
  "price": 12500,
  "compare_at": 15000,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [],
  "badge": null,
  "description": "Compact 1000 W dryer with a folding handle. Light enough for travel.",
  "care": "Clear the air vent of lint regularly.",
  "image": "/img/7247.jpg",
  "variants": [
   {
    "colour": "Cobalt",
    "hex": "#3E5A8C",
    "stock": 18
   },
   {
    "colour": "Rose",
    "hex": "#D98AA0",
    "stock": 18
   }
  ],
  "position": 9
 },
 {
  "id": "b11",
  "slug": "hand-pull-food-chopper-2-l",
  "name": "Hand-Pull Food Chopper, 2 L",
  "price": 10500,
  "compare_at": null,
  "category": "kitchen",
  "categories": [
   "kitchen"
  ],
  "tags": [
   "new",
   "bestseller"
  ],
  "badge": null,
  "description": "Pull-cord chopper with sharp blades for onions, peppers, garlic and herbs. No electricity needed.",
  "care": "Blades are sharp. Hand wash the bowl and blades.",
  "image": "/img/7248.jpg",
  "variants": [
   {
    "colour": "Mint",
    "hex": "#9ED3C3",
    "stock": 18
   }
  ],
  "position": 10
 },
 {
  "id": "b12",
  "slug": "waist-trainer-belt",
  "name": "Waist Trainer Belt",
  "price": 8500,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [],
  "badge": null,
  "description": "Adjustable compression belt to wear under or over clothes.",
  "care": "Hand wash in cool water and air dry.",
  "image": "/img/7249.jpg",
  "variants": [
   {
    "colour": "Ink",
    "hex": "#34333A",
    "stock": 18
   }
  ],
  "position": 11
 },
 {
  "id": "b13",
  "slug": "plush-bath-towel-set",
  "name": "Plush Bath Towel Set",
  "price": 15000,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [
   "new"
  ],
  "badge": null,
  "description": "Soft, thick microfibre towels. Quick to dry and very absorbent.",
  "care": "Machine wash warm. Avoid fabric softener to keep them absorbent.",
  "image": "/img/7254.jpg",
  "variants": [
   {
    "colour": "Oat",
    "hex": "#D9CBB2",
    "stock": 18
   },
   {
    "colour": "Lilac",
    "hex": "#B9A6E0",
    "stock": 18
   }
  ],
  "position": 12
 },
 {
  "id": "b14",
  "slug": "fabric-storage-wardrobe",
  "name": "Fabric Storage Wardrobe",
  "price": 38000,
  "compare_at": 45000,
  "category": "storage",
  "categories": [
   "storage"
  ],
  "tags": [
   "bestseller"
  ],
  "badge": null,
  "description": "Freestanding wardrobe with hanging rail and shelves, covered in fabric with a zip front. 130 × 45 × 175 cm.",
  "care": "Assemble on a flat floor. Wipe the cover clean.",
  "image": "/img/7259.jpg",
  "variants": [
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 3
   }
  ],
  "position": 13
 },
 {
  "id": "b15",
  "slug": "travel-toothbrush-case",
  "name": "Travel Toothbrush Case",
  "price": 2500,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty",
   "storage"
  ],
  "tags": [],
  "badge": null,
  "description": "Ribbed case that holds a toothbrush and paste, and doubles as a rinsing cup.",
  "care": "Rinse and dry after use.",
  "image": "/img/7266.jpg",
  "variants": [
   {
    "colour": "Mint",
    "hex": "#9ED3C3",
    "stock": 18
   },
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 18
   }
  ],
  "position": 14
 },
 {
  "id": "b16",
  "slug": "smart-warm-belt",
  "name": "Smart Warm Belt",
  "price": 16000,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [],
  "badge": null,
  "description": "Rechargeable heated waist wrap with adjustable warmth. Wear around the waist or lower back.",
  "care": "Remove the heating unit before washing the wrap.",
  "image": "/img/7268.jpg",
  "variants": [
   {
    "colour": "Rose",
    "hex": "#D98AA0",
    "stock": 18
   },
   {
    "colour": "Cobalt",
    "hex": "#3E5A8C",
    "stock": 18
   }
  ],
  "position": 15
 },
 {
  "id": "b17",
  "slug": "desk-phone-holder-stand",
  "name": "Desk Phone Holder Stand",
  "price": 6500,
  "compare_at": null,
  "category": "gadgets",
  "categories": [
   "gadgets"
  ],
  "tags": [],
  "badge": null,
  "description": "Adjustable stand with a weighted base and phone clamp. Good for calls, recipes and live videos.",
  "care": "Wipe clean.",
  "image": "/img/7269.jpg",
  "variants": [
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 18
   }
  ],
  "position": 16
 },
 {
  "id": "a1",
  "slug": "led-cube-light-with-clip",
  "name": "LED Cube Light with Clip",
  "price": 8500,
  "compare_at": null,
  "category": "lighting",
  "categories": [
   "lighting"
  ],
  "tags": [
   "new",
   "bestseller"
  ],
  "badge": null,
  "description": "Rechargeable LED panel with a clip-on mount. Charges by USB or Type-C. Three light tones.",
  "care": "Charge fully before first use. Wipe with a dry cloth.",
  "image": "/img/7271.jpg",
  "variants": [
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 18
   }
  ],
  "position": 17
 },
 {
  "id": "a2",
  "slug": "refillable-perfume-atomizer",
  "name": "Refillable Perfume Atomizer",
  "price": 4500,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [
   "new"
  ],
  "badge": null,
  "description": "Aluminium shell with a glass inner bottle. Refills from the base in seconds. About 5 ml.",
  "care": "Rinse with warm water between scents.",
  "image": "/img/7272.jpg",
  "variants": [
   {
    "colour": "Silver",
    "hex": "#C9CCD3",
    "stock": 18
   },
   {
    "colour": "Cobalt",
    "hex": "#3E5A8C",
    "stock": 18
   },
   {
    "colour": "Rose",
    "hex": "#D98AA0",
    "stock": 18
   }
  ],
  "position": 18
 },
 {
  "id": "a3",
  "slug": "mini-travel-hair-straightener",
  "name": "Mini Travel Hair Straightener",
  "price": 9500,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [
   "new"
  ],
  "badge": null,
  "description": "Ceramic plates that heat up in about a minute. Comes in a clear travel case.",
  "care": "Unplug and let it cool before packing away.",
  "image": "/img/7273.jpg",
  "variants": [
   {
    "colour": "Yellow",
    "hex": "#F2C94C",
    "stock": 18
   },
   {
    "colour": "Lilac",
    "hex": "#B9A6E0",
    "stock": 18
   }
  ],
  "position": 19
 },
 {
  "id": "a4",
  "slug": "5-in-1-facial-cleansing-massager",
  "name": "5-in-1 Facial Cleansing Massager",
  "price": 14000,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [
   "bestseller"
  ],
  "badge": "Trending",
  "description": "Five swappable heads: cleansing brush, sponge, pumice, massage roller and soft brush. Battery powered.",
  "care": "Rinse the heads after each use and let them air dry.",
  "image": "/img/7278.jpg",
  "variants": [
   {
    "colour": "Rose",
    "hex": "#D98AA0",
    "stock": 4
   }
  ],
  "position": 20
 },
 {
  "id": "a5",
  "slug": "honeycomb-ice-cube-tray-with-lid",
  "name": "Honeycomb Ice Cube Tray with Lid",
  "price": 6500,
  "compare_at": null,
  "category": "kitchen",
  "categories": [
   "kitchen"
  ],
  "tags": [
   "new"
  ],
  "badge": null,
  "description": "Food-grade silicone tray with a fitted lid. Makes 37 small cubes.",
  "care": "Dishwasher safe. Press from the base to release cubes.",
  "image": "/img/7281.jpg",
  "variants": [
   {
    "colour": "Yellow",
    "hex": "#F2C94C",
    "stock": 18
   },
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 18
   }
  ],
  "position": 21
 },
 {
  "id": "a6",
  "slug": "wireless-led-puck-lights-set-of-3",
  "name": "Wireless LED Puck Lights, Set of 3",
  "price": 15500,
  "compare_at": 18500,
  "category": "lighting",
  "categories": [
   "lighting",
   "storage"
  ],
  "tags": [
   "bestseller"
  ],
  "badge": null,
  "description": "Battery-powered stick-on lights with a remote, timer and dimmer. No wiring needed.",
  "care": "Uses AAA batteries. Mount on clean, dry surfaces.",
  "image": "/img/7283.jpg",
  "variants": [
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 18
   }
  ],
  "position": 22
 },
 {
  "id": "a7",
  "slug": "automatic-toothpaste-dispenser",
  "name": "Automatic Toothpaste Dispenser",
  "price": 11000,
  "compare_at": null,
  "category": "beauty",
  "categories": [
   "beauty",
   "storage"
  ],
  "tags": [],
  "badge": null,
  "description": "Wall-mounted squeezer with five brush slots. Sticks on without drilling.",
  "care": "Wipe clean weekly. Remove toothpaste cap before fitting.",
  "image": "/img/7284.jpg",
  "variants": [
   {
    "colour": "White",
    "hex": "#F7F7F5",
    "stock": 18
   }
  ],
  "position": 23
 },
 {
  "id": "a8",
  "slug": "portable-water-flosser",
  "name": "Portable Water Flosser",
  "price": 22000,
  "compare_at": 26000,
  "category": "beauty",
  "categories": [
   "beauty"
  ],
  "tags": [
   "bestseller"
  ],
  "badge": null,
  "description": "Rechargeable oral irrigator with three modes and a refillable tank. USB charging.",
  "care": "Empty the tank after use and dry it upside down.",
  "image": "/img/7285.jpg",
  "variants": [
   {
    "colour": "Sage",
    "hex": "#A9B9A2",
    "stock": 18
   },
   {
    "colour": "Rose",
    "hex": "#D98AA0",
    "stock": 18
   }
  ],
  "position": 24
 },
 {
  "id": "a9",
  "slug": "expandable-wooden-peg-rack",
  "name": "Expandable Wooden Peg Rack",
  "price": 9000,
  "compare_at": null,
  "category": "decor",
  "categories": [
   "decor",
   "storage"
  ],
  "tags": [
   "new"
  ],
  "badge": null,
  "description": "Natural wood accordion rack with 13 pegs. Opens up to about 1 metre wide.",
  "care": "Dust with a dry cloth. Hang with the screws included.",
  "image": "/img/7289.jpg",
  "variants": [
   {
    "colour": "Natural wood",
    "hex": "#D8B98A",
    "stock": 18
   }
  ],
  "position": 25
 },
 {
  "id": "a10",
  "slug": "travel-jewellery-box",
  "name": "Travel Jewellery Box",
  "price": 7500,
  "compare_at": null,
  "category": "storage",
  "categories": [
   "storage",
   "beauty"
  ],
  "tags": [],
  "badge": null,
  "description": "Zip-around faux-leather case with ring rolls, earring slots and a necklace hook.",
  "care": "Wipe with a damp cloth.",
  "image": "/img/7304.jpg",
  "variants": [
   {
    "colour": "Blush",
    "hex": "#E2B9B9",
    "stock": 18
   },
   {
    "colour": "Mint",
    "hex": "#9ED3C3",
    "stock": 18
   }
  ],
  "position": 26
 },
 {
  "id": "a11",
  "slug": "smart-led-temperature-flask",
  "name": "Smart LED Temperature Flask",
  "price": 12500,
  "compare_at": null,
  "category": "kitchen",
  "categories": [
   "kitchen"
  ],
  "tags": [
   "new",
   "bestseller"
  ],
  "badge": "Trending",
  "description": "Double-walled stainless steel. Tap the lid to show the drink temperature. About 500 ml.",
  "care": "Hand wash only. Keep the lid out of water.",
  "image": "/img/7317.jpg",
  "variants": [
   {
    "colour": "Navy",
    "hex": "#1F2A4D",
    "stock": 18
   },
   {
    "colour": "Red",
    "hex": "#C0392B",
    "stock": 18
   }
  ],
  "position": 27
 }
];
