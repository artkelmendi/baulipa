import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Check,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { products } from "../data";
import WaterReflections from "./ui/water-reflections";
import "./product-page.css";

export default function ProductPage({ savedIds, onAdd, onEnquiry }) {
  const [category, setCategory] = useState("All essentials");
  const [search, setSearch] = useState("");
  const id = window.location.pathname.split("/").filter(Boolean)[1];
  const product = products.find((item) => item.id === id);
  useEffect(() => {
    document.title = product
      ? `${product.name} | BAULIPA`
      : "Pool essentials | BAULIPA";
  }, [product]);
  const visible = products.filter(
    (item) =>
      (category === "All essentials" || item.category === category) &&
      `${item.name} ${item.category}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  if (id && !product)
    return (
      <section className="product-page shell">
        <h1>That product isn’t here.</h1>
        <a className="text-link" href="/products/">
          Back to the collection <ArrowLeft />
        </a>
      </section>
    );
  return (
    <div className="product-page">
      <section className="products-intro shell has-water-reflections contact-top">
        <WaterReflections />
        <div>
          <a
            className="products-breadcrumb"
            href={product ? "/products/" : "/"}
          >
            <ArrowLeft size={15} />
            {product ? "All essentials" : "Back to BAULIPA"}
          </a>
          <p className="eyebrow">The pool shop</p>
          <h1>
            {product ? (
              product.name
            ) : (
              <>
                A little care.
                <br />
                <span>A lot of summer.</span>
              </>
            )}
          </h1>
          <p className="products-lead">
            {product
              ? product.description
              : "Thoughtful equipment and everyday essentials for your life by the water."}
          </p>
          {!product && (
            <a className="text-link" href="#products-collection">
              Explore the collection <ArrowUpRight size={18} />
            </a>
          )}
        </div>
        <div className="products-feature-image">
          <img
            src={product?.image || "/images/product-cleaner.webp"}
            alt={
              product?.name ||
              "Cordless pool cleaner from the pool essentials collection"
            }
            width="850"
            height="850"
            fetchPriority="high"
          />
        </div>
      </section>
      {product ? (
        <section className="product-information shell">
          <div>
            <span className="eyebrow">{product.category}</span>
            <h2>
              The right fit
              <br />
              for your pool.
            </h2>
            <p>{product.note}</p>
          </div>
          <div>
            <ul>
              {product.details.map((detail) => (
                <li key={detail}>
                  <Check size={19} />
                  {detail}
                </li>
              ))}
            </ul>
            <p className="products-availability">
              Collection preview. Models, compatibility and pricing confirmed on
              enquiry.
            </p>
            <div className="products-detail-actions">
              <button className="action" onClick={() => onAdd(product.id)}>
                <span>
                  {savedIds.includes(product.id)
                    ? "Saved to your list"
                    : "Add to enquiry"}
                </span>
                <span className="action-icon">
                  {savedIds.includes(product.id) ? (
                    <Check size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                </span>
              </button>
              <button
                className="text-link"
                onClick={() => onEnquiry(`Advice about ${product.name}`)}
              >
                Ask about this product <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="products-catalog shell" id="products-collection">
          <div className="products-catalog-heading">
            <h2>
              Everyday essentials.
              <br />
              <span className="muted">Chosen with care.</span>
            </h2>
            <label className="products-search">
              <MagnifyingGlass size={19} />
              <input
                aria-label="Search pool products"
                placeholder="Find an essential"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
          <div className="shop-toolbar">
            <div
              className="filters"
              role="group"
              aria-label="Product categories"
            >
              {["All essentials", "Cleaning", "Water care", "Equipment"].map(
                (name) => (
                  <button
                    key={name}
                    className={category === name ? "active" : ""}
                    aria-pressed={category === name}
                    onClick={() => setCategory(name)}
                  >
                    {name}
                  </button>
                ),
              )}
            </div>
            <span className="product-count" role="status">
              {visible.length} {visible.length === 1 ? "product" : "products"}
            </span>
          </div>
          <div className="product-grid">
            {visible.map((item) => (
              <article className="product-card" key={item.id}>
                <div className="product-image">
                  <a
                    className="product-image-link"
                    href={`/products/${item.id}/`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      width="850"
                      height="850"
                      loading="lazy"
                    />
                  </a>
                  <button
                    className={`add-product ${savedIds.includes(item.id) ? "is-saved" : ""}`}
                    aria-label={`Save ${item.name} to enquiry`}
                    onClick={() => onAdd(item.id)}
                  >
                    {savedIds.includes(item.id) ? (
                      <Check size={20} />
                    ) : (
                      <Plus size={20} />
                    )}
                  </button>
                </div>
                <span className="product-category">{item.category}</span>
                <h3>
                  <a href={`/products/${item.id}/`}>
                    {item.name}
                    <ArrowUpRight size={18} />
                  </a>
                </h3>
                <p>Price on request</p>
              </article>
            ))}
          </div>
          {!visible.length && (
            <div className="products-empty">
              <h3>No essentials found.</h3>
              <p>Try another search or explore the full collection.</p>
              <button
                className="text-link"
                onClick={() => {
                  setSearch("");
                  setCategory("All essentials");
                }}
              >
                Show all essentials <ArrowUpRight size={18} />
              </button>
            </div>
          )}
          <p className="products-availability">
            Collection preview. Ask us about available models, brands and
            pricing.
          </p>
        </section>
      )}
      <section className="products-help shell">
        <div>
          <span className="eyebrow">A little guidance goes a long way</span>
          <h2>
            Good advice.
            <br />
            <span className="blue">Clearer water.</span>
          </h2>
          <p>
            Tell us about your pool and we’ll help you find the right
            essentials.
          </p>
        </div>
        <button
          className="action"
          onClick={() => onEnquiry("Help choosing pool products")}
        >
          <span>Find the right fit</span>
          <span className="action-icon">
            <ArrowUpRight size={20} />
          </span>
        </button>
      </section>
    </div>
  );
}
