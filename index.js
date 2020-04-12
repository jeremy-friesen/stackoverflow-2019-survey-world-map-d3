var width = 962,
rotated = 90,
height = 502;

//countries which have states, needed to toggle visibility
//for USA/ etc. either show countries or states, not both
var usa, canada;
var states; //track states
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
  .rotate([rotated, 0, 0]); //center on USA because 'murica

var zoom = d3.behavior.zoom()
  .scaleExtent([1, 20])
  .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
  .attr("width", width)
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

var countryData = {};
d3.json("data.json", function(error, data){
  for(var country in data){
    countryData[country] = data[country]
  }
});
//console.log(countryData);

var topLanguages = [];
var topLanguagesColours = [];


//det json data and draw it
d3.json("world-countries.json", function (error, world) {
  if (error) return console.error(error);
  //console.log(world);
  ////console.log(topojson.feature(world, world.objects.countries));
  //countries
  g.append("g")
    .attr("class", "boundary")
    .selectAll("boundary")
    
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

console.log("topLanguages: ");
console.log(topLanguages);
console.log("topLanguagesColours: ");
console.log(topLanguagesColours);


// legend - NOT WORKING

var color = d3.scale.ordinal()
  .domain(topLanguages)
  .range(d3.schemeCategory20);

var legendRectSize = 18;
var legendSpacing = 4;

var legend = svg.selectAll(".legend")
  .data(topLanguages)
  
  .attr("class", "legend")
  .attr('transform', function (d, i) {
    var height = legendRectSize + legendSpacing;
    var offset = height * color.domain().length / 2;
    var horz = -2 * legendRectSize;
    var vert = i * height - offset;
    return 'translate(' + horz + ',' + vert + ')';
  });

legend.append('rect')
  .attr('width', legendRectSize)
  .attr('height', legendRectSize)
  .style('fill', color)
  .style('stroke', color);

legend.append('text')
  .attr('x', legendRectSize + legendSpacing)
  .attr('y', legendRectSize - legendSpacing)
  .text(function (d, i) { return topLanguages[i]; });

g.append("legend")

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