//constants
const width = 1000;
const height = 600;

const svg = d3.select("#visual")
		.append("svg")
		.attr("width",width)
		.attr("height",height);

const tooltip = d3.select("#visual")
		.append("div")
		.attr("class","tooltip")
		.attr("id","tooltip")
		.style("opacity",0)
		.style("display","none");

//legend

const legend = svg.append("g")
		.attr("class","legend")
		.attr("id","legend")
		.attr("transform","translate(0,40)");

//Path

const path = d3.geoPath() //no projection needed for this data

//Color Scale -- referenced https://observablehq.com/@d3/quantile-quantize-and-threshold-scales
const colorScale = d3.scaleQuantile().range(["#F5F5F5","#D1D7DB", "#95A3AE","#66747E","#3F474D"])

//Data, returns promises
const educationJSON = d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json");

const mapJSON = d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json")

//Resolve Promises and display map
Promise.all([mapJSON,educationJSON]).then((values)=> {
	const bachelors = values[1].map(d=>d.bachelorsOrHigher)
	//values will be used for the legend later
	let minValue = d3.min(bachelors,d=>d);
	let maxValue = d3.max(bachelors,d=>d);
	//add domain to colorScale
	colorScale.domain([d3.min(bachelors,d=>d),d3.max(bachelors,d=>d)])
	
	//The example pen (https://codepen.io/freeCodeCamp/pen/EZKqza) uses .rangeRound, but since we don't use an interpolator it's not necessary
	const legendScale = d3.scaleLinear().domain([minValue, maxValue]).range([600, 860]);

	
	//add counties from TopoJSON data, converted to GeoJSON
svg.selectAll("path")
		.data(topojson.feature(values[0],values[0].objects.counties).features)
		.enter()
		.append("path")
		.attr("d",path)
		.attr("class","county")
		.attr("data-fips",(d,i)=>{
	let mapId = values[0].objects.counties.geometries[i].id;
		let educationObject = values[1].filter((object)=>object.fips == mapId)
		return educationObject[0].fips
})
	.attr("data-education",(d,i)=>{
	let mapId = values[0].objects.counties.geometries[i].id;
		let educationObject = values[1].filter((object)=>object.fips == mapId)
		return educationObject[0].bachelorsOrHigher
})
		.attr("stroke","gray")
		.attr("fill",(d,i)=>{
		let mapId = values[0].objects.counties.geometries[i].id;
		let educationObject = values[1].filter((object)=>object.fips == mapId);
		return colorScale(educationObject[0].bachelorsOrHigher)})
		.on("mouseover",(d,i)=> {
			let mapId = values[0].objects.counties.geometries[i].id;
			//filter the education array to only return the object that matches the mapId
			let educationObject = values[1].filter((object)=>object.fips == mapId);
			tooltip.html(educationObject[0].area_name + ", " + educationObject[0].state + "<br>" + educationObject[0].bachelorsOrHigher + "%")
			.attr("data-education",educationObject[0].bachelorsOrHigher)
			.style("left", d3.event.pageX + 10 + "px")
			.style("top", d3.event.pageY + 5 + "px")
			.style("display","block")
			.style("opacity",0.7)
			})
		.on("mouseout",(d)=> {
				tooltip.style("opacity",0)
			})

		//add state lines, referenced https://observablehq.com/@d3/choropleth
svg.append("path")
		.datum(topojson.mesh(values[0], values[0].objects.states,(a,b)=>a!==b))
		.attr("fill","none")
		.attr("stroke","#d6ffe9")
		.attr("stroke-linejoin","round")
		.attr("d",path)
		.attr("class","state");
	
	//add legend axis and values
	
	let legendValues = [...colorScale.quantiles()]
	legendValues.push(maxValue)
	legendValues.unshift(minValue)
	
	const legendAxis = d3.axisBottom(legendScale)
	.tickSize(13)
	.tickFormat((x)=>Math.round(x) + '%')
	.tickValues(legendValues);
	
	legend.call(legendAxis);
	//The code below creates the color divisions for the legend
	legend.selectAll("rect")
		.data(colorScale.range().map((color)=>{
		color = colorScale.invertExtent(color);
		if (color[0] == null) color[0] = legendScale.domain()[0];
		if (color[1] == null) color[1] = legendScale.domain()[1];
		return color;
	})) //returns array of values that correspond to quantile color
	.enter().append("rect")
		.attr("height",8)
		.attr("x",(d)=> legendScale(d[0]))
		.attr("width",(d)=> legendScale(d[1]) - legendScale(d[0]))
		.attr("fill",(d)=>colorScale(d[0]))
})