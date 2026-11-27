/* Every picture is a real photo (JPG).
   1. First it looks for your own file in assets/photos/<name>.jpg  (run download-photos.ps1 to save them all, or add your own).
   2. If that file isn't there, it loads the photo from the internet instead (Unsplash, then a Flickr keyword search).
   To use your own photo, save it as assets/photos/<name>.jpg, e.g. assets/photos/flat-white.jpg. */
const PHOTOS = {
  "flat-white": ["1534778101976-62847782c213", "latte,coffee", 1],
  "cappuccino": ["1572442388796-11668a67e53d", "cappuccino", 2],
  "americano": ["1495474472287-4d71bcdd2085", "black,coffee", 3],
  "red-cappuccino": ["1509042239860-f550ce710b93", "coffee,cup", 4],
  "mocha": ["1514432324607-a09d9b4aefdd", "mocha,coffee", 5],
  "iced-latte": ["1461023058943-07fcbe16d735", "iced,coffee", 6],
  "burger": ["1568901346375-23c9450c58cd", "burger", 7],
  "toastie": ["1528735602780-2552fd46c7af", "sandwich,toasted", 8],
  "wrap": ["1626700051175-6818013e1d4f", "falafel,wrap", 9],
  "chips": ["1573080496219-bb080dd4f877", "french,fries", 10],
  "bowl": ["1512621776951-a57141f2eefd", "salad,bowl", 11],
  "croissant": ["1555507036-ab1f4038808a", "croissant", 12],
  "cake": ["1565958011703-44f9829ba187", "strawberry,cake", 13],
  "carrot-cake": ["1621303837174-89787a7d4729", "carrot,cake", 14],
  "brownie": ["1606313564200-e75d5e30476c", "chocolate,brownie", 15],
  "malva": ["1488477181946-6428a0291777", "pudding,dessert", 16],
  "smoothie": ["1553530666-ba11a7da3888", "smoothie", 17],
  "lemonade": ["1621263764928-df1444c5e859", "lemonade", 18],
  "rooibos": ["1544787219-7f47ccb76574", "tea,teapot", 19],
  "milkshake": ["1572490122747-3968b75cc699", "milkshake", 20],
  "juice": ["1600271886742-f049cd451bba", "orange,juice", 21],
  "jacaranda-latte": ["1541167760496-1628856ab772", "latte,art", 22],
  "pancakes": ["1567620905732-2d1ec7ab7445", "pancakes", 23],
  "shakshuka": ["1590412200988-a436970781fa", "shakshuka", 24],
  "breakfast": ["1525351484163-7529414344d8", "english,breakfast", 25],
  "hero": ["1554118811-1e0d58224f24", "cafe,interior", 26],
  "g-terrace": ["1559329007-40df8a9345d8", "cafe,terrace", 27],
  "g-counter": ["1442512595331-e89e73853f31", "coffee,bar", 28],
  "g-flatwhite": ["1495474472287-4d71bcdd2085", "flat,white,coffee", 29],
  "g-storefront": ["1521017432531-fbd92d768814", "cafe,storefront", 30],
  "g-bakes": ["1509440159596-0249088772ff", "bakery,pastries", 31],
  "g-brunch": ["1504754524776-8f4f37790ca0", "brunch,table", 32]
};  // name: [Unsplash id, search keywords, seed]
const photo = key => `assets/photos/${key}.jpg`;
const photoFallbacks = (key, w = 600, h = 600) => {
  const [id, kw, seed] = PHOTOS[key] || ["", "cafe", 1];
  return [id && `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&fm=jpg&q=80&w=${w}&h=${h}`,
          `https://loremflickr.com/${w}/${h}/${kw.replace(/,/g, "%2C")}?lock=${seed}`].filter(Boolean).join("|");
};
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
].map(m => ({ ...m, fallback: photoFallbacks(m.img, 600, 600), img: photo(m.img) }));

const MENU_CATS = ["Coffee", "Fast food", "Desserts", "Beverages", "Specials"];

const GALLERY = [
  { src: photo("g-terrace"), fallback: photoFallbacks("g-terrace", 1400, 1000), alt: "Outdoor tables under two jacaranda trees", caption: "The terrace in November" },
  { src: photo("g-counter"), fallback: photoFallbacks("g-counter", 1400, 1000), alt: "Espresso machine on the green-tiled coffee bar", caption: "Our coffee bar" },
  { src: photo("g-flatwhite"), fallback: photoFallbacks("g-flatwhite", 1400, 1000), alt: "Flat white with latte art", caption: "Flat white, the most-ordered drink" },
  { src: photo("g-storefront"), fallback: photoFallbacks("g-storefront", 1400, 1000), alt: "The café shopfront with a striped purple awning", caption: "Find us on 4th Avenue" },
  { src: photo("g-bakes"), fallback: photoFallbacks("g-bakes", 1400, 1000), alt: "Croissants and brownies on plates", caption: "Baked here every morning" },
  { src: photo("g-brunch"), fallback: photoFallbacks("g-brunch", 1400, 1000), alt: "Pancakes with berries and a pot of rooibos", caption: "Saturday brunch" },
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
