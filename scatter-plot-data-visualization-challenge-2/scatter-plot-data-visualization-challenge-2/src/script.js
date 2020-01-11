//set constants
const margin = {top: 20, bottom: 20, left: 50, right: 50};

const width = (1000 + margin.left + margin.right);
const height = (500 + margin.top + margin.bottom);

const svg = d3.select(".visual")
							.append("svg")
							.attr("width",width)
							.attr("height",height)
const g = svg.append("g")
				.attr("transform","translate("+ margin.left + "," + margin.top +")")

const tooltip = d3.select(".visual")
									.append("div")
									.attr("id","tooltip")
									.attr("class","tooltip")
									.style("opacity",0)
									.style("display","none");
//data
const jsondata = d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then((data)=> {
	//parse/format for proper display on axes
	const parse = d3.timeParse('%M:%S');
  const format = d3.timeFormat('%M:%S');
	const yparse = d3.timeParse('%Y');
	const yformat = d3.timeFormat('%Y')
	//extract data needed
	let times = data.map(data => data.Time)
	times = times.map(d=>parse(d));
	let years = data.map(data => data.Year)
	years = years.map(d=>yparse(d))
	let doping = data.map(data => data.Doping)
	let names = data.map(data => data.Name)
	let maxYear = d3.max(years, (d,i) => (years[i]))
	let minYear = d3.min(years, (d,i) => (years[i]))
	let maxTime = d3.max(times, (d,i) => times[i])
	let minTime = d3.min(times, (d,i) => times[i])
	//set scales
	const xScale = d3.scaleTime().domain([minYear,maxYear]).range([0, width - margin.right - margin.left]);
	const yScale = d3.scaleTime().domain([minTime,maxTime]).range([height - margin.top - margin.bottom, 0]);
	g.append("g")
		.attr("id","x-axis")
		.attr("transform", "translate(20," + 500 + ")")
		.call(d3.axisBottom(xScale))
	//set format for y axis
	let yAxis = d3.axisLeft(yScale)
					.tickFormat(format)
	g.append("g")
		.attr("id","y-axis")
		.attr("transform","translate(20,0)")
		.call(yAxis);
		//scale the points we need for the graph
		let scaledyears = years.map(d => xScale(d));
		let scaledtimes = times.map(d=> yScale(d));
	
	//get colors we need for dots
	let color = doping.map((d)=> {
		if (d == "") {
			return "blue"
		} return "red"
	})
	
	// dots
	svg.selectAll(".dot")
		.data(data)
		.enter()
		.append("circle")
		.attr("class","dot")
		.attr("r",5)
		.attr("cx", (d,i) => scaledyears[i])
		.attr("cy",(d,i) => scaledtimes[i])
		.attr("data-xvalue", (d,i) => years[i])
		.attr("data-yvalue", (d,i) => times[i])
		.attr("fill",(d,i) => color[i])
		.attr("transform","translate(" + (margin.left + 20) + "," + (margin.top) + ")")
		.on("mouseover", (d,i) => {
		tooltip.style("opacity",0.8)
						.attr("id","tooltip")
						.html("Name: " + names[i] + "<br>Time: " + format(times[i]) + "<br>Year: " + yformat(years[i]))
						.style("left",d3.event.pageX + 5 + "px")
						.style("top",d3.event.pageY - 5 + "px")
						.attr("data-year",years[i])
						.style("display","block")
	})
	.on("mouseout",(d) => {
		tooltip.style("opacity",0)
	})
	svg.append("text")
			.attr("transform","rotate(-90)")
			.attr("x",-(height / 2))
			.attr("y",margin.left - 20)
			.text("Fastest to Slowest Times")
	
	//legend
	let legendColors = [
		["No Doping Allegations","blue"],
		["Riders with Doping Allegations","red"],
	];
	const legend = svg.selectAll(".legend")
        .data(legendColors)
				.enter()
				.append("g")
        .attr("class","legend")
        .attr("id", "legend")
				.attr("transform", (d,i) => "translate(0," + (height/2 - i * 20) + ")");
      legend
        .append("rect")
        .attr("x", width - 150)
        .attr("y", 0)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", d => d[1]);
      legend
        .append("text")
        .attr("id", "label")
        .attr("x", width - 155)
        .attr("y", 12)
				.style("text-anchor","end")
        .text(d => d[0]);
})