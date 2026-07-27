const icon = (...nodes) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${nodes.join("")}</svg>`;
const path = (d) => `<path d="${d}"></path>`;
const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
const rect = (x, y, width, height, rx) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${rx}"></rect>`;
const circle = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"></circle>`;
const polyline = (points) => `<polyline points="${points}"></polyline>`;

const github = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.96.1-.75.4-1.26.74-1.55-2.57-.29-5.27-1.28-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.38-5.29 5.67.42.36.79 1.06.79 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z"></path></svg>';
const coffee = icon(path("M18 8h1a3 3 0 0 1 0 6h-1"), path("M4 8h14v5a7 7 0 0 1-14 0Z"), line(6, 21, 16, 21), path("M8 3v2"), path("M12 2v3"), path("M16 3v2"));

export const iconMarkup = Object.freeze({
  bold: icon(path("M7 5h6a4 4 0 1 1 0 8H7z"), path("M7 13h8a4 4 0 1 1 0 8H7z")),
  italic: icon(line(19, 4, 10, 4), line(14, 20, 5, 20), line(15, 4, 9, 20)),
  underline: icon(path("M6 4v7a6 6 0 0 0 12 0V4"), line(4, 20, 20, 20)),
  strikethrough: icon(path("M16 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6"), line(4, 12, 20, 12)),
  link: icon(path("M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L12 9"), path("M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L12 15")),
  unlink: icon(path("M10 13a5 5 0 0 0 7.54.54l2.46-2.46"), path("M14 11a5 5 0 0 0-7.54-.54L4 13a5 5 0 0 0 7.07 7.07"), line(3, 3, 21, 21)),
  image: icon(rect(3, 4, 18, 16, 2), circle(8.5, 9, 1.5), path("m21 15-5-5L5 21")),
  video: icon(rect(3, 5, 14, 14, 2), polyline("17 10 22 7 22 17 17 14")),
  table: icon(rect(3, 4, 18, 16, 2), line(3, 10, 21, 10), line(3, 16, 21, 16), line(9, 4, 9, 20), line(15, 4, 15, 20)),
  ul: icon(circle(4, 7, 1), circle(4, 12, 1), circle(4, 17, 1), line(8, 7, 20, 7), line(8, 12, 20, 12), line(8, 17, 20, 17)),
  ol: icon(path("M4 7h1v4"), line(3, 11, 5, 11), path("M3 15h2l-2 4h2"), line(8, 7, 20, 7), line(8, 12, 20, 12), line(8, 17, 20, 17)),
  indent: icon(line(4, 6, 20, 6), line(10, 12, 20, 12), line(10, 18, 20, 18), polyline("4 12 8 16 8 8 4 12")),
  outdent: icon(line(4, 6, 20, 6), line(4, 12, 14, 12), line(4, 18, 20, 18), polyline("8 8 12 12 8 16")),
  alignleft: icon(line(4, 6, 20, 6), line(4, 10, 14, 10), line(4, 14, 20, 14), line(4, 18, 12, 18)),
  aligncenter: icon(line(4, 6, 20, 6), line(7, 10, 17, 10), line(4, 14, 20, 14), line(8, 18, 16, 18)),
  alignright: icon(line(4, 6, 20, 6), line(10, 10, 20, 10), line(4, 14, 20, 14), line(12, 18, 20, 18)),
  alignjustify: icon(line(4, 6, 20, 6), line(4, 10, 20, 10), line(4, 14, 20, 14), line(4, 18, 20, 18)),
  blockquote: icon(path("M7 8h4v5H7l2 4"), path("M15 8h4v5h-4l2 4")),
  code: icon(polyline("9 18 3 12 9 6"), polyline("15 6 21 12 15 18"), line(14, 4, 10, 20)),
  hr: icon(line(4, 12, 20, 12)),
  undo: icon(path("M9 7H4v5"), path("M4 12a8 8 0 1 1 2.34 5.66")),
  redo: icon(path("M15 7h5v5"), path("M20 12a8 8 0 1 0-2.34 5.66")),
  fullscreen: icon(polyline("8 3 3 3 3 8"), line(3, 3, 9, 9), polyline("16 3 21 3 21 8"), line(15, 9, 21, 3), polyline("3 16 3 21 8 21"), line(3, 21, 9, 15), polyline("16 21 21 21 21 16"), line(15, 15, 21, 21)),
  source: icon(polyline("8 18 2 12 8 6"), polyline("16 6 22 12 16 18"), line(14, 4, 10, 20)),
  copy: icon(rect(9, 9, 11, 11, 2), path("M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1")),
  paste: icon(path("M8 4h8"), rect(6, 3, 12, 18, 2), rect(9, 1, 6, 4, 1), line(9, 11, 15, 11), line(9, 15, 15, 15)),
  clearformat: icon(path("M5 5h14"), path("M7 5l5 14"), line(16, 13, 20, 17), line(20, 13, 16, 17)),
  wrap: icon(line(4, 6, 20, 6), line(4, 12, 16, 12), polyline("13 9 16 12 13 15"), line(4, 18, 10, 18)),
  braces: icon(polyline("10 5 6 12 10 19"), polyline("14 5 18 12 14 19")),
  palette: icon(path("M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.63-.29-1.23-.78-1.62A2.25 2.25 0 0 1 15 13.75h1.75A4.25 4.25 0 0 0 21 9.5C21 5.91 16.97 3 12 3z"), circle(7.5, 10.5, 0.8), circle(10.5, 7.5, 0.8), circle(15.5, 7.5, 0.8)),
  theme: icon(circle(12, 12, 4), path("M12 2v2"), path("M12 20v2"), path("m4.93 4.93 1.41 1.41"), path("m17.66 17.66 1.41 1.41"), path("M2 12h2"), path("M20 12h2"), path("m4.93 19.07 1.41-1.41"), path("m17.66 6.34 1.41-1.41")),
  github,
  coffee,
});
