const width = 1000
const height = 500

const svg = d3.select(".visual")
							.append("svg")
							.attr("width",width)
							.attr("height", height)
const tooltip = d3.select(".visual")
							.append("div")
							.attr("id","tooltip")
							.attr("class","tooltip")
							.style("opacity",0)
							.style("display", "none");

const xScale = d3.scaleTime().range([0, width - 100 ]);
const yScale = d3.scaleLinear().range([0, height - 100]);
const g = svg.append("g")
							.attr("transform","translate(" + 0 + "," + 0 + ")");

const jsondata = d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json").then((data)=> {
	let year = data.data.map(d => d[0])
	let dateYear = year.map(function(item) {
		return new Date(item)
	})
	let onlyYear = dateYear.map(function(item) {
		return item.getFullYear()
	})
	let max = new Date(d3.max(year));
	let min = new Date(d3.min(year));
	max.setYear(2016)
	let GDP = data.data.map(d=>d[1])
	xScale.domain([min,max])
	yScale.domain([d3.max(data.data, d=>d[1]), 0]) //large to small, else it doesn't work
	g.append("g")
         .attr("transform", "translate(" + 40 + "," + 420 + ")")
				 .attr("class","tick")
				 .attr("id","x-axis")
         .call(d3.axisBottom(xScale).ticks(20));

        g.append("g")
					.attr("transform", "translate(" + 40 + "," + 20 + ")")
				  .attr("class","tick")
					.attr("id","y-axis")
          .call(d3.axisLeft(yScale).ticks(10));
	d3.select("svg").selectAll("rect")
	.data(GDP)
	.enter()
	.append("rect")
	.attr("class","bar")
	.attr("data-date",(d,i) => data.data[i][0])
	.attr("data-gdp", (d,i) => d)
	.attr("y", (d) => (yScale(d)))
	.attr("x", (d,i) => xScale(new Date (data.data[i][0])))
	.attr("height", (d,i) => (height - yScale(d)) - 100)
	.attr("width",(d) => width/275)
	.attr("transform", "translate(40,20)")
	.on("mouseover", (d,i)=> {
		tooltip.style("opacity", 0.8)
             .attr("id", "tooltip")
             .attr("data-date", data.data[i][0])
             .html("Date: " + data.data[i][0] + "<br>GDP: " + d)
             .style("left", d3.event.pageX + 5 + "px")
             .style("top", d3.event.pageY - 5 + "px")
						 .style("display","block");
  })
	.on("mouseout", (d) => {
        tooltip.style("opacity",0)
  })
	svg.append("text")
		.attr("transform","rotate(-90)")
		.attr("x",-300)
		.attr("y",60)
		.text("GDP in Billions of Dollars");
	svg.append("text")
		.attr("class","bottomlabel")
		/*.attr("transform","translate(80,80)")*/
		.attr("x",500)
		.attr("y",460)
		.text("Year")
})