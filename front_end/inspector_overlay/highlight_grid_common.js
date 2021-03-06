// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

//  Copyright (C) 2012 Google Inc. All rights reserved.

//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions
//  are met:

//  1.  Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//  2.  Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//  3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
//      its contributors may be used to endorse or promote products derived
//      from this software without specific prior written permission.

//  THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
//  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//  DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
//  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
//  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
//  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
//  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
//  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


// @ts-nocheck
// TODO(crbug.com/1011811): Enable TypeScript compiler checks

import {drawGridLabels} from './css_grid_label_helpers.js';
import {buildPath, drawHorizontalRulers, drawVerticalRulers, emptyBounds} from './highlight_common.js';

export const gridStyle = `
/* Grid row and column labels */
.grid-label-content {
  position: absolute;
  z-index: 10;
  -webkit-user-select: none;
}

.grid-label-content {
  background-color: #1A73E8;
  padding: 2px;
  font-family: Menlo, monospace;
  font-size: 10px;
  min-width: 17px;
  min-height: 15px;
  color: #FFFFFF;
  border-radius: 2px;
  box-sizing: border-box;
  z-index: 1;
  background-clip: padding-box;
  pointer-events: none;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.line-names ul,
.line-names .line-name {
  margin: 0;
  padding: 0;
  list-style: none;
}

.line-names .line-name {
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.line-names .grid-label-content,
.line-numbers .grid-label-content,
.track-sizes .grid-label-content {
  border: 1px solid white;
  --inner-corner-avoid-distance: 15px;
}

.grid-label-content.top-left.inner-shared-corner,
.grid-label-content.top-right.inner-shared-corner {
  transform: translateY(var(--inner-corner-avoid-distance));
}

.grid-label-content.bottom-left.inner-shared-corner,
.grid-label-content.bottom-right.inner-shared-corner {
  transform: translateY(calc(var(--inner-corner-avoid-distance) * -1));
}

.grid-label-content.left-top.inner-shared-corner,
.grid-label-content.left-bottom.inner-shared-corner {
  transform: translateX(var(--inner-corner-avoid-distance));
}

.grid-label-content.right-top.inner-shared-corner,
.grid-label-content.right-bottom.inner-shared-corner {
  transform: translateX(calc(var(--inner-corner-avoid-distance) * -1));
}

.line-names .grid-label-content::before,
.line-numbers .grid-label-content::before,
.track-sizes .grid-label-content::before {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  content: "";
  background: #1A73E8;
  width: 3px;
  height: 3px;
  border: 1px solid white;
  border-width: 0 1px 1px 0;
}

.grid-label-content.bottom-mid::before {
  transform: translateY(-1px) rotate(45deg);
  top: 100%;
}

.grid-label-content.top-mid::before {
  transform: translateY(-3px) rotate(-135deg);
  top: 0%;
}

.grid-label-content.left-mid::before {
  transform: translateX(-3px) rotate(135deg);
  left: 0%
}

.grid-label-content.right-mid::before {
  transform: translateX(3px) rotate(-45deg);
  right: 0%;
}

.grid-label-content.right-top::before {
  transform: translateX(3px) translateY(-1px) rotate(-90deg) skewY(30deg);
  right: 0%;
  top: 0%;
}

.grid-label-content.right-bottom::before {
  transform: translateX(3px) translateY(-3px) skewX(30deg);
  right: 0%;
  top: 100%;
}

.grid-label-content.bottom-right::before {
  transform:  translateX(1px) translateY(-1px) skewY(30deg);
  right: 0%;
  top: 100%;
}

.grid-label-content.bottom-left::before {
  transform:  translateX(-1px) translateY(-1px) rotate(90deg) skewX(30deg);
  left: 0%;
  top: 100%;
}

.grid-label-content.left-top::before {
  transform: translateX(-3px) translateY(-1px) rotate(180deg) skewX(30deg);
  left: 0%;
  top: 0%;
}

.grid-label-content.left-bottom::before {
  transform: translateX(-3px) translateY(-3px) rotate(90deg) skewY(30deg);
  left: 0%;
  top: 100%;
}

.grid-label-content.top-right::before {
  transform:  translateX(1px) translateY(-3px) rotate(-90deg) skewX(30deg);
  right: 0%;
  top: 0%;
}

.grid-label-content.top-left::before {
  transform:  translateX(-1px) translateY(-3px) rotate(180deg) skewY(30deg);
  left: 0%;
  top: 0%;
}

@media (forced-colors: active) {
  .grid-label-content {
      border-color: Highlight;
      background-color: Canvas;
      color: Text;
      forced-color-adjust: none;
  }
  .grid-label-content::before {
    background-color: Canvas;
    border-color: Highlight;
  }
}`;

