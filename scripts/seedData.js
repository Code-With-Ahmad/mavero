export const CATEGORIES = [
  {
    slug: "apparel",
    name: "Apparel",
    description: "Tailored coats, knitwear, and eveningwear cut from noble fabrics.",
    imageSeed: "mavero-apparel",
  },
  {
    slug: "footwear",
    name: "Footwear",
    description: "Hand-finished leather shoes and boots, built to last generations.",
    imageSeed: "mavero-footwear",
  },
  {
    slug: "bags-accessories",
    name: "Bags & Accessories",
    description: "Structured leather goods and finishing touches for every occasion.",
    imageSeed: "mavero-bags",
  },
  {
    slug: "watches-jewelry",
    name: "Watches & Jewelry",
    description: "Precision timepieces and fine jewelry, made to be inherited.",
    imageSeed: "mavero-jewelry",
  },
];

const SIZES_APPAREL = ["S", "M", "L", "XL"];
const SIZES_FOOTWEAR = ["7", "8", "9", "10", "11"];

function variantsFor(sizes, colors, baseStock = 8) {
  const variants = [];
  for (const color of colors) {
    for (const size of sizes) {
      variants.push({
        size,
        color,
        stock: baseStock,
        sku: `${color}-${size}`.toUpperCase().replace(/\s+/g, ""),
      });
    }
  }
  return variants;
}

