const color = {
  Asia: 0,
  Europe: 1,
  Africa: 2,
  "North America": 3,
  "South America": 4,
  Oceania: 5,
};

const legend_html = swatches({
  color: d3.scaleOrdinal(
    ["Asia", "Europe", "Africa", "North America", "South America", "Oceania"],
    d3.schemeDark2
  ),
  columns: "180px",
});

d3.select(".scatter-plot-legend").html(legend_html);

// Type conversion.
function scatter_type(d) {
  const date = parseDate(d.release_date);

  return {
    date: parseDate(d.date),
    location: d.location,
    total_cases: +d.total_cases,
    total_deaths: +d.total_deaths,
    population: +d.population,
    continent: d.continent,
  };
}

// Data preparation.
function scatter_filterData(data) {
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

function scatter_prepareScatterPlotData(data) {
  return data.sort((a, b) => b.total_cases - a.total_cases);
  // .filter((d, i) => i < 100);
}

// Drawing utilities.
function scatter_formatTicks(d) {
  return d3
    .format(".2~s")(d)
    .replace("M", " Million")
    .replace("G", " Billion")
    .replace("T", " Trillion")
    .replace("k", " Thousand");
}

const Ccolor = {
  Asia: 0,
  Europe: 1,
  Africa: 2,
  "North America": 3,
  "South America": 4,
  Oceania: 5,
};

function continentColor(d) {
  // debugger;
  return d3.schemeDark2[Ccolor[d]];
}

// Main function.scatter_
function scatter_ready(covid) {
  // Data prep.
  const covidClean = scatter_filterData(covid);
  const scatterData = scatter_prepareScatterPlotData(covidClean);

  // Margin convention.
  const parentDiv = d3.select(".scatter-plot-container");
  //   const svg = d3.select(parentDiv).append("svg");
  const margin = { top: 80, right: 80, bottom: 80, left: 80 };
  const width =
    parentDiv._groups[0][0].clientWidth - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // create a tooltip
  var Tooltip = d3
    .select(".scatter-plot-container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (event, d) {
    Tooltip.style("opacity", 1);
    d3.select(this).style("stroke", "black").style("opacity", 1);
  };
  var mousemove = function (event, d) {
    Tooltip.html(
      `<p> <strong> ${d.location} </strong> 
        <br /> Population - ${scatter_formatTicks(d.population)}
        <br /> Cases - ${scatter_formatTicks(d.total_cases)}
        <br /> Deaths - ${scatter_formatTicks(d.total_deaths)} </p>`
    )
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 50 + "px");
  };
  var mouseleave = function (event, d) {
    Tooltip.style("opacity", 0);
    d3.select(this).style("stroke", "none").style("opacity", 0.8);
  };

  // Scales.
  const xMax = d3.max(scatterData, (d) => d.population);
  const yMax = d3.max(scatterData, (d) => d.total_cases);
  const sMax = d3.max(scatterData, (d) => d.total_deaths);

  const xScale = d3.scaleLog().domain([10e3, xMax]).range([0, width]).nice();
  const yScale = d3.scaleLog().domain([1, yMax]).range([height, 0]).nice();
  const sScale = d3.scaleLinear().domain([0, sMax]).range([8, 30]);

  //   const color = [
  //     "#1fe21a",
  //     "#2209d0",
  //     "#782105",
  //     "#17d5fa",
  //     "#e8c005",
  //     "#ffa4fc",
  //     "#034b13",
  //     "#0e3f7d",
  //     "#e4bc9f",
  //     "#35dd9c",
  //     "#7c0950",
  //     "#473e3b",
  //     "#9fd453",
  //     "#69068e",
  //     "#c4bfe9",
  //     "#97d0b6",
  //     "#d4c56b",
  //     "#484006",
  //     "#ffadc5",
  //     "#38e067",
  //   ];

  //   const myColor = d3
  //     .scaleOrdinal()
  //     .domain(scatterData.map((d) => d.genre))
  //     .range(color);

  // Draw base.
  const svg = d3
    .select(".scatter-plot-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Draw header.
  const header = svg
    .append("g")
    .attr("class", "bar-header")
    .attr("transform", `translate(0, ${-margin.top / 2})`)
    .append("text");

  header.append("tspan").text("Population vs. Cases per country");

  header
    .append("tspan")
    .text("Top 100 highly populated countries")
    .attr("x", 0)
    .attr("dy", "1.5em")
    .style("font-size", "0.8em")
    .style("fill", "#555");

  // Draw axes.
  const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat(scatter_formatTicks);

  const xAxisDraw = svg
    .append("g")
    .attr("class", "x axis")
    .call(xAxis)
    .attr("transform", "translate(0," + height + ")");
  xAxisDraw
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(5)
    .tickFormat(scatter_formatTicks)
    .tickSizeInner(-width);

  const xLabel = svg
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .text("Population of the country");

  const yLabel = svg
    .append("g")
    .attr("transform", `translate(-50, ${height / 2})`)
    .append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Total cases");

  const yAxisDraw = svg.append("g").attr("class", "y axis").call(yAxis);
  yAxisDraw.selectAll("text").attr("dx", "-0.6em");

  // Draw bars.
  const scatter = svg
    .append("g")
    .attr("class", "scatter-points")
    .selectAll(".scatter")
    .data(scatterData)
    .enter()
    .append("circle")
    .transition()
    .duration(2000)
    .delay((d, i) => i * 10)
    .attr("class", "scatter")
    .attr("cx", (d) => xScale(d.population))
    .attr("cy", (d) => yScale(d.total_cases))
    .attr("r", (d) => sScale(d.total_deaths))
    .style("fill-opacity", 0.7)
    .style("fill", (d) => continentColor(d.continent));

  d3.selectAll("circle")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

// Load data.
d3.csv("../data/cases_population.csv", scatter_type).then((res) => {
  scatter_ready(res);
});
