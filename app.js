const width = 1400;
const height = 900;

const svg = d3.select(".map").append("svg").attr("width", width).attr("height", height);
const mapGroup = svg.append("g");

const projection = d3.geoMercator()
    .translate([width / 2, height / 1.6])
    .scale(185);

const path = d3.geoPath()
    .projection(projection);

d3.queue()
    .defer(d3.json,
      "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json")
    .defer(d3.json,
      "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json")
    .await(main);

function main(error, data, meteors){
  const countries = topojson.feature(data, data.objects.countries1).features;
  const newMeteors = meteors.features.filter( d => d.geometry && d.properties.mass);

  const max = d3.max(newMeteors, d => +d.properties.mass);
  const min = d3.min(newMeteors, d => +d.properties.mass);

  const meteoriteScale = d3.scaleLinear()
        .domain([min, max*0.01, max*0.2, max*0.9])
        .range([4, 7, 40, 50]);

  const tip = d3.tip()
        .attr("class","tip")
        .html(d =>  `${d.properties.name}
                    <br/><br/>
                    ${d.properties.mass} kg
                    <br/>
                    ${d.properties.year.split("T")[0]}`);

   mapGroup.selectAll(".country")
    .data(countries)
    .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path);

   mapGroup.selectAll(".meteor")
    .data(newMeteors)
    .enter()
      .append("circle")
      .attr("class", "meteor")
        .attr("r", d => meteoriteScale(d.properties.mass))
        .attr("cx", d => projection(d.geometry.coordinates)[0])
        .attr("cy", d => projection(d.geometry.coordinates)[1])
        .style("fill", "#006A4E")
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide);

  svg.call(tip);
}
