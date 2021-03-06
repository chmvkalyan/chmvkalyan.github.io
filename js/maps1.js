tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const promises = [];
promises.push(d3.csv("../data/owid-covid-data.csv"));
promises.push(
  d3.json(
    "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  )
);

function maps1_filterData(data) {
  return data.filter((d) => {
    return (
      d.iso_code &&
      d.location &&
      d.continent &&
      d.total_cases > 0 &&
      d.total_deaths > 0 &&
      d.population > 0
    );
  });
}

function maps1_formatTicks(d) {
  return d3.format(",.0f")(d);
}

function collate_for_map(v) {
  // debugger;
  var dict = {
    total_cases_per_million: d3.max(v, (d) => d.total_cases_per_million),
    total_deaths_per_million: d3.max(v, (d) => d.total_deaths_per_million),
    total_vaccinations_per_hundred: d3.max(
      v,
      (d) => d.total_vaccinations_per_hundred
    ),
    population: d3.max(v, (d) => d.population),
    total_tests_per_thousand: d3.max(v, (d) => d.total_tests_per_thousand),
    total_cases: d3.max(v, (d) => d.total_cases),
    continent: v[0].continent,
  };
  return dict;
}

Promise.all(promises).then(function ready(values) {
  data = values[0];
  data = data.map(type);
  mapdata = values[1];

  data = maps1_filterData(data);

  const dataByCountryByDate = d3.group(
    data,
    (d) => d.CountryCode,
    (d) => d.month_year
  );

  const dataByCountryByDate1 = d3.rollup(
    data,
    (v) => collate_for_map(v),
    (d) => d.CountryCode,
    (d) => d.month_year
  );

  // debugger;

  max_cases = d3.max(data.map((d) => d.total_cases_per_million));

  mapdata.features.forEach(function (country) {
    var id = country.id;

    if (typeof dataByCountryByDate1.get(id) != "undefined") {
      country.values = dataByCountryByDate1.get(id);
    }
  });

  var legendText = ["", "100K", "", "5M", "", "30M", "", "100M"];

  // Margin convention.
  const parentDiv = d3.select(".map-container");
  //   const svg = d3.select(parentDiv).append("svg");
  const margin = { top: 80, right: 80, bottom: 80, left: 80 };
  const width =
    parentDiv._groups[0][0].clientWidth * 0.9 - margin.left - margin.right;
  const height = 700 - margin.top - margin.bottom;
  format = d3.format(",");

  var projection = d3
    .geoMercator()
    .scale(200)
    .center([0, 30])
    .translate([width / 2, height / 2]);

  var path = d3.geoPath().projection(projection);

  var svg = d3
    .select(".map-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var countryShapes = svg
    .selectAll(".country")
    .data(mapdata.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path);

  svg
    .append("path")
    .datum(
      topojson.feature(mapdata, function (a, b) {
        return a !== b;
      })
    )
    .attr("class", "countries")
    .attr("d", path);

  // var labels = svg.selectAll("text.label").data(mapdata);

  // labels.enter().;

  // labels
  //   .attr("x", function (d) {
  //     return projection(d3.geo.centroid(d))[0];
  //   })
  //   .attr("y", function (d) {
  //     return projection(d3.geo.centroid(d))[1];
  //   })
  //   .attr("text-anchor", function (d, i) {
  //     // Randomly align the label
  //     var idx = Math.round(3 * Math.random());
  //     return ["start", "middle", "end"][idx];
  //   })
  //   .text(function (d) {
  //     return d.properties.admin;
  //   });

  // labels.exit().remove();

  var num_legend = 9;
  const legendScale = d3.scaleLinear().domain([0, 1]).range([0, 1]);
  var legend = svg.append("g").attr("id", "legend");

  var legenditem = legend
    .selectAll(".legenditem")
    .data(d3.range(num_legend))
    .enter()
    .append("g")
    .attr("class", "legenditem")
    .attr("transform", function (d, i) {
      return "translate(" + i * 31 + ",0)";
    });

  legenditem
    .append("rect")
    .attr("x", width * 0.1 - margin.left - margin.right)
    .attr("y", height * 0.9)
    .attr("width", 30)
    .attr("height", 6)
    .attr("class", "rect")
    .style("fill", function (d, i) {
      return map1_color(legendScale(i / num_legend));
    });

  // debugger;
  legenditem
    .append("text")
    .attr("x", width * 0.1 - margin.left - margin.right)
    .attr("y", height * 0.9)
    .style("text-anchor", "middle")
    .text(function (d, i) {
      if (i % 2 == 0) {
        var text = maps1_formatTicks((max_cases * i) / num_legend);
      } else {
        var text = "";
      }
      return text;
    });

  legend
    .append("text")
    .attr("x", width * 0.13 - margin.left - margin.right)
    .attr("y", height * 0.95)
    .text("Total Cases (per Million)")
    .style("font-weight", "bold");

  function mouseover(event, d) {
    // debugger;
    var TipData, bodyData;
    var country = d.properties.name;
    var idx = dates_range.length - parseInt(slider.property("value"));
    if ("values" in d) {
      if (Array.from(d.values.keys()).includes(dates_range[idx])) {
        TipData = d.values.get(dates_range[idx]);

        bodyData = [
          ["Population", maps1_formatTicks(TipData.population)],
          [
            "Cases (per Million)",
            maps1_formatTicks(TipData.total_cases_per_million),
          ],
          [
            "Deaths (per Million)",
            maps1_formatTicks(TipData.total_deaths_per_million),
          ],
          [
            "Tests (per Thousand)",
            maps1_formatTicks(TipData.total_tests_per_thousand),
          ],
          [
            "Vaccinations (per Hundred)",
            maps1_formatTicks(TipData.total_vaccinations_per_hundred),
          ],
        ];
        // console.log(bodyData);
      } else {
        // debugger;
        TipData["continent"] = d.values.get(dates_range[0]).continent;
        bodyData = [
          ["Population", "No data"],
          ["Cases (per Million)", "No data"],
          ["Deaths (per Million)", "No data"],
          ["Tests (per Thousand)", "No data"],
          ["Vaccinations (per Hundred)", "No data"],
        ];
      }
    } else {
      // debugger;
      var TipData = { continent: "" };
      bodyData = [
        ["Population", "No data"],
        ["Cases (per Million)", "No data"],
        ["Deaths (per Million)", "No data"],
        ["Tests (per Thousand)", "No data"],
        ["Vaccinations (per Hundred)", "No data"],
      ];
    }

    // console.log(bodyData);
    // debugger;

    const tip = d3.select(".tooltip");

    tip.transition().style("opacity", 0.98);

    tip.select("h3").html(`${country} (${TipData.continent})`);

    d3.select(".tip-body")
      .selectAll("p")
      .data(bodyData)
      .join("p")
      .attr("class", "tip-info")
      .html((d) => `${d[0]}: ${d[1]}`);
  }

  function mousemove(event, d) {
    // debugger;
    d3.select(".tooltip")
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY}px`);
  }

  function mouseout(event, d) {
    // debugger;
    d3.select(".tooltip").transition().style("opacity", 0);
  }

  function update(idx) {
    slider.property("value", idx);
    idx = dates_range.length - idx;
    console.log(idx, dates_range[idx]);
    year = dates_range[idx];

    // debugger;
    var mon_year =
      Months[parseInt(year.split("-")[0])] + "-" + year.split("-")[1];

    d3.select(".year").text(mon_year);

    countryShapes.style("fill", function (d) {
      if ("values" in d) {
        if (Array.from(d.values.keys()).includes(year)) {
          // debugger;
          var value = d.values.get(year)["total_cases_per_million"];

          // return color(value);
          return map1_color(legendScale(value / max_cases));
        }
      }
      return map1_color(legendScale(0));
    });

    countryShapes
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);
  }

  dates_range = Array.from(dataByCountryByDate.get("AFG").keys());

  // debugger;

  var slider = d3
    .select(".slider")
    .append("input")
    .attr("type", "range")
    .attr("min", 1)
    .attr("max", dates_range.length)
    .attr("step", 1)
    .attr("value", 17)
    .attr("style", "width:70%")
    .on("input", function () {
      // var month_year = dates_range[this.value];
      update(this.value);
    });

  update(dates_range.length);
});

d3.select(self.frameElement).style("height", "810px");
