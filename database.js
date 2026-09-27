const fs = require("fs");

const file = "data.json";

if (!fs.existsSync(file)) {
  fs.writeFileSync(
    file,
    JSON.stringify({
      students: []
    }, null, 2)
  );
}

console.log("SkillBridge database ready!");