export function drawLayoutGridHighlight(highlight, context) {
  // Draw Grid border
  const gridBounds = emptyBounds();
  const gridPath = buildPath(highlight.gridBorder, gridBounds);
  if (highlight.gridHighlightConfig.gridBorderColor) {
    context.save();
    context.translate(0.5, 0.5);
    context.lineWidth = 0;
    if (highlight.gridHighlightConfig.gridBorderDash) {
      context.setLineDash([3, 3]);
    }
    context.strokeStyle = highlight.gridHighlightConfig.gridBorderColor;
    context.stroke(gridPath);
    context.restore();
  }

  // Draw grid lines
  _drawGridLines(context, highlight, 'row');
  _drawGridLines(context, highlight, 'column');

  // Draw gaps
  _drawGridGap(
      context, highlight.rowGaps, highlight.gridHighlightConfig.rowGapColor,
      highlight.gridHighlightConfig.rowHatchColor, highlight.rotationAngle, /* flipDirection */ true);
  _drawGridGap(
      context, highlight.columnGaps, highlight.gridHighlightConfig.columnGapColor,
      highlight.gridHighlightConfig.columnHatchColor, highlight.rotationAngle);

  // Draw named grid areas
  const areaBounds = _drawGridAreas(context, highlight.areaNames, highlight.gridHighlightConfig.areaBorderColor);

  // Draw all the labels
  drawGridLabels(highlight, gridBounds, areaBounds);
}

function _drawGridLines(context, highlight, direction) {
  const tracks = highlight[`${direction}s`];
  const color = highlight.gridHighlightConfig[`${direction}LineColor`];
  const dash = highlight.gridHighlightConfig[`${direction}LineDash`];
  const extensionLines = highlight.gridHighlightConfig.showGridExtensionLines;

  if (!color) {
    return;
  }

  const bounds = emptyBounds();
  const path = buildPath(tracks, bounds);

  context.save();
  context.translate(0.5, 0.5);
  if (dash) {
    context.setLineDash([3, 3]);
  }
  context.lineWidth = 0;
  context.strokeStyle = color;

  context.save();
  context.stroke(path);
  context.restore();

  context.restore();

  if (extensionLines) {
    if (direction === 'row') {
      // Draw left and right of the rows.
      drawHorizontalRulers(context, bounds, /* rulerAtRight */ false, /* default color */ undefined, dash);
      drawHorizontalRulers(context, bounds, /* rulerAtRight */ true, /* default color */ undefined, dash);
    } else {
      // Draw above and below the columns.
      drawVerticalRulers(context, bounds, /* rulerAtBottom */ false, /* default color */ undefined, dash);
      drawVerticalRulers(context, bounds, /* rulerAtBottom */ true, /* default color */ undefined, dash);
    }
  }
}

/**
 * Draw all of the named grid area paths. This does not draw the labels, as
 * placing labels in and around the grid for various things is handled later.
 *
 * @param {CanvasRenderingContext2D} context
 * @param {AreaPaths} areas
 * @param {string} borderColor
 * @return {AreaBounds[]} The list of area names and their associated bounds.
 */
function _drawGridAreas(context, areas, borderColor) {
  if (!areas || !Object.keys(areas).length) {
    return [];
  }

  context.save();
  if (borderColor) {
    context.strokeStyle = borderColor;
  }
  context.lineWidth = 2;

  const areaBounds = [];

  for (const name in areas) {
    const areaCommands = areas[name];

    const bounds = emptyBounds();
    const path = buildPath(areaCommands, bounds);

    context.stroke(path);

    areaBounds.push({name, bounds});
  }

  context.restore();

  return areaBounds;
}

function _drawGridGap(context, gapCommands, gapColor, hatchColor, rotationAngle, flipDirection) {
  if (!gapColor && !hatchColor) {
    return;
  }

  context.save();
  context.translate(0.5, 0.5);
  context.lineWidth = 0;

  const bounds = emptyBounds();
  const path = buildPath(gapCommands, bounds);

  // Fill the gap background if needed.
  if (gapColor) {
    context.fillStyle = gapColor;
    context.fill(path);
  }

  // And draw the hatch pattern if needed.
  if (hatchColor) {
    _hatchFillPath(context, path, bounds, /* delta */ 10, hatchColor, rotationAngle, flipDirection);
  }
  context.restore();
}

/**
 * Draw line hatching at a 45 degree angle for a given
 * path.
 *   __________
 *   |\  \  \ |
 *   | \  \  \|
 *   |  \  \  |
 *   |\  \  \ |
 *   **********
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Path2D} path
 * @param {Object} bounds
 * @param {number} delta - vertical gap between hatching lines in pixels
 * @param {string} color
 * @param {number} rotationAngle
 * @param {boolean=} flipDirection - lines are drawn from top right to bottom left
 */
function _hatchFillPath(context, path, bounds, delta, color, rotationAngle, flipDirection) {
  const dx = bounds.maxX - bounds.minX;
  const dy = bounds.maxY - bounds.minY;
  context.rect(bounds.minX, bounds.minY, dx, dy);
  context.save();
  context.clip(path);
  context.setLineDash([5, 3]);
  const majorAxis = Math.max(dx, dy);
  context.strokeStyle = color;
  const centerX = bounds.minX + dx / 2;
  const centerY = bounds.minY + dy / 2;
  context.translate(centerX, centerY);
  context.rotate(rotationAngle * Math.PI / 180);
  context.translate(-centerX, -centerY);
  if (flipDirection) {
    for (let i = -majorAxis; i < majorAxis; i += delta) {
      context.beginPath();
      context.moveTo(bounds.maxX - i, bounds.minY);
      context.lineTo(bounds.maxX - dy - i, bounds.maxY);
      context.stroke();
    }
  } else {
    for (let i = -majorAxis; i < majorAxis; i += delta) {
      context.beginPath();
      context.moveTo(i + bounds.minX, bounds.minY);
      context.lineTo(dy + i + bounds.minX, bounds.maxY);
      context.stroke();
    }
  }
  context.restore();
}
