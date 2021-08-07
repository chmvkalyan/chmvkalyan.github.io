// // Type conversion.
const legend_html = swatches({
  color: d3.scaleOrdinal(
    ["Cases", "Deaths", "Tests", "Vaccinations"],
    d3.schemeDark2
  ),
  columns: "180px",
});
d3.select(".line-chart-legend").html(legend_html);

// debugger;

// Data preparation.
function line_filterData(data) {
  return data.filter((d) => {
    return (
      d.location &&
      d.continent &&
      d.total_cases &&
      d.total_deaths &&
      d.total_tests &&
      d.total_vaccinations &&
      d.population
    );
  });
}

function line_prepareLineChartData(data) {
  // Group by year and extract measures.
  const groupByMY = (d) => d.month_year;
  const groupByLoc = (d) => d.location;
  const reduceTests = (values) => d3.max(values, (leaf) => leaf.total_tests);
  const testsMap = d3.rollup(data, reduceTests, groupByLoc, groupByMY);
  const reduceVaccinations = (values) =>
    d3.max(values, (leaf) => leaf.total_vaccinations);
  const vaccinationsMap = d3.rollup(
    data,
    reduceVaccinations,
    groupByLoc,
    groupByMY
  );
  const reduceCases = (values) => d3.max(values, (leaf) => leaf.total_cases);
  const casesMap = d3.rollup(data, reduceCases, groupByLoc, groupByMY);
  const reduceDeaths = (values) => d3.max(values, (leaf) => leaf.total_deaths);
  const deathsMap = d3.rollup(data, reduceDeaths, groupByLoc, groupByMY);

  // Convert to Array.
  const total_cases = Array.from(casesMap).sort((a, b) => a[0] - b[0]);
  const total_deaths = Array.from(deathsMap).sort((a, b) => a[0] - b[0]);
  const total_tests = Array.from(testsMap).sort((a, b) => a[0] - b[0]);
  const total_vaccinations = Array.from(vaccinationsMap).sort(
    (a, b) => a[0] - b[0]
  );

  // Parse years.
  const parseMY = d3.timeParse("%m-%Y");

  // Produce final data.
  const groupLineData = [];
  for (let i = 0; i < total_cases.length; i++) {
    const dates = Array.from(total_cases[i][1].keys(), (d) => parseMY(d));

    // Money maximum.
    const cases = Array.from(total_cases[i][1].values());
    const deaths = Array.from(total_deaths[i][1].values());
    const tests = Array.from(total_tests[i][1].values());
    const vaccinations = Array.from(total_vaccinations[i][1].values());
    const yValues = cases.concat(deaths, tests, vaccinations);

    const yMax = d3.max(yValues);
    const yMin = d3.min(yValues);
    // debugger;

    cases_val = [];
    for (let i = 0; i < cases.length; i++) {
      cases_val.push({ date: dates[i], value: cases[i] });
    }

    deaths_val = [];
    for (let i = 0; i < deaths.length; i++) {
      deaths_val.push({ date: dates[i], value: deaths[i] });
    }

    tests_val = [];
    for (let i = 0; i < tests.length; i++) {
      tests_val.push({ date: dates[i], value: tests[i] });
    }

    vaccinations_val = [];
    for (let i = 0; i < vaccinations.length; i++) {
      vaccinations_val.push({ date: dates[i], value: vaccinations[i] });
    }

    const lineData = {
      country: total_cases[i][0],
      series: [
        {
          name: "Cases",
          color: d3.schemeDark2[0],
          values: cases_val,
        },
        {
          name: "Deaths",
          color: d3.schemeDark2[1],
          values: deaths_val,
        },
        {
          name: "Tests",
          color: d3.schemeDark2[2],
          values: tests_val,
        },
        {
          name: "Vaccinations",
          color: d3.schemeDark2[3],
          values: vaccinations_val,
        },
      ],
      dates: dates,
      yMax: yMax,
      yMin: yMin,
    };
    groupLineData.push(lineData);
  }

  return groupLineData;
}

// Drawing utilities.
function line_formatTicks(d) {
  return d3
    .format("~s")(d)
    .replace("M", " mil")
    .replace("G", " bil")
    .replace("T", " tril");
}

