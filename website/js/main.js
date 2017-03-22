var global = {
  heroIndex: 0,
  // chart defaults for MG
  chart: {
    width: 400,
    height: 660,
    left: 0,
    right: 120,
    xax_count: 4
  },
  // used when updating the
  // hours histogram
  currentDate: null,
  charts: null,
  // all firefox releases stored
  // in metrics graphics supported
  // format
  allMarkers: null,
}

// partially applied functions for loading
// json data for histograms for tsla and tuna
var getTSLAFilePath = getFilePath.bind(this, "tsla")
var getTUNAFilePath = getFilePath.bind(this, "tuna")

global.currentDate = moment("2016-09-01").day(4)

var TSLAFile = getTSLAFilePath(global.currentDate)
var TUNAFile = getTUNAFilePath(global.currentDate)

var firefoxReleasesPath = "https://product-details.mozilla.org/1.0/firefox.json"

// main json file for first graphs &
// release json files are loaded in
// series. TODO: change to async if
// needed
d3.queue()
.defer(d3.json, "JSON/fx_retusers.json")
.defer(d3.json, firefoxReleasesPath)
.await(function(error, fx_retusers, firefoxReleases){
  // releases are stored {1.0rc1: "2004-10-27", ...}
  // data needs to be in the form [{'date' : Date(), 'label' : Label()}]
  global.allMarkers = [];

  firefoxReleases = firefoxReleases.releases;

  // filter out for releases that only
  // occured this year. one year is
  // arbitrary
  var lastYearStr = moment().subtract(1, 'years').format('YYYY-MM-DD');

  for(var release in firefoxReleases){
    if(firefoxReleases[release].date >= lastYearStr){
      global.allMarkers.push({
        date: firefoxReleases[release].date,
        // store category to filter by
        // particular release later
        category: firefoxReleases[release].category,
        label: firefoxReleases[release].version,
      });
    }
  }

  global.allMarkers = MG.convert.date(global.allMarkers, "date");

  // filter out all of the release canidates
  var filteredMarkers = global.allMarkers.filter(filterCategory.bind(this, "major"));

  fx_retusers = MG.convert.date(fx_retusers, "date");

  // custom chart properties that override
  // common properties initialized below
  var customChartProperties = [
    {
      title: "Rates",
      target: "#rates",
      y_accessor: ["tuna_neg_prop", "bad_dates_prop", "tsla_neg_prop", "tsla_tuna_neg_prop"],
      legend: ["tuna_neg_prop", "bad_dates_prop", "tsla_neg_prop", "tsla_tuna_neg_prop"],
      description: '',
      format: "percentage",
    },
    {
      title: "TSLA",
      target: "#tsla",
      y_accessor: ["tsla_30_prop"],
      legend: ["tsla_30_prop"],
      description: '',
      format: "percentage",
      min_y: 0.01,
      max_y: 0.02,
    },
    {
      title: "TUNA",
      target: "#tuna",
      y_accessor: ["tuna_90_prop"],
      legend: ["tuna_90_prop"],
      description: '',
      format: "percentage",
      min_y: 0.98,
      max_y: 0.99,
    }
  ]

  // store common properties to be
  // overwritten by customProperties
  var commonChartProperties = []
  for(var i = 0; i < customChartProperties.length; i++){
    commonChartProperties.push({
      data: fx_retusers,
      animate_on_load: true,
      width: global.chart.width,
      height: 300,
      xax_count: global.chart.xax_count,
      right: global.chart.right,
      full_width: true,
      x_accesor: "date",
      markers: filteredMarkers,
      aggregate_rollover: true
    })
  }

  // merge the custom properties & common properties
  function mapCharts(tuple){
    return Object.assign(tuple[0], tuple[1]);
  }
  global.charts = _.zip(commonChartProperties, customChartProperties).map(mapCharts)

  // draw each of the charts
  global.charts.forEach(function(chart){ MG.data_graphic(chart) });

  // bind click events to the histogram
  // buttons to fetch new data & update
  // histogram
  d3.select('.hero-left')
  .on('click', function(){
    global.currentDate = previousDate(global.currentDate);

    var TSLAFile = getTSLAFilePath(global.currentDate);
    var TUNAFile = getTUNAFilePath(global.currentDate);

    updateDates(TSLAFile, TUNAFile);
  });

  d3.select('.hero-right')
  .on('click', function(){
    global.currentDate = nextDate(global.currentDate);

    var TSLAFile = getTSLAFilePath(global.currentDate);
    var TUNAFile = getTUNAFilePath(global.currentDate);

    updateDates(TSLAFile, TUNAFile);
  });
})

