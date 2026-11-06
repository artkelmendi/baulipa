"use client";

import { useEffect, useRef, type RefObject } from "react";
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

const REFRACTION = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_image_aspect;
  uniform sampler2D u_image;
  varying vec2 v_uv;

  void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 cover = min(vec2(1.0), vec2(aspect / u_image_aspect, u_image_aspect / aspect));
    vec2 p = (v_uv - 0.5) * u_resolution / min(u_resolution.x, u_resolution.y);
    float time = u_time * 0.85;

    // Crossing wave fronts bend the sunlight patterns in different directions.
    float a = sin(dot(p, vec2(10.0, 13.0)) - time * 1.6);
    float b = sin(dot(p, vec2(-15.0, 7.0)) + time * 1.25 + 0.7 * a);
    float c = sin(dot(p, vec2(6.0, -21.0)) - time * 1.9);
    vec2 bend = vec2(a + 0.55 * b, b + 0.5 * c) * 0.017;
    bend *= min(u_resolution.x, u_resolution.y) / u_resolution;

    vec2 sampleUv = 0.5 + (v_uv - 0.5 + bend) * cover * 0.95;
    vec3 color = texture2D(u_image, sampleUv).rgb;
    float shimmer = smoothstep(0.48, 0.96, max(color.g, color.b));
    color *= 1.0 + shimmer * (0.08 * a + 0.05 * c);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function parseHex(color: string): [number, number, number] {
  const value = color.trim().replace("#", "");
  return [0, 2, 4].map(
    (offset) => parseInt(value.slice(offset, offset + 2), 16) / 255,
  ) as [number, number, number];
}

export default function WaterReflections({
  imageRef,
}: {
  imageRef?: RefObject<HTMLImageElement | null>;
} = {}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const image = imageRef?.current;

    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    let cleanupRenderer: (() => void) | undefined;
    let updatePlayback = () => {};
    let updateScroll = (_progress: number) => {};
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
      const fragment = compile(gl.FRAGMENT_SHADER, image ? REFRACTION : FRAGMENT);
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
      const texture = image ? gl.createTexture() : null;
      function releaseResources() {
        if (buffer) gl!.deleteBuffer(buffer);
        if (texture) gl!.deleteTexture(texture);
        gl!.deleteProgram(program);
        shaders.forEach((shader) => gl!.deleteShader(shader));
      }
      if (!buffer || (image && !texture)) {
        releaseResources();
        host.dataset.state = "fallback";
        return;
      }

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
      if (image) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if (gl.getError() !== gl.NO_ERROR) {
          releaseResources();
          host.dataset.state = "fallback";
          return;
        }
        gl.uniform1f(
          gl.getUniformLocation(program, "u_image_aspect"),
          image.naturalWidth / image.naturalHeight,
        );
      }
      let frame = 0;
      let elapsed = image ? 0 : 4.2;
      let passStart = elapsed;
      let scrollOffset = 0;
      let previousTime = 0;
      let lastPaint = 0;
      let contextLost = false;

      function paint() {
        if (contextLost) return;
        gl!.uniform1f(time, elapsed + scrollOffset);
        gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      }
      function updatePalette() {
        if (image) return;
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
        if (timestamp - lastPaint >= 30) {
          paint();
          lastPaint = timestamp;
        }
        // The photographed water gets one short shimmer as it comes into view.
        if (image && elapsed - passStart >= 4.8) {
          host!.dataset.state = "still";
          frame = 0;
          return;
        }
        frame = requestAnimationFrame(tick);
      }
      updatePlayback = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        if (contextLost) return;
        if (isNearViewport && !document.hidden && !motionQuery.matches) {
          passStart = elapsed;
          host!.dataset.state = "running";
          frame = requestAnimationFrame(tick);
        } else {
          host!.dataset.state = motionQuery.matches ? "static" : "paused";
          paint();
        }
      };
      if (image) {
        updateScroll = (progress) => {
          if (!isNearViewport || document.hidden || motionQuery.matches) return;
          scrollOffset = progress * 4;
          if (!frame) paint();
        };
      }
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

      cleanupRenderer = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        resizeObserver.disconnect();
        themeObserver.disconnect();
        canvas.removeEventListener("webglcontextlost", onContextLost);
        releaseResources();
        canvas.remove();
      };
    }

    function syncVisibility(active: boolean) {
      isNearViewport = active;
      if (
        active &&
        !cleanupRenderer &&
        host!.dataset.state !== "fallback" &&
        (!image ||
          (image.complete &&
            image.naturalWidth > 0 &&
            !motionQuery.matches &&
            !document.hidden))
      )
        initialize();
      updatePlayback();
    }
    // Use the page's existing scroll engine so this respects its pinned gallery and deep links.
    const trigger = ScrollTrigger.create({
      trigger: host.parentElement ?? host,
      start: image ? "top 92%" : "top bottom+=120",
      end: image ? "bottom 8%" : "bottom top-=120",
      onToggle: (self) => syncVisibility(self.isActive),
      onRefresh: (self) => syncVisibility(self.isActive),
      onUpdate: image ? (self) => updateScroll(self.progress) : undefined,
    });
    const onPlaybackChange = () => syncVisibility(isNearViewport);
    image?.addEventListener("load", onPlaybackChange);
    document.addEventListener("visibilitychange", onPlaybackChange);
    motionQuery.addEventListener("change", onPlaybackChange);

    return () => {
      trigger.kill();
      image?.removeEventListener("load", onPlaybackChange);
      document.removeEventListener("visibilitychange", onPlaybackChange);
      motionQuery.removeEventListener("change", onPlaybackChange);
      cleanupRenderer?.();
    };
  }, [imageRef]);

  return (
    <div
      ref={hostRef}
      className="water-reflections"
      aria-hidden="true"
      data-state="waiting"
    />
  );
}
