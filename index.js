var width = 962,
rotated = 90,
height = 502;
var colourList = ['lightgreen', 'green', 'blue', 'palevioletred', 'red', 'yellow']

//Store parsed data
var parsedData;
d3.json("/data.json", function(data) {
  parsedData = data;
});

//track where mouse was clicked
var initX;
//track scale only rotate when s === 1
var s = 1;
var mouseClicked = false;


//This variable will be used to store the country name when the user clicks on a country
var countryClicked = '';


var projection = d3.geo.mercator()
  .scale(153)
  .translate([width / 2, height / 1.5])
  .rotate([rotated, 0, 0]);

var zoom = d3.behavior.zoom()
  .scaleExtent([1, 20])
  .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
  .attr("width", width+200)
  .attr("height", height)
  //track where user clicked down
  .on("mousedown", function () {
    d3.event.preventDefault();
    //only if scale === 1
    if (s !== 1) return;
    initX = d3.mouse(this)[0];
    mouseClicked = true;
  })
  .on("mouseup", function () {
    if (s !== 1) return;
    rotated = rotated + ((d3.mouse(this)[0] - initX) * 360 / (s * width));
    mouseClicked = false;
  })
  .call(zoom);

function rotateMap(endX) {
  projection.rotate([rotated + (endX - initX) * 360 / (s * width), 0, 0])
  g.selectAll('path')
    .attr('d', path);
}

//for tooltip
var offsetL = document.getElementById('map').offsetLeft + 10;
var offsetT = document.getElementById('map').offsetTop + 10;

var path = d3.geo.path()
  .projection(projection);

var tooltip = d3.select("#map")
  .append("div")
  .attr("class", "tooltip hidden");

//need this for correct panning
var g = svg.append("g");

var languageColours = {};
d3.json("colours.json", function(error, data){
  for(var lang in data){
    languageColours[lang] = data[lang].color;
  }
});
//console.log(languageColours);

var topLanguages = [];
var topLanguagesColours = [];

var topPlatforms = [];

countryTops = {};

// parse country data
var countryData = {};
d3.json("data.json", function(error, data){
  for(var country in data){
    countryData[country] = data[country];

    // parse top languages
    var topLanguage = Object.keys(data[country].languages)[0];
    if (topLanguage == "NA") topLanguage = Object.keys(data[country].languages)[1];
    if (topLanguage == undefined) topLanguage = "NA";
    if(topLanguages.indexOf(topLanguage) == -1) {
      topLanguages.push(topLanguage);
      topLanguagesColours.push(languageColours[topLanguage]);
    }

    // parse top platforms
    var topPlatform = Object.keys(data[country].platforms)[0];
    if (topPlatform == "NA") topPlatform = Object.keys(data[country].platforms)[1];
    if (topPlatform == undefined) topPlatform = "NA";
    if (topPlatforms.indexOf(topPlatform) == -1) {
      topPlatforms.push(topPlatform);
    }
  }

  countryTops = {"top languages": topLanguages, "top platforms": topPlatforms};
  console.log(countryTops);

  var dropdown = d3.select("body").insert("select", ":first-child")
    .attr("class", "select")

  dropdown.selectAll("option")
    .data(Object.keys(countryTops))
    .enter()
    .append("option")
    .attr("value", function (d) { return d; })
    .text(function (d) {
      return d;
      //return d[0].toUpperCase() + d.slice(1, d.length); // capitalize 1st letter
    });
    
  var legendRectSize = 18;
  var legendSpacing = 4;
  var legend = svg.append("g")
    .attr("class", "legend");

  // Handler for dropdown value change
  var dropdownChange = function () {
    var selectedAttribute = d3.select(this).property('value');
    console.log(selectedAttribute);
    console.log(countryTops[selectedAttribute]);
    if (selectedAttribute == undefined)
      selectedAttribute = "top languages";

    var rects = legend
      .selectAll('rect')
      .data(countryTops[selectedAttribute], function(d){return d;})

    rects.exit().remove();

    rects.enter()
      .append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .attr('x', width + 20)
      .attr('y', function (d, i) { return 100 + i * 25 })
      .attr('fill', function (d, i) {
        var value = countryTops[selectedAttribute][i]
        if (selectedAttribute == "top languages") {
          var ret = topLanguagesColours[topLanguages.indexOf(value)];
        } else {
          var ret = d3.scale.ordinal(d3["schemeSet3"])(value);
        }
        if (ret == undefined)
          return "white";
        return ret;
      })
      .attr('stroke', function () { return "black" });

    rects.transition()
      .attr('y', function (d, i) { return 100 + i * 25 })
      .attr('fill', function (d, i) {
        var value = countryTops[selectedAttribute][i]
        if (selectedAttribute == "top languages") {
          var ret = topLanguagesColours[topLanguages.indexOf(value)];
        } else {
          var ret = d3.scale.category20().domain(countryTops[selectedAttribute])(value);
          console.log(ret);
        }
        if (ret == undefined)
          return "white";
        return ret;
      })
      .attr('stroke', function () { return "black" });

    var texts = legend.selectAll('text')
      .data(countryTops[selectedAttribute], function (d) { return d; });

    texts.exit().remove()

    texts.enter()
      .append('text')
      .attr('x', width + 50)
      .attr('y', function (d, i) { return 110 + i * 25 })
      .text(function (d, i) { return countryTops[selectedAttribute][i]; });
  
    texts.transition()
      .attr('y', function (d, i) { return 110 + i * 25 })
  };

  dropdown.on("change", dropdownChange);
  dropdownChange();
});


