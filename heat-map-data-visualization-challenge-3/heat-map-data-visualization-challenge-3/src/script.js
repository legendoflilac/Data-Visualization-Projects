//constants
const margin = {top: 60, bottom: 60, left: 60, right: 60};

const width = 1100 + margin.left + margin.right;
const height = 400 + margin.top + margin.bottom;

const svg = d3.select("#visual")
							.append("svg")
							.attr("width",width)
							.attr("height",height)
							.append("g")
							.attr("transform","translate(" + margin.left + "," + margin.top + ")");

const tooltip = d3.select("#visual")
									.append("div")
									.attr("class","tooltip")
									.style("opacity",0)
									.style("display","none");
const title = svg.append("text")
									.attr("text-anchor","middle")
									.attr("transform","translate(" + (width - margin.left)/2 +","+(-margin.top / 2)+")")
			title.append("tspan")
				.attr("id","title")
				.text("Monthly Global Land-Surface Temperature")
			title.append("tspan")
				.attr("x",0)
				.attr("dy","1.1em")
				.attr("id","description")
				.text("Base Temperature: 8.66℃");
const legend = svg.append("g")
									.attr("id","legend")
									.attr("transform","translate(" + (width / 3) + "," + (height + 20 - (margin.top + margin.bottom))  + ")");

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").then((data)=> {
	//Format months
	let parseMonth = d3.timeParse("%B");
	let formatMonth = d3.timeFormat("%B");
	let months = data.monthlyVariance.map(d=>(d.month));
	months = months.map(d=> {
		switch(d){
			case 1:
				return "January";
			case 2:
				return "February";
			case 3:
				return "March";
			case 4:
				return "April";
			case 5:
				return "May";
			case 6:
				return "June";
			case 7:
				return "July";
			case 8:
				return "August";
			case 9:
				return "September";
			case 10:
				return "October";
			case 11:
				return "November";
			case 12:
				return "December";
		}
	})
	let uniqueMonths = [...new Set(months)];
	//Format years
	let years = data.monthlyVariance.map(d=> d.year);
	let uniqueYears = [...new Set(years)];
	
	//Format Values
	let values = data.monthlyVariance.map(d => d.variance);
	let maxValue = d3.max(values, d=>d)
	let minValue = d3.min(values, d=>d)

	//Scales and Axes
	let xScale = d3.scaleBand()
		.domain(uniqueYears)
		.range([0,width-margin.left-margin.right])
		.padding(0.05);
	svg.append("g")
		.attr("transform","translate(0,"+ (height - margin.top - margin.bottom) + ")")
		.attr("id","x-axis")
		.call(d3.axisBottom(xScale)
					.tickValues(xScale.domain().filter((d,i)=> !(d%10))) //if i%10 is used, will display first tick and then the intervals after--using d%10 allows to filter so only "decades" are shown
				 );
	let yScale = d3.scaleBand()
		.domain(uniqueMonths)
		.range([0,height-margin.top-margin.bottom])
		.padding(0.05);
	svg.append("g")
		.attr("id","y-axis")
		.call(d3.axisLeft(yScale));
	
	let colorScale = d3.scaleLinear()
		.domain([minValue,0,maxValue])
		.range(["#601A4A", "#F9F4EC", "#EE442F"]);
	//Color Scheme from: https://venngage.com/blog/color-blind-friendly-palette/
	
	//Add rects
	svg.selectAll("rect")
		.data(data.monthlyVariance)
		.enter()
		.append("rect")
		.attr("width",xScale.bandwidth())
		.attr("height",yScale.bandwidth())
		.attr("class","cell")
		.style("fill",(d,i)=>colorScale(values[i]))
		.attr("x",(d)=>xScale(d.year))
		.attr("y",(d,i)=>yScale(months[i]))
		.attr("data-month", (d,i)=>d.month - 1) //this test is written with an assumption that the array has a range of 0-11 instead of 1-12. Not a great solution, but it's what we're going with.
		.attr("data-year",(d,i)=>years[i])
		.attr("data-temp",(d,i)=>values[i])
		.on("mouseover", (d,i)=> {
		tooltip
			.attr("id","tooltip")
			.attr("data-year",years[i])
			.html(years[i] + ' - ' + months[i] + '<br>' + values[i] + "℃")
			.style("left", (d3.event.pageX + 5 + "px"))
			.style("top",((d3.event.pageY - 5 + "px")))
			.style("display","block")
			.style("opacity",0.8)
	})
	.on("mouseout",(d)=> {
		tooltip.style("opacity",0);
	});
	
	//legend
	legend.selectAll("rect")
	//d3.range has (start,stop,step) parameters, allowing for the legend to have a defined color corresponding to the degree value
.data(d3.range(Math.floor(minValue),Math.ceil(maxValue),1))
				.enter()
				.append("rect")
				.attr("height", 25)
				.attr("width",25)
				.attr("fill",(d)=>colorScale(d))
				.attr("x",(d,i)=>i*25);
	legend.selectAll("text")
		.data(d3.range(Math.floor(minValue),Math.ceil(maxValue),1))
				.enter()
				.append("text")
				.attr("x",(d,i)=>i*25+5)
				.attr("y",40)
				.text(d=>d + "°")
})

