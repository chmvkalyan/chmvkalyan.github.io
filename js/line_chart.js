tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Type conversion.
const colorScheme = ["#ff2200", "#0d0000", "#002aff", "#2e9930"];

const line_legend_html = swatches({
  color: d3.scaleOrdinal(
    // ["Cases", "Deaths", "Tests", "Vaccinations"],
    ["Tests", "Cases", "Deaths", "Vaccinations"],
    [colorScheme[2], colorScheme[0], colorScheme[1], colorScheme[3]]
  ),
  columns: "180px",
});

d3.select(".line-chart-legend").html(line_legend_html);

// debugger;

// Data preparation.
function line_filterData(data) {
  return data.filter((d) => {
    return (
      d.location &&
      d.continent &&
      d.new_cases &&
      d.new_deaths &&
      d.new_tests &&
      d.new_vaccinations &&
      d.population
    );
  });
}

function line_prepareLineChartData(data, selectedCountry) {
  // debugger;
  // filter data for selected country
  data = data.filter((d) => d.location == selectedCountry);

  // Group by year and extract measures.
  function extractMeasures(v) {
    return {
      Cases: d3.sum(v, (leaf) => leaf.new_cases),
      Deaths: d3.sum(v, (leaf) => leaf.new_deaths),
      Tests: d3.sum(v, (leaf) => leaf.new_tests),
      Vaccinations: d3.sum(v, (leaf) => leaf.new_vaccinations),
    };
  }

  function getKeyValuePairs(data, line) {
    var values = [];

    const parseMY = d3.timeParse("%m-%Y");
    for (const [key, value] of data.entries()) {
      values.push({ date: parseMY(key), value: value[line] });
    }

    return values;
  }

  function getDates(data) {
    // debugger;
    // Parse years.
    const parseMY = d3.timeParse("%m-%Y");
    var dates = [];

    for (const [key, value] of data.entries()) {
      dates.push(parseMY(key));
    }

    return dates;
  }

  const Measures = d3.rollup(data, extractMeasures, (d) => d.month_year);
  cases = getKeyValuePairs(Measures, "Cases");
  deaths = getKeyValuePairs(Measures, "Deaths");
  tests = getKeyValuePairs(Measures, "Tests");
  vaccinations = getKeyValuePairs(Measures, "Vaccinations");

  // debugger;

  const yValues = cases.concat(deaths, tests, vaccinations);

  const yMax = d3.max(yValues.map((d) => d.value));
  const yMin = d3.min(yValues.map((d) => d.value));
  // Produce final data.
  const lineData = {
    country: selectedCountry,
    series: [
      {
        name: "Cases",
        color: colorScheme[0],
        values: cases,
      },
      {
        name: "Deaths",
        color: colorScheme[1],
        values: deaths,
      },
      {
        name: "Tests",
        color: colorScheme[2],
        values: tests,
      },
      {
        name: "Vaccinations",
        color: colorScheme[3],
        values: vaccinations,
      },
    ],
    dates: getDates(Measures),
    yMax: yMax,
    yMin: yMin,
  };

  return lineData;
}

// Drawing utilities.
function line_formatTicks(d) {
  return d3
    .format(".2~s")(d)
    .replace("M", " Million")
    .replace("G", " Billion")
    .replace("T", " Trillion")
    .replace("k", " Thousand");
}

function getCountries(data) {
  results = Array.from(
    d3
      .rollup(
        data,
        (v) => v.location,
        (d) => d.location
      )
      .keys()
  );
  return results.sort();
}

