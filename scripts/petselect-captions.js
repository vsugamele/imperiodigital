const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const TEMPLATES = [
    "Properly British, properly healthy. 🇬🇧🐕 Your pup deserves the best of ethical nutrition. [PRODUCT_CONTEXT]",
    "No nasties, just tails wagging. 🐾✨ Why settle for less when you can have PetSelect? [PRODUCT_CONTEXT]",
    "UK Delivery right to your door. Because your dog shouldn't have to wait for the good stuff. 📦❤️ [PRODUCT_CONTEXT]",
    "Ethical. Sustainable. Delicious (well, according to the dogs). 🐕🥓 Have you tried our latest range? [PRODUCT_CONTEXT]",
    "Rainy UK walks call for proper recovery. ☔️🦴 Fuel your best friend with PetSelect UK. [PRODUCT_CONTEXT]"
];

const CTAS = [
    "Grab yours at the link in bio! 🔗",
    "Treat your pup today. Shop now! 🛍️",
    "Join the PetSelect family. Link in bio! 🐾",
    "Free UK delivery on orders over £30! 🚚"
];

function buildPetCaption({ product } = {}) {
    const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    const cta = CTAS[Math.floor(Math.random() * CTAS.length)];

    const productContext = product ? `Featuring our ${product.replace(/_/g, ' ').replace(/\.[^/.]+$/, "")}.` : "";
    const text = template.replace("[PRODUCT_CONTEXT]", productContext);

    const hashtags = "#PetSelectUK #BritishDogs #DogHealthUK #EthicalPetFood #UKDogs";

    return {
        caption: `${text}\n\n${cta}\n\n${hashtags}`.trim()
    };
}

module.exports = { buildPetCaption };