// initial draw of histograms
updateDates(TSLAFile, TUNAFile)

// called if there is no json for the
// corresponding address created
function createMissingDataChart(target){
  MG.data_graphic({
    title: "Missing Data",
    error: "Data is not available for the time period selected!",
    chart_type: "missing-data",
    missing_text: "Data is not available for the time period selected!",
    width: global.chart.width,
    height: 300,
    xax_count: global.chart.xax_count,
    right: global.chart.right,
    target: target,
    animate_on_load: false,
    full_width: true
  });
}

function updateDates(TSLAFile, TUNAFile){
  // TODO: Histogram doesn't have commonChartProperties
  // like the other charts did. This could be updated,
  // however it is low priority.
  var dates = TSLAFile.replace(".json", "")
    .split("-")
    .slice(1, 3)

  var dateStartParsed = dates[0].substr(0, 4) + "-" + dates[0].substr(4, 2) + "-" + dates[0].substr(6, 2)

  var dateStr = dateStartParsed
  d3.select(".formatted-date").text(dateStr)

  d3.queue()
  .defer(d3.json, TSLAFile)
  .defer(d3.json, TUNAFile)
  .await(function(error, fx_retusers_tsla, fx_retusers_tuna){
    var target = "#fx_retusers_tsla";
    if(fx_retusers_tsla){
      MG.data_graphic({
        title: "Count of Days Since Last Activity (>= 30)",
        data: fx_retusers_tsla,
        width: global.chart.width,
        height: 300,
        min_x: 30,
        max_x: 180,
        min_y: 0,
        max_y: 0.05,
        xax_count: global.chart.xax_count,
        right: global.chart.right,
        target: target,
        y_accessor: "count",
        x_accessor: "days",
        transition_on_update: false,
        full_width: true,
      });
    } else {
      createMissingDataChart(target);
    }

    var target = "#fx_retusers_tuna";
    if(fx_retusers_tuna){
      MG.data_graphic({
        title: "Count of Days Until Next Activity (<= 90)",
        data: fx_retusers_tuna,
        width: global.chart.width,
        height: 300,
        min_x: 0,
        max_x: 90,
        min_y: 0,
        max_y: 0.8,
        xax_count: global.chart.xax_count,
        right: global.chart.right,
        target: target,
        y_accessor: "count",
        x_accessor: "days",
        transition_on_update: false,
        full_width: true,
      });
    } else {
      createMissingDataChart(target);
    }
  });
}

function updateMarkers(category){
  // update the markers for all of the timeseries charts (currently)
  var filteredMarkers = global.allMarkers.filter(filterCategory.bind(this, category));
  // update the charts
  global.charts = global.charts.map(function(chart){
    chart.markers = filteredMarkers;
    // not sure what this does
    delete chart.xax_format;
    return chart;
  });

  // apply to the charts
  global.charts.forEach(function(chart){ MG.data_graphic(chart) });
}

$('.split-by-controls button').click(function(){
  var category = $(this).data('category');
  updateMarkers(category)

  // change button state
  $(this).addClass('active').siblings().removeClass('active');
});

// enable all tooltips
$(function(){
  $('[data-toggle="tooltip"]').tooltip()
});
