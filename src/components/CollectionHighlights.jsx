import { ArrowUpRight, Plus, Check } from "@phosphor-icons/react";
import MarqueeAlongSvgPath from "./ui/marquee-along-svg-path";
import { products, featuredProductId, showcaseHotels } from "../data";
import { sitePath } from "../paths";
import "./collection-highlights.css";

const ribbonPath =
  "M0 130 C400 60 650 60 1000 125 S1700 185 2000 115 S2300 70 2400 105";

function HotelWordmark({ hotel }) {
  if (hotel.logo)
    return (
      <div className="hotel-wordmark">
        <img
          src={sitePath(hotel.logo)}
          alt={hotel.name}
          width="190"
          height="110"
        />
      </div>
    );
  return (
    <div className={`hotel-wordmark hotel-wordmark-${hotel.id}`}>
      <span className="hotel-emblem" aria-hidden="true">
        {hotel.id === "swiss" ? "◇" : hotel.id === "emerald" ? "E" : "V"}
      </span>
      <span className="hotel-name">{hotel.name}</span>
      <span className="hotel-descriptor">{hotel.descriptor}</span>
      <span className="hotel-stars" aria-hidden="true">
        ★★★★★
      </span>
    </div>
  );
}

export function ClientShowcase() {
  return (
    <section
      className="client-showcase"
      id="clients"
      aria-labelledby="clients-title"
    >
      <div className="client-heading shell" data-reveal>
        <h2 id="clients-title">
          Our clients.
          <br />
          <span className="muted">A shared standard.</span>
        </h2>
        <p>Considered spaces. Memorable stays.</p>
      </div>
      <MarqueeAlongSvgPath path={ribbonPath} baseVelocity={34} repeat={3}>
        {showcaseHotels.map((hotel) => (
          <HotelWordmark key={hotel.id} hotel={hotel} />
        ))}
      </MarqueeAlongSvgPath>
      <ul className="sr-only" aria-label="Hotel name placeholders">
        {showcaseHotels.map((hotel) => (
          <li key={hotel.id}>
            {hotel.name} {hotel.descriptor}
          </li>
        ))}
      </ul>
      <p className="client-preview shell">
        Showcase preview. Hotel names are placeholders, not confirmed BAULIPA
        clients.
      </p>
    </section>
  );
}

export function FeaturedCollection({ savedIds, onAdd }) {
  const product =
    products.find((item) => item.id === featuredProductId) || products[0];
  const saved = savedIds.includes(product.id);
  return (
    <section
      className="featured-collection shell"
      id="featured"
      aria-labelledby="featured-title"
    >
      <div className="featured-heading" data-reveal>
        <h2 id="featured-title">Our current favourite.</h2>
        <span>Selected by BAULIPA</span>
      </div>
      <div className="featured-stage">
        <div className="featured-orbit" aria-hidden="true" />
        <p className="featured-statement">
          A little less work.
          <br />
          <span>More pool days.</span>
        </p>
        <div className="featured-photo">
          <img
            src={product.image}
            alt={product.name}
            width="850"
            height="850"
            loading="lazy"
          />
        </div>
        <span className="featured-index" aria-hidden="true">
          THE POOL EDIT / 01
        </span>
        <div className="featured-bottom">
          <div className="featured-product-copy">
            <span>{product.category}</span>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
          <div className="featured-actions">
            <a className="action" href={sitePath(`/products/${product.id}/`)}>
              <span>Discover the product</span>
              <span className="action-icon">
                <ArrowUpRight size={20} />
              </span>
            </a>
            <button
              className="featured-save"
              onClick={() => !saved && onAdd(product.id)}
              aria-pressed={saved}
            >
              {saved ? <Check size={18} /> : <Plus size={18} />}
              {saved ? "Saved to your enquiry" : "Save to your enquiry"}
            </button>
            <p>Collection preview · Price on request</p>
          </div>
        </div>
      </div>
    </section>
  );
}
