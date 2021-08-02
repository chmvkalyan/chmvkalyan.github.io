// // Type conversion.
// function line_type(d) {
//   const date = parseDate(d.release_date);

//   return {
//     date: parseDate(d.date),
//     location: d.location,
//     total_cases: +d.total_cases,
//     total_deaths: +d.total_deaths,
//     population: +d.population,
//     continent: d.continent,
//   };
// }

// Data preparation.
function line_filterData(data) {
  return data.filter((d) => {
    return (
      d.location &&
      d.continent &&
      d.total_cases &&
      d.total_deaths &&
      d.population
    );
  });
}

function line_prepareLineChartData(data) {
  // Group by year and extract measures.
  const groupByMY = (d) => d.month_year;
  const groupByLoc = (d) => d.location;
  const reduceCases = (values) => d3.max(values, (leaf) => leaf.total_cases);
  const casesMap = d3.rollup(data, reduceCases, groupByLoc, groupByMY);
  const reduceDeath = (values) => d3.max(values, (leaf) => leaf.total_deaths);
  const deathMap = d3.rollup(data, reduceDeath, groupByLoc, groupByMY);

  // Convert to Array.
  const total_cases = Array.from(casesMap).sort((a, b) => a[0] - b[0]);
  const total_deaths = Array.from(deathMap).sort((a, b) => a[0] - b[0]);

  // Parse years.
  const parseMY = d3.timeParse("%m-%Y");

  // Produce final data.
  const groupLineData = [];
  for (let i = 0; i < total_cases.length; i++) {
    const dates = Array.from(total_cases[i][1].keys(), (d) => parseMY(d));

    // Money maximum.
    const cases = Array.from(total_cases[i][1].values());
    const deaths = Array.from(total_deaths[i][1].values());
    const yValues = cases.concat(deaths);

    const yMax = d3.max(yValues);

    cases_val = [];
    for (let i = 0; i < cases.length; i++) {
      cases_val.push({ date: dates[i], value: cases[i] });
    }

    deaths_val = [];
    for (let i = 0; i < deaths.length; i++) {
      deaths_val.push({ date: dates[i], value: deaths[i] });
    }

    const lineData = {
      country: total_cases[i][0],
      series: [
        {
          name: "Cases",
          color: "dodgerblue",
          values: cases_val,
        },
        {
          name: "Deaths",
          color: "darkorange",
          values: deaths_val,
        },
      ],
      dates: dates,
      yMax: yMax,
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
function line_ready(covid) {
  // Data prep.
  const covidClean = line_filterData(covid);
  var lineChartData = line_prepareLineChartData(covidClean);
  var selectedCountry = 0;

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
    updateLineChart(covidClean, selectedCountry, false);
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

  lineChartData = lineChartData[selectedCountry];

  // Scales.
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(lineChartData.dates))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, lineChartData.yMax])
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
    .ticks(5)
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
    .style("stroke", (d) => d.color);

  chartGroup1
    .append("g")
    .attr("class", "series-labels")
    .selectAll(".series-label")
    .data(lineChartData.series)
    .enter()
    .append("text")
    .attr("x", (d) => xScale(d.values.date[d.values.length - 1]) + 5)
    .attr("y", (d) => yScale(d.values.value[d.values.length - 1]))
    .text((d) => d.name)
    .style("dominant-baseline", "central")
    .style("font-size", "0.7em")
    .style("font-weight", "bold")
    .style("fill", (d) => d.color);

  function updateLineChart(covidClean, selectedCountry) {
    var lineChartData = line_prepareLineChartData(covidClean);
    lineChartData = lineChartData[selectedCountry];

    xScale.domain(d3.extent(lineChartData.dates));
    yScale.domain([0, lineChartData.yMax]);

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

    //   chartGroup
    //     .selectAll(".series-label")
    //     .data(lineChartData.series)
    //     .attr("x", (d) => xScale(d.values.date[d.values.length - 1]) + 5)
    //     .attr("y", (d) => yScale(d.values.value[d.values.length - 1]))
    //     .text((d) => d.name)
    //     .style("fill", (d) => d.color);
  }
}

// Load data.
d3.csv("../data/owid-covid-data.csv", type).then((res) => {
  line_ready(res);
});
