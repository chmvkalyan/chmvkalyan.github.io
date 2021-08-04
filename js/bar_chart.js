// Type conversion.
function bar_type(d) {
  const date = parseDate(d.release_date);

  return {
    continent: d.continent,
    date: parseDate(d.date),
    location: d.location,
    total_vaccinations: +d.total_vaccinations,
  };
}

// Data preparation.
function bar_filterData(data) {
  return data.filter((d) => {
    return d.location && d.continent;
  });
}

function bar_prepareBarChartData(data) {
  return data;
}

// Drawing utilities.
function bar_formatTicks(d) {
  return d3
    .format("~s")(d)
    .replace("M", " mil")
    .replace("G", " bil")
    .replace("T", " tril");
}

// Main function.bar_
function bar_ready(covid) {
  // Data prep.
  const covidClean = bar_filterData(covid);
  const barChartData = bar_prepareBarChartData(covidClean)
    .sort((a, b) => {
      return b.total_vaccinations - a.total_vaccinations;
    })
    .filter((d, i) => i < 50);

  // Margin convention.
  const parentDiv = d3.select(".bar-chart-container");
  //   const svg = d3.select(parentDiv).append("svg");
  const margin = { top: 80, right: 80, bottom: 80, left: 80 };
  const width =
    parentDiv._groups[0][0].clientWidth - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // create a tooltip
  var Tooltip = d3
    .select(".bar-chart-container")
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
      "<p>" +
        d.location +
        "<br />" +
        d.total_vaccinations +
        "<br />" +
        " vaccinations" +
        "</p>"
    )
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 50 + "px");
  };
  var mouseleave = function (event, d) {
    Tooltip.style("opacity", 0);
    d3.select(this).style("stroke", "none").style("opacity", 0.8);
  };

  // Scales.
  const yMax = d3.max(barChartData, (d) => d.total_vaccinations);

  const yScale = d3.scaleLog().domain([50e5, yMax]).range([height, 0]);

  const xScale = d3
    .scaleBand()
    .domain(barChartData.map((d) => d.location))
    .range([0, width])
    .paddingInner(0.25);

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
  //     .domain(barChartData.map((d) => d.genre))
  //     .range(color);

  // Draw base.
  const svg = d3
    .select(".bar-chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Draw legends.
  const legends = svg.append("g").attr("class", "legends");

  legends
    .append("circle")
    .attr("cx", 1000)
    .attr("cy", 60)
    .attr("r", 6)
    .style("fill", "#008B8B");

  legends
    .append("circle")
    .attr("cx", 1000)
    .attr("cy", 90)
    .attr("r", 6)
    .style("fill", "#FB7E81");
  legends
    .append("circle")
    .attr("cx", 1000)
    .attr("cy", 120)
    .attr("r", 6)
    .style("fill", "#9E0508");
  legends
    .append("text")
    .attr("x", 1020)
    .attr("y", 60)
    .text("Total Vaccinations - 100M +")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  legends
    .append("text")
    .attr("x", 1020)
    .attr("y", 90)
    .text("Total Vaccinations - 10M-100M")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");
  legends
    .append("text")
    .attr("x", 1020)
    .attr("y", 120)
    .text("Total Vaccinations - < 10M")
    .style("font-size", "15px")
    .attr("alignment-baseline", "middle");

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
    .style("fill", "#739AC5");

  // //line for annotation
  annots
    .append("line")
    .attr("x1", 100)
    .attr("y1", 120)
    .attr("x2", 25)
    .attr("y2", 10)
    .attr("stroke-width", 2)
    .attr("stroke", "#739AC5")
    .attr("marker-end", "url(#triangle)");

  // // text for annotation
  annots
    .append("text")
    .attr("x", 110)
    .attr("y", 120)
    .attr("font-family", "Trebuchet MS")
    .attr("font-size", 14)
    .style("fill", "#739AC5")
    .text(
      "So far 4 nations China, India, USA, Brazil have vaccinated 100M+ people."
    );
  // annots
  //   .append("text")
  //   .attr("x", 100)
  //   .attr("y", 180)
  //   .attr("font-family", "Trebuchet MS")
  //   .attr("font-size", 14)
  //   .style("fill", "#739AC5")
  //   .text("Thus more cases and deaths are reported. No data found for China.");
  // annots
  //   .append("text")
  //   .attr("x", 100)
  //   .attr("y", 300)
  //   .attr("font-family", "Trebuchet MS")
  //   .attr("font-size", 14)
  //   .style("fill", "#739AC5")
  //   .text(
  //     "The curve has fallen down for UK as the cases and deaths are reduced."
  //   );

  // Draw header.
  const header = svg
    .append("g")
    .attr("class", "bar-header")
    .attr("transform", `translate(0, ${-margin.top / 2})`)
    .append("text");

  header.append("tspan").text("Total vaccinations as on 31st July 2021");

  header
    .append("tspan")
    .text("Top 50 countries")
    .attr("x", 0)
    .attr("dy", "1.5em")
    .style("font-size", "0.8em")
    .style("fill", "#555");

  // Draw axes.
  const xAxis = d3.axisBottom(xScale).tickSize(0);
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
    .ticks(2)
    .tickFormat(bar_formatTicks)
    .tickSizeInner(-width);

  const yAxisDraw = svg.append("g").attr("class", "y axis").call(yAxis);
  yAxisDraw.selectAll("text").attr("dx", "-0.6em");

  function myColor(data) {
    if (data.total_vaccinations > 10e7) {
      return "#008B8B";
    } else if (data.total_vaccinations > 10e6) {
      return "#FB7E81";
    } else {
      return "#9E0508";
    }
  }

  // Draw bars.
  const bars = svg
    .selectAll(".bar")
    .data(barChartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.location))
    .attr("y", (d) => yScale(d.total_vaccinations))
    .transition()
    .duration(1000)
    .delay((d, i) => i * 10)
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.total_vaccinations))
    .style("fill", (d) => myColor(d));

  d3.selectAll("rect")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

// Load data.
d3.csv("../data/vacc_by_country.csv", bar_type).then((res) => {
  bar_ready(res);
});
