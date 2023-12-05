module.exports = (api, options) => {
  console.log("api, options", api, options);
  api.chainWebpack((webpackConfig) => {
    console.log("webpackConfig", webpackConfig);
  });
};
