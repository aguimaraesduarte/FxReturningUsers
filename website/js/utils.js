function previousDate(date){
  // helper function to get the
  // prev. M, W, F from the date
  // passed as an argument
  var dow = date.day();
  var newDate = null;
  if(dow == 7){
    newDate = date.day(6);
  } else if (dow == 6){
    newDate = date.day(5);
  } else if (dow == 5){
    newDate = date.day(4);
  } else if (dow == 4){
    newDate = date.day(3);
  } else if (dow == 3){
    newDate = date.day(2);
  } else if (dow ==2){
    newDate = date.day(1);
  } else {
    newDate = date.day(-1);
  }
  return newDate;
}

function nextDate(date){
  // helper function to get the
  // next M, W, F from the date
  // passed as an argument
  var dow = date.day();
  var newDate = null;
  if(dow == 7){
    newDate = date.day(8);
  } else if (dow == 6){
    newDate = date.day(7);
  } else if (dow == 5){
    newDate = date.day(6);
  } else if (dow == 4){
    newDate = date.day(5);
  } else if (dow == 3){
    newDate = date.day(4);
  } else if (dow ==2){
    newDate = date.day(3);
  } else {
    newDate = date.day(2);
  }
  return newDate;
}

function getFilePath(units, date){
  // create a json request path
  // based on the unit & date
  var currentDate = date.clone()

  // get the two strings to use for a json request
  var currentDateStr = date.format('YYYYMMDD');

  var requestPath = "JSON/fx_retusers_" + units + "-" + currentDateStr + ".json";

  return requestPath;
}

function filterCategory(category, obj){
  return obj.category == category
}
