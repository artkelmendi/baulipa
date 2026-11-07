import React from "react";
import { createRoot } from "react-dom/client";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root");
const touchScroll = matchMedia("(hover: none) and (pointer: coarse)").matches;
const pageScroller = touchScroll ? root : null;

if (pageScroller) {
  document.documentElement.classList.add("touch-page-scroll");
  ScrollTrigger.defaults({ scroller: pageScroller });
}

createRoot(root).render(<App pageScroller={pageScroller} />);
