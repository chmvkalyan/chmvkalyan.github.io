var width = 1560,
  height = 960,
  svg = d3
    .select("#us")
    .append("div")
    .style("margin", "0%")
    .style("margin-top", "2%")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 960 300"),
  projection = d3.geoAlbersUsa(),
  path = d3.geoPath().projection(projection);
function ready(e, t, s) {
  drawMap(t, s);

  // Draw Annotations
  //arrow for annotation
  const annots = svg.append("g").attr("class", "annotations");

  annots
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "triangle")
    .attr("refX", 10)
    .attr("refY", 6)
    .attr("markerWidth", 500)
    .attr("markerHeight", 500)
    .attr("markerUnits", "userSpaceOnUse")
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 12 6 0 12 3 6")
    .style("fill", "black");

  // //line for annotation
  annots
    .append("line")
    .attr("x2", 640)
    .attr("y2", 430)
    .attr("x1", 520)
    .attr("y1", 545)
    .attr("stroke-width", 2)
    .attr("stroke", "black")
    .attr("marker-end", "url(#triangle)");

  // text for annotation
  annots
    .append("text")
    .attr("x", 350)
    .attr("y", 560)
    .attr("font-family", "Trebuchet MS")
    .attr("font-size", 11)
    .style("fill", "black")
    .text(
      "The situation in the States under South Atlantic, and South Central Census Divisions is highly vulnerable,"
    );

  annots
    .append("text")
    .attr("x", 350)
    .attr("y", 575)
    .attr("font-family", "Trebuchet MS")
    .attr("font-size", 11)
    .style("fill", "black")
    .text("as they have the most number of extremely high risk counties.");
}
function drawMap(e, t) {
  var s = d3
      .scaleThreshold()
      //   .domain(["10", "20", "30", "40", "50"])
      .domain([2, 5, 15, 45, 1000])
      .range(["#A4C96F", "#F0C300", "#FF8104", "#E03320", "#930E6E"]),
    a = {},
    n = {
      "#A4C96F": "LOW",
      "#F0C300": "MODERATE",
      "#FF8104": "HIGH",
      "#E03320": "VERY HIGH",
      "#930E6E": "EXTREMELY HIGH",
    },
    t = d3
      .nest()
      .key(function (e) {
        return e.date;
      })
      .key(function (e) {
        return e.county;
      })
      .entries(t),
    o = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("height", "180px")
      .style("width", "250px");
  o.append("div"),
    (d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    }),
    (d3.selection.prototype.moveToBack = function () {
      return this.each(function () {
        var e = this.parentNode.firstChild;
        e && this.parentNode.insertBefore(this, e);
      });
    }),
    t.forEach(function (e) {
      e.values.forEach(function (e) {
        a[e.values[0].county] = {
          casesAvg: e.values[0].cases_avg,
          casesAvgPer100k: e.values[0].cases_avg_per_100k,
          stateName: e.values[0].state,
        };
      });
    }),
    svg
      .append("g")
      .attr("class", "county")
      .selectAll("path")
      .data(topojson.feature(e, e.objects.counties).features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", function (e) {
        if (a.hasOwnProperty(e.id)) return s(a[e.id].casesAvgPer100k);
      })
      .style("opacity", 0.8)
      .on("mouseover", function (e) {
        d3.select(this).moveToFront(),
          o.transition().duration(300).style("opacity", 1),
          o
            .select("div")
            .html(
              "<h5>" +
                e.properties.name +
                ", " +
                a[e.id].stateName +
                '.</h5><p style="background-color:' +
                s(a[e.id].casesAvgPer100k) +
                '">' +
                n[s(a[e.id].casesAvgPer100k)] +
                '</p><span class="case-heading">AVG. CASES/DAY</span><span class="case-heading">PER 100,000</span><hr /><span>' +
                a[e.id].casesAvg +
                "</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
                a[e.id].casesAvgPer100k +
                "</span>"
            ),
          o
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 30 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).moveToBack(),
          o.select("svg").select("g").select("g").remove(),
          o.transition().duration(300).style("opacity", 0);
      });
}
queue()
  .defer(d3.json, "../data/counties-10m.json")
  .defer(d3.csv, "../data/risk-level-data.csv")
  .await(ready);