//console.log(countryData);
console.log("topLanguages: ");
console.log(topLanguages);
console.log("topLanguagesColours: ");
console.log(topLanguagesColours);

// get json data and draw it
d3.json("world-countries.json", function (error, world) {
  if (error) return console.error(error);
  //console.log(world);
  ////console.log(topojson.feature(world, world.objects.countries));
  //countries
  g.append("g")
    .attr("class", "boundary")
    .selectAll("boundary")
    .attr("width", width-200)
    .attr("height", height)
    .data(topojson.feature(world, world.objects.countries1).features)
    .enter()
    .append("path")
    .attr("name", function (d) { return d.properties.name; })
    .attr("id", function (d) { return d.id; })
    .attr("style", function (d) {
      var colour = "#f0f0f0";
      
      if(countryData[d.properties.name] != undefined){
        languages = Object.keys(countryData[d.properties.name].languages);
        colour = languageColours[languages[0]];

        if(colour == undefined){
          //console.log('language issue: ' + languages[0] + ', country: ' + d.properties.name);
          colour = "#f0f0f0";
        } else{

          if(topLanguages.indexOf(languages[0]) == -1){
            topLanguages.push(languages[0]);
           
            topLanguagesColours.push(colour);
          }
        }
      }else{
        //console.log("Country issue: " + d.properties.name);
      }
      return "fill:" + colour + ";";
    })
    
    .on('click', selected)
    .on("mousemove", showTooltip)
    .on("mouseout", function (d, i) {
      tooltip.classed("hidden", true);
    })
    .attr("d", path);
});

// tooltip
function showTooltip(d) {
  label = d.properties.name;
  
  var mouse = d3.mouse(svg.node())
    .map(function (d) { return parseInt(d); });
  tooltip.classed("hidden", false)
    .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
    .html(label);
}

// selection
d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};

//This functon will highlight the country pressed and grab the country name 
function selected(d) {
 
  if (countryClicked != ''){ //clears the countryClicked variable when user presses new country 
      countryClicked = '';
      countryClicked += d.properties.name; //stores country name in variable 
  }

  countryClicked = d.properties.name;  //stores country name in variable
  console.log(countryClicked); 

  //Aabids function for his graphs can go here and he can pass it country name
  let attribute = "languages";
  displayBarCharts(countryClicked, attribute, 1);
  attribute = "platforms";
  displayBarCharts(countryClicked, attribute, 2);
  attribute = "yearsCoding";
  displayBarCharts(countryClicked, attribute, 3);
  attribute = "developerTypes";
  displayBarCharts(countryClicked, attribute, 4);

  d3.select('.selected').classed('selected', false);
  d3.select(this).classed('selected', true);
  d3.select(this).moveToFront();
}

// zoom
function zoomed() {
  var t = d3.event.translate;
  s = d3.event.scale;
  var h = 0;

  t[0] = Math.min(
    (width / height) * (s - 1),
    Math.max(width * (1 - s), t[0])
  );

  t[1] = Math.min(
    h * (s - 1) + h * s,
    Math.max(height * (1 - s) - h * s, t[1])
  );

  zoom.translate(t);
  if (s === 1 && mouseClicked) {
    rotateMap(d3.mouse(this)[0])
    return;
  }

  g.attr("transform", "translate(" + t + ")scale(" + s + ")");

  //adjust the stroke width based on zoom level
  d3.selectAll(".boundary")
    .style("stroke-width", 1 / s);
}
















