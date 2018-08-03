var programArray = ["CSP", "CCS", "OP", "CRISIS"];

var programOutput = programArray.reverse().map(function(value, index) {
  return {program: value, weight: index * 100}
});

console.log(programOutput);