function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) {
            elmnt.innerHTML = this.responseText;
          }
          if (this.status == 404) {
            elmnt.innerHTML = "Page not found.";
          }
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      };
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}

function swatches({
  color,
  columns = null,
  format = (x) => x,
  swatchSize = 15,
  swatchWidth = swatchSize,
  swatchHeight = swatchSize,
  marginLeft = 0,
}) {
  const id = "legend";

  if (columns !== null)
    return `<div
      style="display: flex; align-items: center; margin-left: ${+marginLeft}px; min-height: 33px; font: 10px sans-serif;"
    >
      <style>
        .${id}-item {
          break-inside: avoid;
          display: flex;
          align-items: center;
          padding-bottom: 1px;
        }

        .${id}-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: calc(100% - ${+swatchWidth}px - 0.5em);
        }

        .${id}-swatch {
          width: ${+swatchWidth}px;
          height: ${+swatchHeight}px;
          margin: 0 0.5em 0 0;
        }
      </style>
      <div style="width: 100%; columns: ${columns};">
        ${color.domain().map((value) => {
          const label = format(value);
          return `<div class="${id}-item">
            <div class="${id}-swatch" style="background:${color(value)};"></div>
            <div class="${id}-label" title="${label}">
              ${label}
            </div>
          </div>`;
        })}
      </div>
    </div>`;

  return html`<div
    style="display: flex; align-items: center; min-height: 33px; margin-left: ${+marginLeft}px; font: 10px sans-serif;"
  >
    <style>
      .${id} {
        display: inline-flex;
        align-items: center;
        margin-right: 1em;
      }

      .${id}::before {
        content: "";
        width: ${+swatchWidth}px;
        height: ${+swatchHeight}px;
        margin-right: 0.5em;
        background: var(--color);
      }
    </style>
    <div>
      ${color
        .domain()
        .map(
          (value) =>
            html`<span class="${id}" style="--color: ${color(value)}"
              >${format(value)}</span
            >`
        )}
    </div>
  </div>`;
}

var Months = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const map1_color = d3.interpolateRgb("yellow", "red");
const map2_color = d3.interpolateRgb("#C5DED7", "#215c51");

const color = {
  Asia: 0,
  Europe: 1,
  Africa: 2,
  "North America": 3,
  "South America": 4,
  Oceania: 5,
};

const ContColor = [
  "#E03426",
  "#FC719E",
  "#CE69BE",
  "#1BA3C6",
  "#F89218",
  "#A3B627",
];

const ContColorDict = {
  Asia: "#E03426",
  "North America": "#FC719E",
  "South America": "#CE69BE",
  Europe: "#1BA3C6",
  Africa: "#F89218",
  Oceania: "#A3B627",
};

const legend_html = swatches({
  color: d3.scaleOrdinal(
    ["Asia", "North America", "South America", "Europe", "Africa", "Oceania"],
    ContColor
  ),
  columns: "180px",
});
