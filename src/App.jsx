import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Plus,
  Minus,
  X,
  Bag,
  Waves,
  PencilRuler,
  Sun,
  Moon,
  Check,
  DownloadSimple,
  Copy,
  CaretDown,
  List,
} from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { products, pools, processSteps } from "./data";
import PerspectiveTunnelHero from "@/components/ui/perspective-tunnel-hero";

gsap.registerPlugin(ScrollTrigger);

function readSaved(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Private browsing may disable storage. */
  }
}

function Action({
  children,
  onClick,
  href,
  className = "",
  secondary = false,
}) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      className={`action ${secondary ? "action-secondary" : ""} ${className}`}
      href={href}
      onClick={onClick}
    >
      <span>{children}</span>
      <span className="action-icon">
        <ArrowUpRight size={20} weight="regular" />
      </span>
    </Tag>
  );
}

function Dialog({ open, onClose, titleId, className = "", children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        )
          onClose();
      }}
    >
      <button
        className="icon-button dialog-close"
        onClick={onClose}
        aria-label="Close dialog"
      >
        <X size={23} />
      </button>
      {children}
    </dialog>
  );
}

function useChoreography(root, galleryTween) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    let active = true;
    const ctx = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        // Header entrance is independent of the supplied Motion-driven tunnel hero.
        gsap.from(".header-brand, .desktop-nav, .header-actions", {
          opacity: 0,
          y: -12,
          duration: 0.65,
          stagger: 0.06,
          ease: "power3.out",
        });

        // Explanation: the statement fills in from left to right, like water finding its level.
        gsap.fromTo(
          ".manifesto-fill",
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            stagger: 0.25,
            ease: "none",
            scrollTrigger: {
              trigger: ".manifesto",
              start: "top 80%",
              end: "bottom 40%",
              scrub: 0.7,
            },
          },
        );

        gsap.utils.toArray("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 32,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          });
        });
        gsap.fromTo(
          ".process-image img",
          { yPercent: -8, scale: 1.15 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: ".process",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        gsap.from(".footer-brand span", {
          yPercent: 100,
          stagger: 0.055,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".footer-brand",
            start: "top 95%",
            once: true,
          },
        });
      });
      media.add(
        "(min-width: 1024px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)",
        () => {
          const track = root.current.querySelector(".pool-track");
          const viewport = root.current.querySelector(".pool-viewport");
          // Spatial consistency: one continuous track preserves the relationship between pool styles.
          galleryTween.current = gsap.to(track, {
            x: () => -(track.scrollWidth - viewport.clientWidth),
            ease: "none",
            scrollTrigger: {
              trigger: ".pool-gallery",
              start: "top top",
              end: () => `+=${track.scrollWidth - viewport.clientWidth}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          return () => {
            galleryTween.current = null;
          };
        },
      );
    }, root);
    const refresh = () => {
      if (active) ScrollTrigger.refresh();
    };
    document.fonts.ready.then(refresh);
    const images = Array.from(root.current.querySelectorAll("img"));
    images.forEach((img) =>
      img.addEventListener("load", refresh, { once: true }),
    );
    return () => {
      active = false;
      images.forEach((img) => img.removeEventListener("load", refresh));
      media.revert();
      ctx.revert();
    };
  }, [root, galleryTween]);
}

function App() {
  const root = useRef(null);
  const galleryTween = useRef(null);
  const galleryViewport = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    readSaved("baulipa-theme-v2", "light"),
  );
  const [filter, setFilter] = useState("All essentials");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPool, setSelectedPool] = useState(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [interest, setInterest] = useState("A new swimming pool");
  const [step, setStep] = useState(0);
  const [savedIds, setSavedIds] = useState(() => {
    const stored = readSaved("baulipa-enquiry", []);
    return Array.isArray(stored)
      ? stored.filter((id) => products.some((product) => product.id === id))
      : [];
  });
  const [notice, setNotice] = useState("");
  useChoreography(root, galleryTween);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    save("baulipa-theme-v2", theme);
  }, [theme]);
  useEffect(() => {
    save("baulipa-enquiry", savedIds);
  }, [savedIds]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  function toggleTheme() {
    const dark =
      theme === "dark" ||
      (theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(dark ? "light" : "dark");
  }
  function openEnquiry(value = "A new swimming pool") {
    setInterest(value);
    setSelectedPool(null);
    setSelectedProduct(null);
    setBagOpen(false);
    setMenuOpen(false);
    setEnquiryOpen(true);
  }
  function addProduct(id) {
    setSavedIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
    setNotice("Added to your enquiry list");
  }
  function moveGallery(direction) {
    if (galleryTween.current) {
      const trigger = galleryTween.current.scrollTrigger;
      const progress = galleryTween.current.progress();
      const next = Math.max(
        0,
        Math.min(
          1,
          (direction > 0
            ? Math.floor(progress * (pools.length - 1) + 0.15) + 1
            : Math.ceil(progress * (pools.length - 1) - 0.15) - 1) /
            (pools.length - 1),
        ),
      );
      window.scrollTo({
        top: trigger.start + (trigger.end - trigger.start) * next,
        behavior: "smooth",
      });
    } else {
      galleryViewport.current.scrollBy({
        left: direction * galleryViewport.current.clientWidth * 0.86,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  }
  const savedProducts = products.filter((p) => savedIds.includes(p.id));
  const visibleProducts = products.filter(
    (p) => filter === "All essentials" || p.category === filter,
  );

  return (
    <div ref={root}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header shell">
        <a className="header-brand wordmark" href="#" aria-label="BAULIPA home">
          baulipa<span className="brand-period">.</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#pools">Our pools</a>
          <a href="#approach">Our approach</a>
          <a href="#shop">
            Pool shop <ArrowUpRight size={14} />
          </a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button theme-toggle"
            onClick={toggleTheme}
            aria-label="Switch colour theme"
          >
            <Sun className="sun-icon" size={21} />
            <Moon className="moon-icon" size={21} />
          </button>
          <button
            className="bag-button"
            onClick={() => setBagOpen(true)}
            aria-label={`Enquiry list, ${savedIds.length} ${savedIds.length === 1 ? "item" : "items"}`}
          >
            <Bag size={21} />
            <span>{savedIds.length}</span>
          </button>
          <button className="header-contact" onClick={() => openEnquiry()}>
            Start your project <ArrowUpRight size={17} />
          </button>
          <button
            className="icon-button menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <List size={25} />
          </button>
        </div>
      </header>

      <main id="main">
        <PerspectiveTunnelHero
          images={pools}
          onStartProject={() => openEnquiry()}
          onSelectPool={setSelectedPool}
        />

        <section
          className="intro shell"
          id="studio"
          aria-labelledby="intro-title"
        >
          <div className="intro-side" data-reveal>
            <span className="eyebrow">
              A little closer to your kind of summer
            </span>
            <p>
              Swimming pools, thoughtfully built.
              <br />
              From the first sketch to the everyday details.
            </p>
            <a className="text-link" href="#approach">
              Meet our approach <ArrowDown size={18} />
            </a>
          </div>
          <div
            className="manifesto"
            id="intro-title"
            role="heading"
            aria-level="2"
            aria-label="More than a pool. A place to feel good."
          >
            {["More than a pool.", "A place to", "feel good."].map(
              (text, i) => (
                <div
                  className={`manifesto-line manifesto-line-${i}`}
                  key={text}
                  aria-hidden="true"
                >
                  <span>{text}</span>
                  <span className="manifesto-fill">{text}</span>
                </div>
              ),
            )}
          </div>
          <div className="service-strip" data-reveal>
            <a href="#pools">
              <Waves size={27} weight="light" />
              <span>Made for your space</span>
              <ArrowUpRight size={19} />
            </a>
            <a href="#approach">
              <PencilRuler size={27} weight="light" />
              <span>Built with consideration</span>
              <ArrowUpRight size={19} />
            </a>
            <a href="#shop">
              <Sun size={27} weight="light" />
              <span>Ready for every summer</span>
              <ArrowUpRight size={19} />
            </a>
          </div>
        </section>

        <section
          className="pool-gallery"
          id="pools"
          aria-labelledby="pools-title"
        >
          <div className="gallery-heading shell">
            <div>
              <h2 id="pools-title">
                Your own little
                <br />
                <span className="muted">piece of summer.</span>
              </h2>
            </div>
            <div className="gallery-controls">
              <button
                className="icon-button outlined"
                onClick={() => moveGallery(-1)}
                aria-label="Previous pool style"
              >
                <ArrowLeft size={23} />
              </button>
              <button
                className="icon-button outlined"
                onClick={() => moveGallery(1)}
                aria-label="Next pool style"
              >
                <ArrowRight size={23} />
              </button>
            </div>
          </div>
          <div
            className="pool-viewport"
            ref={galleryViewport}
            tabIndex="0"
            aria-label="Pool styles gallery. Use the arrow buttons to explore."
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                moveGallery(event.key === "ArrowRight" ? 1 : -1);
              }
            }}
          >
            <div className="pool-track">
              {pools.map((pool) => (
                <article className="pool-card" key={pool.id}>
                  <button
                    className="pool-card-image"
                    onClick={() => setSelectedPool(pool)}
                    aria-label={`Discover ${pool.type}`}
                  >
                    <img
                      src={pool.image}
                      alt={`${pool.type}: ${pool.title}`}
                      width="1448"
                      height="1086"
                      loading="lazy"
                    />
                    <span className="image-arrow">
                      <ArrowUpRight size={28} />
                    </span>
                  </button>
                  <div className="pool-caption">
                    <h3>{pool.title}</h3>
                    <span>{pool.type}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <p className="gallery-note shell">
            A world of possibilities, shaped around your space.{" "}
            <span>Concept imagery for inspiration.</span>
          </p>
        </section>

        <section
          className="process shell"
          id="approach"
          aria-labelledby="process-title"
        >
          <div className="process-visual">
            <div className="process-title" data-reveal>
              <h2 id="process-title">
                Good things
                <br />
                start with
                <br />
                <span className="blue">a clear plan.</span>
              </h2>
              <p>
                Your ideas, our attention to detail.
                <br />A considered journey to your first dive.
              </p>
            </div>
            <div className="process-image">
              <img
                src="/images/pool-mosaic.webp"
                alt="Sunlight rippling across beautifully clear swimming pool water"
                width="1448"
                height="1086"
                loading="lazy"
              />
              <span className="image-ripple ripple-one" aria-hidden="true" />
              <span className="image-ripple ripple-two" aria-hidden="true" />
            </div>
          </div>
          <div className="process-steps" data-reveal>
            {processSteps.map((item, i) => (
              <div
                className={`process-step ${step === i ? "is-open" : ""}`}
                key={item.title}
              >
                <h3>
                  <button
                    aria-expanded={step === i}
                    aria-controls={`step-${i}`}
                    id={`step-button-${i}`}
                    onClick={() => setStep(step === i ? -1 : i)}
                  >
                    <span>{item.title}</span>
                    {step === i ? <Minus size={23} /> : <Plus size={23} />}
                  </button>
                </h3>
                <div
                  className="step-content"
                  id={`step-${i}`}
                  role="region"
                  aria-labelledby={`step-button-${i}`}
                  hidden={step !== i}
                >
                  <p>{item.text}</p>
                  <span>{item.tag}</span>
                </div>
              </div>
            ))}
            <div className="process-end">
              <Waves size={31} weight="light" />
              <p>
                Built around your home.
                <br />
                Designed around your life.
              </p>
            </div>
          </div>
        </section>

        <section className="shop" id="shop" aria-labelledby="shop-title">
          <div className="shop-header shell">
            <div>
              <span className="eyebrow">The pool shop</span>
              <h2 id="shop-title">
                Good water.
                <br />
                Great essentials.
              </h2>
              <p>The details that keep your pool at its best.</p>
            </div>
            <a className="text-link" href="#collection">
              Explore the collection <ArrowDown size={19} />
            </a>
          </div>
          <div className="shop-collection shell" id="collection">
            <div className="shop-toolbar">
              <div
                className="filters"
                role="group"
                aria-label="Filter products by category"
              >
                {["All essentials", "Cleaning", "Water care", "Equipment"].map(
                  (name) => (
                    <button
                      key={name}
                      className={filter === name ? "active" : ""}
                      aria-pressed={filter === name}
                      onClick={() => setFilter(name)}
                    >
                      {name}
                      {name === "All essentials" && <sup>04</sup>}
                    </button>
                  ),
                )}
              </div>
              <span className="product-count" role="status">
                {visibleProducts.length}{" "}
                {visibleProducts.length === 1 ? "product" : "products"}
              </span>
            </div>
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    <button
                      className="product-image-link"
                      onClick={() => setSelectedProduct(product)}
                      aria-label={`View ${product.name}`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        width="850"
                        height="850"
                        loading="lazy"
                      />
                    </button>
                    <button
                      className={`add-product ${savedIds.includes(product.id) ? "is-saved" : ""}`}
                      aria-label={
                        savedIds.includes(product.id)
                          ? `${product.name} is in enquiry list`
                          : `Add ${product.name} to enquiry list`
                      }
                      onClick={() => addProduct(product.id)}
                    >
                      {savedIds.includes(product.id) ? (
                        <Check size={20} />
                      ) : (
                        <Plus size={20} />
                      )}
                    </button>
                  </div>
                  <span className="product-category">{product.category}</span>
                  <h3>
                    <button onClick={() => setSelectedProduct(product)}>
                      {product.name}
                      <ArrowUpRight size={19} />
                    </button>
                  </h3>
                  <p>Price on request</p>
                </article>
              ))}
            </div>
            <div className="shop-bottom">
              <p>
                Collection preview. Ask us about models, compatibility and
                availability.
              </p>
              <button
                className="text-link"
                onClick={() => openEnquiry("Help choosing pool products")}
              >
                A little advice? <ArrowUpRight size={19} />
              </button>
            </div>
          </div>
        </section>

        <section
          className="contact shell"
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-top">
            <div data-reveal>
              <p>You bring the daydream.</p>
              <h2 id="contact-title">
                Let’s make
                <br />
                <span className="blue">a splash.</span>
              </h2>
              <Action onClick={() => openEnquiry()}>Start your project</Action>
            </div>
            <div className="contact-image" data-reveal>
              <img
                src="/images/pool-white.webp"
                alt="A sculptural white stone swimming pool with soft curved steps"
                width="1448"
                height="1086"
                loading="lazy"
              />
            </div>
          </div>
          <div className="questions" data-reveal>
            <h3>
              A few things
              <br />
              you might be wondering.
            </h3>
            <div className="questions-list">
              <details>
                <summary>
                  Where do we start?
                  <Plus size={19} />
                </summary>
                <p>
                  Start with your space and an idea of how you would like to use
                  it. Photos, rough measurements and an initial budget are a
                  useful beginning.
                </p>
              </details>
              <details>
                <summary>
                  Can you help with an existing pool?
                  <Plus size={19} />
                </summary>
                <p>
                  Tell us about your pool and what you want to change. We can
                  discuss products, equipment and the scope of any work with
                  you.
                </p>
              </details>
              <details>
                <summary>
                  How do I find the right pool products?
                  <Plus size={19} />
                </summary>
                <p>
                  Save the products that interest you to your enquiry list.
                  Include your pool dimensions and equipment details so we can
                  help you check compatibility.
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer shell">
        <div className="footer-top">
          <a href="#" className="footer-tagline">
            A life by the water.
          </a>
          <nav aria-label="Footer navigation">
            <a href="#pools">Our pools</a>
            <a href="#approach">Our approach</a>
            <a href="#shop">Pool shop</a>
            <button onClick={() => openEnquiry()}>
              Start your project <ArrowUpRight size={15} />
            </button>
          </nav>
          <a className="back-top" href="#" aria-label="Back to top">
            <ArrowUpRight size={22} />
          </a>
        </div>
        <div className="footer-brand" aria-label="BAULIPA">
          {"baulipa.".split("").map((letter, i) => (
            <span aria-hidden="true" key={i}>
              {letter}
            </span>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} BAULIPA</span>
          <span>Considered pools. Everyday escapes.</span>
          <button
            onClick={() =>
              setNotice(
                "Your enquiry list is stored only in this browser. No analytics or tracking cookies are used.",
              )
            }
          >
            Privacy & cookies
          </button>
        </div>
      </footer>

      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        titleId="menu-title"
        className="menu-dialog"
      >
        <h2 id="menu-title" className="wordmark">
          baulipa.
        </h2>
        <nav aria-label="Mobile navigation">
          {[
            ["Our pools", "#pools"],
            ["Our approach", "#approach"],
            ["Pool shop", "#shop"],
          ].map(([label, href]) => (
            <a href={href} key={href} onClick={() => setMenuOpen(false)}>
              {label}
              <ArrowUpRight size={28} />
            </a>
          ))}
        </nav>
        <Action onClick={() => openEnquiry()}>Start your project</Action>
      </Dialog>

      <Dialog
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        titleId="product-title"
        className="product-dialog"
      >
        {selectedProduct && (
          <div className="product-detail">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              width="850"
              height="850"
            />
            <div>
              <span className="eyebrow">{selectedProduct.category}</span>
              <h2 id="product-title">{selectedProduct.name}</h2>
              <p>{selectedProduct.description}</p>
              <ul>
                {selectedProduct.details.map((d) => (
                  <li key={d}>
                    <Check size={17} />
                    {d}
                  </li>
                ))}
              </ul>
              <p className="detail-note">{selectedProduct.note}</p>
              <p className="detail-availability">
                Collection preview. Models and pricing on request.
              </p>
              <Action onClick={() => addProduct(selectedProduct.id)}>
                {savedIds.includes(selectedProduct.id)
                  ? "Added to your list"
                  : "Add to enquiry"}
              </Action>
              <button
                className="text-link detail-list-link"
                onClick={() => {
                  setSelectedProduct(null);
                  setBagOpen(true);
                }}
              >
                View enquiry list <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={!!selectedPool}
        onClose={() => setSelectedPool(null)}
        titleId="pool-detail-title"
        className="pool-dialog"
      >
        {selectedPool && (
          <div className="pool-detail">
            <img
              src={selectedPool.image}
              alt={selectedPool.type}
              width="1448"
              height="1086"
            />
            <div className="pool-detail-copy">
              <span className="eyebrow">{selectedPool.type}</span>
              <h2 id="pool-detail-title">{selectedPool.title}</h2>
              <p>{selectedPool.description}</p>
              <ul>
                {selectedPool.features.map((text) => (
                  <li key={text}>
                    <Check size={18} />
                    {text}
                  </li>
                ))}
              </ul>
              <Action onClick={() => openEnquiry(selectedPool.type)}>
                Start your project
              </Action>
              <p className="detail-availability">
                Concept imagery for inspiration. Your pool is designed
                individually.
              </p>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        titleId="bag-title"
        className="bag-dialog"
      >
        <span className="eyebrow">Your pool, your picks</span>
        <h2 id="bag-title">
          A little list
          <br />
          for your pool.
        </h2>
        {savedProducts.length ? (
          <>
            <div className="bag-list">
              {savedProducts.map((product) => (
                <div className="bag-item" key={product.id}>
                  <img
                    src={product.image}
                    alt={product.name}
                    width="100"
                    height="100"
                  />
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.category} / Price on request</p>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Remove ${product.name}`}
                    onClick={() =>
                      setSavedIds((current) =>
                        current.filter((id) => id !== product.id),
                      )
                    }
                  >
                    <X size={19} />
                  </button>
                </div>
              ))}
            </div>
            <p className="detail-note">
              A starting point for a conversation. We’ll help you check models,
              compatibility and availability.
            </p>
            <Action
              onClick={() => openEnquiry("Pool products and availability")}
            >
              Prepare enquiry
            </Action>
          </>
        ) : (
          <div className="empty-bag">
            <Bag size={48} weight="light" />
            <h3>A good place to start.</h3>
            <p>
              Use the + on a product to save it here. Bring your favourites
              together before preparing an enquiry.
            </p>
            <Action href="#shop" onClick={() => setBagOpen(false)}>
              Explore the collection
            </Action>
          </div>
        )}
      </Dialog>

      <Dialog
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        titleId="enquiry-title"
        className="enquiry-dialog"
      >
        <EnquiryForm
          interest={interest}
          savedProducts={savedProducts}
          open={enquiryOpen}
          onNotice={setNotice}
        />
      </Dialog>
      <div
        className={`notice ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        <Check size={19} />
        <span>{notice}</span>
      </div>
    </div>
  );
}

function EnquiryForm({ interest, savedProducts, open, onNotice }) {
  const [summary, setSummary] = useState("");
  const [formInterest, setFormInterest] = useState(interest);
  useEffect(() => {
    if (open) {
      setSummary("");
      setFormInterest(interest);
    }
  }, [open, interest]);
  function handleSubmit(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const text = `BAULIPA ENQUIRY\n\nName: ${fields.name}\nEmail: ${fields.email}\nLocation: ${fields.location || "To discuss"}\nInterested in: ${fields.interest}\n\n${fields.message}\n\nProduct shortlist:\n${savedProducts.length ? savedProducts.map((p) => `- ${p.name}`).join("\n") : "None selected"}\n\nPrepared locally. This enquiry has not been sent.`;
    setSummary(text);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([summary], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "baulipa-enquiry.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div>
      <span className="eyebrow">Every good pool starts somewhere</span>
      <h2 id="enquiry-title">
        {summary ? "Your idea, on paper." : "Tell us what\nyou’re dreaming of."}
      </h2>
      {summary ? (
        <div className="enquiry-result">
          <p>Your enquiry is ready to save and share. It has not been sent.</p>
          <pre tabIndex="0">{summary}</pre>
          <div className="enquiry-result-actions">
            <button className="plain-action" onClick={download}>
              <DownloadSimple size={19} />
              Save enquiry
            </button>
            <button
              className="plain-action"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(summary);
                  onNotice("Enquiry copied to clipboard");
                } catch {
                  onNotice("Use Save enquiry to download your copy.");
                }
              }}
            >
              <Copy size={19} />
              Copy text
            </button>
          </div>
          <button className="text-link" onClick={() => setSummary("")}>
            Edit enquiry <ArrowLeft size={18} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="enquiry-form">
          <div className="form-row">
            <label>
              Your name
              <input name="name" autoComplete="name" required maxLength="120" />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength="254"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Project location
              <input
                name="location"
                autoComplete="address-level2"
                placeholder="City or area"
                maxLength="150"
              />
            </label>
            <label>
              I’m interested in
              <div className="select-wrap">
                <select
                  name="interest"
                  value={formInterest}
                  onChange={(e) => setFormInterest(e.target.value)}
                >
                  {Array.from(
                    new Set([
                      interest,
                      "A new swimming pool",
                      "Residential pools",
                      "Lap & leisure pools",
                      "Courtyard & plunge pools",
                      "Pool products and availability",
                      "Help choosing pool products",
                      "An existing pool",
                    ]),
                  ).map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                <CaretDown size={16} />
              </div>
            </label>
          </div>
          <label>
            A little about your idea
            <textarea
              name="message"
              rows="4"
              required
              maxLength="5000"
              placeholder="Your space, your plans, your favourite way to spend a summer…"
            />
          </label>
          {savedProducts.length > 0 && (
            <p className="form-shortlist">
              <Bag size={18} />
              {savedProducts.length} saved{" "}
              {savedProducts.length === 1 ? "product" : "products"} will be
              included.
            </p>
          )}
          <p className="form-note">
            Prepare and save your enquiry here. Online sending will be available
            when BAULIPA’s contact details are connected.
          </p>
          <Action>Prepare enquiry</Action>
        </form>
      )}
    </div>
  );
}

export default App;
