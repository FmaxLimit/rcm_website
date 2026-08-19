/* ============================================================
   SERVICE DETAIL PAGE
   Reads ?id=<service-id> from the URL and renders the matching
   service's title, image, description, and key features.
   ============================================================ */

const SERVICES = {
    "tarpaulin": {
        title: "Tarpaulin Printing",
        image: "images/tarpaulinprinting.jpg",
        short: "Standout banners and tarpaulins with vibrant outdoor-grade inks.",
        long: "Our tarpaulin printing service produces bold, weather-resistant banners for storefronts, events, and announcements. We use premium outdoor-grade inks and reinforced edges so your message stays sharp and readable through sun, wind, and rain.",
        features: [
            "Custom sizes up to 10ft wide and any length",
            "Heavy-duty 13oz and 15oz tarpaulin material",
            "Full-color eco-solvent and UV-stable inks",
            "Heat-welded edges and rust-proof grommets",
            "Rush production available within 24 hours"
        ]
    },
    "pvc": {
        title: "PVC Printing",
        image: "images/rcm_pvcprinting.jpg",
        short: "Rigid, weather-resistant PVC signage for shops, promos, and displays.",
        long: "PVC signs are a durable, professional choice for storefronts, point-of-sale displays, and trade shows. Lightweight yet rigid, they mount easily on walls, easels, and A-frames for both indoor and outdoor use.",
        features: [
            "3mm and 5mm rigid PVC board options",
            "High-resolution direct UV printing",
            "Matte or gloss lamination available",
            "Pre-drilled mounting holes on request",
            "Indoor and outdoor rated finishes"
        ]
    },
    "calling-cards": {
        title: "Calling Cards",
        image: "images/callingcards.jpg",
        short: "Premium business cards that make your first impression count.",
        long: "Make every handshake count. Our calling cards are printed on premium card stock with crisp color and clean edges, finished to match your brand. Choose from classic matte, glossy, or specialty stocks and add foil, spot UV, or embossing.",
        features: [
            "Standard and custom sizes available",
            "Matte, glossy, and textured card stocks",
            "Spot UV, foil stamping, and embossing options",
            "Single or double-sided printing",
            "Bulk quantities from 100 pieces up"
        ]
    },
    "flyers": {
        title: "Flyers & Leaflets",
        image: "images/rcm_flyers.jpg",
        short: "Bold marketing collateral for events, promos, and campaigns.",
        long: "Get your message out with vivid, high-quality flyers and leaflets. Perfect for store openings, product launches, events, and direct mail campaigns. Print in small batches or large runs with fast turnaround.",
        features: [
            "A4, A5, A6, and DL standard sizes",
            "90gsm to 300gsm paper weight options",
            "Full-color CMYK and spot-color printing",
            "Single or double-sided layouts",
            "Folding, scoring, and perforation available"
        ]
    },
    "gift-voucher": {
        title: "Gift Voucher",
        image: "images/rcm_giftvoucher.jpg",
        short: "Attractive, ready-to-gift vouchers for promotions and rewards.",
        long: "Design beautiful, branded gift vouchers for promotions, rewards, and customer giveaways. Add your own denomination, terms, and design, and we'll print them on premium card stock with optional serial numbering.",
        features: [
            "Custom sizes and orientations",
            "Premium 250gsm to 350gsm card stock",
            "Optional serial numbering for tracking",
            "Spot UV, foil, and matte finishes",
            "Perforated tear-off stubs available"
        ]
    },
    "invitation": {
        title: "Invitation & Souvenirs",
        image: "images/rcm_invitation.jpg",
        short: "Customized invitations and souvenirs that match your event theme.",
        long: "From weddings and birthdays to corporate events and christenings, we design and print invitations and souvenirs that bring your theme to life. Pair invitations with matching tags, fans, ribbons, and giveaways.",
        features: [
            "Custom shapes, sizes, and die-cuts",
            "Coordinated event suites and add-ons",
            "Premium textured and pearl card stocks",
            "Foil stamping, embossing, and ribbons",
            "Souvenirs include fans, tags, labels, and boxes"
        ]
    },
    "mug": {
        title: "Customized Mug",
        image: "images/rcm_mug.jpg",
        short: "Personalized mugs for gifts, corporate branding, and special orders.",
        long: "Wrap your brand around a classic ceramic mug. Our sublimation and direct-print methods deliver bright, dishwasher-safe designs perfect for giveaways, employee gifts, and personal keepsakes.",
        features: [
            "Standard 11oz and 15oz ceramic mugs",
            "Full-wrap or single-side printing",
            "Dishwasher and microwave safe inks",
            "Individual gift boxes available",
            "Bulk pricing for corporate orders"
        ]
    },
    "tshirt": {
        title: "T-shirt Printing",
        image: "images/tshirt.jpg",
        alt: "T-shirt Printing",
        short: "Quality apparel printing for teams, events, and promotional wear.",
        long: "Outfit your team, event, or organization with custom-printed shirts. We offer screen printing, heat transfer, and direct-to-garment options so we can match the right method to your design, fabric, and quantity.",
        features: [
            "Screen print, heat transfer, and DTG options",
            "Cotton, poly-cotton, and dry-fit fabrics",
            "Unisex, ladies', and kids' sizing",
            "Up to 6-color front and back printing",
            "Bulk and rush orders accommodated"
        ]
    },
    "totebag": {
        title: "Tote Bag Printing",
        image: "images/totebag.jpg",
        short: "Eco-friendly tote bags with crisp logos and illustrations.",
        long: "Reusable tote bags are a walking advertisement for your brand. Choose from natural canvas, cotton, or non-woven options and print crisp, vivid designs on one or both sides.",
        features: [
            "Canvas, cotton, and non-woven materials",
            "Single or double-sided printing",
            "Heat transfer, screen print, and DTG options",
            "Reinforced stitching and long handles",
            "Great for events, retail, and corporate gifts"
        ]
    },
    "sintra": {
        title: "Sintra Board",
        image: "images/sintraboard.jpg",
        short: "Lightweight, rigid Sintra board prints ideal for displays and signage.",
        long: "Sintra board is a lightweight, closed-cell PVC that's easy to cut, mount, and transport. Perfect for trade-show panels, directional signage, photo props, and short-term outdoor displays.",
        features: [
            "1mm to 10mm thickness options",
            "Direct UV print with vibrant color",
            "Cut to custom shapes on request",
            "Indoor and short-term outdoor use",
            "Lightweight and easy to install"
        ]
    }
};

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function renderService() {
    const container = document.getElementById("service-detail");
    if (!container) return;

    const id = getQueryParam("id");
    const service = id ? SERVICES[id] : null;

    if (!service) {
        container.innerHTML = `
            <div class="service-not-found">
                <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                <h1>Service not found</h1>
                <p>We couldn't find the service you're looking for. Please head back to the services list to pick one.</p>
                <a href="index.html#services" class="btn btn-primary">Back to Services</a>
            </div>
        `;
        document.title = "Service Not Found | RCM Apparel Trading Printing Service";
        return;
    }

    // Update the browser tab title and meta
    document.title = `${service.title} | RCM Apparel Trading Printing Service`;

    // Build the feature list items
    const featuresHtml = service.features
        .map(item => `<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>${item}</span></li>`)
        .join("");

    container.innerHTML = `
        <div class="service-hero">
            <div class="service-hero-image">
                <img src="${service.image}" alt="${service.title}" loading="lazy">
            </div>
            <div class="service-hero-copy">
                <span class="eyebrow">RCM Service</span>
                <h1>${service.title}</h1>
                <p class="service-short">${service.short}</p>
            </div>
        </div>

        <div class="service-body">
            <div class="service-description">
                <h2>About this service</h2>
                <p>${service.long}</p>
            </div>
            <div class="service-features-panel">
                <h2>Key features</h2>
                <ul class="service-features">
                    ${featuresHtml}
                </ul>
            </div>
        </div>
    `;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderService);
} else {
    renderService();
}