// Main function.line
function line_ready(COVID) {
  // Data prep.
  const COVIDClean = line_filterData(COVID);
  var lineChartData = line_prepareLineChartData(COVIDClean);
  var selectedCountry = 0;

  debugger;
  // List of countries
  const countries = d3.map(lineChartData, (d) => d.country);

  // add the options to the button
  d3.select("#selectButton")
    .selectAll("myOptions")
    .data(countries)
    .enter()
    .append("option")
    .text((d) => d) // text showed in the menu
    .attr("value", (d, i) => i); // value of selection

  d3.select("#selectButton").on("change", function (d) {
    var selectedOption = d3.select(this).property("value");
    selectedCountry = parseInt(selectedOption);
    updateLineChart(COVIDClean, selectedCountry, false);
  });

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

  // lineChartData = lineChartData[selectedCountry];
  lineChartData = lineChartData[4];

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
  //   const header = svg
  //     .append("g")
  //     .attr("class", "bar-header")
  //     .attr("transform", `translate(0, ${-margin.top / 2})`)
  //     .append("text");

  //   header.append("tspan").text("Budget vs. Revenue over time in $US");

  //   header
  //     .append("tspan")
  //     .text("Films w/ budget and revenue figures, 2000-2009")
  //     .attr("x", 0)
  //     .attr("dy", "1.5em")
  //     .style("font-size", "0.8em")
  //     .style("fill", "#555");

  // Draw x axis.
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);

  const xAxisDraw = svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  xAxisDraw
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  xAxisDraw.selectAll("text").attr("dy", "1em");

  // Draw y axis.
  const yAxis = d3
    .axisLeft(yScale)
    .ticks(3)
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

  // debugger;
  var latest = chartGroup1
    .enter()
    .append("path")
    .attr("class", (d) => `line-series ${d.name.toLowerCase()}`)
    .attr("d", (d) => lineGen(d.values))
    .style("fill", "none")
    .style("stroke-width", 3)
    .style("stroke", (d) => d.color);

  // var pointsGroupTry = chartGroup1
  //   .enter()
  //   .append("path")
  //   .attr("class", (d) => `line-series ${d.name.toLowerCase()}`)
  //   .attr("cx", (d) => lineGen(d.values))
  //   .style("fill", "none")
  //   .style("stroke", (d) => d.color);

  const pointsGroup = svg.append("g").attr("class", "point-groups");
  const seriesLabel = svg.append("g").attr("class", "series-labels");

  function test_func(d) {
    debugger;
    return xScale(d.date);
  }

  // var k = 0;
  // var pg0 = pointsGroup
  //   .append("g")
  //   .attr("class", `point-group-${lineChartData.series[k].name}`)
  //   .selectAll(".point")
  //   .data(lineChartData.series[k].values)
  //   .enter()
  //   .append("circle")
  //   .attr("r", 2)
  //   .attr("cx", (d) => xScale(d.date))
  //   .attr("cy", (d) => yScale(d.value))
  //   .attr("fill", lineChartData.series[k].color);

  // k = 1;
  // var pg1 = pointsGroup
  //   .append("g")
  //   .attr("class", `point-group-${lineChartData.series[k].name}`)
  //   .selectAll(".point")
  //   .data(lineChartData.series[k].values)
  //   .enter()
  //   .append("circle")
  //   .attr("r", 2)
  //   .attr("cx", (d) => xScale(d.date))
  //   .attr("cy", (d) => yScale(d.value))
  //   .attr("fill", lineChartData.series[k].color);

  // k = 2;
  // var pg2 = pointsGroup
  //   .append("g")
  //   .attr("class", `point-group-${lineChartData.series[k].name}`)
  //   .selectAll(".point")
  //   .data(lineChartData.series[k].values)
  //   .enter()
  //   .append("circle")
  //   .attr("r", 2)
  //   .attr("cx", (d) => xScale(d.date))
  //   .attr("cy", (d) => yScale(d.value))
  //   .attr("fill", lineChartData.series[k].color);

  // k = 3;
  // var pg3 = pointsGroup
  //   .append("g")
  //   .attr("class", `point-group-${lineChartData.series[k].name}`)
  //   .selectAll(".point")
  //   .data(lineChartData.series[k].values)
  //   .enter()
  //   .append("circle")
  //   .attr("r", 2)
  //   .attr("cx", (d) => xScale(d.date))
  //   .attr("cy", (d) => yScale(d.value))
  //   .attr("fill", lineChartData.series[k].color);

  // for (let k = 0; k < lineChartData.series.length; k++) {
  //   var num_data = 0;
  //   var temp_date = lineChartData.series[k].values[num_data].date;
  //   var temp_val = lineChartData.series[k].values[num_data].value;
  //   var temp_col = lineChartData.series[k].color;

  //   // temp_date.setDate(temp_date.getDate() + 1);

  //   // debugger;
  //   seriesLabel
  //     .append("g")
  //     .attr("class", `label-${lineChartData.series[k].name}`)
  //     .append("text")
  //     .attr("x", xScale(temp_date))
  //     .attr("y", yScale(temp_val))
  //     .text(`. ${lineChartData.series[k].name}`)
  //     .style("dominant-baseline", "central")
  //     .style("font-size", "0.7em")
  //     .style("font-weight", "bold")
  //     .style("fill", temp_col);
  // }

  // chartGroup1
  //   .append("g")
  //   .attr("class", "series-labels")
  //   .selectAll(".series-label")
  //   .data(lineChartData.series)
  //   .enter()
  //   .append("text")
  //   .attr("x", (d) => {
  //     return xScale(d.values.date[d.values.length - 1]) + 5;
  //   })
  //   .attr("y", (d) => yScale(d.values.value[d.values.length - 1]))
  //   .text((d) => d.name)
  //   .style("dominant-baseline", "central")
  //   .style("font-size", "0.7em")
  //   .style("font-weight", "bold")
  //   .style("fill", (d) => d.color);

  // debugger;

  function updateLineChart(COVIDClean, selectedCountry) {
    var lineChartData = line_prepareLineChartData(COVIDClean);
    lineChartData = lineChartData[selectedCountry];

    xScale.domain(d3.extent(lineChartData.dates));
    yScale.domain([lineChartData.yMin, lineChartData.yMax]);

    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    xAxisDraw.transition().duration(1000).call(xAxis);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat(line_formatTicks)
      .tickSizeInner(-width);

    yAxisDraw.transition().duration(1000).call(yAxis);

    latest
      .data(lineChartData.series)
      .transition()
      .duration(1000)
      .attr("d", (d) => lineGen(d.values));
  }
}

// Load data.
d3.csv("../data/owid-COVID-data.csv", type).then((res) => {
  line_ready(res);
});
