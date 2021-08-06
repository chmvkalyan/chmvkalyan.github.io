var width = 1560,
  height = 960,
  svg = d3
    .select("#us")
    .append("div")
    .style("margin-left", "0%")
    .style("margin-top", "0%")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 960 360"),
  projection = d3.geoAlbersUsa(),
  path = d3.geoPath().projection(projection);
function ready(t, e, a) {
  drawMap(e, a), drawBar();
}
function drawMap(t, e) {
  var a = [20, 40, 60, 80, 100],
    n = ["20", "40", "60", "80", "100"],
    r = d3
      .scaleOrdinal()
      .range(["#B6D6CD", "#92BDB2", "#70A397", "#4F8B7D", "#2E7265"]),
    s = {},
    l = {},
    u = {},
    e = d3
      .nest()
      .key(function (t) {
        return t.Date;
      })
      .key(function (t) {
        return t.FIPS;
      })
      .entries(e),
    o = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("height", "150px")
      .style("width", "220px");
  o.append("svg").append("g"),
    (d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this);
      });
    }),
    (d3.selection.prototype.moveToBack = function () {
      return this.each(function () {
        var t = this.parentNode.firstChild;
        t && this.parentNode.insertBefore(this, t);
      });
    }),
    e.forEach(function (t) {
      t.values.forEach(function (t) {
        let e = 0,
          a = 0,
          n = 0;
        t.values[0].Administered_Dose1_Recip_12Plus &&
          (e = parseInt(t.values[0].Administered_Dose1_Recip_12Plus)),
          t.values[0].Administered_Dose1_Recip_18Plus &&
            (a = parseInt(t.values[0].Administered_Dose1_Recip_18Plus)),
          t.values[0].Administered_Dose1_Recip_65Plus &&
            (n = parseInt(t.values[0].Administered_Dose1_Recip_65Plus)),
          s.hasOwnProperty(t.values[0].FIPS)
            ? (s[t.values[0].FIPS] = s[t.values[0].FIPS] + e + a + n)
            : (s[t.values[0].FIPS] = e + a + n),
          (l[t.values[0].FIPS] = t.values[0].Recip_County),
          (u[t.values[0].FIPS] = {
            countyName: t.values[0].Recip_County,
            stateName: t.values[0].Recip_State,
            "Age 12+": t.values[0].Series_Complete_12PlusPop_Pct,
            "Age 18+": t.values[0].Series_Complete_18PlusPop_Pct,
            "Age 65+": t.values[0].Series_Complete_65PlusPop_Pct,
            seriesComplete: t.values[0].Series_Complete_Pop_Pct,
          });
      });
    });
  let i = new Array();
  (i[0] = Math.min.apply(null, Object.values(s))),
    (i[1] = Math.max.apply(null, Object.values(s))),
    r.domain(i),
    svg
      .append("g")
      .attr("class", "county")
      .selectAll("path")
      .data(topojson.feature(t, t.objects.counties).features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", function (t) {
        return r(s[t.id]);
      })
      .style("opacity", 0.8)
      .on("mouseover", function (t) {
        d3.select(this).moveToFront(),
          o.transition().duration(300).style("opacity", 1);
        let e = o.select("svg").select("g").append("g");
        e
          .append("text")
          .attr("x", 20)
          .attr("y", 20)
          .text(u[t.id].countyName + ", " + u[t.id].stateName + "."),
          e
            .append("text")
            .attr("x", 20)
            .attr("y", 40)
            .text("Pct. fully vaccinated");
        t = [
          { category: "All Resident", num: u[t.id].seriesComplete, num2: 100 },
          { category: "Age 12+", num: u[t.id]["Age 12+"], num2: 100 },
          { category: "Age 18+", num: u[t.id]["Age 18+"], num2: 100 },
          { category: "Age 65+", num: u[t.id]["Age 65+"], num2: 100 },
        ];
        let a = d3.scaleLinear().range([0, 50]),
          n = d3
            .scaleBand()
            .range([100, 0])
            .domain(["Age 65+", "Age 12+", "Age 18+", "All Resident"]),
          r = d3.max(t, function (t) {
            return t.num2;
          });
        d3.min(t, function (t) {
          return t.num;
        });
        a.domain([0, r]);
        let s = e
          .selectAll(".g-category-group")
          .data(t)
          .enter()
          .append("g")
          .attr("class", "g-category-group")
          .attr("transform", function (t) {
            return "translate(0," + (parseInt(n(t.category)) + 30) + ")";
          });
        s
          .append("rect")
          .attr("width", function (t) {
            return a(t.num2);
          })
          .attr("height", 9)
          .attr("class", "g-num2")
          .attr("transform", "translate(150, 19)"),
          s
            .append("rect")
            .attr("width", function (t) {
              return a(t.num);
            })
            .attr("height", 9)
            .attr("class", "g-num")
            .attr("transform", "translate(150, 19)");
        let l = e
          .selectAll("g-num")
          .data(t)
          .enter()
          .append("g")
          .attr("class", "g-label-group");
        l
          .append("text")
          .text(function (t) {
            return t.category;
          })
          .style("fill", "black")
          .attr("x", function (t, e) {
            return 10;
          })
          .attr("y", function (t, e) {
            return 25 * e + 60;
          })
          .attr("class", "g-labels-tooltip"),
          l
            .append("text")
            .text(function (t) {
              return t.num + "%";
            })
            .style("fill", "black")
            .attr("x", function (t, e) {
              return 100;
            })
            .attr("y", function (t, e) {
              return 25 * e + 60;
            })
            .attr("class", "g-labels-tooltip");
        o.style("left", d3.event.pageX + "px").style(
          "top",
          d3.event.pageY - 30 + "px"
        );
      })
      .on("mouseout", function () {
        d3.select(this).moveToBack(),
          o.select("svg").select("g").select("g").remove(),
          o.transition().duration(300).style("opacity", 0);
      }),
    r.domain(a);
  var a = svg
      .selectAll("g.legend")
      .data(a)
      .enter()
      .append("g")
      .attr("class", "legend"),
    c = 130;
  a
    .append("rect")
    .attr("x", function (t, e) {
      return width / 2 - e * c - c;
    })
    .attr("y", 550)
    .attr("width", c)
    .attr("height", 20)
    .style("fill", function (t, e) {
      return r(t);
    })
    .style("opacity", 0.8),
    a
      .append("text")
      .attr("x", function (t, e) {
        return width / 2 - e * c - c;
      })
      .attr("y", 590)
      .text(function (t, e) {
        return n[e];
      });
}
function drawBar() {
  var e = d3.scaleLinear().range([0, 320]),
    a = d3
      .scaleBand()
      .range([200, 0])
      .domain(["65 and up", "12 and up", "18 and up", "All ages*"]),
    t = d3
      .select("#bar")
      .append("div")
      .attr("align", "center")
      .append("svg")
      .attr("width", 960)
      .attr("height", 250)
      .append("g");
  t
    .append("text")
    .text("At least one dose")
    .style("fill", "black")
    .attr("x", 250)
    .attr("y", 15),
    t
      .append("text")
      .text("Fully vaccinated")
      .style("fill", "black")
      .attr("x", 650)
      .attr("y", 15);
  var n = [
      { category: "All ages*", num: 58.2, num2: 100 },
      { category: "12 and up", num: 68.1, num2: 100 },
      { category: "18 and up", num: 70.4, num2: 100 },
      { category: "65 and up", num: 90.2, num2: 100 },
    ],
    r = d3.max(n, function (t) {
      return t.num2;
    });
  d3.min(n, function (t) {
    return t.num;
  });
  e.domain([0, r]);
  var s = t
      .selectAll(".g-category-group")
      .data(n)
      .enter()
      .append("g")
      .attr("class", "g-category-group")
      .attr("transform", function (t) {
        return "translate(0," + (parseInt(a(t.category)) + 15) + ")";
      }),
    l =
      (s
        .append("rect")
        .attr("width", function (t) {
          return e(t.num2);
        })
        .attr("height", 19)
        .attr("class", "g-num2")
        .attr("transform", "translate(150, 19)"),
      s
        .append("rect")
        .attr("width", function (t) {
          return e(t.num);
        })
        .attr("height", 19)
        .attr("class", "g-num")
        .attr("transform", "translate(150, 19)"),
      t
        .selectAll("g-num")
        .data(n)
        .enter()
        .append("g")
        .attr("class", "g-label-group")),
    r =
      (l
        .append("text")
        .text(function (t) {
          return t.category;
        })
        .style("fill", "black")
        .attr("x", function (t, e) {
          return 0;
        })
        .attr("y", function (t, e) {
          return 50 * e + 50;
        })
        .attr("class", "g-labels"),
      l
        .append("text")
        .text(function (t) {
          return t.num + "%";
        })
        .style("fill", "black")
        .attr("x", function (t, e) {
          return 100;
        })
        .attr("y", function (t, e) {
          return 50 * e + 50;
        })
        .attr("class", "g-labels"),
      [
        { category: "All ages*", num: 49.9, num2: 100 },
        { category: "12 and up", num: 58.4, num2: 100 },
        { category: "18 and up", num: 60.8, num2: 100 },
        { category: "65 and up", num: 80.3, num2: 100 },
      ]);
  d3.min(n, function (t) {
    return t.num;
  }),
    (s = t
      .selectAll(".g-category-group-2")
      .data(r)
      .enter()
      .append("g")
      .attr("class", "g-category-group-2")
      .attr("transform", function (t) {
        return "translate(0," + (parseInt(a(t.category)) + 15) + ")";
      }))
      .append("rect")
      .attr("width", function (t) {
        return e(t.num2);
      })
      .attr("height", 19)
      .attr("class", "g-num3")
      .attr("transform", "translate(550, 19)"),
    s
      .append("rect")
      .attr("width", function (t) {
        return e(t.num);
      })
      .attr("height", 19)
      .attr("class", "g-num4")
      .attr("transform", "translate(550, 19)");
  (l = t
    .selectAll(".g-label-group-2")
    .data(r)
    .enter()
    .append("g")
    .attr("class", "g-label-group-2"))
    .append("text")
    .text(function (t) {
      return t.num + "%";
    })
    .style("fill", "black")
    .attr("x", function (t, e) {
      return 500;
    })
    .attr("y", function (t, e) {
      return 50 * e + 50;
    })
    .attr("class", "g-labels");
}
queue()
  .defer(d3.json, "../data/counties-10m.json")
  .defer(d3.csv, "../data/vaccination-data.csv")
  .await(ready);
