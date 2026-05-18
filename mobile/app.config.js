const app = require('./app.json');

module.exports = ({ config }) => {
  const easProjectId = process.env.EAS_PROJECT_ID?.trim();
  const expoConfig = app.expo;

  return {
    ...config,
    ...expoConfig,
    plugins: expoConfig.plugins ?? [],
    extra: {
      ...expoConfig.extra,
      ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
    },
  };
};
