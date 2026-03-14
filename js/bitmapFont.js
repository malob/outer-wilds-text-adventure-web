// bitmapFont.js - Processing .vlw bitmap font parser and renderer
//
// No .pde counterpart — this is new code for the web port.
// Processing natively renders .vlw bitmap fonts via textFont()/text(). p5.js has no
// .vlw support, so this file parses the binary font format and renders glyph images
// directly, producing pixel-perfect output matching the original.

class BitmapFont {
  // Accepts pre-parsed font data (from tools/convert-assets.js) rather than raw .vlw bytes.
  // Glyph pixel data is stored as alpha arrays and converted to p5 images at init time.
  constructor(fontData) {
    this.glyphs = {};
    this.fontSize = fontData.fontSize;
    this.ascent = fontData.ascent;
    this.descent = fontData.descent;

    for (let i = 0; i < fontData.glyphs.length; i++) {
      const g = fontData.glyphs[i];

      let img = null;
      if (g.width > 0 && g.height > 0) {
        img = createImage(g.width, g.height);
        img.loadPixels();
        for (let p = 0; p < g.alphas.length; p++) {
          const idx = p * 4;
          img.pixels[idx] = 255;       // R
          img.pixels[idx + 1] = 255;   // G
          img.pixels[idx + 2] = 255;   // B
          img.pixels[idx + 3] = g.alphas[p]; // A
        }
        img.updatePixels();
      }

      this.glyphs[g.value] = {
        img: img,
        width: g.width,
        height: g.height,
        setWidth: g.setWidth,
        topExtent: g.topExtent,
        leftExtent: g.leftExtent
      };
    }
  }

  getGlyph(charCode) {
    return this.glyphs[charCode] || null;
  }

  // Returns a pre-tinted canvas for a glyph at a specific color.
  // Cached per glyph+color so tinting only happens once, not every frame.
  // This avoids p5.js's expensive tint() which creates a temp canvas per image() call.
  getColoredCanvas(glyph, colorKey, r, g, b) {
    if (!glyph._colorCache) glyph._colorCache = {};
    if (glyph._colorCache[colorKey]) return glyph._colorCache[colorKey];

    const w = glyph.width;
    const h = glyph.height;
    const cvs = document.createElement('canvas');
    cvs.width = w;
    cvs.height = h;
    const ctx = cvs.getContext('2d');

    // Draw the original white-with-alpha glyph
    ctx.drawImage(glyph.img.canvas, 0, 0);

    // Multiply with the desired color (replaces white with the color, preserves alpha)
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(0, 0, w, h);

    glyph._colorCache[colorKey] = cvs;
    return cvs;
  }

  getLineHeight() {
    return this.ascent + this.descent;
  }

  measureCharWidth(charCode, renderSize) {
    const g = this.glyphs[charCode];
    if (!g) return renderSize * 0.5;
    const scale = renderSize / this.fontSize;
    return g.setWidth * scale;
  }

  measureStringWidth(str, renderSize) {
    let w = 0;
    for (let i = 0; i < str.length; i++) {
      w += this.measureCharWidth(str.charCodeAt(i), renderSize);
    }
    return w;
  }
}

// ---- Global bitmap text system ----

