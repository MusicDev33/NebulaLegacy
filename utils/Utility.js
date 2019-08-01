module.exports.parseConvID = function(convId){
  var userList = []
  tempString = ""
  for (var i=0;i<convId.length;i++){
    if (convId[i]===':'){
      userList.push(tempString)
      tempString = ""
    }else if (convId[i] === ';'){
      userList.push(tempString)
    }else{
      tempString += convId[i]
    }
  }
  return userList
}

module.exports.parseInvolved = function(convId){
  var userList = []
  tempString = ""
  for (var i=0;i<convId.length;i++){
    if (convId[i]===':'){
      userList.push(tempString)
      tempString = ""
    }else if (convId[i] === ';'){
      userList.push(tempString)
    }else{
      tempString += convId[i]
    }
  }
  return userList
}

module.exports.alphabetizeInvolved = function(convId){
  var userList = []
  var sortedConvId = ""
  tempString = ""
  for (var i=0;i<convId.length;i++){
    if (convId[i]===':'){
      userList.push(tempString)
      tempString = ""
    }else if (convId[i] === ';'){
      userList.push(tempString)
    }else{
      tempString += convId[i]
    }
  }

  var sortedArray = userList.sort()
  for (var j=0;j<sortedArray.length;j++){
    if (j===sortedArray.length-1){
      sortedConvId += sortedArray[j];
      sortedConvId += ";";
    }else{
      sortedConvId += sortedArray[j];
      sortedConvId += ":";
    }
  }

  return sortedConvId
}

module.exports.alphabetizeConvId = function(convId){
  var userList = []
  var sortedConvId = ""
  tempString = ""
  for (var i=0;i<convId.length;i++){
    if (convId[i]===':'){
      userList.push(tempString)
      tempString = ""
    }else if (convId[i] === ';'){
      userList.push(tempString)
    }else{
      tempString += convId[i]
    }
  }

  var sortedArray = userList.sort()
  for (var j=0;j<sortedArray.length;j++){
    if (j===sortedArray.length-1){
      sortedConvId += sortedArray[j];
      sortedConvId += ";";
    }else{
      sortedConvId += sortedArray[j];
      sortedConvId += ":";
    }
  }

  return sortedConvId
}

module.exports.returnOneFriendFromConvId = function(convId, username){
  tempString = ""
  var userList = []
  for (var i=0;i<convId.length;i++){
    if (convId[i]===':'){
      if (tempString != username){
        userList.push(tempString)
      }
      tempString = ""
    }else if (convId[i] === ';'){
      if (tempString != username){
        userList.push(tempString)
      }
    }else{
      tempString += convId[i]
    }
  }
  return userList[0]
}

return module.exports
