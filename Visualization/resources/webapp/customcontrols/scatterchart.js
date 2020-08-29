sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/HTML",
	"sap/ui/thirdparty/d3"
], function (Control, HTML, d3) {
	return Control.extend("Z.customcontrols.scatterchart", {

		metadata: {
			properties: {
				x: {
					type: "any",
					defaultValue: []
				},
				y: {
					type: "any",
					defaultValue: []
				}
			},
			aggregations: {
				_html: {
					type: "sap.ui.core.HTML",
					multiple: false,
					visibility: "hidden"
				}
			}

		},

		init: function () {

			this._sContainerId = this.getId() + "--container";
			this.setAggregation("_html", new sap.ui.core.HTML({
				content: "<svg id='" + this._sContainerId + "'></svg>"
			}));
		},
		renderer: function (oRenderManager, oControl) {
			oRenderManager.write("<div");
			oRenderManager.writeControlData(oControl);
			oRenderManager.writeClasses();
			oRenderManager.write(">");
			oRenderManager.renderControl(oControl.getAggregation("_html"));
			oRenderManager.write("</div>");
		},

		onAfterRendering: function (oControl) {

			var selRects = d3.select("#" + this._sContainerId);

			// Löschen vor dem Malen --> Sonst wird nur übermalt 
			d3.select("#" + this._sContainerId).selectAll("label").remove();
			d3.select("#" + this._sContainerId).selectAll("circle").remove();
			d3.select("#" + this._sContainerId).selectAll("text").remove();
			d3.select("#" + this._sContainerId).selectAll("line").remove();
			d3.select("#" + this._sContainerId).selectAll("dot").remove();
			d3.select("#" + this._sContainerId).selectAll("path").remove();

			// svg width + height + css
			var container = d3.select("#" + this._sContainerId)
				.attr("width", 1000)
				.attr("height", 325);

			var margin = {
					top: 20,
					right: 20,
					bottom: 30,
					left: 40
				},
				width = 960 - margin.left - margin.right,
				height = 325 - margin.top - margin.bottom;

			var x = d3.scale.linear()
				.range([0, width]);

			var y = d3.scale.linear()
				.range([height, 0]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");

			var yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");

			var svg = d3.select("#" + this._sContainerId)
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			if (oControl.srcControl.getX().length < 2) {

				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.append("text")
					.attr("class", "label")
					.attr("x", width)
					.attr("y", 30)
					.style("text-anchor", "end")
					.text("reorders");

				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis)
					.append("text")
					.attr("class", "label")
					.attr("transform", "rotate(-90)")
					.attr("y", -40)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text("probability reordering ");

				svg.append("g")
					.append("text")
					.attr("y", 150)
					.attr("x", 400)
					.text("no data");

			} else {

				var data = create_data();

				data.forEach(function (d) {
					d.x = +d.x;
					d.y = +d.y;
					d.yhat = +d.yhat;
				});

				var line = d3.svg.line()
					.x(function (d) {
						return x(d.x);
					})
					.y(function (d) {
						return y(d.yhat);
					});

				x.domain(d3.extent(data, function (d) {
					return d.x;
				}));
				y.domain(d3.extent(data, function (d) {
					return d.y;
				}));

				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)
					.append("text")
					.attr("class", "label")
					.attr("x", width)
					.attr("y", 30)
					.style("text-anchor", "end")
					.text("order numbers");

				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis)
					.append("text")
					.attr("class", "label")
					.attr("transform", "rotate(-90)")
					.attr("y", -40)
					.attr("dy", ".71em")
					.style("text-anchor", "end")
					.text("probability reordering ");

				svg.selectAll(".dot")
					.data(data)
					.enter().append("circle")
					.attr("class", "dot")
					.attr("r", 3.5)
					.attr("cx", function (d) {
						return x(d.x);
					})
					.attr("cy", function (d) {
						return y(d.y);
					});

				svg.append("path")
					.datum(data)
					.attr("class", "line")
					.attr("d", line);
			}

			function create_data() {
				var x = oControl.srcControl.getX();
				var y = oControl.srcControl.getY();
				var n = oControl.srcControl.getX().length;
				var x_mean = 0;
				var y_mean = 0;
				var term1 = 0;
				var term2 = 0;
//  Sxy Syy 
				// create x and y values
				for (var i = 0; i < n; i++) {
					x_mean += x[i];
					y_mean += y[i];
				}
				// calculate mean x and y
				x_mean /= n;
				y_mean /= n;

				// calculate coefficients
				var xr = 0;
				var yr = 0;
				for (i = 0; i < x.length; i++) {
					xr = x[i] - x_mean;
					yr = y[i] - y_mean;
					term1 += xr * yr;
					term2 += xr * xr;

				}
				var b1 = term1 / term2;
				var b0 = y_mean - (b1 * x_mean);
				// perform regression 

				yhat = [];
				// fit line using coeffs
				for (i = 0; i < x.length; i++) {
					yhat.push(b0 + (x[i] * b1));
				}

				var data = [];
				for (i = 0; i < y.length; i++) {
					data.push({
						"yhat": yhat[i],
						"y": y[i],
						"x": x[i]
					})
				}
				return (data);
			}

		}

	});
});