const BitmapText = {
  fonts: {},          // keyed by fontSize (e.g. 14, 18)
  activeFont: null,
  currentSize: 14,
  currentHAlign: null,   // set in init() after p5.js is ready
  currentVAlign: null,
  fillColor: null,
  enabled: false,

  init() {
    this.currentHAlign = LEFT;
    this.currentVAlign = BASELINE;
    this.fillColor = color(0, 0, 100);
    this.enabled = true;
  },

  // Read alignment and size from p5's renderer to stay in sync after pop()
  _getHAlign() {
    return window._renderer ? window._renderer._textAlign : this.currentHAlign;
  },

  _getVAlign() {
    return window._renderer ? window._renderer._textBaseline : this.currentVAlign;
  },

  _getSize() {
    return window._renderer ? window._renderer._textSize : this.currentSize;
  },

  registerFont(sizePx, font) {
    this.fonts[sizePx] = font;
  },

  setFont(sizePx) {
    this.activeFont = this.fonts[sizePx] || null;
    this.currentSize = sizePx;
  },

  drawText(str, x, y, boxW, boxH) {
    if (!this.activeFont || !this.enabled) return;

    const font = this.activeFont;
    const renderSize = this._getSize();
    const hAlign = this._getHAlign();
    const vAlign = this._getVAlign();
    const scale = renderSize / font.fontSize;
    const lineH = font.getLineHeight() * scale;

    // Extract RGB from the current fill color for pre-tinted glyph caching.
    // This avoids p5.js's tint() which creates a temp canvas per image() call.
    let r = 255, g = 255, b = 255;
    let colorKey = 'fff';
    if (this.fillColor) {
      r = Math.round(red(this.fillColor));
      g = Math.round(green(this.fillColor));
      b = Math.round(blue(this.fillColor));
      colorKey = r.toString(16) + g.toString(16) + b.toString(16);
    }

    // Save canvas state for imageSmoothingEnabled and imageMode
    const ctx = drawingContext;
    const prevSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    if (boxW !== undefined && boxH !== undefined) {
      this._drawWrapped(str, x, y, boxW, boxH, font, renderSize, scale, lineH, hAlign, vAlign, colorKey, r, g, b);
    } else {
      this._drawSingleBlock(str, x, y, font, renderSize, scale, lineH, hAlign, vAlign, colorKey, r, g, b);
    }

    ctx.imageSmoothingEnabled = prevSmoothing;
  },

  _drawSingleBlock(str, x, y, font, renderSize, scale, lineH, hAlign, vAlign, colorKey, r, g, b) {
    const lines = String(str).split('\n');

    // Compute total block height for vertical alignment
    const totalH = lines.length * lineH;

    let startY;
    if (vAlign === CENTER) {
      startY = y - totalH / 2 + font.ascent * scale;
    } else if (vAlign === BOTTOM) {
      startY = y - totalH + font.ascent * scale;
    } else if (vAlign === TOP) {
      startY = y + font.ascent * scale;
    } else {
      // BASELINE
      startY = y;
    }

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const lineW = font.measureStringWidth(line, renderSize);

      let startX;
      if (hAlign === CENTER) {
        startX = x - lineW / 2;
      } else if (hAlign === RIGHT) {
        startX = x - lineW;
      } else {
        startX = x;
      }

      this._renderLine(line, startX, startY + li * lineH, font, scale, colorKey, r, g, b);
    }
  },

  _drawWrapped(str, x, y, boxW, boxH, font, renderSize, scale, lineH, hAlign, vAlign, colorKey, r, g, b) {
    // Word-wrap text into the box, matching Processing's text(str, x, y, w, h)
    const words = String(str).split(/(\s+)/);
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Handle explicit newlines within tokens
      const parts = word.split('\n');
      for (let p = 0; p < parts.length; p++) {
        if (p > 0) {
          lines.push(currentLine);
          currentLine = '';
        }
        const testLine = currentLine + parts[p];
        const testW = font.measureStringWidth(testLine, renderSize);
        if (testW > boxW && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = parts[p];
        } else {
          currentLine = testLine;
        }
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Vertical alignment within box
    const totalH = lines.length * lineH;
    let startY;
    if (vAlign === CENTER) {
      startY = y + (boxH - totalH) / 2 + font.ascent * scale;
    } else if (vAlign === BOTTOM) {
      startY = y + boxH - totalH + font.ascent * scale;
    } else {
      // TOP or BASELINE - start from top of box
      startY = y + font.ascent * scale;
    }

    for (let li = 0; li < lines.length; li++) {
      const lineY = startY + li * lineH;
      // Stop if we go beyond the box
      if (lineY - font.ascent * scale > y + boxH) break;

      const line = lines[li];
      const lineW = font.measureStringWidth(line, renderSize);

      let startX;
      if (hAlign === CENTER) {
        startX = x + (boxW - lineW) / 2;
      } else if (hAlign === RIGHT) {
        startX = x + boxW - lineW;
      } else {
        startX = x;
      }

      this._renderLine(line, startX, lineY, font, scale, colorKey, r, g, b);
    }
  },

  _renderLine(line, startX, baselineY, font, scale, colorKey, r, g, b) {
    const ctx = drawingContext;
    let cx = startX;
    for (let i = 0; i < line.length; i++) {
      const code = line.charCodeAt(i);
      const glyph = font.getGlyph(code);
      if (glyph && glyph.img) {
        const dx = cx + glyph.leftExtent * scale;
        const dy = baselineY - glyph.topExtent * scale;
        const dw = glyph.width * scale;
        const dh = glyph.height * scale;
        // Use pre-tinted cached canvas instead of p5's tint() + image()
        const colored = font.getColoredCanvas(glyph, colorKey, r, g, b);
        ctx.drawImage(colored, dx, dy, dw, dh);
      }
      if (glyph) {
        cx += glyph.setWidth * scale;
      } else {
        cx += font.fontSize * 0.5 * scale;
      }
    }
  }
};

// ---- Override p5 text functions ----

function setupBitmapTextOverrides() {
  const origText = window.text;
  const origTextWidth = window.textWidth;
  const origTextSize = window.textSize;
  const origTextAlign = window.textAlign;
  const origFill = window.fill;

  window.text = function(str, x, y, w, h) {
    if (BitmapText.enabled && BitmapText.activeFont) {
      if (w !== undefined && h !== undefined) {
        BitmapText.drawText(str, x, y, w, h);
      } else {
        BitmapText.drawText(str, x, y);
      }
    } else {
      if (w !== undefined && h !== undefined) {
        origText.call(window, str, x, y, w, h);
      } else {
        origText.call(window, str, x, y);
      }
    }
  };

  window.textWidth = function(str) {
    if (BitmapText.enabled && BitmapText.activeFont) {
      return BitmapText.activeFont.measureStringWidth(String(str), BitmapText.currentSize);
    }
    return origTextWidth.call(window, str);
  };

  window.textSize = function(s) {
    origTextSize.call(window, s);
    if (BitmapText.enabled) {
      BitmapText.currentSize = s;
    }
  };

  window.textAlign = function(h, v) {
    origTextAlign.call(window, h, v);
    if (BitmapText.enabled) {
      BitmapText.currentHAlign = h;
      if (v !== undefined) {
        BitmapText.currentVAlign = v;
      }
    }
  };

  window.fill = function() {
    origFill.apply(window, arguments);
    if (BitmapText.enabled) {
      // Convert arguments to a p5 color
      if (arguments.length === 1 && typeof arguments[0] === 'object') {
        BitmapText.fillColor = arguments[0];
      } else {
        BitmapText.fillColor = color.apply(window, arguments);
      }
    }
  };

}