// Main function.line
function line_ready(COVID) {
  // Data prep.
  const COVIDClean = line_filterData(COVID);

  // List of countries
  const countries = getCountries(COVIDClean);

  var selectedCountry = "United States";
  // add the options to the button
  d3.select("#selectButton")
    .selectAll("myOptions")
    .attr("align", "center")
    .data(countries)
    .enter()
    .append("option")
    .text((d) => d) // text showed in the menu
    .attr("value", (d, i) => i) // value of selection
    .property("selected", function (d) {
      return d === selectedCountry;
    });

  d3.select("#selectButton").on("change", function (d) {
    var selectedOption = d3.select(this).property("value");
    selectedCountry = countries[parseInt(selectedOption)];
    updateLineChart(COVIDClean, selectedCountry);
  });

  // debugger;

  var lineChartData = line_prepareLineChartData(COVIDClean, selectedCountry);

  // Margin convention.
  const parentDiv = d3.select(".line-chart-container");
  const margin = { top: 80, right: 80, bottom: 80, left: 80 };
  const width =
    parentDiv._groups[0][0].clientWidth - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Draw base.
  const svg = d3
    .select(".line-chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Scales.
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(lineChartData.dates))
    .range([0, width]);

  const yScale = d3
    .scaleLog()
    .domain([lineChartData.yMin, lineChartData.yMax])
    .range([height, 0]);

  // Draw header.
  const header = svg
    .append("g")
    .attr("class", "bar-header")
    .attr("transform", `translate(0, ${-margin.top / 2})`)
    .append("text");

  header.append("tspan").text("Tests, Cases, Deaths & Vaccinations over time");

  header
    .append("tspan")
    .text("Line chart by countries")
    .attr("x", 0)
    .attr("dy", "1.5em")
    .style("font-size", "0.8em")
    .style("fill", "#555");

  // Draw x axis.
  const xAxis = d3
    .axisBottom(xScale)
    .tickSizeOuter(0)
    .ticks(d3.timeMonth, 1)
    .tickFormat(d3.timeFormat("%b-%Y"));

  const xAxisDraw = svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  xAxisDraw.selectAll("text").style("text-anchor", "end");

  xAxisDraw.selectAll("text").attr("dy", "1em");

  // Draw y axis.
  const yAxis = d3
    .axisLeft(yScale)
    .ticks(4)
    .tickFormat(line_formatTicks)
    .tickSizeInner(-width);

  const yAxisDraw = svg.append("g").attr("class", "y axis").call(yAxis);

  // Line generator.
  const lineGen = d3
    .line()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.value));

  // Draw lines.
  const chartGroup = svg.append("g").attr("class", "line-chart");

  const chartGroup1 = chartGroup
    .selectAll(".line-series")
    .data(lineChartData.series);

  var latest = chartGroup1
    .enter()
    .append("path")
    .attr("class", (d) => `line-series ${d.name.toLowerCase()}`)
    .attr("d", (d) => lineGen(d.values))
    .style("fill", "none")
    .style("stroke-width", 3)
    .style("stroke", (d) => d.color);

  const pointsGroup = svg.append("g").attr("class", "point-groups");
  const seriesLabel = svg.append("g").attr("class", "series-labels");

  for (let k = 0; k < lineChartData.series.length; k++) {
    pointsGroup
      .append("g")
      .attr("class", `point-group-${lineChartData.series[k].name}`)
      .selectAll(".point")
      .data(lineChartData.series[k].values)
      .enter()
      .append("circle")
      .attr("class", `${lineChartData.series[k].name}`)
      .attr("r", 3)
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.value))
      .attr("fill", lineChartData.series[k].color);
  }

  function mouseover(event, d) {
    const tip = d3.select(".tooltip");

    tip.transition().style("opacity", 0.98);

    tip.html(
      `<strong>${
        Months[d.date.getMonth() + 1]
      }-${d.date.getFullYear()}</strong> 
        <br />
        ${this.classList[0]} 
        <br />
        ${line_formatTicks(d.value)}`
    );
  }

  function mousemove(event, d) {
    // debugger;
    d3.select(".tooltip")
      .style("left", `${event.pageX + 15}px`)
      .style("top", `${event.pageY}px`);
  }

  function mouseout(event, d) {
    // debugger;
    d3.select(".tooltip").transition().style("opacity", 0);
  }

  d3.selectAll("circle")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  function updateLineChart(COVIDClean, selectedCountry) {
    // debugger;
    lineChartData = line_prepareLineChartData(COVIDClean, selectedCountry);

    xScale.domain(d3.extent(lineChartData.dates));
    yScale.domain([lineChartData.yMin, lineChartData.yMax]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickSizeOuter(0)
      .ticks(d3.timeMonth, 1)
      .tickFormat(d3.timeFormat("%b-%Y"));
    xAxisDraw.transition().duration(1000).call(xAxis);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(3)
      .tickFormat(line_formatTicks)
      .tickSizeInner(-width);

    yAxisDraw.transition().duration(1000).call(yAxis);

    // debugger;

    latest
      .data(lineChartData.series)
      .transition()
      .duration(1000)
      .attr("d", (d) => lineGen(d.values));

    for (let k = 0; k < lineChartData.series.length; k++) {
      // debugger;
      pg0 = d3
        .selectAll(".point-groups")
        .selectAll(`.point-group-${lineChartData.series[k].name}`)
        .selectAll("circle")
        .data(lineChartData.series[k].values);

      pg0
        .enter()
        .append("circle")
        .attr("class", `${lineChartData.series[k].name}`)
        .attr("r", 3)
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScale(d.value))
        .attr("fill", lineChartData.series[k].color);

      pg0
        .transition()
        .duration(1000)
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScale(d.value));

      pg0.exit().transition().duration(1000).remove();
    }
  }
}

// Load data.
d3.csv("../data/owid-COVID-data.csv", type).then((res) => {
  line_ready(res);
});
