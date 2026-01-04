const fs = require("fs");
const path = require("path");

const pkgPath = path.join(process.cwd(), "package.json");

if (!fs.existsSync(pkgPath)) {
    console.log("❌ No package.json found in:", process.cwd());
    process.exit(1);
}

const pkg = require(pkgPath);
const deps = pkg.dependencies || {};

console.log("SERVICE:", path.basename(process.cwd()));

console.log("Framework:",
    deps.express ? "Express" :
    deps.fastify ? "Fastify" :
    deps["@nestjs/common"] ? "NestJS" :
    "Unknown"
);

console.log("Database:",
    deps.prisma ? "Prisma" :
    deps.mongoose ? "Mongoose" :
    "None"
);

console.log("Auth:", deps.jsonwebtoken ? "JWT" : "None");

console.log("Extra deps:",
    Object.keys(deps).join(", ")
);

