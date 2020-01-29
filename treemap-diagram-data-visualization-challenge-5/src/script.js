//constants
const width = 960;
const height = 570;

const svg = d3.select(".visualization")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

const tooltip = d3.select(".visualization")
		.append("div")
		.style("opacity",0)
		.style("display","none")
		.attr("id","tooltip")
		.attr("class","tooltip");

const legend = d3.select(".visualization")
		.append("svg")
		.attr("width",960)
		.attr("height",40)
		.attr("id","legend")

const colorScheme = [];
d3.schemePaired.map(color=> {colorScheme.push(color)
														 //the interpolation is to generate more colors than schemePaired itself has
								 colorScheme.push(d3.interpolateRgb(color, 'white')(0.4))})

const colorScale = d3.scaleOrdinal(colorScheme);

d3.json("https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json").then((d)=>{
	const treemap = d3.treemap()
			.size([960,570])
			.padding(1);
	const root = d3.hierarchy(d)
			.sum(d=>d.value)
			.sort((a,b)=>b.height - a.height || b.value - a.value);
	
	const treemapData = treemap(root);
	const leaves = root.leaves()
	//we need g elements so that both the text and rectangles will render in the right place
	const group = svg.selectAll("g")
		.data(leaves)
		.enter()
		.append("g")
		.attr('transform', d => `translate(${d.x0},${d.y0})`)
	//the tooltip goes on the general element so it becomes active on any part of the rectangle
		.on("mouseover",(d,i)=> {
			tooltip.style("opacity",.9)
			.attr("data-value",d.data.value)
			.html("Name: " + d.data.name + "<br>Category: " + d.data.category + "<br>Value: " + d.data.value)
			.style("top", d3.event.pageY + 5 + "px")
			.style("left",d3.event.pageX + 5 + "px")
			.style("display","block")
		})
		.on("mouseout",(d,i)=> {
			tooltip.style("opacity",0)
		});
	//then add the tiles
group
		.append("rect")
		.attr("width",(d)=>d.x1 - d.x0)
		.attr("height",(d)=>d.y1 - d.y0)
		.attr("class","tile")
		.attr("data-name",(d)=>d.data.name)
		.attr("data-category",(d)=>d.data.category)
		.attr("data-value",(d)=>d.data.value)
		.style("fill",d=>colorScale(d.data.category));
	
group.append("text")
		.style("font-size",".6em")
		.style("font-family","tahoma")
		.selectAll("tspan")
		.data(d=>d.data.name.split(/(?=[A-Z][a-z])/g))
		.enter()
		.append("tspan")
		.attr("x",3)
		.attr("y",(d,i)=>10 + i * 10)
		.text(d=>d);
	
	//legend constants, helps for explaining how the rows are created rather than having magic numbers
	const itemsPerRow = 9;
	const paddingBetweenItems = 100;
	const horizontalPadding = 50;
	const verticalPadding = 5;
	const squareSize = 10;
	
	const legendItem = legend.append("g")
			.selectAll("g")
			.data(treemapData.children)
			.enter()
			.append("g")
			.attr("transform",(d,i)=>(
		`translate(${i%itemsPerRow * paddingBetweenItems + horizontalPadding},${(Math.floor(i/itemsPerRow) * squareSize) + (squareSize * Math.floor(i/itemsPerRow)) + verticalPadding})`))
	legendItem
			.append("rect")
			.attr("class","legend-item")
			.attr("width", squareSize)
			.attr("height", squareSize)
			.style("fill",(d=>colorScale(d.data.name)))
			
	legendItem
			.append("text")
			.attr("x",squareSize + verticalPadding)
			.attr("y",squareSize)
			.text(d=>d.data.name)
})