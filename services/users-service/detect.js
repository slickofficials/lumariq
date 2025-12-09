const fs = require("fs");

const pkg = require("./package.json");
const deps = pkg.dependencies || {};

let out = [];
out.push("SERVICE: users-service");

if (deps.express) out.push("Framework: Express");
else if (deps.fastify) out.push("Framework: Fastify");
else if (deps["@nestjs/common"]) out.push("Framework: NestJS");
else out.push("Framework: Unknown");

if (deps.prisma) out.push("Database: Prisma");
else if (deps.mongoose) out.push("Database: Mongoose");
else out.push("Database: None");

out.push("Auth: " + (deps.jsonwebtoken ? "JWT" : "None"));

out.push("Extra deps: " + Object.keys(deps).slice(0, 10).join(", "));

fs.writeFileSync("summary.txt", out.join("\n"));