///Create graphs
//Called when a country on the map is clicked
function displayBarCharts(countryClicked, attribute, index){
  //use the parsed data
  console.log(parsedData[countryClicked]);
  let data = parsedData[countryClicked][attribute];
  console.log(data);
  //console.log(Object.keys(data));
  //console.log(Object.values(data));

  let maxY = Math.max(...Object.values(data));
  let newData = [];

  let maxLength = 10;
  if (Object.keys(data).length < maxLength){
    maxLength = Object.keys(data).length;
  }
  for (let i = 0; i < maxLength; i++){
    newData.push({'x': `${Object.keys(data)[i]}`, "y": `${Object.values(data)[i]}`});
  }

  console.log("newData = ", newData);

  let div = document.getElementById(`vis${index}`);
  if(div.hasChildNodes()){
    let removeTable = document.getElementById(`svgChart${index}`);
    removeTable.parentNode.removeChild(removeTable);
  }

  const margin = 50;
  const width = 500;
  const height = 400;
  const chartWidth = width - 2 * margin;
  const chartHeight = height - 2 * margin;

  const colourScale = d3.scale.ordinal()
                        //.domain([0, d3.max(data, d => d.y)])
                        .domain([0, 5])
                        .range(colourList);

  const xScale = d3.scale.ordinal()
                   .rangeRoundBands([0, chartWidth], .1)
                   .domain(newData.map((d) => d.x))
  //console.log("domain = ", xScale.domain())

  const yScale = d3.scale.linear()
                   .range([chartHeight, 0])
                   .domain([0, maxY]);
  //console.log("domain = ", yScale.domain())

  const xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom")

  const yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
  
  const svg = d3.select(`#vis${index}`)
                .append('svg')
                  .attr('id', `svgChart${index}`)
                  .attr('class', 'barChart')
                  .attr('width', width)
                  .attr('height', height);
  
  const canvas = svg.append('g')
                      .attr('transform', `translate(${margin}, ${margin})`);
  
  // chart title
  svg.append('text')
        .attr('x', margin + chartWidth / 1.75)
        .attr('y', margin - 30)
        .attr('text-anchor', 'middle')
        .text(`Top ${maxLength} ${attribute} in ${countryClicked}`)
        .attr('font-size', 22)
        .attr('font-weight', 'bold')
        .style("text-decoration", "underline");

  // x-axis and label
  canvas.append('g')
           .attr('transform', `translate(${margin}, ${chartHeight})`)
           .call(xAxis)
           .attr('font-size', 10);


  svg.append('text')
         .attr('x', margin + chartWidth / 2 + margin)
         .attr('y', chartHeight + 2 * margin - 5)
         .attr('text-anchor', 'middle')
         .text(`${attribute}`);

  // y-axis and label
  canvas.append('g')
           .attr('transform', `translate(50, 0)`)
           .call(yAxis)
           .attr('font-size', 15);

  svg.append('text')
         .attr('x', margin + -(chartWidth / 1.7))
         .attr('y', margin - 5)
         .attr('transform', 'rotate(-90)')
         .attr('text-anchor', 'middle')
         .text('Count');
  
  // the bar chart
  const bars = canvas.selectAll('rect')
                     .data(newData)
                     .enter()
                        .append('rect')
                            .attr('x', (d) => margin + xScale(d.x))
                            .attr('y', chartHeight)
                            .attr('height', 0)
                            .attr('width', xScale.rangeBand())
                            .attr('fill', 'blue')
                            .on('mouseenter', function(source, index) {
                                d3.select(this)
                                  .transition()
                                  .duration(200)
                                  .attr('opacity', 0.5);
                            })
                            .on('mouseleave', function(source, index) {
                              d3.select(this)
                                  .transition()
                                  .duration(200)
                                  .attr('opacity', 1.0);
                            });

  bars.transition()
      .ease("elastic")
      .duration(800)
      .delay((d, index) => index * 50)
      .attr('y', (d) => yScale(d.y))
      .attr('height', (d)  => chartHeight - yScale(d.y))

}