export const PRODUCTS = [
  // ── Apparel ──────────────────────────────────────────────
  {
    sku: "MAV-APP-001",
    name: "The Wool Overcoat",
    description:
      "A double-breasted overcoat cut from heavyweight Italian wool, lined in silk twill for a fluid drape. Structured shoulders and horn buttons finish the tailoring.",
    category: "apparel",
    price: 890,
    salePrice: null,
    tags: ["outerwear", "wool", "tailored"],
    colors: ["Charcoal", "Camel"],
    sizes: SIZES_APPAREL,
    featured: true,
    imageSeed: "mavero-overcoat",
  },
  {
    sku: "MAV-APP-002",
    name: "Silk Evening Gown",
    description:
      "Bias-cut silk charmeuse that skims the body in a single, uninterrupted line. A concealed side zip keeps the silhouette clean from shoulder to hem.",
    category: "apparel",
    price: 1240,
    salePrice: 990,
    tags: ["evening", "silk", "gown"],
    colors: ["Emerald", "Burgundy"],
    sizes: SIZES_APPAREL,
    featured: true,
    imageSeed: "mavero-gown",
  },
  {
    sku: "MAV-APP-003",
    name: "Cashmere Crewneck",
    description:
      "Two-ply Mongolian cashmere, fully fashioned for a clean neckline that holds its shape wash after wash. Effortless with tailoring or denim alike.",
    category: "apparel",
    price: 340,
    salePrice: null,
    tags: ["knitwear", "cashmere", "everyday"],
    colors: ["Ivory", "Navy", "Charcoal"],
    sizes: SIZES_APPAREL,
    featured: false,
    imageSeed: "mavero-cashmere",
  },
  {
    sku: "MAV-APP-004",
    name: "Tailored Wool Trousers",
    description:
      "A modern straight leg in fine merino wool twill, finished with a hidden hook closure and a permanent center crease.",
    category: "apparel",
    price: 310,
    salePrice: null,
    tags: ["trousers", "tailored", "wool"],
    colors: ["Charcoal", "Navy"],
    sizes: SIZES_APPAREL,
    featured: false,
    imageSeed: "mavero-trousers",
  },
  {
    sku: "MAV-APP-005",
    name: "Silk Blouse",
    description:
      "A relaxed silk blouse with a fluid neck tie, cut generously through the body for effortless layering under tailoring.",
    category: "apparel",
    price: 265,
    salePrice: 210,
    tags: ["blouse", "silk", "workwear"],
    colors: ["Ivory", "Blush"],
    sizes: SIZES_APPAREL,
    featured: false,
    imageSeed: "mavero-blouse",
  },

  // ── Footwear ─────────────────────────────────────────────
  {
    sku: "MAV-SHO-001",
    name: "Oxford Leather Brogue",
    description:
      "Full-grain calfskin brogues, Goodyear welted for a sole that can be resoled for decades of wear. Finished with a hand-burnished patina.",
    category: "footwear",
    price: 520,
    salePrice: null,
    tags: ["formal", "leather", "goodyear-welt"],
    colors: ["Black", "Chestnut"],
    sizes: SIZES_FOOTWEAR,
    featured: true,
    imageSeed: "mavero-oxford",
  },
  {
    sku: "MAV-SHO-002",
    name: "Suede Chelsea Boot",
    description:
      "Elasticated side panels and a low block heel make this suede Chelsea boot equally at home with denim or tailoring.",
    category: "footwear",
    price: 480,
    salePrice: 380,
    tags: ["boots", "suede", "everyday"],
    colors: ["Taupe", "Black"],
    sizes: SIZES_FOOTWEAR,
    featured: true,
    imageSeed: "mavero-chelsea",
  },
  {
    sku: "MAV-SHO-003",
    name: "Satin Kitten Heel",
    description:
      "A pointed-toe kitten heel in liquid satin, balanced for all-day wear without sacrificing the silhouette.",
    category: "footwear",
    price: 395,
    salePrice: null,
    tags: ["heels", "satin", "evening"],
    colors: ["Champagne", "Black"],
    sizes: SIZES_FOOTWEAR,
    featured: false,
    imageSeed: "mavero-heel",
  },
  {
    sku: "MAV-SHO-004",
    name: "Leather Espadrille",
    description:
      "Woven jute soles under supple nappa leather uppers — a warm-weather staple built with the same care as our formal shoes.",
    category: "footwear",
    price: 210,
    salePrice: null,
    tags: ["espadrille", "leather", "resort"],
    colors: ["Natural", "Navy"],
    sizes: SIZES_FOOTWEAR,
    featured: false,
    imageSeed: "mavero-espadrille",
  },
  {
    sku: "MAV-SHO-005",
    name: "Minimalist Leather Sneaker",
    description:
      "A single-piece leather upper on a slim cupsole — dressed down luxury for daily rotation.",
    category: "footwear",
    price: 350,
    salePrice: 280,
    tags: ["sneaker", "leather", "casual"],
    colors: ["White", "Black"],
    sizes: SIZES_FOOTWEAR,
    featured: false,
    imageSeed: "mavero-sneaker",
  },

  // ── Bags & Accessories ───────────────────────────────────
  {
    sku: "MAV-BAG-001",
    name: "Structured Top-Handle Bag",
    description:
      "Saffiano leather over a rigid frame, with a detachable strap and a suede-lined interior sized for daily essentials.",
    category: "bags-accessories",
    price: 1450,
    salePrice: null,
    tags: ["handbag", "leather", "structured"],
    colors: ["Black", "Cognac"],
    sizes: null,
    featured: true,
    imageSeed: "mavero-handbag",
  },
  {
    sku: "MAV-BAG-002",
    name: "Velvet Evening Clutch",
    description:
      "A minimal clutch in hand-dyed velvet with a brushed-brass clasp — sized for the essentials and nothing more.",
    category: "bags-accessories",
    price: 380,
    salePrice: 310,
    tags: ["clutch", "velvet", "evening"],
    colors: ["Burgundy", "Emerald"],
    sizes: null,
    featured: false,
    imageSeed: "mavero-clutch",
  },
  {
    sku: "MAV-BAG-003",
    name: "Full-Grain Leather Belt",
    description:
      "A 35mm belt in vegetable-tanned leather with a solid brass buckle that ages into its own patina over time.",
    category: "bags-accessories",
    price: 145,
    salePrice: null,
    tags: ["belt", "leather", "accessory"],
    colors: ["Black", "Cognac"],
    sizes: ["S", "M", "L"],
    featured: false,
    imageSeed: "mavero-belt",
  },
  {
    sku: "MAV-BAG-004",
    name: "Silk Twill Scarf",
    description:
      "Hand-rolled edges on a printed silk twill scarf, generously sized to wear at the neck, the hair, or the handle of a bag.",
    category: "bags-accessories",
    price: 195,
    salePrice: null,
    tags: ["scarf", "silk", "accessory"],
    colors: ["Ivory Print", "Navy Print"],
    sizes: null,
    featured: false,
    imageSeed: "mavero-scarf",
  },
  {
    sku: "MAV-BAG-005",
    name: "Leather Weekend Duffel",
    description:
      "A soft-structured duffel in full-grain leather with a removable shoulder strap and a shoe compartment lined in canvas.",
    category: "bags-accessories",
    price: 890,
    salePrice: 720,
    tags: ["duffel", "leather", "travel"],
    colors: ["Cognac", "Black"],
    sizes: null,
    featured: true,
    imageSeed: "mavero-duffel",
  },

  // ── Watches & Jewelry ────────────────────────────────────
  {
    sku: "MAV-WAT-001",
    name: "Chrono Leather Watch",
    description:
      "A 40mm stainless case with a sapphire crystal and a hand-stitched calfskin strap, powered by a Swiss quartz chronograph movement.",
    category: "watches-jewelry",
    price: 1650,
    salePrice: null,
    tags: ["watch", "chronograph", "leather-strap"],
    colors: ["Silver/Black", "Gold/Brown"],
    sizes: null,
    featured: true,
    imageSeed: "mavero-watch",
  },
  {
    sku: "MAV-WAT-002",
    name: "Gold Vermeil Signet Ring",
    description:
      "18k gold vermeil over sterling silver, hand-engraved with a fine hairline finish — a modern take on an heirloom shape.",
    category: "watches-jewelry",
    price: 220,
    salePrice: null,
    tags: ["ring", "gold-vermeil", "jewelry"],
    colors: ["Gold"],
    sizes: ["6", "7", "8", "9"],
    featured: false,
    imageSeed: "mavero-ring",
  },
  {
    sku: "MAV-WAT-003",
    name: "Pearl Drop Earrings",
    description:
      "Freshwater pearls suspended from brushed 14k gold-filled hooks — a quiet, versatile piece for day into evening.",
    category: "watches-jewelry",
    price: 165,
    salePrice: 135,
    tags: ["earrings", "pearl", "jewelry"],
    colors: ["Gold/White"],
    sizes: null,
    featured: true,
    imageSeed: "mavero-earrings",
  },
  {
    sku: "MAV-WAT-004",
    name: "Sterling Cufflinks",
    description:
      "Solid sterling silver cufflinks with a hand-polished bar finish, presented in a suede-lined box.",
    category: "watches-jewelry",
    price: 145,
    salePrice: null,
    tags: ["cufflinks", "silver", "formalwear"],
    colors: ["Silver"],
    sizes: null,
    featured: false,
    imageSeed: "mavero-cufflinks",
  },
  {
    sku: "MAV-WAT-005",
    name: "Layered Gold Necklace",
    description:
      "Three fine 14k gold-filled chains in graduated lengths, secured with a single lobster clasp for easy layering.",
    category: "watches-jewelry",
    price: 195,
    salePrice: null,
    tags: ["necklace", "gold", "jewelry"],
    colors: ["Gold"],
    sizes: null,
    featured: false,
    imageSeed: "mavero-necklace",
  },
];

export function buildVariants(product) {
  if (!product.sizes && !product.colors) return [];
  const sizes = product.sizes && product.sizes.length ? product.sizes : [null];
  const colors = product.colors && product.colors.length ? product.colors : [null];
  const variants = [];
  for (const color of colors) {
    for (const size of sizes) {
      variants.push({
        size,
        color,
        stock: 6 + Math.floor(Math.random() * 10),
        sku: `${product.sku}-${color || "one"}-${size || "os"}`
          .toUpperCase()
          .replace(/\s+/g, ""),
      });
    }
  }
  return variants;
}
