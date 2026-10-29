"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./water-reflections.css";

/* Adapted from pulkitxm/claude-directory's Flowing Waves Shader (MIT).
   The original nine-pass cosine displacement is kept; rendering is scoped to
   this section and the palette is changed to pale pool-water reflections.
   Source and complete license: THIRD_PARTY_NOTICES.md. */

const VERTEX = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec3 u_paper;
  uniform vec3 u_water;
  uniform vec3 u_light;
  varying vec2 v_uv;

  void main() {
    vec2 uv = (2.0 * v_uv * u_resolution - u_resolution)
      / min(u_resolution.x, u_resolution.y);
    uv *= 1.65;
    float time = u_time * 0.13;

    // Flowing-waves displacement, adapted from the upstream shader.
    for (float i = 1.0; i < 10.0; i++) {
      uv.x += 0.6 / i * cos(i * 2.5 * uv.y + time);
      uv.y += 0.6 / i * cos(i * 1.5 * uv.x + time);
    }

    float band = abs(sin(time * 0.65 - uv.y - uv.x));
    float secondary = abs(sin(uv.x * 0.8 - uv.y * 1.1 + time * 0.3));
    float reflection = pow(1.0 - smoothstep(0.02, 0.19, band), 1.6);
    float depth = 0.07 + 0.22 * (1.0 - smoothstep(0.08, 0.75, secondary));
    vec3 water = mix(u_paper, u_water, depth);
    water = mix(water, u_light, reflection * 0.78);
    gl_FragColor = vec4(water, 1.0);
  }
`;

function parseHex(color: string): [number, number, number] {
  const value = color.trim().replace("#", "");
  return [0, 2, 4].map(
    (offset) => parseInt(value.slice(offset, offset + 2), 16) / 255,
  ) as [number, number, number];
}

export default function WaterReflections() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanupRenderer: (() => void) | undefined;
    let updatePlayback = () => {};
    let isNearViewport = false;

    function initialize() {
      if (!host) return;
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
      });
      if (!gl) {
        host.dataset.state = "fallback";
        return;
      }

      const shaders: WebGLShader[] = [];
      function compile(type: number, source: string) {
        const shader = gl!.createShader(type);
        if (!shader) return null;
        shaders.push(shader);
        gl!.shaderSource(shader, source);
        gl!.compileShader(shader);
        return gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)
          ? shader
          : null;
      }
      const vertex = compile(gl.VERTEX_SHADER, VERTEX);
      const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
      const program = gl.createProgram();
      if (!vertex || !fragment || !program) {
        shaders.forEach((shader) => gl.deleteShader(shader));
        if (program) gl.deleteProgram(program);
        host.dataset.state = "fallback";
        return;
      }
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        shaders.forEach((shader) => gl.deleteShader(shader));
        gl.deleteProgram(program);
        host.dataset.state = "fallback";
        return;
      }

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      gl.useProgram(program);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const resolution = gl.getUniformLocation(program, "u_resolution");
      const time = gl.getUniformLocation(program, "u_time");
      const paper = gl.getUniformLocation(program, "u_paper");
      const water = gl.getUniformLocation(program, "u_water");
      const light = gl.getUniformLocation(program, "u_light");
      let frame = 0;
      let elapsed = 4.2;
      let previousTime = 0;
      let lastPaint = 0;
      let contextLost = false;

      function paint() {
        if (contextLost) return;
        gl!.uniform1f(time, elapsed);
        gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      }
      function updatePalette() {
        const tokens = getComputedStyle(document.documentElement);
        const base = parseHex(tokens.getPropertyValue("--paper") || "#f8f9f7");
        const dark = base[0] < 0.5;
        gl!.uniform3fv(paper, base);
        gl!.uniform3fv(water, dark ? [0.11, 0.36, 0.4] : [0.48, 0.78, 0.88]);
        gl!.uniform3fv(light, dark ? [0.16, 0.31, 0.34] : [0.995, 1, 0.995]);
        paint();
      }
      function resize() {
        const width = Math.max(1, host!.clientWidth);
        const height = Math.max(1, host!.clientHeight);
        const scale = Math.min(
          window.devicePixelRatio || 1,
          1.25,
          1100 / width,
          750 / height,
        );
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        gl!.viewport(0, 0, canvas.width, canvas.height);
        gl!.uniform2f(resolution, canvas.width, canvas.height);
        paint();
      }
      function tick(timestamp: number) {
        if (!frame) return;
        if (!previousTime) previousTime = timestamp;
        elapsed += Math.min((timestamp - previousTime) / 1000, 0.1);
        previousTime = timestamp;
        // This slow ambient effect needs only 30 paints per second.
        if (timestamp - lastPaint >= 1000 / 30) {
          paint();
          lastPaint = timestamp;
        }
        frame = requestAnimationFrame(tick);
      }
      updatePlayback = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        if (contextLost) return;
        if (isNearViewport && !document.hidden && !motionQuery.matches) {
          host!.dataset.state = "running";
          frame = requestAnimationFrame(tick);
        } else {
          host!.dataset.state = motionQuery.matches ? "static" : "paused";
          paint();
        }
      };
      function onContextLost(event: Event) {
        event.preventDefault();
        contextLost = true;
        cancelAnimationFrame(frame);
        frame = 0;
        canvas.style.visibility = "hidden";
        host!.dataset.state = "fallback";
      }

      host.appendChild(canvas);
      updatePalette();
      resize();
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      const themeObserver = new MutationObserver(updatePalette);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      canvas.addEventListener("webglcontextlost", onContextLost);
      updatePlayback();

      cleanupRenderer = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        resizeObserver.disconnect();
        themeObserver.disconnect();
        canvas.removeEventListener("webglcontextlost", onContextLost);
        gl!.deleteBuffer(buffer);
        gl!.deleteProgram(program);
        shaders.forEach((shader) => gl!.deleteShader(shader));
        canvas.remove();
      };
    }

    function syncVisibility(active: boolean) {
      isNearViewport = active;
      if (active && !cleanupRenderer && host!.dataset.state !== "fallback")
        initialize();
      updatePlayback();
    }
    // Use the page's existing scroll engine so this respects its pinned gallery and deep links.
    const trigger = ScrollTrigger.create({
      trigger: host.parentElement ?? host,
      start: "top bottom+=120",
      end: "bottom top-=120",
      onToggle: (self) => syncVisibility(self.isActive),
      onRefresh: (self) => syncVisibility(self.isActive),
    });
    const onPlaybackChange = () => updatePlayback();
    document.addEventListener("visibilitychange", onPlaybackChange);
    motionQuery.addEventListener("change", onPlaybackChange);

    return () => {
      trigger.kill();
      document.removeEventListener("visibilitychange", onPlaybackChange);
      motionQuery.removeEventListener("change", onPlaybackChange);
      cleanupRenderer?.();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="water-reflections"
      aria-hidden="true"
      data-state="waiting"
    />
  );
}
