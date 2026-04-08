const express = require("express");
const http = require("http");
const { addAliases } = require("module-alias");

addAliases({
  "@": __dirname,
});

const responseHandler = require("@/config/result");
const router = require("@/router");

const app = express();

app.use(express.json());
app.use(responseHandler);

app.use("/api", router);

app.use((req, res) => {
  res.sendResult({
    code: 404,
    msg: "接口不存在",
    serviceCode: 404,
  });
});

app.use((error, req, res, next) => {
  const code = Number(error?.code) || 500;

  res.sendResult({
    code,
    msg: error?.msg || "服务器内部错误",
    serviceCode: code,
    error: error?.validate || null,
  });
});

const server = http.createServer(app);
server.listen(3000, () => {
  console.log("Server is running on port 3000...");
});
