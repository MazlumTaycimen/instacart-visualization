sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"Z/Visualization/customcontrols/scatterchart",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (Controller, Filter, Scatterchart, ChartFormatter, Format) {
	"use strict";
	var self;
	var scatterchart;
	this.searchevent_aisles;
	this.searchevent_departments;
	this.searchevent_products;
	this.searchevent_users;
	this.current_tab;
	var oModelOrgVSNON;
	var oModelTop10Products;
	var oModelorderhours;
	var oModelorderdays;
	var oModelpriororder;
	var oModelmostoften;
	var oModelreorder;
	var oModelfirstincart;
	var oModelprobability;
	var oModelAsso2;
	var oModelUser;
	return Controller.extend("Z.Visualization.controller.Auswahl", {
		onInit: function () {
			self = this;
			var dataPath = "/xsodata/getPortfolio.xsodata";
			var dataModel = new sap.ui.model.json.JSONModel(dataPath + "/portfolioSet");
			dataModel.attachRequestCompleted(function () {
				var oVizFrame = self.getView().byId("idVizFrame");
				oVizFrame.setVizProperties({
					plotArea: {
						dataLabel: {
							visible: false
						}
					},
					legend: {
						visible: true,
						title: {
							visible: true
						}
					},
					title: {
						visible: false,
						text: "product-portfolio"
					}
				});
				oVizFrame.setModel(dataModel);
			});
			this.initProductView();
		},
		initProductView: function () {
			//Top 10 Ranking Init - All Aisles + Departments
			var sUrl = "/xsodata/getToprankingIP.xsodata";
			oModelTop10Products = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelTop10Products.setCountSupported(false);
			oModelTop10Products.read("/IP(IP_DEPARTMENT='all',IP_AISLE='all')/Results?$orderby=COUNT_ORDERS%20desc", {
				success: function (oData) {
					self.setChartTopranking(oData);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			//comparison organic vs non organic - All Aisles + Departments
			sUrl = "/xsodata/getOrganicVsNonorganic.xsodata";
			oModelOrgVSNON = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelOrgVSNON.read("/IP2(IP_DEPARTMENT='all',IP_AISLE='all')/Results?$orderby=ANZAHL%20desc", {
				success: function (oData) {
					var oVizFrame = self.getView().byId("Pie_chart_OrgVsNon");
					var model = new sap.ui.model.json.JSONModel();
					model.setData(oData);
					var Dataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "Characteristic",
							value: "{ORGANIC}"
						}],
						measures: [{
							name: "Count",
							value: "{ANZAHL}"
						}],
						data: {
							path: "/results"
						}
					});
					oVizFrame.setVizProperties({
						plotArea: {
							dataLabel: {
								visible: true
							}
						},
						legend: {
							title: {
								visible: false
							}
						},
						title: {
							text: "organic vs non organic orders"
						}
					});
					oVizFrame.setDataset(Dataset);
					oVizFrame.setModel(model);
					var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "size",
							"type": "Measure",
							"values": ["Count"]
						}),
						feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "color",
							"type": "Dimension",
							"values": ["Characteristic"]
						});
					oVizFrame.addFeed(feedSize);
					oVizFrame.addFeed(feedColor);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			// Orderhours
			sUrl = "/xsodata/getOrderhours.xsodata";
			oModelorderhours = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelorderhours.read("/IP3(IP_DEPARTMENT='all',IP_AISLE='all',IP_PRODUCT='all')/Results", {
				success: function (oData) {
					var oVizFrame = self.getView().byId("Bar_chart_orderhours");
					var model = new sap.ui.model.json.JSONModel();
					model.setData(oData);
					var Dataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "hour",
							value: "{HOUR_OF_DAY}"
						}],
						measures: [{
							name: "orders",
							value: "{ANZAHL}"
						}],
						data: {
							path: "/results"
						}
					});
					oVizFrame.setDataset(Dataset);
					oVizFrame.setModel(model);
					var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["orders"]
					});
					/*				feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
										"uid": "color",
										"type": "Dimension",
										"values": ["Product"]
									})*/
					var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["hour"]
					});
					oVizFrame.setVizProperties({
						plotArea: {
							dataLabel: {
								visible: false
							}
						},
						legend: {
							title: {
								visible: false
							}
						},
						title: {
							visible: true,
							text: "time of orders"
						}
					});
					oVizFrame.addFeed(feedValueAxis);
					//	oVizFrame.addFeed(feedColor);
					oVizFrame.addFeed(feedCategoryAxis);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			sUrl = "/xsodata/getOrderdays.xsodata";
			oModelorderdays = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelorderdays.read("/IP4(IP_DEPARTMENT='all',IP_AISLE='all',IP_PRODUCT='all')/Results", {
				success: function (oData) {
					var oVizFrame = self.getView().byId("Bar_chart_orderdays");
					var model = new sap.ui.model.json.JSONModel();
					model.setData(oData);
					var Dataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "day",
							value: "{DAY_OF_WEEK}"
						}],
						measures: [{
							name: "orders",
							value: "{ANZAHL}"
						}],
						data: {
							path: "/results"
						}
					});
					oVizFrame.setDataset(Dataset);
					oVizFrame.setModel(model);
					var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["orders"]
					});
					/*				feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
										"uid": "color",
										"type": "Dimension",
										"values": ["Product"]
									})*/
					var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["day"]
					});
					oVizFrame.setVizProperties({
						plotArea: {
							dataLabel: {
								visible: true
							}
						},
						legend: {
							title: {
								visible: false
							}
						},
						title: {
							visible: true,
							text: "orders per day"
						}
					});
					oVizFrame.addFeed(feedValueAxis);
					//	oVizFrame.addFeed(feedColor);
					oVizFrame.addFeed(feedCategoryAxis);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			//bar_chart_prior_order
			sUrl = "/xsodata/getPriororder.xsodata";
			oModelpriororder = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelpriororder.read("/IP5(IP_DEPARTMENT='all',IP_AISLE='all',IP_PRODUCT='all')/Results", {
				success: function (oData) {
					var oVizFrame = self.getView().byId("bar_chart_prior_order");
					var model = new sap.ui.model.json.JSONModel();
					model.setData(oData);
					var Dataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "days since prior order",
							value: "{DAYS_SINCE_PRIOR_ORDER}"
						}],
						measures: [{
							name: "orders",
							value: "{ANZAHL}"
						}],
						data: {
							path: "/results"
						}
					});
					oVizFrame.setDataset(Dataset);
					oVizFrame.setModel(model);
					var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["orders"]
					});
					/*				feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
										"uid": "color",
										"type": "Dimension",
										"values": ["Product"]
									})*/
					var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["days since prior order"]
					});
					oVizFrame.setVizProperties({
						plotArea: {
							dataLabel: {
								visible: false
							}
						},
						legend: {
							title: {
								visible: false
							}
						},
						title: {
							visible: true,
							text: "days since prior order"
						}
					});
					oVizFrame.addFeed(feedValueAxis);
					//	oVizFrame.addFeed(feedColor);
					oVizFrame.addFeed(feedCategoryAxis);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			//bar_chart_most_often
			sUrl = "/xsodata/getMostoftenreordered.xsodata";
			oModelmostoften = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelmostoften.read("/IP6(IP_DEPARTMENT='all',IP_AISLE='all',IP_PRODUCT='all')/Results?$orderby=ANZAHL%20desc", {
				success: function (oData) {
					var oVizFrame = self.getView().byId("bar_chart_most_often");
					var model = new sap.ui.model.json.JSONModel();
					model.setData(oData);
					var Dataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "product",
							value: "{PRODUCT_NAME}"
						}],
						measures: [{
							name: "reorders",
							value: "{ANZAHL}"
						}],
						data: {
							path: "/results"
						}
					});
					oVizFrame.setDataset(Dataset);
					oVizFrame.setModel(model);
					var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["reorders"]
					});
					var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["product"]
					});
					oVizFrame.setVizProperties({
						plotArea: {
							dataLabel: {
								visible: true
							}
						},
						legend: {
							title: {
								visible: false
							}
						},
						title: {
							visible: true,
							text: "most often reordered"
						}
					});
					oVizFrame.addFeed(feedValueAxis);
					//	oVizFrame.addFeed(feedColor);
					oVizFrame.addFeed(feedCategoryAxis);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			sUrl = "/xsodata/getReordernumber.xsodata";
			oModelreorder = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelreorder.read("/IP7(IP_DEPARTMENT='all',IP_AISLE='all',IP_PRODUCT='all')/Results", {
				success: function (oData) {
					var oVizFrame = self.getView().byId("pie_chart_reorder");
					var model = new sap.ui.model.json.JSONModel();
					model.setData(oData);
					var Dataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "Characteristic",
							value: "{REORDERED}"
						}],
						measures: [{
							name: "Count",
							value: "{ANZAHL}"
						}],
						data: {
							path: "/results"
						}
					});
					oVizFrame.setVizProperties({
						plotArea: {
							dataLabel: {
								visible: true
							}
						},
						legend: {
							title: {
								visible: false
							}
						},
						title: {
							text: "reorder numbers"
						}
					});
					oVizFrame.setDataset(Dataset);
					oVizFrame.setModel(model);
					var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "size",
							"type": "Measure",
							"values": ["Count"]
						}),
						feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
							"uid": "color",
							"type": "Dimension",
							"values": ["Characteristic"]
						});
					oVizFrame.addFeed(feedSize);
					oVizFrame.addFeed(feedColor);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			//bar_chart_first_in_cart
			sUrl = "/xsodata/getFirstincart.xsodata";
			oModelfirstincart = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelfirstincart.read("/IP8(IP_DEPARTMENT='all',IP_AISLE='all',IP_PRODUCT='all')/Results?$orderby=ANZAHL%20desc", {
				success: function (oData) {
					var oVizFrame = self.getView().byId("bar_chart_first_in_cart");
					var model = new sap.ui.model.json.JSONModel();
					model.setData(oData);
					var Dataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "product",
							value: "{PRODUCT_NAME}"
						}],
						measures: [{
							name: "orders",
							value: "{ANZAHL}"
						}],
						data: {
							path: "/results"
						}
					});
					oVizFrame.setDataset(Dataset);
					oVizFrame.setModel(model);
					var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["orders"]
					});
					var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["product"]
					});
					oVizFrame.setVizProperties({
						plotArea: {
							dataLabel: {
								visible: true
							}
						},
						legend: {
							title: {
								visible: false
							}
						},
						title: {
							visible: true,
							text: "first in cart"
						}
					});
					oVizFrame.addFeed(feedValueAxis);
					//	oVizFrame.addFeed(feedColor);
					oVizFrame.addFeed(feedCategoryAxis);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			sUrl = "/xsodata/getProbability.xsodata";
			oModelprobability = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelprobability.read("/IP8(IP_DEPARTMENT='all',IP_AISLE='all',IP_PRODUCT='all')/Results", {
				success: function (oData) {
					var x = [];
					var y = [];
					for (var i = 0; oData.results.length > i; i++) {
						x.push(oData.results[i].REORDERS);
						y.push(parseFloat(oData.results[i].PROBABILITY));
					}
					scatterchart = new Scatterchart({
						x: x,
						y: y
					});
					self.getView().byId("hbox_scatter").addItem(scatterchart);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
			sUrl = "/xsodata/getProbabilitylast.xsodata";
			oModelAsso2 = new sap.ui.model.odata.ODataModel(sUrl, true);
			oModelAsso2.read("/IP9(IP_DEPARTMENT='all',IP_AISLE='all',IP_PRODUCT='all')/Results?$orderby=DAYS_SINCE_PRIOR_ORDER%20asc", {
				success: function (oData) {
					var data = oData;
					var oVizFrame = self.getView().byId("column_chart_asso2");
					var model = new sap.ui.model.json.JSONModel();
					model.setData(data);
					var Dataset = new sap.viz.ui5.data.FlattenedDataset({
						dimensions: [{
							name: "days since prior order",
							value: "{DAYS_SINCE_PRIOR_ORDER}"
						}],
						measures: [{
							name: "probability",
							value: "{PROBABILITY}"
						}],
						data: {
							path: "/results"
						}
					});
					oVizFrame.setDataset(Dataset);
					oVizFrame.setModel(model);
					var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["probability"]
					});
					/*				feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
										"uid": "color",
										"type": "Dimension",
										"values": ["Product"]
									})*/
					var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["days since prior order"]
					});
					oVizFrame.setVizProperties({
						valueAxis: {
							label: {
								formatString: null
							}
						},
						plotArea: {
							dataLabel: {
								visible: false
							}
						},
						legend: {
							title: {
								visible: false
							}
						},
						title: {
							visible: true,
							text: "day of last order and probability of reordering"
						}
					});
					oVizFrame.addFeed(feedValueAxis);
					//	oVizFrame.addFeed(feedColor);
					oVizFrame.addFeed(feedCategoryAxis);
				},
				error: function (oError) {
					sap.m.MessageToast.show("Error! " + oError.message);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		onSearchaisles: function (event) {
			this.searchevent_aisles = event.getParameter("suggestionItem");
		},
		onSuggestaisles: function (event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [new Filter([new Filter("aisle", sap.ui.model.FilterOperator.Contains, sValue)])];
			}
			var oSource = event.getSource();
			var oBinding = event.getSource().getBinding("suggestionItems");
			self.getView().byId("searchfield_aisles").getBinding("suggestionItems").filter(aFilters);
			oBinding.attachEventOnce("dataReceived", function () {
				oSource.suggest();
			});
		},
		onSearchproducts: function (event) {
			this.searchevent_products = event.getParameter("suggestionItem");
		},
		onSuggestproducts: function (event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [new Filter([new Filter("product_name", sap.ui.model.FilterOperator.Contains, sValue)])];
			}
			var oSource = event.getSource();
			var oBinding = event.getSource().getBinding("suggestionItems");
			self.getView().byId("searchfield_products").getBinding("suggestionItems").filter(aFilters);
			oBinding.attachEventOnce("dataReceived", function () {
				oSource.suggest();
			});
		},
		onSearchdepartments: function (event) {
			this.searchevent_departments = event.getParameter("suggestionItem");
		},
		onSuggestdepartments: function (event) {
			var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [new Filter([new Filter("department", sap.ui.model.FilterOperator.Contains, sValue)])];
			}
			var oSource = event.getSource();
			var oBinding = event.getSource().getBinding("suggestionItems");
			self.getView().byId("searchfield_departments").getBinding("suggestionItems").filter(aFilters);
			oBinding.attachEventOnce("dataReceived", function () {
				oSource.suggest();
			}); //self.getView().byId("searchfield_departments").suggest();
		},
		onPressedBack: function () {
			history.go(-1);
		},
		setChartTopranking: function (formated_data) {
			var oVizFrame = this.getView().byId("Bar_chart_Top10Product");
			var model = new sap.ui.model.json.JSONModel();
			model.setData(formated_data);
			var Dataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "products",
					value: "{PRODUCT_NAME}"
				}],
				measures: [{
					name: "orders",
					value: "{COUNT_ORDERS}"
				}],
				data: {
					path: "/results"
				}
			});
			oVizFrame.setDataset(Dataset);
			oVizFrame.setModel(model);
			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "valueAxis",
				"type": "Measure",
				"values": ["orders"]
			});
			var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				"uid": "categoryAxis",
				"type": "Dimension",
				"values": ["products"]
			});
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true
					}
				},
				legend: {
					title: {
						visible: false
					}
				},
				title: {
					visible: true,
					text: "top 10 products"
				}
			});
			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);
		},
		onFilterPressed: function (oEvent) {
			var aisles_parameter = "";
			var departments_parameter = "";
			var product_parameter = "";
			if (this.searchevent_aisles !== undefined) {
				aisles_parameter = "'" + this.searchevent_aisles.getKey() + "'";
			} else {
				aisles_parameter = "'all'";
				self.getView().byId("searchfield_aisles").setValue("");
			}
			if (this.searchevent_departments !== undefined) {
				departments_parameter = "'" + this.searchevent_departments.getKey() + "'";
			} else {
				departments_parameter = "'all'";
				self.getView().byId("searchfield_departments").setValue("");
			}
			if (this.searchevent_products !== undefined) {
				product_parameter = "'" + this.searchevent_products.getKey() + "'";
			} else {
				product_parameter = "'all'";
				self.getView().byId("searchfield_products").setValue("");
			}
			if (this.current_tab == "products") {
				self.getView().byId("Bar_chart_Top10Product").setBusy(true);
				self.getView().byId("Pie_chart_OrgVsNon").setBusy(true);
				oModelTop10Products.read("/IP(IP_DEPARTMENT=" + departments_parameter + ",IP_AISLE=" + aisles_parameter +
					")/Results?$orderby=COUNT_ORDERS%20desc", {
						success: function (oData) {
							self.getView().byId("Bar_chart_Top10Product").setBusy(false);
							var sorted_data = oData;
							var oChart = self.getView().byId("Bar_chart_Top10Product");
							oChart.getModel().setProperty("/", sorted_data);
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
				oModelOrgVSNON.read("/IP2(IP_DEPARTMENT=" + departments_parameter + ",IP_AISLE=" + aisles_parameter +
					")/Results?$orderby=ANZAHL%20desc", {
						success: function (oData) {
							self.getView().byId("Pie_chart_OrgVsNon").setBusy(false);
							var sorted_data = oData;
							var oChart = self.getView().byId("Pie_chart_OrgVsNon");
							oChart.getModel().setProperty("/", sorted_data);
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
			} else if (this.current_tab == "time related") {
				self.getView().byId("Bar_chart_orderhours").setBusy(true);
				self.getView().byId("Bar_chart_orderdays").setBusy(true);
				//Falls Produktname eingegeben wurde, wird kein Department / Aisle benötigt
				if (product_parameter !== "'all'") {
					aisles_parameter = "'all'";
					departments_parameter = "'all'";
					self.getView().byId("searchfield_aisles").setValue("");
					self.getView().byId("searchfield_departments").setValue("");
				}
				oModelorderhours.read("/IP3(IP_DEPARTMENT=" + departments_parameter + ",IP_AISLE=" + aisles_parameter + ",IP_PRODUCT=" +
					product_parameter + ")/Results", {
						success: function (oData) {
							self.getView().byId("Bar_chart_orderhours").setBusy(false);
							var sorted_data = oData;
							var oChart = self.getView().byId("Bar_chart_orderhours");
							oChart.getModel().setProperty("/", sorted_data);
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
				oModelorderdays.read("/IP4(IP_DEPARTMENT=" + departments_parameter + ",IP_AISLE=" + aisles_parameter + ",IP_PRODUCT=" +
					product_parameter + ")/Results", {
						success: function (oData) {
							self.getView().byId("Bar_chart_orderdays").setBusy(false);
							var sorted_data = oData;
							var oChart = self.getView().byId("Bar_chart_orderdays");
							oChart.getModel().setProperty("/", sorted_data);
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
			} else if (this.current_tab == "rebuy related") {
				self.getView().byId("bar_chart_prior_order").setBusy(true);
				self.getView().byId("bar_chart_most_often").setBusy(true);
				self.getView().byId("pie_chart_reorder").setBusy(true);
				//Falls Produktname eingegeben wurde, wird kein Department / Aisle benötigt
				if (product_parameter !== "'all'") {
					aisles_parameter = "'all'";
					departments_parameter = "'all'";
					self.getView().byId("searchfield_aisles").setValue("");
					self.getView().byId("searchfield_departments").setValue("");
				}
				oModelpriororder.read("/IP5(IP_DEPARTMENT=" + departments_parameter + ",IP_AISLE=" + aisles_parameter + ",IP_PRODUCT=" +
					product_parameter + ")/Results", {
						success: function (oData) {
							self.getView().byId("bar_chart_prior_order").setBusy(false);
							var sorted_data = oData;
							var oChart = self.getView().byId("bar_chart_prior_order");
							oChart.getModel().setProperty("/", sorted_data);
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
				oModelmostoften.read("/IP6(IP_DEPARTMENT=" + departments_parameter + ",IP_AISLE=" + aisles_parameter + ",IP_PRODUCT=" +
					product_parameter + ")/Results?$orderby=ANZAHL%20desc", {
						success: function (oData) {
							self.getView().byId("bar_chart_most_often").setBusy(false);
							var sorted_data = oData;
							var oChart = self.getView().byId("bar_chart_most_often");
							oChart.getModel().setProperty("/", sorted_data);
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
				oModelreorder.read("/IP7(IP_DEPARTMENT=" + departments_parameter + ",IP_AISLE=" + aisles_parameter + ",IP_PRODUCT=" +
					product_parameter + ")/Results", {
						success: function (oData) {
							self.getView().byId("pie_chart_reorder").setBusy(false);
							var sorted_data = oData;
							var oChart = self.getView().byId("pie_chart_reorder");
							oChart.getModel().setProperty("/", sorted_data);
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
			} else if (this.current_tab == "others") {
				self.getView().byId("bar_chart_first_in_cart").setBusy(true);
				if (product_parameter !== "'all'") {
					aisles_parameter = "'all'";
					departments_parameter = "'all'";
					self.getView().byId("searchfield_aisles").setValue("");
					self.getView().byId("searchfield_departments").setValue("");
				}
				oModelfirstincart.read("/IP8(IP_DEPARTMENT=" + departments_parameter + ",IP_AISLE=" + aisles_parameter + ",IP_PRODUCT=" +
					product_parameter + ")/Results?$orderby=ANZAHL%20desc", {
						success: function (oData) {
							self.getView().byId("bar_chart_first_in_cart").setBusy(false);
							var sorted_data = oData;
							var oChart = self.getView().byId("bar_chart_first_in_cart");
							oChart.getModel().setProperty("/", sorted_data);
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
			} else if (this.current_tab == "associations") {
				scatterchart.setBusy(true);
				self.getView().byId("column_chart_asso2").setBusy(true);
				if (product_parameter !== "'all'") {
					aisles_parameter = "'all'";
					departments_parameter = "'all'";
					self.getView().byId("searchfield_aisles").setValue("");
					self.getView().byId("searchfield_departments").setValue("");
				}
				oModelprobability.read("/IP8(IP_DEPARTMENT=" + departments_parameter + ",IP_AISLE=" + aisles_parameter + ",IP_PRODUCT=" +
					product_parameter + ")/Results", {
						success: function (oData) {
							var x = [];
							var y = [];
							for (var i = 0; oData.results.length > i; i++) {
								x.push(oData.results[i].REORDERS);
								y.push(parseFloat(oData.results[i].PROBABILITY));
							}
							scatterchart.setX(x);
							scatterchart.setY(y);
							scatterchart.setBusy(false);
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
				oModelAsso2.read("/IP9(IP_DEPARTMENT='all',IP_AISLE='all',IP_PRODUCT='all')/Results?$orderby=DAYS_SINCE_PRIOR_ORDER%20asc", {
					success: function (oData) {
						self.getView().byId("column_chart_asso2").setBusy(false);
						var oChart = self.getView().byId("column_chart_asso2");
						oChart.getModel().setProperty("/", oData);
					},
					error: function (oError) {
						sap.m.MessageToast.show("Error! " + oError.message);
						sap.ui.core.BusyIndicator.hide();
					}
				});
			} else if (this.current_tab == "user") {

				var sUrl = "/xsodata/getUserinformation.xsodata";
				oModelUser = new sap.ui.model.odata.ODataModel(sUrl, true);
				var parameter = self.getView().byId("input0").getValue();
				if (parameter) {
					oModelUser.read("/IP(IP_USER_ID=" + parameter + ")/Results", {
						success: function (oData) {
							if (oData.results.length == 0) {
								sap.m.MessageToast.show("UserID not found!");
							} else {
								var dataModel = new sap.ui.model.json.JSONModel();
								dataModel.setData(oData);
								var oTable = self.getView().byId("table4");
								oTable.setModel(dataModel);
							}
						},
						error: function (oError) {
							sap.m.MessageToast.show("Error! " + oError.message);
							sap.ui.core.BusyIndicator.hide();
						}
					});
				}
			}

		},
		/**
		 *@memberOf Z.Visualization.controller.Auswahl
		 */
		onSelectCategory: function (oEvent) {

				this.current_tab = oEvent.mParameters.key;
				self.getView().byId("input0").setEnabled(false);
				self.getView().byId("Button_Filter").setEnabled(true);
				self.getView().byId("Button_Filter").setEnabled(false);
				self.getView().byId("searchfield_aisles").setEnabled(false);
				self.getView().byId("searchfield_departments").setEnabled(false);
				self.getView().byId("searchfield_products").setEnabled(false);
				self.getView().byId("input0").setEnabled(false);

				if (this.current_tab == "products") {
					self.getView().byId("tab_customerbehaviour").setExpanded(false);
					self.getView().byId("Button_Filter").setEnabled(true);
					self.getView().byId("searchfield_aisles").setEnabled(true);
					self.getView().byId("searchfield_departments").setEnabled(true);
					self.getView().byId("searchfield_aisles").setEnabled(true);
					self.getView().byId("searchfield_departments").setEnabled(true);
				} else if (this.current_tab == "item portfolio") {
					self.getView().byId("Button_Filter").setEnabled(false);
					self.getView().byId("tab_customerbehaviour").setExpanded(false);

				} else if (this.current_tab == "customer behaviour") {
					self.getView().byId("tab_customerbehaviour").setExpanded(false);

				} else if (this.current_tab == "time related") {
					self.getView().byId("Button_Filter").setEnabled(true);
					self.getView().byId("searchfield_aisles").setEnabled(true);
					self.getView().byId("searchfield_aisles").setEnabled(true);
					self.getView().byId("searchfield_departments").setEnabled(true);
					self.getView().byId("searchfield_products").setEnabled(true);
				} else if (this.current_tab == "rebuy related") {
					self.getView().byId("Button_Filter").setEnabled(true);
					self.getView().byId("searchfield_aisles").setEnabled(true);
					self.getView().byId("searchfield_departments").setEnabled(true);
					self.getView().byId("searchfield_products").setEnabled(true);
				} else if (this.current_tab == "others") {
					self.getView().byId("Button_Filter").setEnabled(true);
					self.getView().byId("searchfield_aisles").setEnabled(true);
					self.getView().byId("searchfield_departments").setEnabled(true);
					self.getView().byId("searchfield_products").setEnabled(true);
				} else if (this.current_tab == "associations") {
					self.getView().byId("Button_Filter").setEnabled(true);
					self.getView().byId("searchfield_aisles").setEnabled(true);
					self.getView().byId("searchfield_departments").setEnabled(true);
					self.getView().byId("searchfield_products").setEnabled(true);
				} else if (this.current_tab == "user") {
					self.getView().byId("Button_Filter").setEnabled(true);
					self.getView().byId("input0").setEnabled(true);

				}
			}
			/**
			 *@memberOf Z.Visualization.controller.Auswahl
			 */

	});
});