"use client";

import { useRef } from "react";
import gsap from "gsap";
import { currentScroll, useIsoLayoutEffect } from "@/lib/motion/scroll";
import { prefersReducedMotion } from "@/lib/motion/media";

const TEX_W = 1107;
const TEX_H = 1902;

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ the living figure (WebGL) */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/**
 * The supplied picture, brought to life:
 *  - the flames above the figure are advected upward by drifting noise, so they stream out of him
 *  - extra procedural flame tongues and rising embers add to what the photo already has
 *  - the sparkle outline of his body twinkles, and the body itself floats on a slow wave
 */
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;
uniform float uTime;
uniform float uLight;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float t = uTime;
  vec2 head = vec2(0.485, 0.485);

  // --- flames stream upward: drifting noise bends the picture above the chest
  float flameZone = smoothstep(0.58, 0.34, uv.y);
  vec2 flow = vec2(uv.x * 5.0, uv.y * 3.0 + t * 0.55);
  float n1 = fbm(flow);
  float n2 = fbm(flow * 1.7 + vec2(8.3, t * 0.8));
  vec2 bend = vec2(n1 - 0.5, n2 - 0.5) * flameZone * vec2(0.022, 0.032);

  // --- the body floats on its own slow wave
  float bodyZone = smoothstep(0.5, 0.6, uv.y);
  float floatY = (sin(t * 0.9) * 0.004 + sin(t * 0.37 + 1.3) * 0.003) * (0.4 + bodyZone);

  // a small, soft blur: five taps instead of one
  vec2 suv = uv + bend + vec2(0.0, floatY);
  float br = 0.0032;
  vec4 tex = texture2D(uTex, suv) * 0.36
    + (texture2D(uTex, suv + vec2(br, 0.0)) + texture2D(uTex, suv - vec2(br, 0.0))) * 0.16
    + (texture2D(uTex, suv + vec2(0.0, br * 0.7)) + texture2D(uTex, suv - vec2(0.0, br * 0.7))) * 0.16;
  vec3 rgb = tex.rgb;
  float a = tex.a;

  // --- the sparkle outline twinkles
  float lum = max(rgb.r, max(rgb.g, rgb.b));
  float tw = noise(uv * vec2(520.0, 900.0) + vec2(0.0, t * 1.7));
  float below = smoothstep(0.44, 0.54, uv.y);
  rgb *= 1.0 + 0.7 * smoothstep(0.35, 1.0, lum) * (tw - 0.5) * below;

  // --- extra flame tongues rising from the head, widening as they climb
  float dy = head.y - uv.y;
  float cone = smoothstep(-0.01, 0.06, dy) * exp(-dy * 1.45);
  float sway = (fbm(vec2(uv.y * 3.0, t * 0.4)) - 0.5) * 0.35 * dy;
  float dx = uv.x - head.x - sway;
  float halfW = 0.06 + max(dy, 0.0) * 0.7;
  float lateral = smoothstep(halfW, halfW * 0.15, abs(dx));
  float f1 = fbm(vec2(uv.x * 6.0, uv.y * 3.0 + t * 0.95));
  float streak = pow(smoothstep(0.32, 0.8, f1), 1.2);
  float fl = streak * cone * lateral;
  vec3 pal = 0.55 + 0.45 * cos(6.2832 * (vec3(0.0, 0.33, 0.67) + f1 * 0.8 + uv.x * 0.9 + t * 0.03));
  vec3 flameRGB = pal * fl * 0.7;
  float flameA = fl * 0.5;

  // --- embers climbing out of the flames
  vec2 gp = vec2(uv.x * 36.0, uv.y * 58.0 + t * 3.0);
  vec2 gi = floor(gp);
  vec2 gf = fract(gp);
  float h = hash(gi);
  float reach = smoothstep(0.34, 0.0, abs(uv.x - head.x)) * smoothstep(-0.02, 0.1, dy) * exp(-dy * 1.1);
  float on = step(0.955, h) * reach;
  vec2 c = vec2(0.5 + (hash(gi + 7.0) - 0.5) * 0.5 + sin(t * 1.3 + h * 20.0) * 0.18, 0.5);
  float d = length((gf - c) * vec2(1.0, 0.6));
  float ember = on * smoothstep(0.17, 0.0, d) * (0.6 + 0.4 * sin(t * 4.0 + h * 30.0));
  vec3 emberRGB = mix(vec3(1.0, 0.55, 0.25), vec3(1.0, 0.86, 0.62), hash(gi + 3.0)) * ember * 0.7;

  vec3 col = rgb + flameRGB + emberRGB;
  float alpha = clamp(a + flameA + ember * 0.7, 0.0, 1.0);
  // tame the white-hot core and soften the colour a touch
  col = col / (1.0 + 0.45 * col);
  col *= 1.12;
  col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, 0.88);

  // keep the picture's edges soft
  float edge = smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x) * smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.9, uv.y);
  col *= edge;
  alpha *= edge;

  // dark page: premultiplied colour above alpha reads as glowing light.
  // light page: keep it a normal blend so it never bleaches to white.
  vec3 lightCol = min(col * 0.92, vec3(alpha));
  col = mix(col, lightCol, uLight);

  gl_FragColor = vec4(col, alpha);
}`;

type FigureGL = { draw: (time: number, light: number) => void; dispose: () => void };

function createFigureGL(canvas: HTMLCanvasElement, image: HTMLImageElement): FigureGL | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);

  const uTime = gl.getUniformLocation(prog, "uTime");
  const uLight = gl.getUniformLocation(prog, "uLight");

  return {
    draw(time, light) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uLight, light);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/* ------------------------------------------------------------------ the layer */

/**
 * The aura figure, floating in the background of everything after the logo. It fades in as the
 * logo docks, then drifts upward over the whole length of the page while hovering — and the
 * flames stream out of him continuously. Without WebGL (or with reduced motion) it falls back to
 * the still picture.
 */
export function AuraFigure() {
  const root = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useIsoLayoutEffect(() => {
    const el = root.current;
    const im = img.current;
    const cv = canvas.current;
    if (!el || !im || !cv) return;
    const reduced = prefersReducedMotion();
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;

    let gl: FigureGL | null = null;
    let target: HTMLElement = im;
    let quality = small ? 0.5 : 0.72;
    const sizeBuffer = () => {
      const w = Math.round(1000 * quality);
      cv.width = w;
      cv.height = Math.round((w * TEX_H) / TEX_W);
    };
    sizeBuffer();

    let disposed = false;
    if (!reduced) {
      const pic = new Image();
      pic.src = "/aura/figure.webp";
      pic
        .decode()
        .then(() => {
          if (disposed) return;
          gl = createFigureGL(cv, pic);
          if (gl) {
            cv.style.display = "block";
            im.style.display = "none";
            target = cv;
          }
        })
        .catch(() => {
          /* keep the still picture */
        });
    }
    const onLost = (e: Event) => {
      e.preventDefault();
      gl = null;
      cv.style.display = "none";
      im.style.display = "block";
      target = im;
    };
    cv.addEventListener("webglcontextlost", onLost);

    let t = 0;
    let rise = 0;
    let lightV = document.documentElement.dataset.theme === "light" ? 1 : 0;
    let vh = window.innerHeight;
    let vw = document.documentElement.clientWidth;
    let max = 1;
    let frame = 0;
    let slow = 0;
    const measure = () => {
      vh = window.innerHeight;
      vw = document.documentElement.clientWidth;
      max = Math.max(1, document.documentElement.scrollHeight - vh);
    };
    measure();
    window.addEventListener("resize", measure);
    const poll = window.setInterval(measure, 2000); // content height settles as fonts/scenes lay out

    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(0.1, dtMs / 1000);
      t += dt;
      const y = currentScroll();
      // fade in after the logo has left the hero
      const fade = smooth(vh * 0.3, vh * 1.05, y);
      if (fade <= 0.001) {
        el.style.visibility = "hidden";
        return;
      }
      el.style.visibility = "visible";
      // ease off at the very end so the contact details stay easy to read
      const endDim = 1 - 0.62 * smooth(max - vh * 1.4, max - vh * 0.2, y);
      el.style.opacity = (fade * endDim).toFixed(3);

      // rise: low in the frame at the start of the page, high at the end of it
      const p = Math.min(1, Math.max(0, y / max));
      const targetY = reduced ? 0 : (0.2 - 0.4 * p) * vh;
      rise += (targetY - rise) * (1 - Math.exp(-dt * 2.4));
      // hover: a clear, slow float
      const bob = reduced ? 0 : Math.sin(t * 0.7) * vh * 0.017 + Math.sin(t * 0.29 + 0.8) * vh * 0.008;
      const sway = reduced ? 0 : Math.sin(t * 0.42 + 1.3) * vw * 0.007;
      const tilt = reduced ? 0 : Math.sin(t * 0.31) * 0.8;
      const grow = reduced ? 1 : 1 + Math.sin(t * 0.5) * 0.012;
      target.style.transform = `translate3d(${sway.toFixed(2)}px, ${(rise + bob).toFixed(2)}px, 0) rotate(${tilt.toFixed(3)}deg) scale(${grow.toFixed(4)})`;

      if (gl) {
        frame++;
        if (coarse && frame % 2) return; // 30 fps on touch screens
        const lightT = document.documentElement.dataset.theme === "light" ? 1 : 0;
        lightV += (lightT - lightV) * Math.min(1, dt * 3);
        gl.draw(t, lightV);
        // if the GPU is struggling, trade resolution for smoothness
        if (dtMs > (coarse ? 70 : 34)) slow++;
        else slow = Math.max(0, slow - 1);
        if (slow > 45 && quality > 0.45) {
          quality *= 0.8;
          sizeBuffer();
          slow = 0;
        }
      }
    };
    gsap.ticker.add(tick);
    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      cv.removeEventListener("webglcontextlost", onLost);
      gl?.dispose();
      window.removeEventListener("resize", measure);
      window.clearInterval(poll);
    };
  }, []);

  return (
    <div ref={root} className="aura-figure" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} className="aura-figure-img" src="/aura/figure.webp" alt="" decoding="async" draggable={false} />
      <canvas ref={canvas} className="aura-figure-img aura-figure-canvas" style={{ display: "none" }} />
    </div>
  );
}
