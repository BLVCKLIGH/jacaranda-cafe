/* Menu data. Swap `img` for a photo path (e.g. assets/img/flat-white.jpg) whenever you have real photos. */
const MENU = [
  // Coffee
  { id: "c1", cat: "Coffee", name: "Flat white", desc: "Double ristretto with silky steamed milk. Our house blend is roasted in Maboneng.", price: 38, img: "flat-white", tags: ["Bestseller"] },
  { id: "c2", cat: "Coffee", name: "Cappuccino", desc: "Equal parts espresso, steamed milk and foam, dusted with cocoa if you like.", price: 36, img: "cappuccino" },
  { id: "c3", cat: "Coffee", name: "Americano", desc: "A double shot topped up with hot water. Black, strong, simple.", price: 30, img: "americano" },
  { id: "c4", cat: "Coffee", name: "Red cappuccino", desc: "Rooibos espresso with steamed milk. Caffeine-free and very South African.", price: 40, img: "red-cappuccino", tags: ["Caffeine-free"] },
  { id: "c5", cat: "Coffee", name: "Mocha", desc: "Espresso, Belgian chocolate and steamed milk.", price: 44, img: "mocha" },
  { id: "c6", cat: "Coffee", name: "Iced latte", desc: "Double shot over ice with cold milk. Add vanilla or caramel syrup for R8.", price: 42, img: "iced-latte" },
  // Fast food
  { id: "f1", cat: "Fast food", name: "Jacaranda burger", desc: "Beef patty, aged cheddar, pickles and smoky sauce on a toasted brioche bun.", price: 125, img: "burger", tags: ["Bestseller"] },
  { id: "f2", cat: "Fast food", name: "Chicken mayo toastie", desc: "Pulled chicken, herb mayo and mozzarella on sourdough.", price: 85, img: "toastie" },
  { id: "f3", cat: "Fast food", name: "Falafel wrap", desc: "Crispy falafel, hummus, pickled red onion and greens.", price: 92, img: "wrap", tags: ["Vegan"] },
  { id: "f4", cat: "Fast food", name: "Hand-cut chips", desc: "Twice-cooked, with chutney mayo for dipping.", price: 45, img: "chips", tags: ["Vegetarian"] },
  { id: "f5", cat: "Fast food", name: "Harvest bowl", desc: "Roast butternut, quinoa, feta, avocado and toasted seeds.", price: 110, img: "bowl", tags: ["Vegetarian"] },
  // Desserts
  { id: "d1", cat: "Desserts", name: "Butter croissant", desc: "Baked every morning at 6. Served warm with jam.", price: 34, img: "croissant" },
  { id: "d2", cat: "Desserts", name: "Strawberry layer cake", desc: "Vanilla sponge, fresh cream and strawberries.", price: 58, img: "cake" },
  { id: "d3", cat: "Desserts", name: "Carrot cake", desc: "Spiced, with walnuts and cream-cheese icing.", price: 55, img: "carrot-cake" },
  { id: "d4", cat: "Desserts", name: "Double-chocolate brownie", desc: "Fudgy in the middle. Ask for a scoop of ice cream on the side.", price: 42, img: "brownie", tags: ["Gluten-free"] },
  { id: "d5", cat: "Desserts", name: "Malva pudding", desc: "Warm apricot sponge soaked in cream sauce, with custard.", price: 60, img: "malva", tags: ["Bestseller"] },
  // Beverages
  { id: "b1", cat: "Beverages", name: "Berry smoothie", desc: "Blueberries, banana, yoghurt and honey.", price: 58, img: "smoothie" },
  { id: "b2", cat: "Beverages", name: "Homemade lemonade", desc: "Fresh lemons, a little mint, lightly sweetened.", price: 38, img: "lemonade", tags: ["Vegan"] },
  { id: "b3", cat: "Beverages", name: "Rooibos pot", desc: "Loose-leaf Cederberg rooibos for one, served with honey.", price: 32, img: "rooibos", tags: ["Caffeine-free"] },
  { id: "b4", cat: "Beverages", name: "Vanilla milkshake", desc: "Real vanilla ice cream, thick enough to need a spoon.", price: 52, img: "milkshake" },
  { id: "b5", cat: "Beverages", name: "Fresh orange juice", desc: "Squeezed to order.", price: 40, img: "juice", tags: ["Vegan"] },
  // Specials
  { id: "s1", cat: "Specials", name: "Jacaranda latte", desc: "Our spring special: butterfly-pea and vanilla latte, purple like the trees outside. October and November only.", price: 48, img: "jacaranda-latte", tags: ["Seasonal"] },
  { id: "s2", cat: "Specials", name: "Buttermilk pancakes", desc: "A stack of three with berries, crème fraîche and maple syrup.", price: 95, img: "pancakes" },
  { id: "s3", cat: "Specials", name: "Shakshuka", desc: "Eggs baked in spiced tomato and peppers, with toasted ciabatta.", price: 105, img: "shakshuka", tags: ["Vegetarian"] },
  { id: "s4", cat: "Specials", name: "Big Parkhurst breakfast", desc: "Two eggs, bacon, boerewors, mushrooms, tomato and toast.", price: 135, img: "breakfast" },
].map(m => ({ ...m, img: `assets/img/${m.img}.svg` }));

const MENU_CATS = ["Coffee", "Fast food", "Desserts", "Beverages", "Specials"];

const GALLERY = [
  { src: "assets/img/gallery-terrace.svg", alt: "Outdoor tables under two jacaranda trees", caption: "The terrace in November" },
  { src: "assets/img/gallery-counter.svg", alt: "Espresso machine on the green-tiled coffee bar", caption: "Our coffee bar" },
  { src: "assets/img/gallery-flatwhite.svg", alt: "Flat white with latte art", caption: "Flat white, the most-ordered drink" },
  { src: "assets/img/gallery-storefront.svg", alt: "The café shopfront with a striped purple awning", caption: "Find us on 4th Avenue" },
  { src: "assets/img/gallery-bakes.svg", alt: "Croissants and brownies on plates", caption: "Baked here every morning" },
  { src: "assets/img/gallery-brunch.svg", alt: "Pancakes with berries and a pot of rooibos", caption: "Saturday brunch" },
];

const REVIEWS = [
  { name: "Lerato M.", text: "The flat white is the best on 4th Avenue, and I've tried all of them. Staff remember my order after two visits.", rating: 5, when: "October 2026" },
  { name: "Pieter van Wyk", text: "Took my parents for the Big Parkhurst breakfast. Huge portions, quick service, and a table under the trees.", rating: 5, when: "September 2026" },
  { name: "Ayesha K.", text: "I work from here two mornings a week. Fast Wi-Fi, plugs at every bench, and nobody rushes you.", rating: 4, when: "November 2026" },
  { name: "Sipho D.", text: "Malva pudding exactly like my gran used to make. Booked a table for my birthday and they brought it out with a candle.", rating: 5, when: "August 2026" },
];

const HOURS = [
  ["Monday to Friday", "06:30–16:00"],
  ["Saturday", "07:00–16:00"],
  ["Sunday & public holidays", "08:00–14:00"],
];
